import ExtracurricularBooKState from "./extracurricularBooKState";
import Main from "../app";
import { BUNDLE_PICTURE_BOOK_LIST, HAS_CLICK_PICKBOOK } from "../config/config";
import { PLAY_BACKGROUND_MUSIC, STATE_TO_HALL, STATE_TO_PICTURE_BOOK, STOP_BACKGROUND_MUSIC } from "../config/event";
import { kit } from "../../kit/kit";
import Spot from "../config/spot";
import HallStateV2 from "./HallStateV2";
import ModelManager from "../../kit/model/ModelManager";

export default class PictureBookListState implements kit.fsm.State<Main> {
    public entity: Main;
    private bookListNode: cc.Node;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            kit.manager.Event.on(STATE_TO_HALL, this.showHall, this)
            kit.manager.Event.on(STATE_TO_PICTURE_BOOK, this.onLessonItemClick, this);
            kit.util.LocalStorage.setBool(HAS_CLICK_PICKBOOK, true);
            kit.manager.Event.emit(PLAY_BACKGROUND_MUSIC);
            kit.manager.resources.loadRes(BUNDLE_PICTURE_BOOK_LIST, `prefab/${BUNDLE_PICTURE_BOOK_LIST}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    rej(error);
                    return;
                }
                this.bookListNode = cc.instantiate(prefab)
                this.entity.contentNode.addChild(this.bookListNode);

                let preState = this.entity.stateMachine.PreviousState;
                if (preState instanceof HallStateV2) { //
                    // kit.system.spot.send(Spot.AELC_ViewPictureBookList, { UserID: ModelManager.instance.UserId });
                }
                res();
            });
        })
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    private showHall(): void {
        // this.entity.stateMachine.ChangeState(HallState);
        this.entity.changeState(HallStateV2);
        kit.system.spot.send(Spot.AELC_QuitPictureBookList);

    }

    private onLessonItemClick(data: any): void {
        kit.manager.Event.emit(STOP_BACKGROUND_MUSIC);
        // this.entity.stateMachine.ChangeState(extracurricularBooKState, data);
        this.entity.changeState(ExtracurricularBooKState, data);
    }


    public exit(data?: any): void {
        kit.manager.Event.off(STATE_TO_HALL, this.showHall, this)
        kit.manager.Event.off(STATE_TO_PICTURE_BOOK, this.onLessonItemClick, this);

        this.entity.contentNode.removeChild(this.bookListNode);
        this.bookListNode.destroy();
        kit.manager.resources.releaseAsset(BUNDLE_PICTURE_BOOK_LIST);
        // cc.assetManager.removeBundle(this.bundle);
    }
}