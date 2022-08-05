import { ConfigDataManager } from './../../../Script/manager/ConfigDataManager';
import { LessonVo_V2 } from './../../../Script/structure/lessonVoV2';
import { BUNDLE_HALL_V2 } from '../../../Script/config/config';
import { SCROLL_LESSON_2_LEARN } from '../../../Script/config/event';
import { BUNDLE_COMPONENTS, COMMON_CLICK_SOUND } from "../../../Script/config/config";
import { STATE_TO_LESSON } from "../../../Script/config/event";
import { LESSON_STATE_V2, LESSON_TYPE_V2 } from "../../../Script/config/enum";
import { kit } from '../../../kit/kit';
import ResLoader from '../../../kit/framework/load/ResLoader';
import HallV2 from './HallV2';
import DelayUtils from '../../../kit/utils/DelayUtils';
import Spot from '../../../Script/config/spot';
import { ResourceType } from '../../../kit/manager/ResourcesManager';
import ModelManager from '../../../kit/model/ModelManager';
import LessonManagerV2 from '../../../Script/manager/LessonManagerV2';


const { ccclass, property } = cc._decorator;

const TEST_LESSON_ANI = [
    'dao1',
    'dao2',
    'dao1'
]

const WORD_LESSON_ANI = [
    'dao',
    'dao2',
    'dao'
]

@ccclass
export default class LessonCellV2 extends cc.Component {
    @property(cc.Sprite)
    public lessonIcon: cc.Sprite = null;

    @property(sp.Skeleton)
    private iconSpine: sp.Skeleton = null;


    @property(cc.Node)
    public lockNode: cc.Node = null;

    @property(cc.Label)
    public lessonId: cc.Label = null;

    @property(sp.Skeleton)
    private lockSpine: sp.Skeleton = null;

    @property(sp.Skeleton)
    private shadingSpine: sp.Skeleton = null;

    @property(sp.Skeleton)
    private decSpine: sp.Skeleton = null;

    public lessonInfo: LessonVo_V2;

    public onLoad() { }

