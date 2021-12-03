import * as THREE from "three"
import ClassType from "./classType"
import App from "./app"
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
    size = 1
    // position: [x: number, y: number, z: number] = [0, 0, 0]
    public initParams: any = null
    private delegate = new EventEmitter()
    private positionWithParent: [number, number, number] = [0, 0, 0]
    private selected = false
    protected app: App
    private pickerHandle: null | Function = null
    private _pickable = true
    private _visible = true
    set pickable(bool: boolean) {
        this._pickable = bool
        if (!bool) {
            this.cancelSelected()
        }
    }
    get pickable() {
        return this._pickable
    }
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
    get visible() {
        return this._visible
    }
    set visible(val: boolean) {
        this._visible = val
        this.renderNode.visible = val
    }
    constructor(app: App) {
        this.app = app
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
    onLoad() {
        this.children.forEach((item) => {
            item.pickerWillLoad()
        })
    }
    onRelease() {
        this.children.forEach((item) => {
            item.pickerWillUnload()
        })
        this.app.picker.onLevelChange()
    }
    pickerWillLoad() {
        this.pickerHandle = this.app.picker.on({
            'dblclick': this.handleDoubleClick,
            'click': this.handleClick,
            'mousemove': this.handleMove
        }, this.node)
    }
    pickerWillUnload() {
        if (this.selected) {
            this.cancelSelected()
        }
        if (this.pickerHandle) {
            this.pickerHandle()
            this.pickerHandle = null
        }
    }
    handleDoubleClick(active: boolean) {
        if (active && !this.app.cameraManager.flying) {
            this.onDoubleClick()
        }
    }
    onDoubleClick() {
        this.app.level.change(this)
    }
    handleMove(active: boolean) {
        if (this.pickable) {
            if (active && !this.selected) {
                this.confirmSelected()
            } else if (!active && this.selected) {
                this.cancelSelected()
            }
        }
    }
    handleClick(active: boolean) {
        if (active) {
            this.onClick()
        }
    }
    onClick() {

    }
    viewDidLoad() {
        this.positionWithParent = this.renderNode.position.toArray()
        this.style = new BaseStyle(this.renderNode, this)
        this._visible = this.renderNode.visible
        if (this.app.level.current && (this.app.level.current.id === this.parent?.id)) {
            this.pickerWillLoad()
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
    onEnterView(params?: onEnterViewParams) {
        return this.app.cameraManager.flyTo(this, {
            ...(params || {}),
        })
    }
    onMouseOn() {

    }
    onMouseOff() {

    }
    cancelSelected() {
        const {
            selected
        } = this
        this.selected = false
        this.app.effectComposer.removeSelect(this)
        if (selected) {
            this.onMouseOff()
        }
    }
    confirmSelected() {
        this.selected = true
        this.app.effectComposer.addSelect(this)
        this.onMouseOn()
    }
}

export interface onEnterViewParams {
    xAngle?: number
    yAngle?: number
    radiusFactor?: number
    onComplete?: (e?: unknown) => void
    targetOffset?: [x: number, y: number, z: number]
}