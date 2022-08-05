import { SCROLL_LESSON_2_LEARN, SHOW_TIGO_GREET, STATE_TO_ENCOURAGE_LIST, STATE_TO_BOOK_LIST, STATE_TO_GAME_LIST, ADD_GUILD_HAND_TIMER, STATE_TO_FEED_BACK } from '../../../Script/config/event';
import { BUNDLE_COMPONENTS, BUNDLE_HALL_V2, COMMON_CLICK_SOUND, HAS_CLICK_LESSON_ITEM } from '../../../Script/config/config';
import { kit } from '../../../kit/kit';
import LessonManagerV2 from '../../../Script/manager/LessonManagerV2';
import LessonCellV2 from './LessonCellV2';
import InitHallStateV2 from './state/InitHallStateV2';
import DelayUtils from '../../../kit/utils/DelayUtils';
import Spot from '../../../Script/config/spot';
import { ResourceType } from '../../../kit/manager/ResourcesManager';
import ModelManager from '../../../kit/model/ModelManager';


const { ccclass, property } = cc._decorator;

@ccclass
export default class HallV2 extends cc.Component implements kit.fsm.Entity {
    public stateMachine: kit.fsm.StateManager<HallV2>;
    public sid: string = 'HallV2';
    public lessonList: LessonCellV2[];
    @property(cc.Prefab)
    public lessonCell: cc.Prefab = null;
    public bgNode: cc.Node = null;
    public spineNode: cc.Node = null;
    public list: cc.Node = null;
    public contentSV: cc.ScrollView = null;
    public tigoSpine: sp.Skeleton = null;
    public guidHandNode: cc.Node = null;
    public firstGuidHandNode: cc.Node = null;
    public firstGuidTimeh;
    public topBtn: cc.Node = null;
    public picBookNode: cc.Node = null;

    private guildHandTimer;

    public onLoad() {
        this.initUI();
        this.stateMachine = new kit.fsm.StateManager(this);
        this.stateMachine.ChangeState(InitHallStateV2, this);
        kit.manager.Event.on(SCROLL_LESSON_2_LEARN, this.scrollLesson2Learn, this);
        kit.manager.Event.on(SHOW_TIGO_GREET, this.showTigoGreet, this);
        kit.manager.Event.on(ADD_GUILD_HAND_TIMER, this.addGuidHandTimer, this);
        kit.manager.Event.on(ADD_GUILD_HAND_TIMER, this.fistGuidHand, this);
        this.initTigoSpine();
        this.initTopBtn();
        this.addCommonGuildHand();
        this.contentSV.node.on('scrolling', this.onScrollViewScrolling, this);
    }
    start() {
        this.fixBg();
    }
    /**
     * 适配背景图
     */
    fixBg() {
        let frameSize: cc.Size = cc.winSize // 屏幕尺寸
        let designResolution: cc.Size = cc.Canvas.instance.designResolution
        // console.log(" ====frameSize: ", frameSize);
        // console.log(" ====designResolution: ", designResolution);

        let designSize: cc.Size = cc.size(designResolution.width, designResolution.height)  // cc.Canvas.instance.designResolution
        let frameAspectRatio: number = frameSize.width / frameSize.height
        let screenSize: cc.Size = { ...designSize } as cc.Size

        // console.log(" ====screenSize: ", screenSize);

        let ratio: number = this.bgNode.width / this.bgNode.height
        // console.log(" ====ratio: ", ratio, "   ===frameAspectRatio: ", frameAspectRatio);
        if (ratio > frameAspectRatio) {
            let width = this.bgNode.width * screenSize.height / this.bgNode.height
            this.bgNode.width = width
            this.bgNode.height = screenSize.height
        } else {
            let scale = frameSize.width / designSize.width;
            this.bgNode.width = designSize.width * scale;
            this.bgNode.height = designSize.height * scale;

        }
        // console.log(" ====: ", this.bgNode.width, "   ===frameAspectRatio: ", this.bgNode.height);

        this.bgNode.x = -frameSize.width / 2;
        this.bgNode.y = 0;
    }

    private onScrollViewScrolling(sc: cc.ScrollView) {
        // cc.log(" ===>>>event: ", sc.content.x)
        let frameSize: cc.Size = cc.winSize; // 屏幕尺寸
        this.bgNode.x = sc.content.x - frameSize.width;
        this.spineNode.x = sc.content.x - frameSize.width;
        // cc.log(" ===>>>this.bgNode.x: ", this.bgNode.x)
    }
    private initUI() {
        this.list = cc.find("scrollview/view/content", this.node);
        this.contentSV = cc.find("scrollview", this.node).getComponent(cc.ScrollView);
        this.tigoSpine = cc.find("leftBottom/Tigo-biaoqing", this.node).getComponent(sp.Skeleton);
        this.guidHandNode = cc.find("shou", this.node);
        this.topBtn = cc.find("topBtn", this.node);
        this.picBookNode = cc.find("rightBottom/sprite", this.node);
        this.bgNode = cc.find("bg_node", this.node);
        this.spineNode = cc.find("spine_node", this.node);
        this.scheduleOnce(() => {
            this.spineNode.active = true;
        }, 0.3);
    }

