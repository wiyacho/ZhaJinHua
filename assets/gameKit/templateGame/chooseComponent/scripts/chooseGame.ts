import ComponentBase from "../../scripts/ComponentBase";
import AudioManager from '../../../../kit/system/audio/AudioManager';
import { RoundStateType } from "../../../common/structure/CompEnum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class chooseGame extends ComponentBase {

    @property({ type: cc.Integer, displayName: "正确选项" })
    answerNumber: number = 0

    @property({ type: [cc.Node], displayName: "选项Node" })
    touchItems: cc.Node[] = [];


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        //   this.gameBase = this.node.parent.getComponent("QuziGamePanda");
        this.schedule(this.showTips,5);
        this.showTips()
    }

    showTips() {
        this.touchItems.forEach((node) => {
            cc.tween(node).by(0.2, { scale: 0.1 })
                .by(0.2, { scale: -0.1 })
                .union()
                .repeat(2)
                .start()
        })
    }

    itemTouchCall(event, data) {
        let n = Number(data);
        if (this.answerNumber == n) {
            //选择正确
            AudioManager.playEffect("quziGamePanda", "res/audios/game_right")
        }
        else {
            //选择错误
            AudioManager.playEffect("quziGamePanda", "res/audios/game_error")
        }
        cc.tween(this.node).to(.5, { opacity: 0 }).call(() => {
            // this.node.destroy()
            if (this.answerNumber == n) {
                //选择正确
                this.gameBase.roundStateTypeChanged(RoundStateType.RoundComplete, { win: 1 })
            }
            else {
                //选择错误
                this.gameBase.roundStateTypeChanged(RoundStateType.RoundComplete, { win: 0 })
            }
        }).call(() => {
            this.node.destroy();
        }).start();
    }


    // update (dt) {}
}