    public async onClick() {
        if (DelayUtils.CheckDelay("button")) return;
        switch (this.lessonInfo.lessonStatus) {
            case LESSON_STATE_V2.unComplete:
                await this.lockSpineAni();
                // 未解锁
                kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, "commonRes/sound/wrong_effect");
                // kit.manager.Event.emit(SCROLL_LESSON_2_LEARN);
                // await this.itemClickAni();
                // kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, COMMON_CLICK_SOUND);
                // kit.manager.Event.emit(STATE_TO_LESSON, this.lessonInfo);
                break;
            case LESSON_STATE_V2.completed:    // 已完成
            case LESSON_STATE_V2.ongoing:  // 进行中
                await this.itemClickAni();
                kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, COMMON_CLICK_SOUND);
                kit.manager.Event.emit(STATE_TO_LESSON, this.lessonInfo);
                break;
        }
        // kit.manager.Event.emit(SCROLL_LESSON_2_LEARN);
        // this.getItemPosXToScroll();
    }

    itemClickAni() {
        return new Promise<void>((resolve, reject) => {
            cc.tween(this.node)
                .to(0.1, { scale: 1.2 })
                .to(0.1, { scale: 0.9 })
                .to(0.1, { scale: 1.2 })
                .to(0.1, { scale: 1 })
                .call(() => {
                    resolve()
                })
                .start()
        });
    }

    lockSpineAni() {
        return new Promise<void>((resolve, reject) => {
            let te = this.lockSpine.setAnimation(0, 'dou', false);
            if (!te) {
                resolve();
                return;
            };
            this.lockSpine.setTrackCompleteListener(te, () => {
                resolve();
            });
        });
    }
    /**
     * 相对于scroll view的位置
     */
    public getItemPosXToScroll() {
        let worldPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        let scrolPos = this.node.parent.convertToNodeSpaceAR(worldPos);
        // cc.log(" ----worldPos: ", worldPos.x)
        // cc.log(" ----scrolPos: ", scrolPos.x, " ======>>>> xxxx: ", this.node.parent.x)
        // cc.log(" ---- lesson id: ", this.lessonInfo.lessonId)
        return scrolPos;
    }

    public async init(entity: HallV2, data: LessonVo_V2, index: number) {
        this.lessonInfo = data;
        if (index > 6) {
            await this.loadTexture();
        } else {
            await this.loadRemoteRes(index);
        }

        // 刷新课程状态
        this.updateChapterItemState();
    }

    getCurLessonConfig(index: number) {
        let lessonId = this.lessonInfo.lessonId;
        let lessonConfig = ConfigDataManager.instance.getLessonConfig();
        return lessonConfig.find(config => config.lessonId == (index + 1));
    }
    private loadRemoteRes(index: number) {
        return new Promise<void>((resolve, reject) => {
            // console.log(this.lessonInfo)
            let spineName = 'spaceship2'
            let curLessonConfig = this.getCurLessonConfig(index);
            spineName = (curLessonConfig && curLessonConfig.spinePath) ? curLessonConfig.spinePath : 'spaceship2';
            console.log(`lessonId: ${this.lessonInfo.lessonId}  spineName: ${spineName}`);
            kit.manager.resources.loadRes(BUNDLE_HALL_V2, `lessonicon/${spineName}`, ResourceType.Normal, sp.SkeletonData, (err, res: sp.SkeletonData) => {
                if (err) {
                    cc.error(err);
                    resolve();
                    return
                }
                this.iconSpine.skeletonData = res;
                this.iconSpine.setAnimation(0, 'dao2', true);
                // skin & ani
                if (this.lessonInfo.lessonType == LESSON_TYPE_V2.testLesson) {
                    this.iconSpine.setAnimation(0, TEST_LESSON_ANI[this.lessonInfo.lessonStatus], true);
                } else if (this.lessonInfo.lessonType == LESSON_TYPE_V2.wordLesson || this.lessonInfo.lessonType == LESSON_TYPE_V2.grammarLesson) {
                    this.iconSpine.setAnimation(0, WORD_LESSON_ANI[this.lessonInfo.lessonStatus], true);
                    //TODO: 目前只有五节课
                    let nextLessonData = LessonManagerV2.instance.getNextLessonDataByLessonId(this.lessonInfo.lessonId);
                    // console.log(" ====nextLessonData: ", nextLessonData)
                    // 后一节课即将学习，当前课程播小岛闪烁
                    if (nextLessonData && nextLessonData.lessonStatus == LESSON_STATE_V2.ongoing) {
                        // console.log(`lessonId: ${this.lessonInfo.lessonId}  spineName: ${spineName}`);
                        this.iconSpine.setAnimation(0, 'dao1', true);
                    }
                }

                //coming soon
                if (!this.lessonInfo.lessonId && spineName == 'spaceship2') {
                    this.iconSpine.setAnimation(0, 'Coming_soon', true);
                }
                //
                resolve();
            });
        })
    }

    private loadTexture() {
        return new Promise<void>((resolve, reject) => {
            kit.manager.resources.loadRes(BUNDLE_HALL_V2, `texture/1`, ResourceType.Normal, cc.SpriteFrame, (err, res: cc.SpriteFrame) => {
                this.lessonIcon.enabled = true;
                this.lessonIcon.spriteFrame = res;
                resolve();
            });
        })
    }

    private updateChapterItemState() {
        this.lessonId.string = `${this.lessonInfo.lessonId}`;
        this.lockSpine.node.active = false;
        this.shadingSpine.node.active = false;
        this.decSpine.node.active = false;
        switch (this.lessonInfo.lessonStatus) {
            case LESSON_STATE_V2.unComplete:
                // 未解锁
                this.lockSpine.node.active = true;
                this.lockSpine.setAnimation(0, 'stay', true);
                break;
            case LESSON_STATE_V2.completed:    // 已完成
                // this.decSpine.animation = ""; // TODO:
                break;
            case LESSON_STATE_V2.ongoing:  // 进行中
                this.shadingSpine.node.active = true;
                // this.shadingSpine.animation = ''; // TODO:
                break;
            default:
                break;
        }
    }
}
