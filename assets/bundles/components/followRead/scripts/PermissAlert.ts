import { kit } from "../../../../kit/kit";
import { BACK, ON_GAME_PASS, ON_GAME_RESUME } from "../../../../Script/config/event";
import Spot from "../../../../Script/config/spot";
import { RecordNativeFunction } from "./core/RecordConfig";
import RecordManager from "./core/RecordManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PermissAlert extends cc.Component {

    private confirm_node: cc.Node = null;

    private cancel_node: cc.Node = null;

    private isClickConfirm = false;

    public init(data?: any) {

    }

    public onLoad() {
        this.confirm_node = cc.find("main/ok", this.node);
        this.cancel_node = cc.find("main/cancel", this.node);
        let clickCmpt = this.node.addComponent(kit.component.Click);
        clickCmpt.onClick(this.confirm_node, this.onClickConfirm, this);
        clickCmpt.onClick(this.cancel_node, this.onClickCancel, this);
        kit.manager.Event.on(ON_GAME_RESUME, this.onGameResume, this);
        kit.manager.Event.on(BACK, this.onBack, this);
        kit.manager.Event.on("OnPermissionCb", this.permissionBack, this);

    }

    onDestroy() {
        cc.log("弹窗销毁");
       kit.manager.Event.off(ON_GAME_RESUME, this.onGameResume, this);
       kit.manager.Event.off(BACK, this.onBack, this);
       kit.manager.Event.off("OnPermissionCb", this.permissionBack, this);

    }


    public onClickConfirm() {
        this.isClickConfirm = true;
        kit.system.spot.send(Spot.AELC_jurisdiction_record_setting);

        RecordManager.instance.applyPermission();
    }

    public onClickCancel() {
        this.node.destroy();
        kit.system.spot.send(Spot.AELC_jurisdiction_record_cancel);

        kit.manager.Event.emit(RecordManager.instance.PERMISSION_ALERT_CANCEL);
    }

    // 游戏切前台
    public onGameResume() {
        if (!this.isClickConfirm) {
            return;
        }
        // this.node.destroy();
        cc.log("请求权限");
        RecordManager.instance.callNativeFunction(RecordNativeFunction.checkRecordAudioPermission, "");
    }

    public permissionBack (parm) {
        cc.log(parm);
        if (parm.data.result == true) {
            this.node.destroy();
            RecordManager.instance.readyRecord();
        }
        this.isClickConfirm = false;
    }

    onBack() {
        this.node.destroy();
    }
}
