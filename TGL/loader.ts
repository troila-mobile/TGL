import * as THREE from "three"
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader"

export default class Loader {
    private loader = new GLTFLoader()
    private isLoading = false
    private models = new Map<string, GLTF>()
    private waitLoadUrl: { [key: string]: Array<{ callback: (e: THREE.Group) => void, error?: (e: Error) => void }> } = {}
    loadWithUrl(url: string, func: (object: THREE.Group) => void, error?: (error: Error) => void) {
        this.load(url, func, error)
    }
    private load(url: string, func: (object: THREE.Group) => void, error?: (error: Error) => void) {
        const has = this.models.has(url)
        if (has) {
            const gltf = this.models.get(url)!
            func(this.cloneObject(gltf))
        } else {
            if (!(url in this.waitLoadUrl)) {
                this.waitLoadUrl[url] = [];
            }
            this.waitLoadUrl[url].push({ callback: func, error })
            if (!this.isLoading) {
                this.startLoad()
            }
        }
    }
    private asyncLoad(url: string): Promise<THREE.Group> {
        const has = this.models.has(url)
        if (has) {
            const gltf = this.models.get(url)!
            return Promise.resolve(this.cloneObject(gltf))
        } else {
            return new Promise((resolve, reject) => {
                if (!(url in this.waitLoadUrl)) {
                    this.waitLoadUrl[url] = [];
                }
                this.waitLoadUrl[url].push({ callback: resolve })
                if (!this.isLoading) {
                    this.startLoad()
                }
            })
        }
    }
    private startLoad() {
        this.isLoading = true
        const keys = Object.keys(this.waitLoadUrl)
        if (keys.length > 0) {
            const [url] = keys
            this.loader.load(url, (gltf) => {
                this.models.set(url, gltf)
                this.waitLoadUrl[url].forEach((object) => {
                    object.callback(this.cloneObject(gltf))
                })
                delete this.waitLoadUrl[url]
                this.startLoad()
            }, undefined, (event) => {
                console.log('error url', url);
                this.waitLoadUrl[url].forEach((object) => {
                    object.error && object.error(event.error)
                })
                delete this.waitLoadUrl[url]
                this.startLoad()
            })
        } else {
            this.isLoading = false
        }
    }
    private cloneObject(gltf: GLTF) {
        const o = gltf.scene.clone(true)
        o.traverse((item) => {
            if (item instanceof THREE.Mesh) {
                if (item.material instanceof Array) {
                    item.material = item.material.map((mat) => {
                        return mat.clone()
                    })
                } else {
                    item.material = item.material.clone()
                }
            }
        })
        if (gltf.animations.length > 0) {
            o.animations = gltf.animations.map((animation) => {
                return animation.clone()
            })
        }
        return o
    }
}
