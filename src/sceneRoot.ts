import BaseObject from "./baseObject"
import ClassType from "./classType"
export default class SceneRoot extends BaseObject {
    type = ClassType.SceneRoot
    get parks() {
        return []
    }
    load() {

    }
}