import AudioManager from "../../../../kit/system/audio/AudioManager";
import { RoundStateType } from "../../../common/structure/CompEnum";
import ComponentBase from "../../scripts/ComponentBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectGame extends ComponentBase {



    @property({ type: [cc.Node], displayName: "步数指示器" })
    heartsArr: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: "任务指示器" })
    answerItemsArr: cc.Node[] = [];

    rightTimes: number = 0;

    wrongTiems: number = 0;

    @property({ type: [cc.Node], displayName: "选项Node" })
    touchItems: cc.Node[] = [];


    isGameEnd:boolean = false;

    // onLoad () {}

    start() {

        cc.tween(this.node).to(1, { y: 0 }).call(() => {
            this.schedule(this.showTips, 5);
            this.showTips()
        }).start();
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
        if (this.isGameEnd) {
            cc.warn('game end')
            return
        }
        let n = Number(data);
        let node = event.target;
        node.active = false;
        if (n == 0) {
            //正确
            this.answerItemsArr[this.rightTimes].active = true;
            AudioManager.playEffect("templateGame", "selectGame/audios/game_right")
            if (this.rightTimes >= 1) {
                this.gameEnd(1);
                return;
            }
            this.rightTimes += 1;
        }
        else {
            //错误
            AudioManager.playEffect("templateGame", "selectGame/audios/game_error")
            this.heartsArr[this.wrongTiems].active = false;
            this.wrongTiems += 1;

            if (this.wrongTiems >= 3) {
                this.gameEnd(0)
            }

        }
    }

    gameEnd(w: number) {
        this.isGameEnd = true;
        cc.tween(this.node).to(2, { y: 900 }).call(() => {
            this.gameBase.roundStateTypeChanged(RoundStateType.RoundComplete, { win: w })
        }).call(() => {
            this.node.destroy();
        }).start()
    }

    onEnable() {
        cc.tween(this.node).to(1, { y: 0 });
    }



    // update (dt) {}
}
