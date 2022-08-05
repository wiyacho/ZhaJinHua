import Telegram from "./Telegram";
import IEntity from "../entity/IEntity";
import EntityManager from "../entity/EntityManager";

/**
 * 实体消息派发器
 * @author 
 */
export class MessageDispatcher {
    private static _instance: MessageDispatcher;
    private SEND_MSG_IMMEDIATELY: number = 0;
    private NO_ADDITIONAL_INFO: number = 0;
    private PriorityQ: TreeSet<Telegram>;
    private showList: Telegram[];

    public constructor() {
        this.PriorityQ = new TreeSet<Telegram>((a, b) => { return a - b });
        this.showList = new Array<Telegram>();
    }

    public static get instance(): MessageDispatcher {
        if (this._instance == null) {
            this._instance = new MessageDispatcher();
        }
        return this._instance;
    }

    /**
     * 设置用作延迟消息的容器由于自动分类和避免的好处重复的。
     * 消息按他们的调度时间进行排序。
     */


    /**
     * 这种方法是通过向窗口发送消息或dispatchdelayedmessages利用。
     * 此方法调用接收的消息处理成员函数实体，空，与新创建的电报
     */
    public Discharge(pReceiver: IEntity, telegram: Telegram): void {
        this.showList.push(telegram);
        if (!pReceiver.stateMachine.HandleMessage(telegram)) {
            // console.log("消息被处理,Receiver：" + EntityManager.instance.GetEntityFromID(telegram.Receiver).property.name);
        }
    }

    public get showListData(): Telegram[] {
        return this.showList;
    }

    /**
     * send a message to another agent. Receiving agent is referenced by ID.
     * 发送消息到另一个代理。接收代理是由身份证引用。
     */
    public DispatchMessage(sender: string, receiver: string, msg: number, info: any = null, delay: number = 0): void {
        //        View.instance.addText(BACKGROUND_RED | FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);
        let pSender: IEntity = EntityManager.instance.getEntityFromID(sender);
        let pReceiver: IEntity = EntityManager.instance.getEntityFromID(receiver);
        if (pReceiver == null) {
            console.warn("\nWarning! No Receiver with ID of " + receiver + " found");
            return;
        }
        // create the telegram
        let telegram: Telegram = new Telegram(0, sender, receiver, msg, info);
        // if there is no delay, route telegram immediately
        if (delay <= 0.0) {
            this.Discharge(pReceiver, telegram);
        } else {
            telegram.DispatchTime = Date.now();
            this.PriorityQ.add(telegram);
        }
    }

    /**
     * 发送任何延迟的消息。这种方法被称为每一次通过
     * 主游戏循环。
     */
    public DispatchDelayedMessages(): void {
        while ((!this.PriorityQ.isEmpty) && (this.PriorityQ.first.DispatchTime <= Date.now()) && (this.PriorityQ.first.DispatchTime > 0)) {
            let telegram: Telegram = this.PriorityQ.first;
            let pReceiver: IEntity = EntityManager.instance.getEntityFromID(telegram.Receiver);

            this.Discharge(pReceiver, telegram);
            this.PriorityQ.remove(this.PriorityQ.first);
        }
    }

    public DispatchSimpleMessage(sender: IEntity, receiver: IEntity): void {
        let pSender: IEntity = sender;
        let pReceiver: IEntity = receiver;
        if (pReceiver == null) {
            console.warn("\nWarning! No Receiver with ID of " + receiver + " found");
            return;
        }
        let telegram: Telegram = new Telegram(0, pSender.sid, receiver.sid, 0, null);
        this.Discharge(pReceiver, telegram);

    }
}

// 简单版TreeSet
export class TreeSet<K> extends Set {
    public first: K;

    private sortFun: Function;

    constructor(sort: Function) {
        super();
        this.sortFun = sort;
    }

    public add(data: K): any {
        return super.add(data);
    }

    public remove(data: K): boolean {
        return this.delete(data);
    }

    public get isEmpty(): boolean {
        return this.size === 0;
    }

}