import { LevelParams } from "./level"
import BaseObject from "./baseObject"
import ClassType from "./classType"

export default class Room extends BaseObject {
    type = ClassType.Room
    onEnterLevel(initParams: any) {
        this.otherRoomThings.forEach((item) => {
            item.style.opacity = 0.2
        })
        this.things.forEach((item) => {
            item.load()
        })
    }
    onLeaveLevel(params: LevelParams) {
        this.otherRoomThings.forEach((item) => {
            item.style.opacity = 1
        })
        this.things.forEach((item) => {
            item.release()
        })
    }
    get things() {
        return this.brothers.filter((item) => item.extraData && item.extraData.hasOwnProperty('belongRoom') && (item.extraData.belongRoom === this.id))
    }
    get otherRoomThings() {
        return this.brothers.filter((item) => item.extraData && item.extraData.hasOwnProperty('belongRoom') && (item.extraData.belongRoom !== this.id))
    }
}
