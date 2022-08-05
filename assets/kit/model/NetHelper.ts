import EventSystem from "../system/event/EventSystem";
import HttpSystem from "../system/net/http/HttpSystem";
import { MessageBase } from "./MessageBase";
import ModelManager from "./ModelManager";
import NativeInfo, { NetworkType } from "./NativeInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NetHelper {

    private static cbMap: Map<string, (api: string, msg: MessageBase) => void> = new Map();
    public static currentMessage: MessageBase;
    private static _hostUrl:string;
    private static onErrorCb: (states, message, response) => void

    public static init(errorCb: (states, message, response) => void) {
        HttpSystem.instance.init(NetHelper.onError);
        NetHelper.onErrorCb = errorCb;
    }
    public static setHostUrl(url:string) {
        NetHelper._hostUrl = url;
    }

    public static registCb (message: string, callBack: (api, msg) => void) {
        NetHelper.cbMap.set(message, callBack);
    }

    public static sendMessage(message: MessageBase) {
        if (NetHelper._hostUrl == "") {
            NetHelper.dispatcher(message.messageApi, message.debugData);
            return;
        }
        if (!ModelManager.instance.UserToken || ModelManager.instance.UserToken == '') {
            this.sendMessageWithOutToken(message);
            return;
        }
        NetHelper.currentMessage = message;

        let netWork = NativeInfo.getNetworkStatus();
        // 无网络
        if (netWork == NetworkType.NETWORK_NO) { 
            NetHelper.onError && NetHelper.onError("请求错误", "failed to connect", null);
            return;
        }
        let url = this.formatUrl(message.messageApi);
        let header = { "timestamp": ModelManager.instance.timestamp, "phoneInfo": ModelManager.instance.phoneInfo, "Authorization": `Bearer ${ModelManager.instance.UserToken}` };
        //let header =  `{"timestamp": ${ModelManager.instance.timestamp}, "phoneInfo": ${ModelManager.instance.phoneInfo}, "Authorization": "Bearer ${ModelManager.instance.UserToken}"}`
        cc.log(header);
        HttpSystem.instance.httpPost(url, message.param, null, JSON.stringify(header))
            .then(msg => {
                cc.log(message.messageApi + "请求返回", msg);
                if (!msg || msg.code != 200) {
                    NetHelper.onError && NetHelper.onError("请求错误", msg, msg);
                }
                NetHelper.dispatcher(message.messageApi, msg);
            })
    }

    public static sendMessageWithOutToken(message: MessageBase) {
        if (NetHelper._hostUrl == "") {
            NetHelper.dispatcher(message.messageApi, message.debugData);
            return;
        }
        let url = this.formatUrl(message.messageApi);
        let header = { "timestamp": ModelManager.instance.timestamp, "phoneInfo": ModelManager.instance.phoneInfo , "hotVer": ModelManager.instance.hotVer };
        cc.log(header);
        NetHelper.currentMessage = message;
        NetHelper.currentMessage["noHeader"] = true;
        //let header = `{"timestamp": ${ModelManager.instance.timestamp}, "phoneInfo": ${ModelManager.instance.phoneInfo}}`
        HttpSystem.instance.httpPost(url, message.param, null, JSON.stringify(header))
            .then(msg => {
                cc.log(message.messageApi + "请求返回", msg);
                if (!msg || msg.code != 200) {
                    NetHelper.onError && NetHelper.onError("请求错误", msg, msg);
                }
                NetHelper.dispatcher(message.messageApi, msg);
            })
    }

    public static dispatcher(api: string, msg: any) {
        let cb = NetHelper.cbMap.get(api);
        if (cb) { 
            cb(api, msg);
            NetHelper.cbMap.delete(api);
        } else {
            EventSystem.emit(api, msg)
        }
    }

    public static tryAgain () {
        if (NetHelper.currentMessage["noHeader"]) {
            NetHelper.sendMessageWithOutToken(NetHelper.currentMessage)
            return;
        } 
        NetHelper.sendMessage(NetHelper.currentMessage)
    }

    public static onError (states, message, response) {
        let api = NetHelper.currentMessage.messageApi;
        let cb = NetHelper.cbMap.get(api);
        if (cb) { 
            cb(api, response);
            NetHelper.cbMap.delete(api);
        }
        NetHelper.onErrorCb(states, message, response);
    }

    public static formatUrl(api: string): string {
        return `${NetHelper._hostUrl}${api}`;
    }
}
