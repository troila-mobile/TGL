import * as THREE from "three"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import App from './app'

const ImageArrayByPath = (path: string) => {
    return ["posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg"].map((name) => require(`./environment/${path}/${name}`).default)
}

export type skyBoxs = 'light' | 'dark'

export default class Scene {
    scene: THREE.Scene
    cubeLoader = new THREE.CubeTextureLoader()
    skyBoxs = {
        'light': ImageArrayByPath('light-skybox'),
        'dark': ImageArrayByPath('dark-skybox')
    }
    skybox: skyBoxs = 'dark'
    app: App
    changeSkyBox(skybox: skyBoxs) {
        this.skybox = skybox
        const textureCube = this.cubeLoader.load(this.skyBoxs[skybox])
        this.scene.background = textureCube
    }
    constructor(app: App, background: string | number) {
        this.app = app
        this.scene = new THREE.Scene()
        // this.scene.background = new THREE.Color(background)
        this.scene.add(this.app.cameraManager.camera)
        new RGBELoader()
            .setDataType(THREE.UnsignedByteType)
            .load(require('./environment/venice_sunset_1k.hdr').default, (texture) => {
                const pmremGenerator = new THREE.PMREMGenerator(this.app.rendererManager.renderer);
                pmremGenerator.compileEquirectangularShader();
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                pmremGenerator.dispose();
                this.scene.environment = envMap;
            });
    }
}
