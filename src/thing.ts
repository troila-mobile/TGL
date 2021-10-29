import BaseObject from "./baseObject"
import { LevelParams } from "./level"

export default class Thing extends BaseObject {
    viewDidLoad() {
        super.viewDidLoad()
        if (this.parent) {
            this.parent.renderNode.add(this.renderNode)
            this.renderNode.position.set(this.localPosition[0], this.localPosition[1], this.localPosition[2])
        }
    }

    onEnterLevel(initParams?: any) {
        this.parent!.style.opacity = 0.01
        this.brothers.forEach((item) => {
            item.style.opacity = 0.01
        })
    }

    onLeaveLevel(params?: LevelParams) {
        this.parent!.style.opacity = 1
        this.brothers.forEach((item) => {
            item.style.opacity = 1
        })
    }

    onEnterView(params?: { xAngle?: number; yAngle?: number; radiusFactor?: number, onComplete?: (e?: unknown) => void }) {
        return super.onEnterView({
            xAngle: 0,
            yAngle: 0,
            ...(params || {}),
        })
    }
}
