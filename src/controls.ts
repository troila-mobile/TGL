import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import App from "./app"

export default class Controls {
    app: App
    controls: OrbitControls
    rightOffset = {
        offsetX: 0,
        offsetY: 0
    }
    constructor(app: App) {
        this.app = app
        this.controls = new OrbitControls(this.app.cameraManager.camera, this.app.rendererManager.renderer.domElement)
        this.controls.minDistance = 0.01
        this.controls.maxDistance = 100000
        this.controls.enablePan = true
        this.controls.enableDamping = false
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.dampingFactor = 0.12;
        this.controls.rotateSpeed = 1.25;
        this.controls.panSpeed = 1.25;
        this.controls.screenSpacePanning = true;
        this.controls.domElement.ownerDocument?.addEventListener('pointerup', this.onPointerUp, false)
        this.controls.domElement.ownerDocument?.addEventListener('pointerdown', this.onPointerDown, false)
        document.oncontextmenu = function (event) {
            event.returnValue = false
        }
    }
    onPointerUp = (event: DocumentEventMap['pointerup']) => {
        if (event.button === 2) {
            if (this.rightOffset && this.rightOffset.offsetX === event.offsetX && this.rightOffset.offsetY === event.offsetY) {
                if (this.app.level.current && this.app.level.current.lodLevel > 1) {
                    this.app.level.rollback()
                }
            }
            this.rightOffset = {
                offsetX: 0,
                offsetY: 0
            }
        }
    }
    onPointerDown = (event: DocumentEventMap['pointerdown']) => {
        if (event.button === 2) {
            this.rightOffset = {
                offsetX: event.offsetX,
                offsetY: event.offsetY
            }
        }
    }
}
