import { kit } from "../../kit/kit";
import { ResourceType } from "../../kit/manager/ResourcesManager";
import Main from "../app";
import { BUNDLE_LESSON_COMPLETE, BUNDLE_QUIT_LESSON_ALERT, BUNDLE_TOP_BAR_V2 } from "../config/config";
import { CHAPTER_TYPE_V2 } from "../config/enum";
import { BACK, NEXT_LESSON, POPUP_QUIT_LESSON_ALERT, PRE_LESSON, STATE_TO_HALL } from "../config/event";
import AssetsManager from "../manager/assetsManager";
import LessonManagerV2 from "../manager/LessonManagerV2";
import { ChapterVo_V2, LessonVo_V2 } from "../structure/lessonVoV2";
import loadingStateV2 from "./loadingStateV2";
import HallStateV2 from "./HallStateV2";
import ReportState from "./reportState";
import Spot from "../config/spot";
import { VideoEventTransType } from "../../kit/structure/ClientModuleEnum";

export default class lessonStateV2 implements kit.fsm.State<Main> {
    public entity: Main;
    private lessonNode: cc.Node;
    private lessonBundle: string[];

    private lesson: ChapterVo_V2 = null;
    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public async enter(data?: any): Promise<void> {
        // kit.util.LocalStorage.setBool(HAS_CLICK_LESSON_ITEM, true);
        this.lessonBundle = data.bundles;
        this.lesson = data.lesson;
        kit.manager.Event.on(STATE_TO_HALL, this.toHall, this);
        kit.manager.Event.on(NEXT_LESSON, this.toNext, this);
        kit.manager.Event.on(PRE_LESSON, this.toPre, this);
        kit.manager.Event.on(POPUP_QUIT_LESSON_ALERT, this.popupQuitAlert, this);
        kit.manager.Event.on(BACK, this.onBack, this);

        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_CREATED, this.onLessonCreated, this);
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_READY, this.onLessonReady, this);
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_BACK, this.onBack, this);
        kit.manager.Event.on(kit.consts.Event.VIDEO_MODULE_TO_CLIENT, this.onVideoChange, this);
        await this.openLesson(this.lesson);
        // ?????????????????????
        let topBar: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR_V2)
        this.entity.uiNode.addChild(topBar);
        topBar.getComponent("TopBarV2").init({ isShowNext: true });
        kit.system.spot.send(Spot.AELC_EnterModule,
            {
                CourseID: this.lesson.lessonId,
                CourseName: this.lesson.lessonName,
                ModuleName: this.lesson.chapterName
            });
        return Promise.resolve();
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        kit.manager.Event.off(STATE_TO_HALL, this.toHall, this);
        kit.manager.Event.off(NEXT_LESSON, this.toNext, this);
        kit.manager.Event.off(PRE_LESSON, this.toPre, this);
        kit.manager.Event.off(POPUP_QUIT_LESSON_ALERT, this.popupQuitAlert, this);
        kit.manager.Event.off(BACK, this.onBack, this);

        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_CREATED, this.onLessonCreated, this);
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_READY, this.onLessonReady, this);
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_BACK, this.onBack, this);
        kit.manager.Event.off(kit.consts.Event.VIDEO_MODULE_TO_CLIENT, this.onVideoChange, this);

        let ui: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR_V2);
        this.entity.uiNode.removeChild(ui);

        this.closeLesson();
    }

    // ????????????
    private openLesson(lessonData: ChapterVo_V2): Promise<void> {
        LessonManagerV2.instance.chapterBegin(lessonData);
        return this.loadLocalProject(lessonData);

        // switch (lessonData.type) {
        //     case CHAPTER_TYPE_V2.video:
        //         return this.loadLocalProject(lessonData);
        //     case CHAPTER_TYPE_V2.book:
        //         return this.loadLocalProject(lessonData);
        //     case CHAPTER_TYPE_V2.game:
        //         return this.loadLocalProject(lessonData);
        //     default:
        //         return Promise.reject('lesson state openLesson not match');
        // }
    }

    // ????????????
    private closeLesson(): void {
        // ???????????? TODO: lesson???????????????node?????????????????????
        let gameAniNode = this.entity.contentNode.getChildByName("game_ani_end");
        if (gameAniNode && cc.isValid(gameAniNode)) {
            gameAniNode.destroy();
        }

        if (!cc.isValid(this.lessonNode)) {
            return
        }
        if (this.lessonNode) {
            this.lessonNode.destroy();
            this.lessonNode = null;
        }

        kit.manager.resources.releaseAsset(this.lessonBundle);
    }

    // ??????????????????bundle
    private loadLocalProject(lessonData: ChapterVo_V2): Promise<void> {
        return new Promise((res, rej) => {

            let chapterId = lessonData.chapterId;
            let bundleName = '';
            cc.log(`????????????id???${chapterId}`);
            let config: any = lessonData.getChapterConfig();
            bundleName = config.main;

            // ?????????????????? TODO: ?????????????????????
            if (lessonData.type == CHAPTER_TYPE_V2.video) {
                config.params.url = lessonData.fileUrl;
            }

            let bookName = 'PicktureBookNode' + config.params.bookNum;
            let mainPrefab = (lessonData.type === CHAPTER_TYPE_V2.book) ? bookName : bundleName;
            if (config.entry && config.entry != '') {
                mainPrefab = config.entry
            }
            kit.manager.resources.loadRes(bundleName, `${mainPrefab}`, ResourceType.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error);
                    rej(error);
                    return;
                }
                this.lessonNode = cc.instantiate(prefab);
                this.entity.contentNode.addChild(this.lessonNode);
                kit.system.timer.doFrameOnce(1, () => {
                    kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_PARAMS, config.params);
                });
                res();
            })
        })
    }
    // ????????????
    private toHall(): void {
        this.close()
        LessonManagerV2.instance.chapterExit(LessonManagerV2.instance.currentChapterData);
        this.entity.changeState(HallStateV2)
    }

    private close() {
        this.closeLesson();
        // ????????????
        kit.manager.Audio.stopMusic();
        kit.manager.Audio.stopEffect();
        kit.manager.Audio.pauseLoopEffects();
    }

    // ?????????
    private async toPre(): Promise<void> {
        let lesson: ChapterVo_V2 = LessonManagerV2.instance.getPreChapterData();
        if (lesson) { // ????????????
            await loadingStateV2.showCloud(this.entity, lesson.type)
            this.close()
            this.entity.changeState(loadingStateV2, lesson);
        } else { // ????????????
            this.close()
            let lessonData = LessonManagerV2.instance.getCurViewLessonData();
            this.entity.changeState(ReportState, lessonData);
        }
    }

    // ?????????
    private async toNext(): Promise<void> {
        let lesson: ChapterVo_V2 = LessonManagerV2.instance.getNextChapterData();
        if (lesson) { // ????????????
            await loadingStateV2.showCloud(this.entity, lesson.type)
            this.close()
            this.entity.changeState(loadingStateV2, lesson);
        } else { // ????????????
            // ??????1?????????
            // kit.system.timer.doOnce(1000, () => {
            //     this.close()
            // });
            // let lessonData = LessonManagerV2.instance.getCurViewLessonData();
            // this.entity.changeState(ReportState, lessonData);

            let param = {
                lessonInfo: null,
                curChapterData: null,
                callback: () => {
                    kit.manager.Event.emit(BACK);
                }
            }
            let node = AssetsManager.instance.getGlobalNode(BUNDLE_LESSON_COMPLETE);
            node.getComponent(BUNDLE_LESSON_COMPLETE).init(param);
            this.entity.uiNode.addChild(node);
        }
    }

    private popupQuitAlert(): void {
        let alert: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_QUIT_LESSON_ALERT);
        kit.manager.Popup.show(alert, null, { mode: kit.manager.Popup.cacheMode.Frequent });
    }

    private onLessonCreated(): void {
        cc.log('onLessonCreated')
    }

    private onLessonReady(): void {
        cc.log('onLessonReady')
        if (this.lesson.type === CHAPTER_TYPE_V2.video) {
            loadingStateV2.loading.onLessonReady(() => {
                // "???"????????????
                cc.log('????????????...')
            })
        }
    }

    private onBack(): void {
        kit.manager.Event.emit(STATE_TO_HALL);
    }

    private onLessonComplete(): void {
        cc.log('onLessonComplete');
        // LessonManagerV2.instance.chapterComplete(LessonManagerV2.instance.currentChapterData);
        // // ????????????
        // let lessonInfo = LessonManagerV2.instance.getCurViewLessonData();
        // // ???????????????????????????
        // let curChapterData = LessonManagerV2.instance.currentChapterData;
        // let param = {
        //     lessonInfo: lessonInfo,
        //     curChapterData: curChapterData,
        //     callback: () => {
        //         kit.manager.Event.emit(NEXT_LESSON);
        //     }
        // }
        // let node = AssetsManager.instance.getGlobalNode(BUNDLE_LESSON_COMPLETE);
        // node.getComponent(BUNDLE_LESSON_COMPLETE).init(param);
        // this.entity.uiNode.addChild(node);

        LessonManagerV2.instance.chapterComplete(LessonManagerV2.instance.currentChapterData);
        kit.manager.Event.emit(NEXT_LESSON);
    }

    private onVideoChange(event: any): void {
        let eventType: any = event.data.type;
        switch (eventType) {
            case VideoEventTransType.M2C_VIDEO_PLAY_PAUSE:
                // kit.system.spot.send(Spot.AELC_Pause, {
                //     CourseID: this.lesson.lessonId,
                //     ModuleID: this.lesson.chapterId,
                //     CoursenName: this.lesson.lessonName,
                //     ModuleName: this.lesson.chapterName
                // });
                break;
            case VideoEventTransType.M2C_VIDEO_PLAY_RESUME:
                // kit.system.spot.send(Spot.AELC_Play, { CourseID: this.lesson.lessonId, ModuleID: this.lesson.chapterId, CoursenName: this.lesson.lessonName, ModuleName: this.lesson.chapterName });
                break;
        }
    }

}