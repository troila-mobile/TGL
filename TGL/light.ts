import * as THREE from "three"
import App from "./app"

export default class Light {
    ambientLight: THREE.AmbientLight
    hemisphereLight: THREE.HemisphereLight
    app: App
    constructor(app: App) {
        this.app = app
        this.hemisphereLight = new THREE.HemisphereLight(
            new THREE.Color(0.9, 1, 1.25),
            new THREE.Color(0.5, 0.5, 0.5),
            0.6
        )
        this.hemisphereLight.name = 'hemisphere_light';
        this.app.sceneManager.scene.add(this.hemisphereLight)
        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2)
        this.ambientLight.name = 'ambient_light'
        this.app.sceneManager.scene.add(this.ambientLight)
        this.app.rendererManager.renderer.toneMappingExposure = 1.0
    }
}