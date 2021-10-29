import * as THREE from "three"
import { v4 as uuidv4 } from 'uuid'

export const queryIntersects = (event: MouseEvent, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Object3D) => {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    }
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    try {
        const intersects = raycaster.intersectObject(scene, true)
        return intersects
    } catch (error) {
        return []
    }
}

export const getCenterSizeWithObject = (obj: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3()).length()
    const center = box.getCenter(new THREE.Vector3())
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    return {
        center,
        size,
        radius: sphere.radius
    }
}

export const generateUUID = () => {
    return uuidv4()
}

export const getObjectWithName = (object: THREE.Object3D, name: string) => {
    return object.children.find((e) => {
        return e.name.split('@')[0] === name
    })
}

export const recursiveObjectForUUID = (selectedObject: THREE.Object3D, objects: { model: THREE.Object3D, func: Function }[], failed?: Function) => {
    const obj = objects.find((e) => {
        return e.model?.uuid === selectedObject.uuid
    })
    if (obj && obj.model.name !== '顶层' && !obj.model.name.includes('Short_Wall') && !obj.model.name.includes('Long_Wall')) {
        obj.func(obj.model)
        return
    }
    if (selectedObject.parent) {
        recursiveObjectForUUID(selectedObject.parent, objects, failed)
    } else {
        failed && failed()
    }
}