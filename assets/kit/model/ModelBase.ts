import EventSystem from "../system/event/EventSystem";
import { MessageBase } from "./MessageBase";
import NetHelper from "./NetHelper";
const {ccclass} = cc._decorator;

/**
 * model基类
 */
@ccclass
export default class ModelBase {

    private cbMap: Map<string, (msg) => void> = new Map();

    /** 子类重写 */
    public init() {
        let cb = this.messageCallBack();
        cb.forEach((item) => {
            EventSystem.on(item.key, item.callBack, item.target);
        });
    }

    public sendMessage (message: MessageBase) {
        this.regiestReponse(message);
        NetHelper.sendMessage(message);
    }

    public sendMessageWithOutToken (message: MessageBase) {
        this.regiestReponse(message);
        NetHelper.sendMessageWithOutToken(message);
    }

    public registerCallBack(messageBase: MessageBase, callBack: (msg) => void) {
        this.cbMap.set(messageBase.messageApi, callBack);
    }

    private regiestReponse (message: MessageBase) {
        NetHelper.registCb(message.messageApi, this.responseMessage.bind(this));
    }

    public responseMessage(api: string, msg: any) {
        let cb = this.cbMap.get(api);
        if (cb) {
            cb(msg);
        }
    }

    public clear () {
        this.cbMap = new Map();
    }

    /** 注册回调 */
    public messageCallBack(): {key: string, callBack: (responseData) => void, target: any}[] {
        return [];
    }
}
