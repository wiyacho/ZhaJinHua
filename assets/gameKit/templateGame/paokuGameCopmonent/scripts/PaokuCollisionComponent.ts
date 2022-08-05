import EventSystem from "../../../../kit/system/event/EventSystem";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PaokuCollisionComponent extends cc.Component {
    //todo aabb reset, but still check by preAabb, result 'this.colliderTarget = other.node'
    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        EventSystem.emit("PaikuOnCollisionEnter", {other, self})
    }

    onCollisionStay(other: cc.BoxCollider, self: cc.BoxCollider) {
        EventSystem.emit("PaikuOnCollisionStay", {other, self})
    }
   
    onCollisionExit(other: cc.BoxCollider, self: cc.BoxCollider) {
        EventSystem.emit("PaikuOnCollisionExit", {other, self})
    }
}
