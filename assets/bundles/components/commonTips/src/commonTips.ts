/*
    使用示例
    let params:commonTipsOptions = {
        tipsType:TIPS_TYPE.NOT_WIFI, 
        confirmCallback:()=>{console.log("confirmCallback")},
        cancelCallback:()=>{console.log("cancelCallback")}
    }
    kit.manager.Event.emit(kit.consts.Event.SHOW_COMMON_TIPS_POP,params);
*/
import { kit } from "../../../../kit/kit";
import PopupBase from "../../../../kit/manager/popupManager.ts/PopupBase";
import { commonTipsOptions, tipsInfoConfig } from "../../../../kit/structure/ClientModuleInterface";
import { TIPS_TYPE } from "../../../../kit/structure/ClientTipsEnum";
import Spot from "../../../../Script/config/spot";
import { TIPS_CONFIG } from "../../../../Script/config/tipsConfig";
const { ccclass, property } = cc._decorator;
@ccclass
export default class commonTips extends PopupBase<commonTipsOptions> {

    @property(cc.Label)
    private titleLabel: cc.Label = null;

    @property(cc.Label)
    private contentLabel: cc.Label = null;

    @property(cc.Node)
    private confirmBtn: cc.Node = null;

    @property(cc.Node)
    private cancelBtn: cc.Node = null;

    public tipsType: string = null

    protected onLoad() {
        this.registerEvent();
    }

    private registerEvent() {
        this.cancelBtn.on(cc.Node.EventType.TOUCH_END, this.onCancelBtnClick, this);
        this.confirmBtn.on(cc.Node.EventType.TOUCH_END, this.onConfirmBtnClick, this);
    }

    protected updateDisplay(options: commonTipsOptions): void {
        console.log("弹窗 options =======>", options)
        this.confirmBtn.active = true
        this.cancelBtn.active = true
        let tipsConfig: tipsInfoConfig = TIPS_CONFIG[options.tipsType]

        if (tipsConfig) {
            this.tipsType = options.tipsType
            this.titleLabel.node.active = true;
            if (!tipsConfig.title || tipsConfig.title == "") {
                this.titleLabel.node.active = false;
            }
            this.titleLabel.string = tipsConfig.title;
            this.contentLabel.string = tipsConfig.content;
            this.confirmBtn.getChildByName("o_label").getComponent(cc.Label).string = tipsConfig.ok_text
            this.cancelBtn.getChildByName("c_label").getComponent(cc.Label).string = tipsConfig.cancel_text
        }

        if (!options.confirmCallback) {
            this.confirmBtn.active = false
        }

        if (!options.cancelCallback) {
            this.cancelBtn.active = false
        }
    }

    protected onConfirmBtnClick() {
        this.options.confirmCallback && this.options.confirmCallback();
        this.hide();
        kit.system.spot.send(Spot.AELC_NetworkFailure_continue);


    }


    protected onCancelBtnClick() {
        this.options.cancelCallback && this.options.cancelCallback();
        this.hide();
        kit.system.spot.send(Spot.AELC__NetworkFailure_cancel);

    }

    public checkSpot(spotType: string) {
        switch (this.tipsType) {
            case TIPS_TYPE.NOT_WIFI:
            case TIPS_TYPE.DOWNLOAD_FAILED:
                kit.system.spot.send(spotType);
                break;
        }
    }

    private unregisterEvent() {
        this.cancelBtn.targetOff(this);
        this.confirmBtn.targetOff(this);
    }

    protected onDestroy() {
        this.unregisterEvent();
    }
    // update (dt) {}
}

