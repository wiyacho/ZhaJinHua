import { kit } from "../../../kit/kit";
import InitLessonState from "./state/initLessonState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lesson extends cc.Component implements kit.fsm.Entity {
    public stateMachine: kit.fsm.StateManager<Lesson>;
    public sid: string = 'Hall';

    @property(cc.Prefab)
    public lessonItem: cc.Prefab = null;

    @property(cc.Node)
    public list: cc.Node = null;

    public onLoad() {
        this.stateMachine = new kit.fsm.StateManager(this);
        this.stateMachine.ChangeState(InitLessonState, this);
    }

    public onSchoolClick(event: cc.Event): void {

    }

    public onHouseClick(event: cc.Event): void {

    }

    public onZooClick(event: cc.Event): void {

    }

    public onDestroy() {

    }
}
