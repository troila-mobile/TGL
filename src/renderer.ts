import * as THREE from "three"
import Stats from "stats.js"

export default class Renderer {
    renderer: THREE.WebGLRenderer
    stats: Stats
    constructor() {
        this.stats = new Stats()
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        this.renderer.physicallyCorrectLights = true
        // this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.setClearColor(0xcccccc)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(document.body.clientWidth, document.body.clientHeight)
        document.body.appendChild(this.renderer.domElement)
        document.body.appendChild(this.stats.dom)
    }
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (ev: HTMLElementEventMap[K]) => void) {
        this.renderer.domElement.addEventListener(type, listener)
        return () => { this.renderer.domElement.removeEventListener(type, listener) }
    }
    resize() {
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(document.body.clientWidth, document.body.clientHeight)
    }
}