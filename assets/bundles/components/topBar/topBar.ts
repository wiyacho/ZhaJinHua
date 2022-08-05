import { NEXT_LESSON, POPUP_QUIT_LESSON_ALERT } from "../../../Script/config/event";
import { kit } from "../../../kit/kit";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TopBar extends cc.Component {

    @property(cc.Node)
    public nextBtnNode: cc.Node = null;

    public init(data?: { isShowNext?: boolean }): void {
        let isShowNext: boolean = true;
        if (data !== undefined) {
            isShowNext = data.isShowNext ? true : false;
        }
        this.nextBtnNode.active = isShowNext;
    }

    public onBack(): void {
        kit.manager.Event.emit(POPUP_QUIT_LESSON_ALERT);
        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_BLOCK);
    }

    public onNext(): void {
        kit.manager.Event.emit(NEXT_LESSON);
    }

}
