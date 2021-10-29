import Camera from "./camera"
import Controls from "./controls"
import ClassType from "./classType"
import Renderer from "./renderer"
import * as THREE from "three"
import Scene, { skyBoxs } from "./scene"
import Light from "./light"
import Loader from "./loader"
import Composer from "./composer"
import SceneLevel from "./level"
import BaseObject from "./baseObject"
import Picker from "./picker"
import TWEEN from "@tweenjs/tween.js"
import { EventEmitter } from "events"
import { generateUUID } from "./utils"
import Thing from "./thing"
import UIAnchor from "./anchor"
import Panel from "./widget/panel"
import PanelTem from "./widget/panelTem"

interface TreeStruct {
    type: ClassType
    id: string
    name: string
    url?: string
    class?: typeof BaseObject
    children?: TreeStruct[]
    remark?: any
}
export type { TreeStruct }
interface AppProps {
    struct: TreeStruct[]
    background: string | number
    animationCallback?: Function
}

export default class GLManager {
    rendererManager: Renderer
    cameraManager: Camera
    sceneManager: Scene
    lightManager: Light
    controlsManager: Controls
    loaderManager: Loader
    effectComposer: Composer
    level: SceneLevel
    picker: Picker
    private event = new EventEmitter()
    constructor(props: AppProps) {
        this.rendererManager = new Renderer()
        this.cameraManager = new Camera(this)
        this.sceneManager = new Scene(this, props.background)
        this.lightManager = new Light(this)
        this.controlsManager = new Controls(this)
        this.loaderManager = new Loader()
        this.effectComposer = new Composer(this)
        this.level = new SceneLevel(this)
        this.picker = new Picker(this)
        window.onresize = this.onWindowResize
        this.level.init(props.struct)
        this.start()
    }
    query(str: string | RegExp): BaseObject[] {
        const selector: BaseObject[] = []
        if (typeof str === 'string') {
            if (str.length === 0) return [];
            const firstString = str[0]
            const queryByProperty = (children: BaseObject[], property: keyof BaseObject, value: any) => {
                children.forEach((obj) => {
                    if (obj[property] === value) {
                        selector.push(obj)
                    }
                    if (obj.children.length) {
                        queryByProperty(obj.children, property, value)
                    }
                })
            }
            if (firstString === '#') {
                const id = str.slice(1)
                queryByProperty(this.level.root.children, 'id', id)
            } else if (firstString === '.') {
                const type = str.slice(1)
                queryByProperty(this.level.root.children, 'type', type)
            } else {
                queryByProperty(this.level.root.children, 'name', str)
            }
        } else if (str instanceof RegExp) {
            const queryByRegExp = (children: BaseObject[]) => {
                children.forEach((obj) => {
                    if (str.test(obj.name)) {
                        selector.push(obj)
                    }
                    if (obj.children.length) {
                        queryByRegExp(obj.children)
                    }
                })
            }
            queryByRegExp(this.level.root.children)
        }
        return selector
    }
    start() {
        this.animate()
    }
    animate = () => {
        this.rendererManager.stats.begin()
        this.controlsManager.controls.update()
        this.effectComposer.composer.render()
        this.effectComposer.renderOutlinePass()
        this.event.emit('animate')
        TWEEN.update()
        this.rendererManager.stats.end()
        requestAnimationFrame(this.animate)
    }
    onWindowResize = () => {
        this.rendererManager.resize()
        this.cameraManager.resize()
        this.effectComposer.resize()
    }
    on(type: string, func: () => void) {
        this.event.on(type, func)
        return () => {
            this.event.removeListener(type, func)
        }
    }
    onLoad() {
        this.event.emit('onLoad')
    }
    create({
        type,
        id,
        name,
        url,
        complete,
        Class,
        extraData,
        size,
        position,
        parent,
    }: {
        type: string,
        id?: string,
        name: string,
        url: string,
        complete?: (object: BaseObject) => void,
        Class?: typeof BaseObject | undefined,
        extraData?: { [key: string]: any },
        size?: number,
        position?: [x: number, y: number, z: number],
        parent?: BaseObject
    }) {
        const object = new (Class || Thing)(this)
        object.id = id || generateUUID()
        object.type = type
        object.name = name
        extraData && (object.extraData = extraData);
        if (typeof size === 'number') {
            object.size = size
        }
        position && (object.localPosition = position)
        parent && (object.parent = parent)
        object.loadWithUrl(url, () => {
            if (parent) {
                parent.add({ object })
            }
            complete && complete(object)
        })
        return object
    }
    /**
    * 将界面元素的 dom 节点挂接在 3D 场景中某个位置或物体上
    * @param element - 界面的dom元素
    * @param parent - 界面的父物体（位置跟随父物体更新）
    * @param localPosition - 相对父物体的偏移系数
    * @param pivot - 界面的轴心，以百分比表示界面轴心位置, [0,0]即以界面左上角定位，[1,1]即以界面右下角进行定位
    * @param pivotPixel - 相对于Element轴心点的偏移像素值
    *
    * 已经提供了 widget.Panel，Panel的优点是 统一的样式 和 响应数据更改自动更新界面. 系统化的样式建议直接使用 Panel
    * @returns 界面元素实例
    */
    createUIAnchor({
        element,
        parent,
        localPosition,
        pivot,
        pivotPixel,
        node
    }: {
        element: HTMLElement,
        parent: BaseObject,
        localPosition?: [x: number, y: number],
        pivot?: [x: number, y: number],
        pivotPixel?: [x: number, y: number],
        node?: THREE.Object3D,
    }) {
        return new UIAnchor({ element, parent, localPosition, pivot, pivotPixel, node }, this)
    }
    widget = {
        Panel: Panel
    }
    widgetTem = {
        PanelTem: PanelTem
    }
    get skyBox(): skyBoxs {
        return this.sceneManager.skybox
    }
    set skyBox(sky: skyBoxs) {
        this.sceneManager.changeSkyBox(sky)
    }
}