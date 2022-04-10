import * as THREE from "three"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import App from './app'

import darkposx from "./environment/dark-skybox/posx.jpg"
import darknegx from "./environment/dark-skybox/negx.jpg"
import darkposy from "./environment/dark-skybox/posy.jpg"
import darknegy from "./environment/dark-skybox/negy.jpg"
import darkposz from "./environment/dark-skybox/posz.jpg"
import darknegz from "./environment/dark-skybox/negz.jpg"

import lightposx from "./environment/light-skybox/posx.jpg"
import lightnegx from "./environment/light-skybox/negx.jpg"
import lightposy from "./environment/light-skybox/posy.jpg"
import lightnegy from "./environment/light-skybox/negy.jpg"
import lightposz from "./environment/light-skybox/posz.jpg"
import lightnegz from "./environment/light-skybox/negz.jpg"

import sunset from "./environment/venice_sunset_1k.hdr"

console.log('sunset', sunset);


export type skyBoxs = 'light' | 'dark'

export default class Scene {
    scene: THREE.Scene
    cubeLoader = new THREE.CubeTextureLoader()
    skyBoxs = {
        'light': [lightposx, lightnegx, lightposy, lightnegy, lightposz, lightnegz],
        'dark': [darkposx, darknegx, darkposy, darknegy, darkposz, darknegz]
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
            .load(sunset, (texture) => {
                const pmremGenerator = new THREE.PMREMGenerator(this.app.rendererManager.renderer);
                pmremGenerator.compileEquirectangularShader();
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                pmremGenerator.dispose();
                this.scene.environment = envMap;
            });
    }
}
