import { kit } from "../../../kit/kit";
import ModelManager from "../../../kit/model/ModelManager";
import { BUNDLE_REPORT } from "../../../Script/config/config";
import { CHAPTER_STATE_V2, REWARD_TYPE } from "../../../Script/config/enum";
import { SHOW_COMMON_HAND_GUILD, STATE_TO_BOOK_LIST, STATE_TO_GAME_LIST, STATE_TO_HALL, STATE_TO_LESSON } from "../../../Script/config/event";
import Spot from "../../../Script/config/spot";
import LessonManagerV2 from "../../../Script/manager/LessonManagerV2";
import LessonModel, { ChapterReportParams } from "../../../Script/modle/LessonModel";
import { ChapterVo_V2 } from "../../../Script/structure/lessonVoV2";
import BaseComponent from "../../components/baseComponent";
import ReportData from "./ReportData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Report extends BaseComponent {

    @property(cc.Prefab)
    starPrefab: cc.Prefab = null;
    // 灰色星星
    @property(cc.SpriteFrame)
    graySprite: cc.SpriteFrame = null;

    @property(cc.Material)
    grayMat: cc.Material = null;

    private starRoot: cc.Node = null;
    // 得分label
    private label_star: cc.Label = null;
    // 小手
    private hand_node: cc.Node = null;

    private starNodelist: cc.Node[] = [];

    private reportData: ReportData = null;


    init(data?: any): void {
        this.reportData = ReportData.instance;
        this.starRoot = this.ui.getNode("stars_node");// cc.find('default_panel/stars_node', this.node);
        this.label_star = this.ui.getComponent("label_gotstar", cc.Label);// cc.find('default_panel/label_gotstar', this.node).getComponent(cc.Label);
        this.hand_node = this.ui.getNode("hand");// cc.find('default_panel/hand', this.node);
        this.label_star.string = `You got ${this.reportData.starCount} stars`;
        // this.btn_story.on(cc.Node.EventType.TOUCH_START, this.onClickStory, this);
        // this.btn_game.on(cc.Node.EventType.TOUCH_START, this.onClickGame, this);
        // this.btn_back.on(cc.Node.EventType.TOUCH_START, this.onBlackClick, this);

        this.ui.onClick('btn_story', this.onClickStory, this);
        this.ui.onClick('btn_game', this.onClickGame.bind(this), this);
        this.ui.onClick('btn_back', this.onBlackClick, this);

        this.refreshView();
        if (this.reportData.showEncourage()) {
            // 加载激励
            kit.manager.resources.loadRes(BUNDLE_REPORT, `prefab/encouragePre`, kit.manager.Resources.Type.Normal, cc.Prefab, (e, res) => {
                let encourageNode = cc.instantiate(res)
                this.node.addChild(encourageNode);
            })

            return;
        }

        this.scheduleOnce(() => {
            if (this.reportData && this.reportData.guideIndex != -1) {
                this.guide(this.reportData.guideIndex);
            } else {
                let tempParm = this.reportData.lessonVo_V2.lessonId + "report";
                let clickPicBook = kit.util.LocalStorage.getBool(tempParm) || false;
                if (clickPicBook) {
                    return;
                }
                // let encourage = this.reportData.getEncourageInfo();

                // let node = encourage.type == REWARD_TYPE.pictureBook ? this.ui.getNode('btn_story') : this.ui.getNode('btn_game');
                let node = this.ui.getNode('btn_game');
                let worldPos = this.node.convertToWorldSpaceAR(node.position);
                kit.manager.Event.emit(SHOW_COMMON_HAND_GUILD, worldPos);
            }
        }, 1);
        kit.system.spot.send(Spot.AELC_COURSEID_REPORT, LessonManagerV2.instance.currentChapterData.lessonId);

        // let params: ChapterReportParams = {
        //     lessonId: this.reportData.chapterData.lessonId,
        //     chapterId: this.reportData.chapterData.chapterId,
        //     lessonChapterId: this.reportData.chapterData.lessonChapterId,
        //     speedVal: 1,
        //     type: this.reportData.chapterData.type
        // }
        // ModelManager.instance.getModel<LessonModel>(LessonModel).report(params);

    }
    // 刷新页面
    refreshView() {
        // 有未完成环节
        // if (this.reportData.guideIndex != -1) {
        //     this.ui.getComponent("btn_story_bg", cc.Sprite).setMaterial(0, this.grayMat);
        //     this.ui.getComponent("btn_game", cc.Sprite).setMaterial(0, this.grayMat);
        //     this.ui.getComponent('btn_story', cc.Sprite).setMaterial(0, this.grayMat);

        // }
        this.loadStar();
    }

    // 点击星星
    onClickStar(index) {
        cc.log(`点击${index}`);
        // 进入环节
        kit.manager.Event.emit(STATE_TO_LESSON, this.getLessonVo(index))
    }

    // 点击绘本
    onClickStory() {
        // if (this.reportData.guideIndex != -1) {
        //     // this.guide(this.reportData.guideIndex);
        //     return;
        // }
        let tempParm = this.reportData.lessonVo_V2.lessonId + "report";
        kit.util.LocalStorage.setBool(tempParm, true);
        kit.manager.Event.emit(STATE_TO_BOOK_LIST);
        kit.system.spot.send(Spot.AELC_COURSEID_REPORT_PICTUREBOOK, LessonManagerV2.instance.currentChapterData.lessonId);
    }

    // 点击游戏
    onClickGame() {
        // if (this.reportData.guideIndex != -1) {
        //     // this.guide(this.reportData.guideIndex);
        //     return;
        // }
        let tempParm = this.reportData.lessonVo_V2.lessonId + "report";
        kit.util.LocalStorage.setBool(tempParm, true);
        kit.manager.Event.emit(STATE_TO_GAME_LIST);
        kit.system.spot.send(Spot.AELC_COURSEID_REPORT_GAME, LessonManagerV2.instance.currentChapterData.lessonId);
    }

    onBlackClick(): void {
        kit.manager.Event.emit(STATE_TO_HALL);
        kit.system.spot.send(Spot.AELC_COURSEID_REPORT_QUIT, LessonManagerV2.instance.currentChapterData.lessonId);
    }

    // 引导提示
    guide(index) {
        return;
        let starNode = this.starNodelist[index];
        if (!starNode) {
            return;
        }
        let wordPos = starNode.parent.convertToWorldSpaceAR(starNode.position);
        let nodePos = starNode.parent.convertToNodeSpaceAR(wordPos);
        this.hand_node.position = nodePos;
        this.hand_node.active = true;
        this.hand_node.x += 30
        this.hand_node.y += 30
    }

    loadStar() {
        if (!this.reportData.lessonListVo) {
            return;
        }
        let lessonList = this.reportData.lessonListVo;
        cc.log(lessonList);
        for (let i = 0; i < lessonList.length; i++) {
            this.creatStarNode(i);
        }
    }

    private creatStarNode(index: number) {
        let lessonV0 = this.getLessonVo(index);
        let starNode = cc.instantiate(this.starPrefab);
        if (lessonV0.chapterStatus != CHAPTER_STATE_V2.completed) {
            starNode.getComponent(cc.Sprite).spriteFrame = this.graySprite;
        }
        // this.ui.onClick(starNode, this.onClickStar, this, index);
        // starNode.on(cc.Node.EventType.TOUCH_START, () => {
        //     this.onClickStar(index);
        // }, this)
        this.starNodelist.push(starNode);
        this.starRoot.addChild(starNode);
    }

    private getLessonVo(index: number): ChapterVo_V2 {
        return this.reportData.lessonListVo[index];
    }

}
