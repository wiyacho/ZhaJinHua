import AssetsManager from "../../manager/assetsManager";
import Main from "../../app";
import { BUNDLE_LOADING } from "../../config/config";
import { kit } from "../../../kit/kit";

const { ccclass, property } = cc._decorator;
/**
 * loading动画-翻书
 */
@ccclass
export default class LoadingTurnState implements kit.fsm.State<Main> {
    public entity: Main;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }


    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            // 添加加载动画
            let loadingNode = AssetsManager.instance.getGlobalNode(BUNDLE_LOADING);
            loadingNode.zIndex = cc.macro.MAX_ZINDEX;
            this.entity.uiNode.addChild(loadingNode);
            res();
        })
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        this.entity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING));
    }
}
