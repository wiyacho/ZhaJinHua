import { kit } from "../../../kit/kit";
import { BUNDLE_ENCOURAGE_LIST } from "../../../Script/config/config";
import EncourageData from "./EncourageData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EncourageItem extends cc.Component {

    private currentData: any;
    private currentIndex: number;

    private icon: cc.Sprite = null;
    private jiantou_right: cc.Sprite = null;
    private jiantou_down: cc.Sprite = null;
    private jiantou_top: cc.Sprite = null;
    private icon_bg: cc.Sprite = null;

    private touchpos: cc.Vec2;
    private canClick: boolean = true;
    /**
     * 
     * @param index 
     * @param direction 1: 下 2: 右 3: 上
     */
    public init(data, index: number, direction: number) {
        this.icon = cc.find("content/mask/icon", this.node).getComponent(cc.Sprite);
        this.jiantou_right = this.node.getChildByName("jiantou_right").getComponent(cc.Sprite);
        this.jiantou_down = this.node.getChildByName("jiantou_down").getComponent(cc.Sprite);
        this.jiantou_top = this.node.getChildByName("jiantou_top").getComponent(cc.Sprite);
        this.icon_bg = cc.find("content/icon_bg", this.node).getComponent(cc.Sprite);
        this.currentData = data;
        this.currentIndex = index;

        this.loadIcon();
        this.showJiantou(direction);

        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this)
    }

    public touchStart(event: cc.Event.EventTouch) {
        this.touchpos = event.getLocation();
    }

    public touchEnd(event: cc.Event.EventTouch) {
        let endPos = event.getLocation();
        if (Math.abs(endPos.x - this.touchpos.x) > 5 || Math.abs(endPos.y - this.touchpos.y) > 5) {
            return;
        }
        this.onClick();
    }

    private async loadIcon() {
        let icon = this.currentData.iconUrl;
        // 锁住状态
        if (this.currentData.lockVal == 1) {
            icon += "_lock";
            kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `textures/bg_lock`, kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
                if (e) {
                    cc.log(`loadRes textures/$bg_lock error ${e}`);
                    return;
                }
                this.icon_bg.spriteFrame = res;
            })
        }
        //this.icon.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        

        if (this.currentData.gameId == EncourageData.instance.paintGameId) {
            if (EncourageData.instance.paintPropId.indexOf(this.currentData.propId) > -1) {
                let sprite = await EncourageData.instance.getPaintIcon(this.currentData.propId);
                if (sprite) {
                    this.fullBg(sprite);
                    // this.icon.spriteFrame = sprite;  
                    return;
                }
            }
        }
        kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `textures/icon/${icon}`, kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
            if (e) {
                cc.log(`loadRes textures/icon/${icon} error ${e}`);
                return;
            }
            this.fullBg(res);
            //this.icon.spriteFrame = res;
        })
    }

    private showJiantou(direction: number) {
        this.jiantou_right.node.active = false;
        this.jiantou_down.node.active = false;
        this.jiantou_top.node.active = false;
        let activeJianTou;
        let nextInfo = EncourageData.instance.nextEncourageInfo(this.currentIndex - 1);
        if (!nextInfo) {
            return;
        }
        if (direction == 1) {
            this.jiantou_down.node.active = true;
            activeJianTou = this.jiantou_down;
        } else if (direction == 2) {
            this.jiantou_right.node.active = true;
            activeJianTou = this.jiantou_right;
        } else {
            this.jiantou_top.node.active = true;
            activeJianTou = this.jiantou_top;
        }
        if (nextInfo.lockVal == 1) {
            kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `textures/jiantou_lock`, kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
                if (e) {
                    cc.log(`loadRes textures/jiantou_lock error ${e}`);
                    return;
                }
                activeJianTou.spriteFrame = res;
            })
        }
    }

    onClick() {
        if (this.currentData.lockVal == 1) {
            this.shakeOptions();
            return;
        }
        EncourageData.instance.clickLesson = this.currentData.lessonId;
        kit.manager.Event.emit(EncourageData.SHOW_DETAIL);
    }
    shakeOptions() {
        if (!this.canClick) {
            return;
        }
        kit.manager.Audio.playEffect(BUNDLE_ENCOURAGE_LIST, 'audio/wrong')
        this.canClick = false;
        let content = this.node.getChildByName("content");
        cc.tween(content).
            by((16.67 * 6) / 1000, { angle: -15 }).
            by((16.67 * 6) / 1000, { angle: 25 }).
            by((16.67 * 6) / 1000, { angle: -15 }).
            by((16.67 * 6) / 1000, { angle: 8 }).
            by((16.67 * 6) / 1000, { angle: -3 }).
            call(() => {
                this.canClick = true;
            }).
            start();
    }
    onDestroy() {
    }

    fullBg (sprite: cc.SpriteFrame) { 
        if (!sprite) {
            return;
        }
        let rect = sprite.getRect();
        this.icon.spriteFrame = sprite;
        if (rect.width == rect.height) {
            this.icon.node.width = 230;
            this.icon.node.height = 230;
            return;
        }
        cc.log(rect);
        if (rect.width >  rect.height) {
            this.icon.node.height = 230;
            this.icon.node.width = rect.width * 230 /  rect.height;
        }
        
        if (rect.width < rect.height) {
            this.icon.node.width = 230;
            this.icon.node.width = rect.height * 230 /  rect.width;
        }
    }
}
