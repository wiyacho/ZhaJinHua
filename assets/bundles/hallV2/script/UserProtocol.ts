import { kit } from "../../../kit/kit";
import Spot from "../../../Script/config/spot";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserProtocol extends cc.Component {
    onLoad() {
        kit.system.spot.send(Spot.AELC_Servicepolicy);

    }
    onBackBtnClicked() {
        // kit.system.spot.send(Spot.AELC_QuitServicepolicy);
        this.node.destroy();
    }
}
