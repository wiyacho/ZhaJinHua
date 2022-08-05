import { kit } from "../../kit/kit";
import Main from "../app";
import { BUNDLE_REPORT } from "../config/config";
import { BACK_STATE } from "../config/enum";
import { HIDE_COMMON_HAND_GUILD, STATE_TO_BOOK_LIST, STATE_TO_GAME, STATE_TO_GAME_LIST, STATE_TO_HALL, STATE_TO_LESSON, STATE_TO_PICTURE_BOOK, STOP_BACKGROUND_MUSIC } from "../config/event";
import { DownLoadManager } from "../manager/DownLoadManager";
import LessonManagerV2 from "../manager/LessonManagerV2";
import { UserDataManager } from "../manager/userDataManager";
import ExtracurricularBooKState from "./extracurricularBooKState";
import ExtracurricularGameState from "./extracurricularGameState";
import GameListState from "./gameListState";
import HallStateV2 from "./HallStateV2";
import loadingStateV2 from "./loadingStateV2";
import PictureBookListState from "./pictureBookListState";

export default class ReportState implements kit.fsm.State<Main> {
    public entity: Main;
    private reportNode: cc.Node;
    private encourageNode: cc.Node;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    // 进入学习报告的前提条件：本单元所有课程至少全部为已查看状态，LESSON_STATE
    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            kit.manager.Event.on(STATE_TO_HALL, this.toHall, this);
            kit.manager.Event.on(STATE_TO_LESSON, this.onLessonItemClick, this);
            kit.manager.Event.on(STATE_TO_GAME_LIST, this.onGameListClick, this);
            kit.manager.Event.on(STATE_TO_BOOK_LIST, this.onBookListClick, this);
            // 课外游戏
            kit.manager.Event.on(STATE_TO_GAME, this.toGameList, this);
            kit.manager.Event.on(STATE_TO_PICTURE_BOOK, this.toBookList, this);
            kit.system.timer.doOnce(1000, () => {
                kit.manager.resources.loadRes(BUNDLE_REPORT, `prefab/${BUNDLE_REPORT}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error, result) => {
                    if (error) {
                        rej(error);
                        return;
                    }
                    // LessonManager.instance.reportEnter(data);
                    this.reportNode = cc.instantiate(result)
                    this.entity.contentNode.addChild(this.reportNode);
                   
                })
                res();
            })
        })
    }
    public execute(data?: any): void {
    }
    public exit(data?: any): void {
        kit.manager.Event.off(STATE_TO_HALL, this.toHall, this);
        kit.manager.Event.off(STATE_TO_LESSON, this.onLessonItemClick, this);
        kit.manager.Event.off(STATE_TO_GAME_LIST, this.onGameListClick, this);
        kit.manager.Event.off(STATE_TO_BOOK_LIST, this.onBookListClick, this);
        // 课外游戏
        kit.manager.Event.off(STATE_TO_GAME, this.toGameList, this);
        kit.manager.Event.off(STATE_TO_PICTURE_BOOK, this.toBookList, this);
        this.entity.contentNode.removeChild(this.reportNode);
        this.reportNode.destroy();
        if (this.encourageNode) {
            this.encourageNode.destroy();
        }
        kit.manager.Event.emit(HIDE_COMMON_HAND_GUILD);
        kit.manager.resources.releaseAsset(BUNDLE_REPORT);
        // cc.assetManager.removeBundle(this.bundle);
    }

    private toHall(event: any): void {
        // this.entity.stateMachine.ChangeState(HallState);
        this.entity.changeState(HallStateV2)
    }

    private async onLessonItemClick(event: any) {
        await LessonManagerV2.instance.initChapterData(event.data);
        DownLoadManager.instance.initDownLoadInfo();
        // cc.log(" ====initDownLoadInfo11")
        // DownLoadManager.instance.checkDownLoaded(1, (suc:boolean)=>{

        // }, (percent:number) => {

        // })


        kit.manager.Event.emit(STOP_BACKGROUND_MUSIC);
        UserDataManager.instance.backState = BACK_STATE.LessonState;
        let chapterData = LessonManagerV2.instance.currentChapterData;
        // cc.log(" ====initDownLoadInfo222: ", chapterData)

        this.entity.changeState(loadingStateV2, chapterData);
    }

    private onGameListClick(event: any): void {
        UserDataManager.instance.backState = BACK_STATE.GameListState;
        this.entity.changeState(GameListState, event.data);
    }

    private onBookListClick(event: any): void {
        UserDataManager.instance.backState = BACK_STATE.PictureBookListState;
        this.entity.changeState(PictureBookListState);
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
        cc.log("跳转绘本", data);
        // this.entity.stateMachine.ChangeState(extracurricularBooKState, data);
        this.entity.changeState(ExtracurricularBooKState, data);
    }
}