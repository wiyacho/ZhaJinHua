import { kit } from "../../../kit/kit";
import { BUNDLE_REPORT } from "../../../Script/config/config";
import { REWARD_TYPE } from "../../../Script/config/enum";
import { STATE_TO_GAME, STATE_TO_PICTURE_BOOK } from "../../../Script/config/event";
import BaseComponent from "../../components/baseComponent";
import ReportData from "./ReportData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReportEncourage extends BaseComponent {

    public init(data?: any): void {
        this.ui.onClick("btn_item", this.onClickBtnList, this);

        if (!ReportData.instance.encourageData) {
            this.node.active = false;
            cc.log("没有激励数据");
            return;
        }
        // 替换图标
        let type = ReportData.instance.encourageData.type;
        if (type == REWARD_TYPE.pictureBook) {
            kit.manager.resources.loadRes(BUNDLE_REPORT, "texture/pictureBook", kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
                let btnSprite = this.ui.getComponent("btn_item", cc.Sprite);
                btnSprite.spriteFrame = res;
            })
        }

        // 加载图片
        kit.manager.resources.loadRes(BUNDLE_REPORT, `texture/encourage/item/${ReportData.instance.encourageData.iconUrl}`, kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
            let icon = this.ui.getComponent("icon", cc.Sprite);
            icon.spriteFrame = res;
        })
        this.playPinTu();
    }

    private get pintuType(): number {
        let lessonCount = ReportData.instance.lessonListVo.length;
        return lessonCount;
    }

    public onClickContent () {
        this.finish();
        ReportData.instance.reportFinish();
        this.ui.offClick("content");
    }

    public onClickBtnList () {
        ReportData.instance.reportFinish();
        this.changeList();
    }



    /** 播放拼图动画 */
    private playPinTu () {
        // let fudai = this.ui.getComponent('fudai', sp.Skeleton);
        this.playSpine('fudai', 'fudai2', true, () => {
            this.playSpine("fudai", "fudai", true);
        }, this.pintuType == 4? 3 : 2);

        let itemNode = this.ui.getNode("item_node");
        itemNode.scale = 0;
        itemNode.angle = -150;
        let pintuAnim = this.pintuType == 4 ? 2 : 3;
        let spine = this.ui.getComponent("pintu", sp.Skeleton);
        spine.setAnimation(0, pintuAnim.toString(), false);
        
        cc.tween(itemNode)
        .delay(1.5)
        .call(() => {
            this.ui.getNode("pintu").active = false;
            this.ui.getNode("fudai").active = false;
            this.ui.getNode("btn_item").active = true;
        })
        .call(() => {
            this.ui.getNode("guang").active = false;
        })
        .to(0.3, {scale: 1.3, angle: 0})
        .to(0.2, {scale: 1})
        .call(() => {
            kit.manager.Audio.playEffect(BUNDLE_REPORT, "audio/hecheng");
            // 撒花
            let shaHua = this.ui.getNode("sahua");
            shaHua.active = true;
            this.playSpine("sahua", "animation", false, () => {
                shaHua.active = false;
            });
            this.ui.onClick("content", this.onClickContent, this, null, "", "");
        })
        .start();
        // this.playSpine("pintu", pintuAnim.toString(), false, () => {
        //     this.changeState(StateType.Next);
        // });
    }
   
    /** 缩小到绘本、游戏 */ 
    private finish () {
        let xing = this.ui.getNode("xing");
        let type = ReportData.instance.encourageData.type;
        if (type == REWARD_TYPE.pictureBook) {
            xing.scaleX = 1;
        } else {
            xing.scaleX = -1;
        }
        let itemNode = this.ui.getNode("item_node");
        cc.tween(itemNode)
        .to(0.3, {scale: 0, angle: 160})
        .call(() => {
            this.ui.getNode("bg").active = false;
            this.ui.getNode("btn_item").active = false;
            this.ui.getNode("xing").active = true;
            kit.manager.Audio.playEffect(BUNDLE_REPORT, "audio/star");
            this.playSpine("xing", "xing", false, () => {
                this.node.active = false;
            });
        })
        .start();
    }

    /** 跳出到指定游戏 */ 
    private changeList () {
        let gameData;
        switch (ReportData.instance.encourageData.type) {
            case REWARD_TYPE.game:
            case REWARD_TYPE.prop:
                gameData = ReportData.instance.gameInfo;
                kit.manager.Event.emit(STATE_TO_GAME, gameData);
                break;
            case REWARD_TYPE.pictureBook:
                gameData = ReportData.instance.bookInfo;
                kit.manager.Event.emit(STATE_TO_PICTURE_BOOK, gameData);
                break;
            default:
                break;
        }
    }

    private playSpine (node: string, animName: string, loop: boolean, finishCb?: () => void, finishCount: number = 1, nextName?: string, nextLoop?: boolean) {
        let spinCmpt = this.ui.getComponent(node, sp.Skeleton);
        if (!spinCmpt) {
            cc.warn(`playSpine:${animName}, sp.Skeleton null`);
            return;
        }
        if (animName == '') {
            cc.warn(`playSpine:${animName}`);
            return;
        }
        spinCmpt.setAnimation(0, animName, loop);
        spinCmpt.setCompleteListener(null);
        if (animName == "fudai2") {
            kit.manager.Audio.playEffect(BUNDLE_REPORT, "audio/pintu");
        }
        if (finishCb) {
            let count = 0;
            spinCmpt.setCompleteListener(() => {
                if (spinCmpt.animation == animName) {
                    count ++
                    if (animName == "fudai2" && count < finishCount) {
                        kit.manager.Audio.playEffect(BUNDLE_REPORT, "audio/pintu");
                    }
                    if (count >= finishCount) {
                        finishCb();
                        if (nextName && nextName != "") {
                            spinCmpt.setAnimation(0, nextName, nextLoop);
                        }
                        spinCmpt.setCompleteListener(null);
                    }
                }
            })
            return;
        }

        if (nextName && nextName != "") {
            spinCmpt.addAnimation(0, nextName, nextLoop);
        }
    }
}
