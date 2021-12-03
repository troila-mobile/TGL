import App from "./app"
import { queryIntersects } from "./utils"
import ClassType from "./classType"
import { EventEmitter } from "events"
import * as THREE from "three"
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'

interface EventMap {
    "dblclick": MouseEvent;
    "mousemove": MouseEvent;
    "click": MouseEvent;
}

export default class Picker {
    private app: App
    objects: THREE.Object3D[] = []
    enable = true
    event = new EventEmitter()
    pickingScene = new THREE.Scene()
    pickingTexture: THREE.WebGLRenderTarget
    private selectionObjects: THREE.Object3D[] = []
    private id = 1
    private _disableGPUPicker = true
    private eventTypes: Array<keyof EventMap> = ['mousemove', 'click', 'dblclick']
    set disableGPUPicker(bool: boolean) {
        if (bool !== this.disableGPUPicker) {
            this.app.level.current?.onRelease()
            this._disableGPUPicker = bool
            this.app.level.current?.onLoad()
        }
    }
    get disableGPUPicker() {
        return this._disableGPUPicker
    }
    constructor(app: App) {
        this.app = app
        this.pickingTexture = new THREE.WebGLRenderTarget(1, 1)
        this.startPicker()
        // const renderPass = new RenderPass(this.pickingScene, this.app.cameraManager.camera)
        // this.app.effectComposer.composer.addPass(renderPass)
    }
    startPicker() {
        this.eventTypes.forEach((type) => {
            this.onMouse(type, () => {
                this.event.emit(type, this.objects)
            })
        })
    }
    onMouse<K extends keyof EventMap>(eventType: K, callback: () => void) {
        return this.app.rendererManager.addEventListener(eventType, (event: EventMap[K]) => {
            if (!this.app.level.current) {
                return
            }
            if (this.disableGPUPicker) {
                this.cpuPicking(event, callback)
            } else {
                this.gpuPicking(event, callback)
            }
        })
    }
    cpuPicking(event: MouseEvent, callback: () => void) {
        const intersects = queryIntersects(event, this.app.rendererManager.renderer, this.app.cameraManager.camera, this.app.level.current!.type === ClassType.Room ? this.app.level.current!.parent!.renderNode : this.app.level.current!.renderNode)
        this.objects = intersects.map((e) => e.object)
        callback()
    }
    gpuPicking(event: MouseEvent, callback: () => void) {
        const {
            rendererManager,
            cameraManager
        } = this.app
        // set the view offset to represent just a single pixel under the mouse
        const pixelRatio = rendererManager.renderer.getPixelRatio()
        cameraManager.camera.setViewOffset(rendererManager.renderer.domElement.width, rendererManager.renderer.domElement.height, event.pageX * pixelRatio | 0, event.pageY * pixelRatio | 0, 1, 1)
        // render the picker scene
        rendererManager.renderer.setRenderTarget(this.pickingTexture)
        rendererManager.renderer.render(this.pickingScene, cameraManager.camera)
        rendererManager.renderer.setRenderTarget(null)
        // clear the view offset so rendering returns to normal
        cameraManager.camera.clearViewOffset()
        //create buffer for reading single pixel
        const pixelBuffer = new Uint8Array(4)
        //read the pixel
        rendererManager.renderer.readRenderTargetPixels(this.pickingTexture, 0, 0, 1, 1, pixelBuffer)
        //interpret the pixel as an ID
        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2])
        if (id > 0 && this.selectionObjects[id]) {
            const object = this.selectionObjects[id]
            this.objects = [object]
        } else {
            this.objects = []
        }
        callback()
    }
    on<K extends keyof EventMap>(actions: { [type in K]: (active: boolean) => void }, node: THREE.Object3D) {
        const handles: Array<() => void> = []
        if (this.disableGPUPicker) {
            for (const type in actions) {
                const callback = actions[type]
                const handle = () => {
                    let active = false
                    if (this.objects.length > 0 && node.visible === true) {
                        const selected = this.objects[0]
                        active = Boolean(node.id === selected.id || node.getObjectById(selected.id))
                    }
                    callback(active)
                }
                this.event.on(type, handle)
                handles.push(() => {
                    this.event.removeListener(type, handle)
                })
            }
        } else {
            const clone = node.clone(true)
            clone.position.copy(node.getWorldPosition(new THREE.Vector3()))
            clone.rotation.setFromQuaternion(node.getWorldQuaternion(new THREE.Quaternion()));
            clone.scale.copy(node.getWorldScale(new THREE.Vector3()));
            const cloneMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(this.id),
                side: THREE.DoubleSide,
                fog: false,
            });
            clone.traverse((mesh) => {
                if (mesh instanceof THREE.Mesh) {
                    mesh.material = cloneMaterial;
                }
            })
            this.pickingScene.add(clone)
            this.selectionObjects[this.id] = node;
            this.id = this.id + 1;
            for (const type in actions) {
                const callback = actions[type]
                const handle = () => {
                    let active = false
                    if (this.objects.length > 0 && node.visible === true) {
                        const selected = this.objects[0]
                        active = Boolean(node.id === selected.id)
                    }
                    callback(active)
                }
                this.event.on(type, handle)
                handles.push(() => {
                    this.pickingScene.remove(clone)
                    this.selectionObjects.splice(this.id, 1)
                    this.event.removeListener(type, handle)
                })
            }
        }
        return () => {
            handles.forEach((handle) => { handle() })
        }
    }
    remove<K extends keyof EventMap>(type: K, callback: (objects: THREE.Object3D[]) => void) {
        this.event.removeListener(type, callback)
    }
    onLevelChange() {
        if (!this.disableGPUPicker) {
            this.id = 1
            this.selectionObjects = []
            this.pickingScene.clear()
        }
    }
}


