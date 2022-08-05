import AssetsManager from "../../manager/assetsManager";
import Main from "../../app";
import { BUNDLE_COMPONENTS, BUNDLE_NOVICE_GUIDE, BUNDLE_ROOT } from "../../config/config";
import { NOVICE_GUIDE_ENTER } from "../../config/event";
import { kit } from "../../../kit/kit";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NoviceGuideState implements kit.fsm.State<Main> {
    public entity: Main;
    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            let guideNode = AssetsManager.instance.getGlobalNode(BUNDLE_NOVICE_GUIDE);
            if (guideNode) {
                this.entity.uiNode.addChild(guideNode);
                kit.manager.Event.emit(NOVICE_GUIDE_ENTER);
                res();
                return;
            }
            kit.manager.resources.loadBundle(`${BUNDLE_ROOT}/${BUNDLE_COMPONENTS}`).then((bundle: cc.AssetManager.Bundle) => {
                bundle.load(`${BUNDLE_NOVICE_GUIDE}/${BUNDLE_NOVICE_GUIDE}`, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                    if (error) {
                        rej(error);
                        return;
                    }
                    guideNode = cc.instantiate(prefab);
                    AssetsManager.instance.addGlobalNode(guideNode);
                    this.entity.uiNode.addChild(guideNode);
                    res();
                })
            })

        })
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        let guideNode = AssetsManager.instance.getGlobalNode('noviceGuide');
        this.entity.uiNode.removeChild(guideNode);
    }
}
