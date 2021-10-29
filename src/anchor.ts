import * as THREE from "three"
import App from "./app";
import BaseObject from "./baseObject";

export default class UIAnchor {
    private app: App
    private element: HTMLElement
    private node: THREE.Object3D
    private localPosition: [x: number, y: number]
    private pivot: [x: number, y: number]
    private pivotPixel: [x: number, y: number]
    constructor(props: {
        element: HTMLElement,
        parent: BaseObject,
        localPosition?: [x: number, y: number] | undefined,
        pivot?: [x: number, y: number] | undefined,
        pivotPixel?: [x: number, y: number] | undefined,
        node?: THREE.Object3D | undefined,
    }, app: App) {
        this.app = app
        this.element = props.element
        this.node = props.node || props.parent.renderNode
        this.localPosition = props.localPosition || [0, 0]
        this.pivot = props.pivot || [0, 0]
        this.pivotPixel = props.pivotPixel || [0, 0]

        const container = document.getElementById('2d_view_container')!
        const position = this.toScreenPosition(this.node)
        container.appendChild(this.element)
        this.element.style.position = 'absolute'
        this.changePosition(position)
        this.addEventListener()
    }
    toScreenPosition(object: THREE.Object3D) {
        const vector = new THREE.Vector3()
        const size = this.app.rendererManager.renderer.getSize(new THREE.Vector2())
        const widthHalf = 0.5 * size.width;
        const heightHalf = 0.5 * size.height;
        object.updateMatrixWorld()
        vector.setFromMatrixPosition(object.matrixWorld);
        vector.project(this.app.cameraManager.camera)
        vector.x = (vector.x * widthHalf) + widthHalf
        vector.y = -(vector.y * heightHalf) + heightHalf
        return {
            x: vector.x,
            y: vector.y
        }
    }
    addEventListener() {
        this.app.controlsManager.controls.addEventListener('change', this.onChange)
    }
    onChange = () => {
        const position = this.toScreenPosition(this.node)
        this.changePosition(position)
    }
    destroy() {
        this.app.controlsManager.controls.removeEventListener('change', this.onChange)
        this.element.remove()
    }
    changePosition(position: { x: number; y: number; }) {
        this.element.style.left = `${position.x + this.localPosition[0] * this.element.offsetWidth - this.pivot[0] * this.element.offsetWidth - this.pivotPixel[0]}px`
        this.element.style.top = `${position.y - this.localPosition[1] * this.element.offsetHeight - this.pivot[1] * this.element.offsetWidth - this.pivotPixel[1]}px`
    }
}