import Events from '../../kit/events/events';
import { kit } from '../../kit/kit';
import EventSystem from '../../kit/system/event/EventSystem';
import Main from "../app";
import HotUpdate from '../utils/HotUpdate';
import InitState from './initState';

export default class UpdateState implements kit.fsm.State<Main> {
    public entity: Main;

    hotupdate: HotUpdate = null

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        return true
    }
    public async enter(data?: any): Promise<void> {
        EventSystem.on(Events.HOTFIX_OK, this.onHotFixOk, this)
        EventSystem.on(Events.HOTFIX_RM, this.onHotFixRm, this)
        this.entity.hotupdate = cc.instantiate(this.entity.hotupdatePrefab)
        this.hotupdate = this.entity.hotupdate.getComponent(HotUpdate)
        this.entity.uiNode.addChild(this.entity.hotupdate)
        return Promise.resolve()
    }
    onHotFixRm() {
        EventSystem.off(Events.HOTFIX_OK, this.onHotFixOk, this)
        EventSystem.off(Events.HOTFIX_RM, this.onHotFixRm, this)
        this.entity.hotupdate.removeFromParent()
    }

    private safeLock = false

    onHotFixOk(param) {
        if (this.safeLock) {
            return
        }
        this.safeLock = true
        if (param.result) {
            console.log('param.code:' + param.code)
        }
        let currState = this.entity.stateMachine.CurrentState
        if (currState) {
            console.log('curr state:' + (typeof currState))
            if (!(currState instanceof InitState)) {
                this.entity.stateMachine.ChangeState(InitState)
            }
        }
    }

    public execute(data?: any): void {

    }
    public exit(data?: any): void {
        // this.entity.hotupdate.removeFromParent()
    }



}