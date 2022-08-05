import { kit } from "../../kit/kit";
import ModelManager from "../../kit/model/ModelManager";
import { DEV_MODE, DEV_MODE_LIST } from "../config/config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UserModel extends kit.model.modelBase {

    public reqToken (cb?: (msg) => void) {
        return new Promise((res, reject) => {
             // @ts-ignore
            if (DEV_MODE == DEV_MODE_LIST.LOCAL) {
                let token = "testToken";
                kit.model.modelManager.UserToken = token;
                kit.model.modelManager.UserId = `ChineseAi_-1`;
                res(token);
                return;
            }
            let needReqToken = true;
            let difference = kit.model.modelManager.expireTime - kit.model.modelManager.timestamp;
            // 大于1天 3600 * 24 * 1000 不重新请求
            if (difference > 3600 * 24 * 1000) {
                needReqToken = false;
            }

            if (ModelManager.instance.UserToken != "" && !needReqToken) {
                res(ModelManager.instance.UserToken);
                return;
            }

            this.sendMessageVisitorRegister((token) => {
                res(token);
            })
        }).catch((e) => {
            cc.error("UserModel.reqToken error", e);
        });

    }

    timeHandle;
    public sendMessageVisitorRegister (cb: (token) => void) {
        let message = new MessageVisitorRegister();
        this.registerCallBack(message, (msg) => {
            let token = '';
            let userId = -1;
            let expireTime = 0;
            // 清楚计时器
            kit.system.timer.clearTimer(this.timeHandle);
            if (msg && msg.code == 200 && msg.data) {
                token = msg.data.jwtToken || '';
                userId = msg.data.userId || -1;
                expireTime = msg.data.jwtExpireTime || 0;
            } 
            if (expireTime != 0) {
                expireTime = new Date(expireTime).getTime();
            }
            if (!token || token == '') {
                return;
            }
            cc.log("token: ", token);
            kit.model.modelManager.UserToken = token;
            kit.model.modelManager.UserId = `ChineseAi_${userId}`;
            kit.model.modelManager.expireTime = expireTime;
            kit.util.LocalStorage.setObject("USER_INFO", {"token": token, "userId": `ChineseAi_${userId}`, "expireTime": expireTime});
            cb(token);
        });
        this.sendMessageWithOutToken(message);

        // 超时
        this.timeHandle = kit.system.timer.doOnce(8000, () => {
            cc.log("超时重新请求token");
            this.sendMessageVisitorRegister(cb);
        })
    }

    public messageCountryInfo  () {
        return new Promise((res, reject) => {
            cc.log("请求国家信息");
            let message = new MessageCountryInfo();
            this.registerCallBack(message, (msg) => {
                let country = '';
                cc.log("ccccc",msg);
                if (msg && msg.code == 200 && msg.data) {
                    ModelManager.instance.CountryName = msg.data.countryName || "";
                    ModelManager.instance.cityName = msg.data.cityName || ""
                    ModelManager.instance.hotUpdatePath = msg.data.hotUpdatePath || ""
                    ModelManager.instance.hotLatestVersion = msg.data.hotLatestVersion || ""
                    res(country);
                } else {
                    reject()
                }
            });
            this.sendMessageWithOutToken(message);
        }); 
    }
}


/** 游客注册 */
export class MessageVisitorRegister extends kit.model.messageBase{
    messageApi = "/cnapi/v/user/visitor/register";
    param = {};
    showTips = false;
    data = {};
}
/** 获取国家信息 */
export class MessageCountryInfo extends kit.model.messageBase{
    messageApi = "/cnapi/v/init";
    param = {};
    showTips = false;
    data = {};
}
