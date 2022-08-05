import ExtracurricularGameState from "./extracurricularGameState";
import Main from "../app";
import { BUNDLE_GAME_LIST } from "../config/config";
import { PLAY_BACKGROUND_MUSIC, STATE_TO_GAME, STATE_TO_HALL, STOP_BACKGROUND_MUSIC, } from "../config/event";
import { kit } from "../../kit/kit";
import Spot from "../config/spot";
import HallStateV2 from "./HallStateV2";
import ModelManager from "../../kit/model/ModelManager";

// 游戏列表
export default class GameListState implements kit.fsm.State<Main> {
    public entity: Main;
    // private bundle: cc.AssetManager.Bundle;
    private gameListNode: cc.Node;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            kit.manager.resources.loadRes(BUNDLE_GAME_LIST, `prefab/${BUNDLE_GAME_LIST}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error);
                    rej(error);
                    return;
                }
                this.gameListNode = cc.instantiate(prefab)
                this.entity.contentNode.addChild(this.gameListNode);

                kit.manager.Event.emit(PLAY_BACKGROUND_MUSIC);
                kit.manager.Event.on(STATE_TO_HALL, this.showHall, this)
                kit.manager.Event.on(STATE_TO_GAME, this.onGameListClick, this);
                let preState = this.entity.stateMachine.PreviousState;
                if (preState instanceof HallStateV2) { //
                    // kit.system.spot.send(Spot.AELC_ViewGameList, { UserID: ModelManager.instance.UserId });
                }
                res();
            });
        })
    }

    private onGameListClick(data: any): void {
        kit.manager.Event.emit(STOP_BACKGROUND_MUSIC);
        // this.entity.stateMachine.ChangeState(extracurricularGameState, data);
        this.entity.changeState(ExtracurricularGameState, data);
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        kit.manager.Event.off(STATE_TO_HALL, this.showHall, this)
        kit.manager.Event.off(STATE_TO_GAME, this.onGameListClick, this);

        this.entity.contentNode.removeChild(this.gameListNode);
        this.gameListNode.destroy();
        kit.manager.resources.releaseAsset(BUNDLE_GAME_LIST);
        // cc.assetManager.removeBundle(this.bundle);
    }

    private showHall(): void {
        // this.entity.stateMachine.ChangeState(HallState);
        this.entity.changeState(HallStateV2);
        kit.system.spot.send(Spot.AELC_QuitGameList);

    }

}