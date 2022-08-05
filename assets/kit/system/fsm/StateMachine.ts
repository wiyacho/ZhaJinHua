import IEntity from "./entity/IEntity";
import IState from "./state/IState";
import Telegram from './message/Telegram';

/**
 * 状态机,翻译自游戏编程精粹7，c++版本
 * @class StateMachine
 */
export default class StateMachine<T extends IEntity> {
    private m_pOwner: T;
    private m_pCurrentState: IState<T>;
    private m_pPreviousState: IState<T>;
    private m_pGlobalState: any;

    public constructor(owner: T) {
        this.m_pOwner = owner;
        this.m_pCurrentState = null;
        this.m_pPreviousState = null;
        this.m_pGlobalState = {};
    }

    public release(): void {
        this.m_pCurrentState && this.m_pCurrentState.exit();
        if (this.m_pGlobalState) {
            for (let key in this.m_pGlobalState) {
                this.m_pGlobalState[key].exit();
                delete this.m_pGlobalState[key]
            }
            this.m_pGlobalState = null;
        }
    }

    public AddGlobalState(state: any, data?: any): void {
        let newState: IState<T> = new state()
        newState.entity = this.m_pOwner;
        this.m_pGlobalState[state] = newState;
        // enter 放在后面
        newState.enter(data);
    }

    public RemoveGlobalState(state: any): void {
        if (this.m_pGlobalState[state]) {
            this.m_pGlobalState[state].exit();
            delete this.m_pGlobalState[state];
        }
    }

    public Update(dt: number): void {
        if (this.m_pGlobalState !== null) {
            for (let key in this.m_pGlobalState) {
                this.m_pGlobalState[key].execute(dt);
            }
        }
        if (this.m_pCurrentState !== null) {
            this.m_pCurrentState.execute(dt);
        }
    }

    /**
     * 自定义改变状态过程
     * @param onTransition 自定义过场函数
     * @example
     *    this.stateMachine.Transition((currentState: IState<Main>) => {
     *        let newState: IState<Main> = new stateClass();
     *        newState.entity = this;
     *        newState.enter(data).then(() => {
     *            currentState.exit();
     *        })
     *        return newState;
     *    });
     */
    public Transition(onTransition: (currentState: IState<T>) => IState<T>): void {
        this.m_pPreviousState = this.m_pCurrentState;
        let newState: IState<T> = onTransition(this.m_pPreviousState);
        this.m_pCurrentState = newState;
    }

    public ChangeState(pNewState: any, data?: any): void {
        this.m_pPreviousState = this.m_pCurrentState;
        this.m_pPreviousState && this.m_pPreviousState.exit(this.m_pOwner);
        this.m_pCurrentState = new pNewState();
        this.m_pCurrentState.entity = this.m_pOwner;
        this.m_pCurrentState.enter(data);
    }

    public HandleMessage(msg: Telegram): boolean {
        if (this.m_pCurrentState && this.m_pCurrentState.onMessage(this.m_pOwner, msg)) {
            return true;
        }
        if (this.m_pGlobalState) {
            this.m_pGlobalState.forEach((element: IState<T>) => {
                element.onMessage(this.m_pOwner, msg);
            })
        }
        return false;
    }

    public RevertPreviousState(): void {
        this.ChangeState(this.m_pPreviousState);
    }

    public isInState(state: any | IState<T>): boolean {
        return this.m_pCurrentState instanceof state;
    }

    public exitCurrentState(data?: any): void {
        this.CurrentState && this.CurrentState.exit(data);
        this.m_pCurrentState.entity = null;
        this.m_pPreviousState = null;
        this.m_pCurrentState = null;
    }

    public get CurrentState(): IState<T> {
        return this.m_pCurrentState;
    }

    public get GlobalState(): IState<T>[] {
        return this.m_pGlobalState;
    }

    public get PreviousState(): IState<T> {
        return this.m_pPreviousState;
    }
}