    public onPictureBookClick(event: cc.Event): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, COMMON_CLICK_SOUND);
        kit.manager.Event.emit(STATE_TO_BOOK_LIST)
        kit.system.spot.send(Spot.AELC_OpenPictureBookList);
    }

    public onHouseClick(event: cc.Event): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, COMMON_CLICK_SOUND);

    }

    public onGameClick(event: cc.Event): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, COMMON_CLICK_SOUND);
        kit.manager.Event.emit(STATE_TO_GAME_LIST)
        kit.system.spot.send(Spot.AELC_OpenGameList);
    }

    public onEncourageClick(event: cc.Event): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, COMMON_CLICK_SOUND);
        kit.manager.Event.emit(STATE_TO_ENCOURAGE_LIST);
    }

    public onUserProtocolClick(event: cc.Event): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.resources.loadRes(BUNDLE_HALL_V2, 'prefab/userProtocol', ResourceType.Normal, cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            let node = cc.instantiate(prefab);
            node.parent = this.node;
            node.name = 'userProtocol';
        })
    }

    public onUserFeedBackClick(event: cc.Event): void {
        if (DelayUtils.CheckDelay("button")) return;
        kit.manager.Event.emit(STATE_TO_FEED_BACK);
    }

    public onDestroy() {
        // this.contentSV.node.off('scrolling', this.onScrollViewScrolling, this);

        this.stateMachine.exitCurrentState();
        cc.log('hall destroy')
        kit.manager.Event.off(SCROLL_LESSON_2_LEARN, this.scrollLesson2Learn, this);
        kit.manager.Event.off(SHOW_TIGO_GREET, this.showTigoGreet, this);
        kit.manager.Event.off(ADD_GUILD_HAND_TIMER, this.addGuidHandTimer, this);
        kit.manager.Event.off(ADD_GUILD_HAND_TIMER, this.fistGuidHand, this);

        kit.system.timer.clearTimer(this.firstGuidTimeh);
        this.firstGuidTimeh = null;
        this.clearGuidHand();
    }

    /**
     * 跳转到即将要学习的课程
     */
    public scrollLesson2Learn(eventData) {
        this.contentSV.stopAutoScroll();
        let itemPos: cc.Vec3 = eventData.data;
        itemPos = this.getNext2LearnItemPos();
        // cc.log(" =====>>>>itemPos: ", itemPos.x);
        let x = (itemPos.x - cc.winSize.width / 2);
        let pos = cc.v2(x, 0);
        // cc.log(" =====>>>>pos: ", pos.x, "  Offset: ", this.contentSV.getScrollOffset().x);
        this.contentSV.scrollToOffset(pos, 0.1);
    }

    private getNext2LearnItemPos(): cc.Vec3 {
        this.contentSV.stopAutoScroll();
        let itemPos: cc.Vec3;
        this.lessonList.find((ele) => {
            if (ele.lessonInfo.lessonId == LessonManagerV2.instance.locLessonId) {
                itemPos = ele.getItemPosXToScroll();
            }
        });
        if (!itemPos) { // 全部学完,定位到最后面
            itemPos = cc.v3(this.list.width, 0, 0);
        }
        return itemPos;
    }

    private initTigoSpine() {
        this.tigoSpine.node.opacity = 0;
        this.tigoSpine.setCompleteListener(() => {
            cc.tween(this.tigoSpine.node)
                .to(0.1, { opacity: 0 })
                .start();
        });
    }
    private showTigoGreet() {
        cc.tween(this.tigoSpine.node)
            .to(0.1, { opacity: 255 })
            .start();
        this.tigoSpine.setAnimation(0, "zhaoshou", false);
        // sound
        kit.manager.Audio.playEffect(BUNDLE_HALL_V2, "sound/welcomeback");
    }

    private initTopBtn() {
        this.topBtn.on(cc.Node.EventType.TOUCH_START, this.onTopBtnClicked, this);
        this.topBtn['_touchListener'].setSwallowTouches(false);
    }

    private onTopBtnClicked(event) {
        // let clickLessonItem = kit.util.LocalStorage.getBool(HAS_CLICK_LESSON_ITEM) || false;
        // if (clickLessonItem) {
        //     this.guidHandNode.active = false;
        //     this.addGuidHandTimer();
        // }

        this.guidHandNode.active = false;
        this.addGuidHandTimer();
    }

    private addGuidHandTimer() {
        if (LessonManagerV2.instance.allLessonComplete) {
            cc.log(`all lesson complete, no guild`);
            return
        }
        let clickLessonItem = kit.util.LocalStorage.getBool(HAS_CLICK_LESSON_ITEM) || false;
        if (!clickLessonItem && false) {
            this.fistGuidHand();

        } else {
            if (this.guildHandTimer) {
                this.clearGuidHand();
            }
            let t = 6;
            this.guildHandTimer = kit.system.timer.doOnce(t * 1000, () => {
                if (!cc.isValid(this.node)) return;

                this.showGuidHand();
            }, this);
        }
    }

    private fistGuidHand() {
        if (LessonManagerV2.instance.allLessonComplete) {
            cc.log(`all lesson complete, no guild`);
            return
        }
        kit.system.timer.doOnce(200, () => { // 0.11要大于 SCROLL_LESSON_2_LEARN触发的事件
            if (!cc.isValid(this.node)) return;
            let itemPos: cc.Vec2;
            let node
            this.lessonList.find((ele) => {
                if (ele.lessonInfo.lessonId == LessonManagerV2.instance.locLessonId) {
                    node = ele.node;
                }
            });
            if (!node) {
                kit.util.LocalStorage.setBool(HAS_CLICK_LESSON_ITEM, true);
                cc.log("已经学完课程")
                return
            }
            this.firstGuidHandNode = cc.instantiate(this.guidHandNode);
            this.firstGuidHandNode.active = true;
            this.firstGuidHandNode.x = 30;
            this.firstGuidHandNode.y = -217;
            node.addChild(this.firstGuidHandNode);
            kit.manager.Audio.playEffect(BUNDLE_HALL_V2, "sound/dianyidian");
            this.firstGuidTimeh = kit.system.timer.doOnce(2 * 1000, () => {
                if (!cc.isValid(this.node)) return;
                // kit.manager.Audio.playEffect(BUNDLE_HALL_V2, "sound/dianyidian");
                this.firstGuidHandNode.active = false;
            }, this);
        });
    }

    private clearGuidHand() {
        kit.system.timer.clearTimer(this.guildHandTimer);
        this.guildHandTimer = null;
    }

    private showGuidHand() {
        if (!cc.isValid(this.node)) return;

        // hand
        // kit.manager.Event.emit(SCROLL_LESSON_2_LEARN);
        kit.system.timer.doOnce(200, () => { // 0.11要大于 SCROLL_LESSON_2_LEARN触发的事件
            if (!cc.isValid(this.node)) return;
            let itemPos: cc.Vec2;
            this.lessonList.find((ele) => {
                if (ele.lessonInfo.lessonId == LessonManagerV2.instance.locLessonId) {
                    itemPos = ele.node.parent.convertToWorldSpaceAR(ele.node.getPosition());
                }
            });
            if (itemPos) {
                let userProtocol = this.node.getChildByName('userProtocol');
                // sound
                if (!userProtocol) {
                    kit.manager.Audio.playEffect(BUNDLE_HALL_V2, "sound/dianyidian");
                }
                itemPos = this.node.convertToNodeSpaceAR(itemPos);
                this.guidHandNode.active = true;
                this.guidHandNode.position = cc.v3(itemPos.x + 50, itemPos.y - 200);
                let clickLessonItem = kit.util.LocalStorage.getBool(HAS_CLICK_LESSON_ITEM) || false;
                if (!clickLessonItem && false) {
                    kit.system.timer.doLoop(4 * 1000, () => {
                        if (!cc.isValid(this.node)) return;
                        kit.manager.Audio.playEffect(BUNDLE_HALL_V2, "sound/dianyidian");
                    }, this);
                } else {
                    kit.system.timer.doOnce(2 * 1000, () => {
                        if (!cc.isValid(this.node)) return;
                        this.guidHandNode.active = false;
                        this.addGuidHandTimer();
                    }, this);
                }
            }
        });


    }

    addCommonGuildHand() {
        let cv = cc.director.getScene().getChildByName('Canvas');
        if (!cv.getChildByName('guildHand')) {
            kit.manager.resources.loadRes(BUNDLE_COMPONENTS, "guildHand/guildHand", kit.manager.Resources.Type.Normal, cc.Prefab, (err: Error, ass: cc.Prefab) => {
                let node = cc.instantiate(ass);
                node.parent = cv;
                node.y = 10000;
                node.name = 'guildHand';
            });
        }

    }



}


