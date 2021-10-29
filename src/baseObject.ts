import * as THREE from "three"
import ClassType from "./classType"
import App from "./app"
import { recursiveObjectForUUID } from "./utils"
import LevelEventType from "./levelEventType"
import { LevelParams } from "./level"
import BaseStyle from "./baseStyle"
import { EventEmitter } from "events"

export default class BaseObject {
    type: string = ClassType.BaseObject
    id!: string
    name!: string
    lodLevel!: number
    children: BaseObject[] = []
    node!: THREE.Object3D
    renderNode!: THREE.Object3D
    parent: BaseObject | null = null
    style!: BaseStyle
    extraData: { [keys: string]: any } = {}
    visible!: boolean
    size = 1
    // position: [x: number, y: number, z: number] = [0, 0, 0]
    public initParams: any = null
    private delegate = new EventEmitter()
    private positionWithParent: [number, number, number] = [0, 0, 0]
    private selected = false
    protected app: App
    private eventHandle: Array<() => void> = []
    get localPosition() {
        return this.positionWithParent
    }
    set localPosition(position: [number, number, number]) {
        this.positionWithParent = position
        if (this.renderNode) {
            this.renderNode.position.set(position[0], position[1], position[2])
        }
    }
    get worldPosition() {
        return this.renderNode.getWorldPosition(new THREE.Vector3())
    }
    constructor(app: App) {
        this.app = app
        Object.defineProperties(this, {
            "visible": {
                get: () => {
                    return this.renderNode.visible
                },
                set: (val) => {
                    this.renderNode.visible = val
                }
            },
        })
        this.handleDoubleClick = this.handleDoubleClick.bind(this)
        this.handleMove = this.handleMove.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }
    loadWithUrl(url: string, complete?: () => void) {
        this.app.loaderManager.loadWithUrl(url, (obj) => {
            obj.name = this.name
            obj.scale.set(this.size, this.size, this.size)
            this.renderNode = obj
            this.node = obj
            this.viewDidLoad()
            complete && complete()
        })
    }
    onLevel(eventType: LevelEventType, callback: () => void) {
        this.delegate.on(eventType, callback)
        return () => {
            this.delegate.removeListener(eventType, callback)
        }
    }
    // 需要处理非允许选中物体
    load() {
        this.eventHandle = [
            this.app.picker.on('dblclick', this.handleDoubleClick),
            this.app.picker.on('mousemove', this.handleMove),
            this.app.picker.on('click', this.handleClick)
        ]
    }
    handleDoubleClick(objects: THREE.Object3D[]) {
        if (objects.length > 0 && this.node.visible === true && !this.app.cameraManager.flying) {
            recursiveObjectForUUID(objects[0], [{
                model: this.node,
                func: () => {
                    this.onDoubleClick()
                }
            }])
        }
    }
    onDoubleClick() {
        this.app.level.change(this)
    }
    handleMove(objects: THREE.Object3D[]) {
        if (this.app.level.current?.type !== ClassType.Building) {
            if (objects.length > 0) {
                recursiveObjectForUUID(objects[0], [{
                    model: this.node,
                    func: () => {
                        if (!this.selected) {
                            this.app.effectComposer.addSelect(this)
                        }
                    }
                }], () => {
                    if (this.selected) {
                        this.app.effectComposer.removeSelect(this)
                    }
                })
            } else {
                if (this.selected) {
                    this.app.effectComposer.removeSelect(this)
                }
            }
        }
    }
    handleClick(objects: THREE.Object3D[]) {
        if (objects.length > 0 && this.node.visible === true) {
            recursiveObjectForUUID(objects[0], [{
                model: this.node,
                func: () => {
                    this.onClick()
                }
            }])
        }
    }
    onClick() {

    }
    release() {
        if (this.selected) {
            this.app.effectComposer.removeSelect(this)
        }
        this.eventHandle.forEach((func) => {
            func()
        })
        this.eventHandle = []
    }
    viewDidLoad() {
        this.positionWithParent = this.renderNode.position.toArray()
        this.style = new BaseStyle(this.renderNode, this)
        if (this.app.level.current && (this.app.level.current.id === this.parent?.id)) {
            this.load()
        }
    }
    add(params: {
        object: BaseObject;
        localPosition?: [number, number, number];
        angles?: [number, number, number];
    }, index?: number) {
        const {
            object,
            localPosition,
            angles
        } = params
        object.lodLevel = this.lodLevel + 1
        object.parent = this
        if (typeof index === 'number') {
            this.children.splice(index, 0, object)
        } else {
            this.children.push(object)
        }
        if (object.renderNode) {
            this.renderNode.add(object.renderNode)
        }
        if (localPosition) {
            object.localPosition = localPosition
        }
        if (angles) {
            object.renderNode.rotation.set(angles[0], angles[1], angles[2])
        }
    }
    onLevelEvent(type: LevelEventType, params: LevelParams) {
        this.delegate.emit(type, params)
        switch (type) {
            case LevelEventType.EnterLevel:
                this.onEnterLevel(this.initParams)
                break;
            case LevelEventType.LeaveLevel:
                this.onLeaveLevel(params)
                this.initParams = null
                break;
            case LevelEventType.LevelChange:
                this.onLevelChange()
                if (this.parent) {
                    this.parent.onLevelEvent(type, params)
                }
                break;
            case LevelEventType.LevelFlyEnd:
                this.onLevelFlyEnd()
                break;
        }
    }
    get brothers() {
        if (!this.parent) {
            return []
        }
        return this.parent.children.filter((item) => {
            return item.id !== this.id
        })
    }
    onEnterLevel(initParams?: any) {

    }
    onLeaveLevel(params: LevelParams) {

    }
    onLevelChange() {

    }
    onLevelFlyEnd() {

    }
    onEnterView(params?: {
        xAngle?: number
        yAngle?: number
        radiusFactor?: number
        onComplete?: (e?: unknown) => void
        targetOffset?: [x: number, y: number, z: number]
    }) {
        return this.app.cameraManager.flyTo(this, {
            ...(params || {}),
        })
    }
    onMouseOn() {

    }
    onMouseOff() {

    }
    cancelSelected() {
        this.selected = false
        this.onMouseOff()
    }
    confirmSelected() {
        this.selected = true
        this.onMouseOn()
    }
}
