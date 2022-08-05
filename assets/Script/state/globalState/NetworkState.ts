import { kit } from "../../../kit/kit";
import ModelManager from "../../../kit/model/ModelManager";
import NativeInfo, { NetworkType } from "../../../kit/model/NativeInfo";
import NetHelper from "../../../kit/model/NetHelper";
import { commonTipsOptions } from "../../../kit/structure/ClientModuleInterface";
import Main from "../../app";
import { DEV_MODE, GAME_VERSION, HOSTURL } from "../../config/config";
import { BACK } from "../../config/event";
import Spot from "../../config/spot";
import UserModel from "../../modle/UserModel";

export default class NetworkState implements kit.fsm.State<Main> {
    public entity: Main;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public async enter(data?: any): Promise<void> {
        ModelManager.instance.init(HOSTURL, this.handleNetError);
        // // 给设备号加头
        // let phoneInfo = ModelManager.instance.phoneInfo;
        // let json = JSON.parse(phoneInfo);
        // if (json['device_uuid']) {
        //     let uid = json['device_uuid'];
        //     json['device_uuid'] = `${GAME_VERSION}_${uid}`;
        // }
        // cc.log("修改过后的id"+ json['device_uuid']);
        // ModelManager.instance.phoneInfo = JSON.stringify(json);
        console.log("userToken:", ModelManager.instance.UserToken);
        console.log("phoneInfo:", ModelManager.instance.phoneInfo);
        console.log("DEV_MODE: ", DEV_MODE,);
        await ModelManager.instance.getModel(UserModel).messageCountryInfo();
        return Promise.resolve()
    }

    public async handleNetError(states, message, response) {
        cc.log("nethelper onError  -------", message, response);
        if (!response && !message) {
            return
        }

        let netWork = NativeInfo.getNetworkStatus();
        // 无网络
        if (netWork == NetworkType.NETWORK_NO && NetHelper.currentMessage.showTips) {
            // --TODO 无网络弹窗
            let params: commonTipsOptions = {
                tipsType: kit.structure.Tips.Type.NO_NETWORK,
                confirmCallback: () => {
                    NetHelper.tryAgain();
                },
                cancelCallback: () => {
                    if (NetHelper.currentMessage.messageApi == "/cnapi/lesson/list") {
                        NetHelper.tryAgain();
                        return;
                    }
                    kit.manager.Event.emit(BACK);
                }
            }
            kit.manager.Event.emit(kit.consts.Event.SHOW_COMMON_TIPS_POP, params);
            return;
        }
        if (response && response.code == 10009) {
            // ————TODO token失效 重新登陆
            ModelManager.instance.getModel(UserModel).sendMessageVisitorRegister((token) => {
                NetHelper.tryAgain();
            });
            return;
        }
        if (NetHelper.currentMessage.showTips) {
            // --TODO 无网络弹窗
            let params: commonTipsOptions = {
                tipsType: kit.structure.Tips.Type.REQUEST_FAILED,
                confirmCallback: () => {
                    NetHelper.tryAgain();
                },
                cancelCallback: () => {
                    if (NetHelper.currentMessage.messageApi == "/cnapi/lesson/list") {
                        NetHelper.tryAgain();
                        return;
                    }
                    kit.manager.Event.emit(BACK);
                }
            }
            kit.manager.Event.emit(kit.consts.Event.SHOW_COMMON_TIPS_POP, params);
        }
        cc.warn("网络请求错误", message, response)
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
    }
}