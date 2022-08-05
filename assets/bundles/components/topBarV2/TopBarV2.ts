import { ChapterVo_V2 } from './../../../Script/structure/lessonVoV2';
import { BACK, NEXT_LESSON, POPUP_QUIT_LESSON_ALERT, PRE_LESSON } from "../../../Script/config/event";
import { kit } from "../../../kit/kit";
import LessonManagerV2 from "../../../Script/manager/LessonManagerV2";
import { CHAPTER_STATE_V2, CHAPTER_TYPE_V2 } from '../../../Script/config/enum';
import ResLoader from '../../../kit/framework/load/ResLoader';
import Spot from '../../../Script/config/spot';
import DelayUtils from '../../../kit/utils/DelayUtils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TopBarV2 extends cc.Component {

    @property(cc.Node)
    public statusItem: cc.Node = null;
    @property(cc.Node)
    public chapterContent: cc.Node = null;
    @property(cc.Node)
    public preBtnNode: cc.Node = null;

    @property(cc.Node)
    public nextBtnNode: cc.Node = null;

    public init(data?: { isShowNext?: boolean }): void {
        // let isShowNext: boolean = true;
        // if (data !== undefined) {
        //     isShowNext = data.isShowNext ? true : false;
        // }
        // this.nextBtnNode.active = isShowNext;

        this.initChapterStatusDisplay();
        this.initChapterBtnChangeDisplay();
    }


    public initChapterStatusDisplay() {
        let chapterList = LessonManagerV2.instance.totalChapterData;
        let curChapterData = LessonManagerV2.instance.currentChapterData;
        this.chapterContent.destroyAllChildren();
        for (let index = 0; index < chapterList.length; index++) {
            const data = chapterList[index];
            if (data.type < CHAPTER_TYPE_V2.report) {
                let item = cc.instantiate(this.statusItem);
                item.parent = this.chapterContent;
                item.active = true;
                item.y = 0;

                let icon = item.getChildByName('audio_purple')
                let icon_comp = icon.getChildByName('icon_comp');
                // let shading = item.getChildByName('shading_1');
                icon_comp.active = false;

                if (data.chapterId == curChapterData.chapterId) {
                    icon.scale = 1;
                } else {
                    icon.scale = 0.52;
                    if (data.chapterStatus == CHAPTER_STATE_V2.completed) {
                        icon_comp.active = true;
                        // shading
                        // shading.getChildByName('shading_2').active = true;
                    } else {
                        icon_comp.active = false;
                        // shading
                        // shading.getChildByName('shading_2').active = false;
                    }
                }

                // icon
                ResLoader.loadRes(data.iconUrl, cc.SpriteFrame, (err: Error, spf: cc.SpriteFrame) => {
                    if (!cc.isValid(this.node)) {
                        return
                    }
                    spf.getTexture().setPremultiplyAlpha(true);
                    icon.getComponent(cc.Sprite).spriteFrame = spf;

                    // shading
                    // shading.active = index < chapterList.length - 2;
                });
            }
        }
    }

    public initChapterBtnChangeDisplay() {
        let chapterList = LessonManagerV2.instance.totalChapterData;
        let curChapterData = LessonManagerV2.instance.currentChapterData;
        let index = chapterList.findIndex((data: ChapterVo_V2) => {
            return data.chapterId == curChapterData.chapterId;
        });

        this.preBtnNode.active = (index >= 1);
        cc.log(this.preBtnNode)
        let visible = index < chapterList.length - 1
        this.nextBtnNode.active = visible;
    }

    public onBack(): void {
        if (DelayUtils.CheckDelay("button")) return;
        // kit.manager.Event.emit(POPUP_QUIT_LESSON_ALERT);
        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_BLOCK);
        kit.manager.Audio.stopEffect();
        kit.manager.Audio.stopMusic();
        kit.manager.Event.emit(BACK);

        let curData = LessonManagerV2.instance.currentChapterData
        kit.system.spot.send(Spot.AELC_QuitCourse, {
            CourseID: curData.lessonId,
            CourseName: curData.lessonName,
            ModuleName: curData.chapterName
        });
    }

    public onNext(): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_BLOCK);
        kit.manager.Event.emit(NEXT_LESSON);
        let curData = LessonManagerV2.instance.currentChapterData
        kit.system.spot.send(Spot.AELC_Next, {
            CourseID: LessonManagerV2.instance.currentChapterData.lessonId,
            ModuleID: LessonManagerV2.instance.currentChapterData.chapterId,
            CoursenName: curData.lessonName,
            ModuleName: curData.chapterName
        });

    }

    public onPre(): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_BLOCK);
        kit.manager.Event.emit(PRE_LESSON);
        let curData = LessonManagerV2.instance.currentChapterData
        kit.system.spot.send(Spot.AELC_JumpBack, {
            CourseID: LessonManagerV2.instance.currentChapterData.lessonId,
            ModuleID: LessonManagerV2.instance.currentChapterData.chapterId,
            CoursenName: curData.lessonName,
            ModuleName: curData.chapterName,
        });
    }

}
