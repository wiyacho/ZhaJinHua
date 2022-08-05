import { kit } from "../../../kit/kit";
import Main from "../../app";
import { BUNDLE_COMMON_TIPS, BUNDLE_COMPONENTS, BUNDLE_FOLLOW_READ } from "../../config/config";
import AssetsManager from "../../manager/assetsManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FollowReadState implements kit.fsm.State<Main> {
    public entity: Main;

    private res: cc.Asset;
    private recordPrefab: cc.Node;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }


    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {

            this.addFollowRead(data);
        })
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        this.recordPrefab.removeFromParent();
        this.recordPrefab.destroy();
        this.res.decRef();
    }

    public addFollowRead(data) {
        this.recordPrefab = AssetsManager.instance.getGlobalNode(BUNDLE_FOLLOW_READ);
        // this.recordPrefab = cc.instantiate(prefab);
        this.entity.uiNode.addChild(this.recordPrefab);
        this.recordPrefab.zIndex = 99;
    }

}
