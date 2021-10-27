import { LevelParams } from "./level"
import BaseObject from "./baseObject"
import ClassType from "./classType"

export default class Floor extends BaseObject {
    type = ClassType.Floor
    onEnterLevel() {
        console.log("item=>>>>>>>",this);
        this.brothers.forEach((item) => {
            item.visible = false
        })
        this.children.forEach((item) => {
            item.visible = true
        })
    }
    onLeaveLevel(params: LevelParams) {
        if (params.current.lodLevel <= this.lodLevel) {
            this.brothers.forEach((item) => {
                item.visible = true
            })
            /*this.children.forEach((item) => {
                item.visible = false
            })*/
        }
    }
    onEnterView() {
        return super.onEnterView({
            yAngle: 50,
            radiusFactor: 2.5
        })
    }
}
