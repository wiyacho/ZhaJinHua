import EventSystem from "../../../../kit/system/event/EventSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaokuClickComponent extends cc.Component {
    
    start () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public onTouchStart () {
        EventSystem.emit("PaokuGameClick");
    }
}
