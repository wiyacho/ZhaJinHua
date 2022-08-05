import { GAME_NAME, GAME_VERSION, URL_BASE } from "./config/config";
import InitState from "./state/initState";
import { ON_GAME_PASS, ON_GAME_RESUME } from "./config/event";
import LoadingTurnState from "./state/globalState/LoadingTurnState";
import { kit } from "../kit/kit";
import UpdateState from "./state/updateState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component implements kit.fsm.Entity {
    @property(cc.Node)
    public uiNode: cc.Node = null;

    @property(cc.Node)
    public contentNode: cc.Node = null;

    public sid: string = 'Main';
    public stateMachine: kit.fsm.StateManager<Main>;
    public host: string = URL_BASE;

    @property({ type: cc.Prefab, displayName: "热更UI" })
    hotupdatePrefab: cc.Prefab = null

    hotupdate: cc.Node = null

    public onLoad() {

        cc.debug.setDisplayStats(false);
        kit.system.platform.init();
        kit.system.log.init(this.onLog, GAME_NAME, GAME_VERSION, true);
        kit.system.error.init(cc.sys.isNative, this.onError)
        kit.system.timer.init();
        kit.manager.Audio.init();   // FIXME 系统或者管理器？

        this.stateMachine = new kit.fsm.StateManager<Main>(this);
        if (cc.sys.isNative) {
            this.stateMachine.ChangeState(UpdateState, this);
        } else {
            this.stateMachine.ChangeState(InitState, this);
        }

        // 监听前后台
        cc.game.on(cc.game.EVENT_HIDE, () => {
            cc.log("游戏进入后台");
            kit.manager.Event.emit(ON_GAME_PASS);
        }, this);

        cc.game.on(cc.game.EVENT_SHOW, () => {
            cc.log("游戏进入前台");
            kit.manager.Event.emit(ON_GAME_RESUME);
        }, this);

    }

    // 上报错误
    private onError(exception: string): void {
        kit.system.platform.adapter.toast(exception);
    }

    // 记录运行时日志
    private onLog(message: string) {

    }

    // 自定义状态改变流程
    public changeState(stateClass: any, data?: any): void {
        this.stateMachine.AddGlobalState(LoadingTurnState); // 开始加载添加loading界面
        this.stateMachine.Transition((currentState: kit.fsm.State<Main>) => {
            let newState: kit.fsm.State<Main> = new stateClass();
            newState.entity = this;
            newState.enter(data).then(() => {
                this.stateMachine.RemoveGlobalState(LoadingTurnState);  // 加载完毕移除loading界面
                currentState.exit();
            })
            return newState;
        });
    }

    public onDestroy() {
        if (cc.sys.isNative) {
            if (AppHelper.isRestart()) {
                cc.log('热更重启，不需要release，返回')
                return
            }
        }
        kit.system.timer.release();
        kit.system.error.release();
        kit.system.log.release();
        kit.system.platform.release();
        this.stateMachine.release();
    }

}
