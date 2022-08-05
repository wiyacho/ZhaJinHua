import { kit } from "../../../kit/kit";
import { commonTipsOptions } from "../../../kit/structure/ClientModuleInterface";
import Main from "../../app";
import { BUNDLE_COMMON_TIPS} from "../../config/config";
import { TIPS_CONFIG } from "../../config/tipsConfig";
import AssetsManager from "../../manager/assetsManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonTipsState implements kit.fsm.State<Main> {
    public entity: Main;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public enter(data?: any): Promise<void> {
        kit.manager.Event.on(kit.consts.Event.SHOW_COMMON_TIPS_POP, this.showCommonTipsPop, this)
        return Promise.resolve()
    }

    public showCommonTipsPop(event) {
        let params = event.data
        let alert: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_COMMON_TIPS);
        kit.manager.Popup.show(alert, params, { mode: kit.manager.Popup.cacheMode.Frequent });
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        kit.manager.Event.off(kit.consts.Event.SHOW_COMMON_TIPS_POP, this.showCommonTipsPop, this)
    }
}


