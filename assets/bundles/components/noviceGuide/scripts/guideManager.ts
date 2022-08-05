import { kit } from "../../../../kit/kit";
import { NOVICE_GUIDE_FINISH } from "../../../../Script/config/event";
import IGuideObserver from "./IGuideObserver";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideManager {

    private static _instance: GuideManager = null;
    public static get instance(): GuideManager {
        if (this._instance == null) {
            this._instance = new GuideManager();
        }
        return this._instance;
    }
    // 引导配置
    private jsonConfig: any;
    // 当前进行到的引导步数
    private step: number;
    private isInGuide: boolean

    private observer: IGuideObserver = null;

    private guideNode: cc.Node = null;
    private rootNode: cc.Node = null;
    private maskNode: cc.Node = null;
    private blockNode: cc.Node = null;
    private btnNode: cc.Node = null;

    // 初始化
    public init(guideNode: cc.Node, guideConfig: cc.JsonAsset, observer: new () => IGuideObserver, step: number, isNext?: boolean) {
        cc.log('新手引导初始化', guideConfig, step);
        this.guideNode = guideNode;
        this.rootNode = this.guideNode.getChildByName("guide_root");
        this.rootNode.active = false;
        this.maskNode = this.rootNode.getChildByName("guide_mask_root");
        this.blockNode = this.guideNode.getChildByName("block_input_node");
        this.btnNode = this.rootNode.getChildByName("btn_node");
        this.blockNode.active = false;

        this.jsonConfig = guideConfig;
        this.isInGuide = false;
        this.observer = new observer();

        this.step = step;
        if (isNext) {
            let guideData = this.jsonConfig[this.step];
            if (guideData) {
                this.step = guideData.next;
            }
        }
    }

    // check
    public check() {
        if (this.step === -1) {
            kit.manager.Event.emit(NOVICE_GUIDE_FINISH);
            return;
        }
        let guideData = this.jsonConfig[this.step];
        if (guideData) {
            let isContinue = this.observer.check(this.step);
            if (!isContinue) {
                return;
            }

            this.observer.begin(this.step);
            this.isInGuide = true;
            this.rootNode.active = true;
            this.blockNode.active = false;
            // 1. 设置纹理遮罩
            let stepNode = this.guideNode.getChildByName(`step_${guideData.step}`)
            // this.maskNode.getComponent(cc.Mask).spriteFrame = btnBg.spriteFrame;
            this.maskNode.width = stepNode.width;
            this.maskNode.height = stepNode.height;
            this.maskNode.x = stepNode.x;
            // this.maskNode.y = cc.winSize.height / 2 - worldPos.y + 27;
            this.maskNode.y = stepNode.y;
            // 2. 设置描述
            let desNode = this.maskNode.getChildByName("tips_node");
            let desLabel = desNode.getChildByName("des_bg").getComponentInChildren(cc.Label);
            desLabel.string = guideData.style.des.text;
            if (desLabel.string == "") {
                desNode.active = false;
            } else {
                desNode.active = true;
            }
            // 对其位置
            let desX = 0;
            let desY = 0;
            if (guideData.style.des.align === "top") {
                desY = (this.maskNode.height / 2 + desNode.height / 2 + 100);
            } else if (guideData.style.des.align === "left") {
                desX = -(this.maskNode.width / 2 + desNode.width / 2 + 100);
            } else if (guideData.style.des.align === "right") {
                desX = (this.maskNode.width / 2 + desNode.width / 2 + 100);
            } else if (guideData.style.des.align === "bottom") {    // bottom
                desY = -(this.maskNode.height / 2 + desNode.height / 2 + 100);
            } else {    // 配置坐标
                let pos = guideData.style.des.align.split("|");
                if (pos.length === 2) {
                    desX = Number(pos[0]);
                    desY = Number(pos[1]);
                } else {
                    desY = -(this.maskNode.height / 2 + desNode.height / 2 + 50);
                }
            }
            desNode.x = desX;
            desNode.y = desY;

            // 3. 设置指引动画的位置
            let hintNode = this.rootNode.getChildByName("hint_node");
            // 设置默认位置
            hintNode.x = stepNode.x;
            hintNode.y = stepNode.y;
            // 设置偏移量
            if (guideData.style.hint.offsetX || guideData.style.hint.offsetY) {
                if (guideData.style.hint.offsetX) {
                    hintNode.x += guideData.style.hint.offsetX
                }
                if (guideData.style.hint.offsetY) {
                    hintNode.y += guideData.style.hint.offsetY
                }
            }
            // 4 设置按钮位置
            if (guideData.btnNodePosition) {
                this.btnNode.x = guideData.btnNodePosition.x;
                this.btnNode.y = guideData.btnNodePosition.y;
            }

            // next skip
            if (guideData.end) {
                this.btnNode.active = false;
                // let next = this.btnNode.getChildByName("next");
                // next.active = false;
                let right_arrow = this.rootNode.getChildByName("right_arrow");
                right_arrow.active = true;
            }

            let arrow = this.rootNode.getChildByName('arrow_node');
            // 左右箭头
            if (guideData.arrow) {
                arrow.active = true;
                this.playHintSpine(false);
            } else {
                arrow.active = false;
                this.playHintSpine(true);
            }

            // 背景
            let woedPpos = this.rootNode.convertToWorldSpaceAR(cc.v2(0, 0));
            let zeroPos = this.maskNode.convertToNodeSpaceAR(woedPpos);
            this.maskNode.getChildByName('guide_mask').position = cc.v3(zeroPos.x, zeroPos.y) ;
        }
    }

    // next
    public next() {
        let guideData = this.jsonConfig[this.step];
        if (guideData) {
            let nextStepId = guideData.next;
            this.step = nextStepId;
            let nextGuideData = this.jsonConfig[this.step];
            // 判断是否自动进入下一步
            if (nextGuideData && nextGuideData.auto === true) {
                this.check();
            }
        }

        // 引导结束
        if (this.step == -1) {
            this.observer.end(this.step);
            kit.manager.Event.emit(NOVICE_GUIDE_FINISH);
            return;
        }
    }

    // 点击事件
    public onClickEvent() {
        if (!this.isInGuide) {
            // 没有在新手引导状态中，可以忽略本次点击事件
            return;
        }
        this.rootNode.active = false;
        let guideData = this.jsonConfig[this.step];
        if (guideData) {
            this.observer.end(this.step);
            if (guideData.block === true) {
                this.blockNode.active = true;
            } else {
                this.blockNode.active = false;
            }
        }
        this.isInGuide = false;
        this.next();
    }

    public playHintSpine(isClick: boolean) {
        let hintNode = this.rootNode.getChildByName("hint_node");
        let hintSpineNode = cc.find("hint/shou", hintNode);
        if (!hintSpineNode) {
            cc.warn("playHintSpine hintSpine not find")
            return;
        }
        let spCmpt = hintSpineNode.getComponent(sp.Skeleton);
        spCmpt.setCompleteListener(null);
        if (isClick) {
            spCmpt.setAnimation(0, 'dian', true);
            return
        }
        spCmpt.setAnimation(0, 'you-zuo', false);
        spCmpt.setCompleteListener(() => {
            let animName = spCmpt.animation;
            if (animName == 'you-zuo') {
                spCmpt.setAnimation(0, 'zuoyou', false);
            } else {
                spCmpt.setAnimation(0, 'you-zuo', false);
            }
        })
    }

    // 跳过
    public skip() {
        this.step = -1;
        this.observer.end(-1);
        this.next();
    }
}
