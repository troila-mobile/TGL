import App from "./app"
import { queryIntersects } from "./utils"
import ClassType from "./classType"
import { EventEmitter } from "events"

interface EventMap {
    "dblclick": MouseEvent;
    "mousemove": MouseEvent;
    "click": MouseEvent;
}

export default class Picker {
    app: App
    objects: THREE.Object3D[] = []
    enable = true
    event = new EventEmitter()
    constructor(app: App) {
        this.app = app
        this.onMouseMove()
        this.onMouseDoubleClick()
        this.onMouseClick()
    }
    onMouse<K extends keyof EventMap>(eventType: K, callback: (event: MouseEvent) => void) {
        return this.app.rendererManager.addEventListener(eventType, (event: EventMap[K]) => {
            if (!this.app.level.current) {
                return
            }
            const intersects = queryIntersects(event, this.app.rendererManager.renderer, this.app.cameraManager.camera, this.app.level.current.type === ClassType.Room ? this.app.level.current.parent!.renderNode : this.app.level.current.renderNode)
            this.objects = intersects.map((e) => e.object)
            callback(event)
        })
    }
    onMouseMove() {
        this.onMouse('mousemove', (event) => {
            this.event.emit('mousemove', this.objects)
        })
    }
    onMouseDoubleClick() {
        this.onMouse('dblclick', (event) => {
            this.event.emit('dblclick', this.objects)
        })
    }
    onMouseClick() {
        this.onMouse('click', (event) => {
            this.event.emit('click', this.objects)
        })
    }
    on<K extends keyof EventMap>(type: K, callback: (objects: THREE.Object3D[]) => void) {
        this.event.on(type, callback)
        return () => {
            this.event.removeListener(type, callback)
        }
    }
    remove<K extends keyof EventMap>(type: K, callback: (objects: THREE.Object3D[]) => void) {
        this.event.removeListener(type, callback)
    }
}

