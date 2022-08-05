import { kit } from "../../../../kit/kit";
import { NOVICE_GUIDE_ENTER } from "../../../../Script/config/event";
import { UserDataManager } from "../../../../Script/manager/userDataManager";
import BaseComponent from "../../baseComponent";
import GuideManager from "./guideManager";
import GuideObserver from "./guideObserver";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NoviceGuide extends BaseComponent {

    @property(cc.JsonAsset)
    public guideConfig: cc.JsonAsset = null;

    public init(data?: any): void {
        kit.manager.Event.on(NOVICE_GUIDE_ENTER, this.enterGuide, this)
        this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
        // 下一帧进入引导
        kit.system.timer.doFrameOnce(2, () => {
            this.enterGuide();
        })
    }
    public enterGuide() {
        let step = 1000;
        let next = false;
        if (UserDataManager.instance.guideStep != 0) {
            step = UserDataManager.instance.guideStep;
            next = true;
        }
        GuideManager.instance.init(this.node, this.guideConfig.json, GuideObserver, step, next);
        GuideManager.instance.check();
    }

    private onClick() {
        GuideManager.instance.onClickEvent();
    }

    // 点击跳过
    public onClickSkip() {
        GuideManager.instance.skip();
    }
    public onDestroy() {
        kit.manager.Event.off(NOVICE_GUIDE_ENTER, this.enterGuide, this)
    }
}
