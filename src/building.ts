import * as THREE from "three"
import BaseObject, { onEnterViewParams } from "./baseObject"
import ClassType from "./classType"
import TWEEN from "@tweenjs/tween.js"
import { LevelParams } from "./level"
import Floor from "./floor"

interface floorPosition {
    [id: string]: [number, number, number]
}
export default class Building extends BaseObject {
    type = ClassType.Building
    expanded = false
    private initLocalPositionWithFloor: floorPosition = {}
    get floors() {
        return this.children.filter((item) => item.type === ClassType.Floor) as Floor[]
    }
    viewDidLoad() {
        super.viewDidLoad()
        this.visible = false
        const worldPosition = new THREE.Vector3()
        this.node.getWorldPosition(worldPosition)
        this.renderNode.position.copy(worldPosition)
        this.app.sceneManager.scene.add(this.renderNode)
    }
    onEnterLevel(initParams: any) {
        this.visible = true
        this.floors.forEach((item) => {
            this.initLocalPositionWithFloor[item.id] = item.localPosition
        })
    }
    onLeaveLevel(params: LevelParams) {
        if (params.current.lodLevel < this.lodLevel) {
            this.visible = false
        }
    }
    expandFloors(params = {
        time: 700,
        distance: 7,
        complete: function () { }
    }) {
        const {
            time,
            distance,
            complete
        } = params
        const coords = JSON.parse(JSON.stringify(this.initLocalPositionWithFloor)) as floorPosition
        const target: typeof coords = {}
        let index = 0
        for (const id in coords) {
            const floorPosition = coords[id]
            target[id] = [floorPosition[0], floorPosition[1] + distance * index, floorPosition[2]]
            ++index
        }
        new TWEEN.Tween(coords)
            .to(target, time)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.floors.forEach((item) => {
                    item.localPosition = coords[item.id]
                })
            })
            .onComplete(() => {
                complete()
            })
            .onStart(() => {
                this.expanded = true
            })
            .start()
    }
    unexpandFloors(params = {
        time: 700,
        complete: function () { }
    }) {
        const {
            time,
            complete
        } = params
        const target = JSON.parse(JSON.stringify(this.initLocalPositionWithFloor)) as floorPosition
        const coords: typeof target = {}
        this.floors.forEach((item) => {
            coords[item.id] = item.localPosition
        })
        new TWEEN.Tween(coords)
            .to(target, time)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.floors.forEach((item) => {
                    item.localPosition = coords[item.id]
                })
            })
            .onComplete(() => {
                complete()
            })
            .onStart(() => {
                this.expanded = false
            })
            .start()
    }
    onEnterView(params?: onEnterViewParams) {
        return super.onEnterView({
            xAngle: 45,
            yAngle: 0,
            ...(params || {}),
        })
    }
}
