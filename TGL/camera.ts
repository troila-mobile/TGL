import * as THREE from "three"
import App from "./app"
import BaseObject from "./baseObject"
import { getCenterSizeWithObject } from "./utils"
import TWEEN from "@tweenjs/tween.js"

export default class Camera {
    app: App
    camera: THREE.PerspectiveCamera
    flying = false
    constructor(app: App) {
        this.app = app
        const size = this.app.rendererManager.renderer.getSize(new THREE.Vector2())
        this.camera = new THREE.PerspectiveCamera(60, size.width / size.height, 0.1, 100000)
        this.camera.position.set(0, 0, 200)
        this.camera.lookAt(0, 0, 0)
    }
    resize() {
        const size = this.app.rendererManager.renderer.getSize(new THREE.Vector2())
        this.camera.aspect = size.width / size.height
        this.camera.updateProjectionMatrix()
    }
    flyTo(object: BaseObject, params?: {
        xAngle?: number
        yAngle?: number
        radiusFactor?: number
        onComplete?: (e?: unknown) => void,
        targetOffset?: [x: number, y: number, z: number]
    }) {
        let onCompleteCallBack: Function | null = null
        let onStopCallBack: Function | null = null
        const {
            xAngle,
            yAngle,
            radiusFactor,
            onComplete,
            targetOffset
        } = {
            xAngle: 45,
            yAngle: 15,
            radiusFactor: 2,
            targetOffset: [0, 0, 0],
            ...params,
        }
        const {
            camera
        } = this
        const {
            controls
        } = this.app.controlsManager
        // controls.enabled = false
        const pods = {
            cameraX: camera.position.x,
            cameraY: camera.position.y,
            cameraZ: camera.position.z,
            targetX: controls.target.x,
            targetY: controls.target.y,
            targetZ: controls.target.z
        }
        const tween = new TWEEN.Tween(pods)
        const { center, radius } = getCenterSizeWithObject(object.renderNode)
        const target = new THREE.Vector3(center.x + targetOffset[0], center.y + targetOffset[1], center.z + targetOffset[2])
        const rotation = object.renderNode.rotation
        const xDelta = ((Math.PI / 180) * xAngle!) + rotation.y
        const yDelta = ((Math.PI / 180) * yAngle!) + rotation.x
        const distance = radius * radiusFactor!
        const targetCamera = new THREE.Vector3()
        targetCamera.x = target.x + distance * (Math.sin(xDelta) * Math.cos(yDelta))
        targetCamera.y = target.y + distance * Math.sin(yDelta)
        targetCamera.z = target.z + distance * (Math.cos(xDelta) * Math.cos(yDelta))
        tween.to({
            cameraX: targetCamera.x,
            cameraY: targetCamera.y,
            cameraZ: targetCamera.z,
            targetX: target.x,
            targetY: target.y,
            targetZ: target.z
        }, 1000);
        tween.onStart(() => {
            this.flying = true
        })
        tween.onUpdate(function () {
            camera.position.x = pods.cameraX;
            camera.position.y = pods.cameraY;
            camera.position.z = pods.cameraZ;
            controls.target.x = pods.targetX;
            controls.target.y = pods.targetY;
            controls.target.z = pods.targetZ;
            controls.update();
        })
        tween.onComplete(() => {
            this.flying = false
            // controls.enabled = true
            onComplete && onComplete()
            onCompleteCallBack && onCompleteCallBack()
        })
        tween.onStop(() => {
            this.flying = false
            // controls.enabled = true
            onStopCallBack && onStopCallBack()
        })
        tween.easing(TWEEN.Easing.Cubic.InOut);
        this.flying = true
        tween.start();
        return {
            'stop': () => {
                tween.stop()
            },
            'onComplete': (callback: () => void) => {
                onCompleteCallBack = callback
            },
            'onStop': (callback: () => void) => {
                onStopCallBack = callback
            }
        }
    }
    rotateAround() {
        this.app.controlsManager.controls.autoRotate = true
    }
    stopRotateAround() {
        this.app.controlsManager.controls.autoRotate = false
    }
    autoRotateAround() {
        this.app.controlsManager.controls.autoRotate = !this.app.controlsManager.controls.autoRotate
    }
}