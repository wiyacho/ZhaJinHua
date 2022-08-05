/**
 *
 * @author 
 */
export default class Telegram {
    /**
     * these telegrams will be stored in a priority queue. Therefore the >
     * operator needs to be overloaded so that the PQ can sort the telegrams
     * by time priority. Note how the times must be smaller than
     * SmallestDelay apart before two Telegrams are considered unique.
     */
    private SmallestDelay: number = 0.25;
    /**
     * 发送消息的实体(entity)的id
     */
    public Sender: string;
    /**
     * 处理消息的实体(entity)的id
     */
    public Receiver: string;
    /**
     * 一个enum类型的消息类型，实体(entity)根据不同的消息类型进行不同的处理
     */
    public Msg: number;
    /**
     * 消息可以立即发送或延迟指定的金额时间。
     * 如果一个延迟是必要的，这个字段是加盖的时间应发送消息。
     */
    public DispatchTime: number;

    // 消息附带的额外信息，这个可以根据需求自定义，也可以为null
    public ExtraInfo: any;

    public time: number;

    public constructor(time: number, sender: string, receiver: string, msg: number, info: any = null) {
        this.Sender = sender;
        this.Receiver = receiver;
        this.Msg = msg;
        this.DispatchTime = time;
        this.time = Date.now();
        this.ExtraInfo = info;
    }

    public get sortSerial(): number {
        return this.DispatchTime;
    }
}
