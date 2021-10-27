enum LevelEventType {
    /**
     * 通知场景层级发生改变
     */
    LevelChange = "levelchange",
    /**
     * 通知进入下一层级
     */
    EnterLevel = "enterLevel",
    /**
     * 通知退出当前层级
     */
    LeaveLevel = "leaveLevel",
    /**
     * 通知摄像机飞入下一层级结束
     */
    LevelFlyEnd = "levelflyend"
}

export default LevelEventType