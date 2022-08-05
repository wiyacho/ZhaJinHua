import { kit } from "../../../kit/kit";
import { lessonCompleteData, MESSAGE_COMPLETE } from "./script/lessonCompleteData";
const { ccclass, property } = cc._decorator;
@ccclass
export default class lessonComplete extends cc.Component {

    @property(cc.Prefab)
    chapterRewardPre: cc.Prefab = null;

    @property(cc.Prefab)
    commonCompletePre: cc.Prefab = null;

    public completeBack: Function = null

    public onLoad() {
        kit.manager.Event.on(MESSAGE_COMPLETE, this.eventCompleteBack.bind(this), this)
        this.refreshUI()
    }

    public init(data) {
        this.completeBack = data.callback
        // lessonCompleteData.instance.init(data)
        this.refreshUI()
    }

    public refreshUI() {
        let IsFirstComplete = lessonCompleteData.instance.getCurChapterIsFirstComplete()
        if (IsFirstComplete && false) {    //首次完成
            let node = cc.instantiate(this.chapterRewardPre)
            this.node.addChild(node)
        } else {
            let node = cc.instantiate(this.commonCompletePre)
            this.node.addChild(node)
        }
    }

    public eventCompleteBack() {
        cc.log("completeEndBack ==")
        this.completeBack && this.completeBack()
        this.node.destroyAllChildren();
        this.node.removeFromParent(false)
    }

    public onDisable() {
        kit.manager.Event.off(MESSAGE_COMPLETE, this.eventCompleteBack.bind(this), this)
    }
}
