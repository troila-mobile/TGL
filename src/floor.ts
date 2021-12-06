import { LevelParams } from "./level"
import BaseObject, { onEnterViewParams } from "./baseObject"
import ClassType from "./classType"

export default class Floor extends BaseObject {
    type = ClassType.Floor
    onEnterLevel() {
        this.brothers.forEach((item) => {
            item.visible = false
        })
    }
    onLeaveLevel(params: LevelParams) {
        if (params.current.lodLevel <= this.lodLevel) {
            this.brothers.forEach((item) => {
                item.visible = true
            })
        }
    }
    onEnterView(params?: onEnterViewParams) {
        return super.onEnterView({
            yAngle: 50,
            radiusFactor: 2.5,
            ...(params || {}),
        })
    }
}