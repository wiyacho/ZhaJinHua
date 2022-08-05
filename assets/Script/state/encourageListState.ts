import { kit } from "../../kit/kit";
import Main from "../app";
import { BUNDLE_ENCOURAGE_LIST } from "../config/config";
import { STATE_TO_GAME, STATE_TO_HALL, STATE_TO_PICTURE_BOOK, STOP_BACKGROUND_MUSIC } from "../config/event";
import ExtracurricularBooKState from "./extracurricularBooKState";
import ExtracurricularGameState from "./extracurricularGameState";
import HallStateV2 from "./HallStateV2";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EncourageListState implements kit.fsm.State<Main> {
    public entity: Main;
    private prefabNode: cc.Node = null;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            kit.manager.Event.on(STATE_TO_HALL, this.toHall, this);
            // 课外游戏
            kit.manager.Event.on(STATE_TO_GAME, this.toGameList, this);
            kit.manager.Event.on(STATE_TO_PICTURE_BOOK, this.toBookList, this);

            kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `prefab/${BUNDLE_ENCOURAGE_LIST}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error, result) => {
                if (error) {
                    rej(error);
                }
                this.prefabNode = cc.instantiate(result);
                this.entity.contentNode.addChild(this.prefabNode);
                res();
            })
        })
    }

    public execute(data?: any): void {

    }

    public exit(data?: any): void {
        this.prefabNode.destroy();
        kit.manager.Event.off(STATE_TO_HALL, this.toHall, this);
        kit.manager.Event.off(STATE_TO_GAME, this.toGameList, this);
        kit.manager.Event.off(STATE_TO_PICTURE_BOOK, this.toBookList, this);

        kit.manager.resources.releaseAsset(BUNDLE_ENCOURAGE_LIST);
    }
    // 跳转课外游戏
    private toGameList(data: any) {
        kit.manager.Event.emit(STOP_BACKGROUND_MUSIC);
        // this.entity.stateMachine.ChangeState(extracurricularGameState, data);
        this.entity.changeState(ExtracurricularGameState, data);
    }

    // 跳转课外绘本
    private toBookList(data) {
        kit.manager.Event.emit(STOP_BACKGROUND_MUSIC);
        // this.entity.stateMachine.ChangeState(extracurricularBooKState, data);
        this.entity.changeState(ExtracurricularBooKState, data);
    }

    private toHall(event: any): void {
        // this.entity.stateMachine.ChangeState(HallState);
        this.entity.changeState(HallStateV2);
    }

}
