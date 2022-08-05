import PlatformSystem from "../../kit/framework/platform/PlatformSystem";
import { kit } from "../../kit/kit";
import Main from "../app";
import { BUNDLE_PARENT_DOOR } from "../config/config";
import { PARENT_DOOR_TYPE } from "../config/enum";
import { PARENT_DOOR_JUMP, STATE_TO_HALL } from "../config/event";
import feedBackState from "./feedBackState";
import HallStateV2 from "./HallStateV2";
const { ccclass, property } = cc._decorator;
@ccclass
export default class parentDoorState implements kit.fsm.State<Main> {
    public entity: Main;
    public jumpType: any
    public parentDoorNode: cc.Node = null

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public enter(data?: any): Promise<void> {
        this.jumpType = data
        return new Promise((res, rej) => {
            kit.manager.resources.loadRes(BUNDLE_PARENT_DOOR, `prefab/${BUNDLE_PARENT_DOOR}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error);
                    rej(error);
                    return;
                }
                this.parentDoorNode = cc.instantiate(prefab)
                this.entity.uiNode.addChild(this.parentDoorNode);
                kit.manager.Event.on(PARENT_DOOR_JUMP, this.Jump, this)
                kit.manager.Event.on(STATE_TO_HALL, this.showHall, this)
                res();
            });
        })
    }

    private Jump(): void {
        switch (this.jumpType) {
            case PARENT_DOOR_TYPE.USER_FEED_BACK:
                this.entity.changeState(feedBackState);
                break
        }
    }

    private showHall(): void {
        this.entity.changeState(HallStateV2);
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        kit.manager.Event.off(PARENT_DOOR_JUMP, this.Jump, this)
        kit.manager.Event.off(STATE_TO_HALL, this.showHall, this)

        this.parentDoorNode.destroy();
        kit.manager.resources.releaseAsset(BUNDLE_PARENT_DOOR);
    }
}