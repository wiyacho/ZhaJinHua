import { kit } from "../../kit/kit";
import Main from "../app";
import { BUNDLE_FIRST_PAGE } from "../config/config";
import { STATE_TO_HALL } from "../config/event";
import { ConfigDataManager } from "../manager/ConfigDataManager";
import BackGroundMusicState from "./globalState/BackGroundMusicState";
import HallStateV2 from "./HallStateV2";

export default class FirstPageState implements kit.fsm.State<Main> {
    public entity: Main;
    private firstPage: cc.Node;
    private bundle: cc.AssetManager.Bundle;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            kit.manager.Event.on(STATE_TO_HALL, this.toHall, this);

            kit.manager.resources.loadBundle(`bundles/${BUNDLE_FIRST_PAGE}`).then((bundle: cc.AssetManager.Bundle) => {
                this.bundle = bundle;
                bundle.load(`prefab/${BUNDLE_FIRST_PAGE}`, cc.Prefab, async (error: Error, prefab: cc.Prefab) => {
                    if (error) {
                        rej(error)
                        return;
                    }
                    this.firstPage = cc.instantiate(prefab)
                    this.entity.contentNode.addChild(this.firstPage);

                    //
                    await ConfigDataManager.instance.init();
                    res();
                })
            })
        })
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        kit.manager.Event.off(STATE_TO_HALL, this.toHall, this);
        this.entity.contentNode.removeChild(this.firstPage);
        this.firstPage.destroy();
        // this.entity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING));
        cc.assetManager.removeBundle(this.bundle);
    }

    private toHall(event: any): void {
        // this.entity.uiNode.addChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING));
        // loadBundle(BUNDLE_HALL).then((res: cc.Prefab) => {
        this.entity.stateMachine.AddGlobalState(BackGroundMusicState);
        this.entity.stateMachine.ChangeState(HallStateV2);

        if (cc.sys.isNative){
            // @ts-ignore
            jsb.Device.setKeepScreenOn(true);
        };
        // this.entity.changeState(HallState);
        // kit.manager.Event.off(STATE_TO_HALL, this.toHall, this);
        // this.entity.contentNode.removeChild(this.firstPage);
        // this.firstPage.destroy();
        // this.entity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING));
        // cc.assetManager.removeBundle(this.bundle);
        // })

    }

}