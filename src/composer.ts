import * as THREE from "three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import App from "./app"
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import BaseObject from "./baseObject"
import { JFAOutline } from 'troila_outline'

const SELECTED_LAYER = 1;

export default class Composer {
    app: App
    composer: EffectComposer
    private outlineUniforms: {
        threshLow: number,
        threshHigh: number,
        outlineColor: THREE.Vector4,
    }
    private targets: THREE.WebGLRenderTarget[] = []
    private iResolution: THREE.Vector2
    private jfaOutline: JFAOutline
    private unrealBloomPass?: UnrealBloomPass | null
    private selectedObjects: BaseObject[] = []
    constructor(app: App) {
        this.app = app
        this.composer = new EffectComposer(this.app.rendererManager.renderer)
        const size = this.app.rendererManager.renderer.getSize(new THREE.Vector2())
        const pixelRatio = this.app.rendererManager.renderer.getPixelRatio()
        this.iResolution = new THREE.Vector2(size.width * pixelRatio, size.height * pixelRatio)
        for (let i = 0; i < 2; i++) {
            this.targets.push(
                new THREE.WebGLRenderTarget(this.iResolution.x, this.iResolution.y, {
                    type: THREE.FloatType,
                    magFilter: THREE.LinearFilter,
                    minFilter: THREE.LinearFilter,
                })
            );
        }
        this.outlineUniforms = {
            threshLow: 1,
            threshHigh: 3 * pixelRatio,
            outlineColor: new THREE.Vector4(255, 215, 0),
        }
        this.jfaOutline = new JFAOutline(this.targets, this.iResolution)
        this.addRenderPass()
    }
    resize() {
        const size = this.app.rendererManager.renderer.getSize(new THREE.Vector2())
        const pixelRatio = this.app.rendererManager.renderer.getPixelRatio()
        this.iResolution = new THREE.Vector2(size.width * pixelRatio, size.height * pixelRatio)
        this.targets.forEach((e) => {
            e.setSize(this.iResolution.x, this.iResolution.y)
        })
        this.outlineUniforms.threshHigh = 3 * pixelRatio
        this.jfaOutline = new JFAOutline(this.targets, this.iResolution)
    }
    addRenderPass() {
        const renderPass = new RenderPass(this.app.sceneManager.scene, this.app.cameraManager.camera)
        this.composer.addPass(renderPass)
    }
    renderOutlinePass() {
        if (this.selectedObjects.length) {
            this.jfaOutline.outline(this.app.rendererManager.renderer, this.app.sceneManager.scene, this.app.cameraManager.camera, this.targets, this.iResolution, SELECTED_LAYER, this.outlineUniforms);
        }
    }
    addUnrealBloomPass(resolution: THREE.Vector2, strength: number, radius: number, threshold: number) {
        /**
         * UnrealBloomPass的参数
         * 1:辉光所覆盖的场景大小
         * 2：辉光的强度
         * 3：辉光散发的半径
         * 4：辉光的阈值（场景中的光强大于该值就会产生辉光效果）
         */
        this.unrealBloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);
        this.composer.addPass(this.unrealBloomPass)
    }
    removeUnrealBloomPass() {
        if (this.unrealBloomPass) {
            this.composer.removePass(this.unrealBloomPass)
            this.unrealBloomPass.dispose()
            this.unrealBloomPass = null
        }
    }
    clearSelected() {
        this.selectedObjects = []
        this.selectedObjects.forEach((e) => {
            this.disableOutline(e.node)
        })
    }
    addSelect(obj: BaseObject) {
        if (!this.selectedObjects.find((item) => item.id === obj.id)) {
            this.selectedObjects.push(obj)
            this.enableOutline(obj.node)
        }
    }
    removeSelect(obj: BaseObject) {
        const index = this.selectedObjects.findIndex((item) => item.id === obj.id)
        if (index !== -1) {
            this.selectedObjects.splice(index, 1)
            this.disableOutline(obj.node)
        }
    }
    private enableOutline(obj: THREE.Object3D) {
        obj.layers.enable(SELECTED_LAYER)
        if (obj.children.length) {
            obj.children.forEach((e) => {
                this.enableOutline(e)
            })
        }
    }
    private disableOutline(obj: THREE.Object3D) {
        obj.layers.disable(SELECTED_LAYER)
        if (obj.children.length) {
            obj.children.forEach((e) => {
                this.disableOutline(e)
            })
        }
    }
}