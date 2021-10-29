import BaseObject from "./baseObject"
import ClassType from "./classType"
export default class Park extends BaseObject {
    type = ClassType.Park
    get buildings() {
        return this.children.filter((item) => item.type === ClassType.Building)
    }
    viewDidLoad() {
        this.visible = false
        this.app.sceneManager.scene.add(this.renderNode)
    }
    onEnterLevel() {
        this.visible = true
    }
    onLeaveLevel() {
        this.visible = false
    }
}
