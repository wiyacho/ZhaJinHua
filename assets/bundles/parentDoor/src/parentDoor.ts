import ClickCmpt from "../../../kit/component/ClickCmpt";
import { kit } from "../../../kit/kit";
import ModelManager from "../../../kit/model/ModelManager";
import { TIPS_TYPE } from "../../../kit/structure/ClientTipsEnum";
import AudioManager from "../../../kit/system/audio/AudioManager";
import DelayUtils from "../../../kit/utils/DelayUtils";
import { PARENT_DOOR_JUMP, STATE_TO_HALL } from "../../../Script/config/event";
import Spot from "../../../Script/config/spot";

const { ccclass, property } = cc._decorator;
@ccclass
export default class parentDoor extends cc.Component {

    public callBack: Function = null
    public randomArr: number[] = []
    public passWordArr: number[] = []
    public wordConfig = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"]

    onLoad() {
        this.refreshUI()
    }

    refreshUI() {
        this.randomPassWordEng()
        this.setKeyboardClick()
    }

    public randomPassWordEng() {
        for (let i = 0; i < 3; i++) {
            let a = Math.floor(Math.random() * 10)
            this.randomArr.push(a)
            cc.find('left/lb_word' + i, this.node).getComponent(cc.Label).string = this.wordConfig[a]
        }
    }

    public setKeyboardClick() {
        for (let i = 0, len = 10; i < len; i++) {
            let node = cc.find('right/item' + i, this.node)
            node.getChildByName("lb").getComponent(cc.Label).string = i.toString()
            node.addComponent(ClickCmpt)
            node.addComponent(ClickCmpt).onClick(node, this.onClick.bind(this), null, { target: node, index: i }, false, null)
        }
    }

    public onClick(parm: { target: cc.Node, index: number }) {
        cc.log("index ========>" + parm.index)
        let index = parm.index
        this.passWordArr.push(index)
        this.refreshPassWord()
        this.scheduleOnce(() => this.checkResult())
        AudioManager.playEffect("parentDoor", "audios/qipao")
    }

    public checkResult() {
        if (this.passWordArr.length == 3) {
            let result = (this.randomArr.toString() == this.passWordArr.toString())
            if (result) {
                cc.log("正确～～～～")
                kit.system.spot.send(Spot.AELC_PassVerify, { VerifySuccess: 1 });
                this.answerRight()
            } else {
                cc.log("错误～～～～")
                kit.system.spot.send(Spot.AELC_PassVerify, { VerifySuccess: 2 });
                this.setWordShake()
                AudioManager.playEffect("parentDoor", "audios/didi")
            }
        }
    }

    public refreshPassWord() {
        for (let j = 0, len = 3; j < len; j++) {
            let num = this.passWordArr[j]
            if (num != undefined) {
                cc.find("left/lb_pass" + j, this.node).getComponent(cc.Label).string = num.toString()
            } else {
                cc.find("left/lb_pass" + j, this.node).getComponent(cc.Label).string = ""
            }
        }
    }

    public setWordShake() {
        for (let j = 0, len = 3; j < len; j++) {
            let node = cc.find("left/lb_pass" + j, this.node)
            cc.tween(node)
                .by(0.1, { x: -10 })
                .by(0.1, { x: 10 })
                .union()
                .repeat(2)
                .delay(0.2)
                .call(() => this.clearWord())
                .start()
        }
    }

    public clearWord() {
        this.passWordArr = []
        this.refreshPassWord()
    }


    public answerRight() {
        let net_work = kit.model.nativeInfo.getNetworkStatus()
        if (net_work === kit.model.netWork.networkType.NETWORK_NO) {
            let params = {
                tipsType: TIPS_TYPE.NO_NETWORK,
                confirmCallback: () => {
                    this.answerRight()
                },
                cancelCallback: () => {
                    kit.manager.Event.emit(STATE_TO_HALL)
                },
            }
            kit.manager.Event.emit(kit.consts.Event.SHOW_COMMON_TIPS_POP, params);
            return
        }
        kit.manager.Event.emit(PARENT_DOOR_JUMP)
    }

    public deleteBtn(event, data) {
        this.passWordArr.pop()
        this.refreshPassWord()
    }

    public btnBack() {
        if (DelayUtils.CheckDelay("button")) return;
        kit.system.spot.send(Spot.AELC_QuitVerify);

        kit.manager.Event.emit(STATE_TO_HALL)
    }
}
