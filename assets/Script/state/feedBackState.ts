import PlatformSystem from "../../kit/framework/platform/PlatformSystem";
import { kit } from "../../kit/kit";
import Main from "../app";
import { BUNDLE_USER_FEED_BACK } from "../config/config";
import { PLAY_BACKGROUND_MUSIC, STATE_TO_HALL, STOP_BACKGROUND_MUSIC } from "../config/event";
import HallStateV2 from "./HallStateV2";
const { ccclass, property } = cc._decorator;
@ccclass
export default class feedBackState implements kit.fsm.State<Main> {
    public entity: Main;
    public feedBackNode: cc.Node = null

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public enter(data?: any): Promise<void> {
        this.setScreenOrientation(false)
        return new Promise((res, rej) => {
            kit.manager.resources.loadRes(BUNDLE_USER_FEED_BACK, `prefab/${BUNDLE_USER_FEED_BACK}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error);
                    rej(error);
                    return;
                }
                kit.manager.Event.emit(STOP_BACKGROUND_MUSIC);
                this.feedBackNode = cc.instantiate(prefab)
                this.entity.contentNode.addChild(this.feedBackNode);
                kit.manager.Event.on(STATE_TO_HALL, this.showHall, this)
                res();
            });
        })
    }

    private showHall(): void {
        this.entity.changeState(HallStateV2);
    }
    
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        this.setScreenOrientation(true)
        kit.manager.Event.emit(PLAY_BACKGROUND_MUSIC);
        kit.manager.Event.off(STATE_TO_HALL, this.showHall, this)
        this.feedBackNode.destroy(); 
        kit.manager.resources.releaseAsset(BUNDLE_USER_FEED_BACK);
    }

    /* isHeng 是否横屏 */
    public setScreenOrientation(isHeng){
        if (cc.sys.os == cc.sys.OS_IOS) {
            if(isHeng){
                PlatformSystem.instance.adapter.callFunction("landscapeRight", "", "CocosHelper");
            }else{
                PlatformSystem.instance.adapter.callFunction("orientationPortrait", "", "CocosHelper");
            }
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "changeOrientationH", "(Z)V", isHeng);
        }
    }

}