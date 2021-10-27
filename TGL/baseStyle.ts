import * as THREE from "three"
import BaseObject from "./baseObject"

export default class BaseStyle {
    node: THREE.Object3D
    opacity: number = 1
    constructor(node: THREE.Object3D, instance: BaseObject) {
        this.node = node
        const handler = {
            set: (obj: this, prop: keyof BaseStyle, value: any) => {
                if (prop === 'opacity') {
                    const ids = instance.children.filter((e) => e instanceof BaseObject).map((e) => e.renderNode.uuid)
                    traverseVisible(this.node, (item) => {
                        if (item instanceof THREE.Mesh) {
                            let materials = item.material instanceof Array ? item.material : [item.material]
                            materials.forEach((material) => {
                                const resultOpacity = value / this.opacity * material.opacity
                                material.transparent = (resultOpacity >= 1 ? false : true)
                                material.opacity = resultOpacity
                                material.transparent = true
                                material.format = THREE.RGBAFormat
                            })
                        }
                    }, ids)
                }
                obj[prop] = value;
                return true
            }
        }
        return new Proxy(this, handler)
    }
}

const traverseVisible = (object: THREE.Object3D, callback: (object: THREE.Object3D) => void, filterIds: string[]) => {
    if (filterIds.includes(object.uuid)) return;
    callback(object);

    const children = object.children;
    for (let i = 0, l = children.length; i < l; i++) {
        traverseVisible(children[i], callback, filterIds);
    }
}