import Events from '../../kit/events/events';
import { kit } from '../../kit/kit';
import ModelManager from '../../kit/model/ModelManager';
import EventSystem from '../../kit/system/event/EventSystem';
import Main from "../app";
import { BUNDLE_HALL_V2 } from "../config/config";
import { BACK_STATE, PARENT_DOOR_TYPE } from "../config/enum";
import { ADD_GUILD_HAND_TIMER, HIDE_COMMON_HAND_GUILD, NOVICE_GUIDE_FINISH, PLAY_BACKGROUND_MUSIC, SHOW_TIGO_GREET, STATE_TO_BOOK_LIST, STATE_TO_ENCOURAGE_LIST, STATE_TO_FEED_BACK, STATE_TO_GAME_LIST, STATE_TO_LESSON, STATE_TO_REPORT, STOP_BACKGROUND_MUSIC } from '../config/event';
import Spot from '../config/spot';
import LessonManagerV2 from '../manager/LessonManagerV2';
import { UserDataManager } from "../manager/userDataManager";
import { DownLoadManager } from './../manager/DownLoadManager';
import EncourageListState from './encourageListState';
import GameListState from "./gameListState";
import NoviceGuideState from './globalState/NoviceGuideState';
import loadingStateV2 from './loadingStateV2';
import parentDoorState from './parentDoorState';
import PictureBookListState from "./pictureBookListState";
import ReportState from "./reportState";


export default class HallStateV2 implements kit.fsm.State<Main> {
    public entity: Main;
    private hallNode: cc.Node;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public enter(data?: any): Promise<void> {
        if (cc.sys.isNative) {
            AppHelper.setRestart(false)
        }
        return new Promise(async (res, rej) => {
            kit.manager.Event.on(STATE_TO_FEED_BACK, this.onFeedBackClick, this);
            kit.manager.Event.on(STATE_TO_LESSON, this.onLessonItemClick, this);
            kit.manager.Event.on(STATE_TO_REPORT, this.onReportItemClick, this);
            kit.manager.Event.on(STATE_TO_GAME_LIST, this.onGameListClick, this);
            kit.manager.Event.on(STATE_TO_BOOK_LIST, this.onBookListClick, this);
            kit.manager.Event.on(NOVICE_GUIDE_FINISH, this.onNoviceGuideFinish, this)
            kit.manager.Event.on(STATE_TO_ENCOURAGE_LIST, this.onEncourageListClick, this)


            let _guideStep = UserDataManager.instance.guideStep;
            await LessonManagerV2.instance.initLessonData();

            kit.manager.resources.loadRes(BUNDLE_HALL_V2, `prefab/${BUNDLE_HALL_V2}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error);
                    rej(error);
                    return;
                }
                this.hallNode = cc.instantiate(prefab);
                this.entity.contentNode.addChild(this.hallNode);

                // let preState = this.entity.stateMachine.PreviousState;
                // if (preState instanceof FirstPageState) { //
                kit.system.spot.send(Spot.AELC_Home);
                // }
                // // 新手引导
                // (_guideStep !== -1) && this.entity.stateMachine.AddGlobalState(NoviceGuideState);

                // // tigo打招呼
                // let preState = this.entity.stateMachine.PreviousState;
                // if (preState instanceof FirstPageState) { //
                //     let _guideStep = UserDataManager.instance.guideStep;
                //     if (_guideStep === -1) {
                //         kit.system.timer.doFrameOnce(1, () => {
                //             kit.manager.Event.emit(SHOW_TIGO_GREET);
                //         }, this);
                //     }
                // }
                // // 课程引导、绘本引导
                // let clickPicBook = kit.util.LocalStorage.getBool(HAS_CLICK_PICKBOOK) || false;
                // if (preState instanceof LessonState && !clickPicBook) { //
                //     kit.system.timer.doFrameOnce(30, () => {
                //         let hallComp = this.hallNode.getComponent("hall");
                //         let worldPos = hallComp.picBookNode.parent.convertToWorldSpaceAR(hallComp.picBookNode.position);
                //         kit.manager.Event.emit(SHOW_COMMON_HAND_GUILD, worldPos);
                //     });
                // } else {
                //     let _guideStep = UserDataManager.instance.guideStep;
                //     (_guideStep == -1) && kit.manager.Event.emit(ADD_GUILD_HAND_TIMER);
                // }

                kit.manager.Event.emit(ADD_GUILD_HAND_TIMER);

                EventSystem.emit(Events.HOTFIX_RM)
                // 播放背景音乐
                kit.manager.Event.emit(PLAY_BACKGROUND_MUSIC);
                res();
            })
        })
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        kit.manager.Event.emit(HIDE_COMMON_HAND_GUILD);
        // this.entity.contentNode.removeChild(this.hallNode);
        if (this.hallNode) {
            this.hallNode.destroy();
            kit.manager.resources.releaseAsset(BUNDLE_HALL_V2);
        }
        // cc.assetManager.removeBundle(this.bundle);
        kit.manager.Event.off(STATE_TO_FEED_BACK, this.onFeedBackClick, this);
        kit.manager.Event.off(STATE_TO_LESSON, this.onLessonItemClick, this);
        kit.manager.Event.off(STATE_TO_REPORT, this.onReportItemClick, this);
        kit.manager.Event.off(STATE_TO_GAME_LIST, this.onGameListClick, this);
        kit.manager.Event.off(STATE_TO_BOOK_LIST, this.onBookListClick, this);
        kit.manager.Event.off(NOVICE_GUIDE_FINISH, this.onNoviceGuideFinish, this)
        kit.manager.Event.off(STATE_TO_ENCOURAGE_LIST, this.onEncourageListClick, this)
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
        await loadingStateV2.showCloud(this.entity, chapterData.type)
        this.entity.changeState(loadingStateV2, chapterData);
    }

    private onFeedBackClick(event: any): void {
        this.entity.changeState(parentDoorState, PARENT_DOOR_TYPE.USER_FEED_BACK);
    }

    private onReportItemClick(event: any): void {
        this.entity.changeState(ReportState, event.data);
    }

    private onGameListClick(event: any): void {
        UserDataManager.instance.backState = BACK_STATE.GameListState;
        this.entity.changeState(GameListState, event.data);
    }

    private onBookListClick(event: any): void {
        UserDataManager.instance.backState = BACK_STATE.PictureBookListState;
        this.entity.changeState(PictureBookListState);
    }

    private onEncourageListClick(event: any): void {
        UserDataManager.instance.backState = BACK_STATE.EncourageListState;
        this.entity.changeState(EncourageListState);
    }

    private onNoviceGuideFinish(event: any) {
        this.entity.stateMachine.RemoveGlobalState(NoviceGuideState);
        kit.manager.Event.emit(SHOW_TIGO_GREET);
        kit.manager.Event.emit(ADD_GUILD_HAND_TIMER);
    }


}