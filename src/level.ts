import THREE from "three"
import SceneRoot from "./sceneRoot"
import Park from "./park"
import Building from "./building"
import BaseObject from "./baseObject"
import ClassType from "./classType"
import LevelEventType from "./levelEventType"
import App, { TreeStruct } from "./app"
import { EventEmitter } from "events"
import { generateUUID, getObjectWithName } from './utils'
import Floor from "./floor";
import Room from "./room";

export type initObject = {
    type: ClassType
    id: string
    lodLevel: number
    name: string
    node: THREE.Object3D
    renderNode: THREE.Object3D
    children: initObject[],
    class?: typeof BaseObject,
}

export default class SceneLevel {
    app: App
    root!: BaseObject
    changed = false
    current: BaseObject | null = null
    private onComplete: (() => void) | null = null
    constructor(app: App) {
        this.app = app
    }
    event = new EventEmitter()
    private stacks: BaseObject[] = []
    private getUrlsWithStruct(struct: TreeStruct[]) {
        const urls: Set<string> = new Set()
        const loadUrl = (s: TreeStruct[]) => {
            s.forEach((e) => {
                if (e.url) {
                    urls.add(e.url)
                }
                e.children && loadUrl(e.children)
            })
        }
        loadUrl(struct)
        return urls
    }
    private urlsLoad(urls: Set<string>, struct: TreeStruct[]) {
        let loadCount = 0
        const checkOnLoad = () => {
            ++loadCount
            if (loadCount === urls.size) {
                this.urlsOnLoad(struct)
            }
        }
        urls.forEach((url) => {
            this.app.loaderManager.loadWithUrl(url, checkOnLoad, checkOnLoad)
        })
    }
    private urlsOnLoad(struct: TreeStruct[]) {
        const rootStruct: TreeStruct = {
            type: ClassType.SceneRoot,
            id: generateUUID(),
            name: 'root',
            children: struct
        }
        const func = (object: TreeStruct, parent: null | BaseObject) => {
            let obj: BaseObject
            const classTypes = {
                [ClassType.SceneRoot]: SceneRoot,
                [ClassType.Park]: Park,
                [ClassType.Building]: Building,
                [ClassType.Floor]: Floor,
                [ClassType.BaseObject]: BaseObject,
                [ClassType.Room]: Room,
            }
            obj = object.class ? new object.class(this.app) : (classTypes[object.type] ? new classTypes[object.type](this.app) : new BaseObject(this.app))
            obj.id = object.id
            obj.lodLevel = parent ? parent.lodLevel + 1 : 0
            obj.name = object.name
            object.remark && (obj.extraData.remark = object.remark)
            this.loadNodeForType(object, obj, parent)
            obj.parent = parent
            obj.children = object.children ? object.children.map((item) => {
                return func(item, obj)
            }) : []
            obj.viewDidLoad()
            return obj
        }
        this.root = func(rootStruct, null)
        this.app.onLoad()
    }
    loadNodeForType(struct: TreeStruct, baseObject: BaseObject, parent: null | BaseObject) {
        switch (struct.type) {
            case ClassType.SceneRoot:
                baseObject.node = this.app.sceneManager.scene
                baseObject.renderNode = this.app.sceneManager.scene
                break;
            case ClassType.Park:
                this.app.loaderManager.loadWithUrl(struct.url!, (object) => {
                    baseObject.node = object
                    baseObject.renderNode = object
                })
                break;
            case ClassType.Building:
                this.app.loaderManager.loadWithUrl(struct.url!, (object) => {
                    baseObject.node = getObjectWithName(parent!.renderNode, struct.name)!
                    baseObject.renderNode = object
                })
                break;
            case ClassType.Floor:
                baseObject.node = getObjectWithName(parent!.renderNode, struct.name)!
                baseObject.renderNode = baseObject.node
                break;
            case ClassType.Room:
                baseObject.node = getObjectWithName(parent!.renderNode, struct.name)!
                baseObject.renderNode = baseObject.node
                break;
            case ClassType.BaseObject:
                this.app.loaderManager.loadWithUrl(struct.url!, (object) => {
                    baseObject.node = object
                    baseObject.renderNode = object
                })
                break;
            default:
                break;
        }
    }
    init(struct: TreeStruct[]) {
        const urls = this.getUrlsWithStruct(struct)
        this.urlsLoad(urls, struct)
    }
    change(target: BaseObject) {
        this.pushStack(target)
        this.findLevelWithObject(target)
    }
    back() {
        if (this.current && this.current.parent) {
            this.change(this.current.parent)
        }
    }
    popToTop() {
        this.change(this.app.query(ClassType.Park)[0])
    }
    rollback() {
        if (this.stacks.length > 1) {
            this.stacks.pop()
            const lastStack = this.stacks[this.stacks.length - 1]
            this.findLevelWithObject(lastStack)
        }
    }
    pushStack(target: BaseObject) {
        if (target.type === ClassType.Park) {
            this.stacks = [target]
        } else {
            this.stacks.push(target)
        }
    }
    private findLevelWithObject(target: BaseObject) {
        if (!this.current) {
            this.jump(target)
            return
        }
        if (this.current.lodLevel > target.lodLevel) {
            this.jump(this.current.parent!, () => {
                this.findLevelWithObject(target)
            })
        } else if (this.current.lodLevel <= target.lodLevel) {
            const func = () => {
                this.getParentWithIndex(target, target.lodLevel - this.current!.lodLevel, (object) => {
                    if (this.current!.id === object.id) {
                        if (object.id !== target.id) {
                            this.jumpChildrenWithId(target, target.lodLevel - this.current!.lodLevel)
                        } else {
                            this.onComplete = null
                        }
                    } else if (this.current!.parent!.id === object.parent!.id) {
                        this.jump(object, () => {
                            func()
                        })
                    } else {
                        this.jump(this.current!.parent!, () => {
                            func()
                        })
                    }
                })
            }
            func()
        }
    }
    private async jump(obj: BaseObject, onComplete?: () => void) {
        this.onComplete = onComplete || null
        if (this.current) {
            this.event.emit(LevelEventType.LeaveLevel, this.levelParams(obj))
            this.current.onLevelEvent(LevelEventType.LeaveLevel, this.levelParams(obj))
            this.current.onRelease()
        }
        this.event.emit(LevelEventType.LevelChange, this.levelParams(obj))
        obj.onLevelEvent(LevelEventType.LevelChange, this.levelParams(obj))
        this.event.emit(LevelEventType.EnterLevel, this.levelParams(obj))
        obj.onLevelEvent(LevelEventType.EnterLevel, this.levelParams(obj))
        obj.onLoad()
        this.current = obj
        const junmpComplete = () => {
            this.event.emit(LevelEventType.LevelFlyEnd, this.levelParams(this.current!))
            this.current!.onLevelEvent(LevelEventType.LevelFlyEnd, this.levelParams(this.current!))
            this.onComplete && this.onComplete()
        }
        const flyTo = obj.onEnterView()
        flyTo.onComplete(junmpComplete)
    }
    private getParentWithIndex(obj: BaseObject, index: number, onComplete: (obj: BaseObject) => void) {
        let currentIndex = 0
        const func = (obj: BaseObject) => {
            if (index === currentIndex) {
                onComplete(obj)
            } else {
                ++currentIndex
                func(obj.parent!)
            }
        }
        func(obj)
    }
    private jumpChildrenWithId(target: BaseObject, level: number) {
        const path: BaseObject[] = []
        let currentLevel = 0
        const func = (obj: BaseObject) => {
            if (level !== currentLevel) {
                ++currentLevel
                path.unshift(obj)
                func(obj.parent!)
            } else {
                // unknow
            }
        }
        func(target)
        const jump = (obj: BaseObject, x: BaseObject[]) => {
            this.jump(obj, () => {
                if (x.length) {
                    const [a, ...z] = x
                    jump(a, z)
                } else {
                    this.onComplete = null
                }
            })
        }
        const [a, ...x] = path
        jump(a, x)
    }
    private levelParams(target: BaseObject) {
        return {
            autoEnterSubLevel: true,
            current: target,
            level: this.current?.type,
            previous: this.current,
        }
    }
    on(type: LevelEventType, func: (params: LevelParams) => void) {
        this.event.on(type, func)
        return () => {
            this.event.removeListener(type, func)
        }
    }
}


export interface LevelParams {
    autoEnterSubLevel: boolean
    current: BaseObject
    level: string | undefined
    previous: BaseObject | null
}
