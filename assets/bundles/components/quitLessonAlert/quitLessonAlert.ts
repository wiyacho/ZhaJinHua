import { kit } from "../../../kit/kit";
import { BACK, CONTINUE } from "../../../Script/config/event";
import Spot from "../../../Script/config/spot";
import LessonManagerV2 from "../../../Script/manager/LessonManagerV2";
import IComponent from "../IComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuitLessonAlert extends kit.manager.Popup.Base implements IComponent {

    @property(cc.Label)
    public label: cc.Label = null;


    public onLoad() {

    }

    public init(data?: any): void {

    }

    public onClickClose(): void {
        this.hide();
        kit.manager.Audio.stopEffect();
        kit.manager.Audio.stopMusic();
        kit.manager.Event.emit(BACK);
        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_UNBLOCK);
    }

    public onClickOk(): void {
        this.hide();
        kit.manager.Event.emit(CONTINUE);
        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_UNBLOCK);
    }

}
