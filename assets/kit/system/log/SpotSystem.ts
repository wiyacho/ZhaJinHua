import PlatformSystem from "../../framework/platform/PlatformSystem";
import ASystem from "../interface/ASystem";
import HttpSystem from "../net/http/HttpSystem";

/**
 * 埋点
 */
export default class SpotSystem extends ASystem {

    /** 埋点 */
    private static readonly LOG_EVENT: string = "la_logEvent";
    /** 初始化埋点sdk */
    private static readonly LOG_INIT: string = "la_logInitWithApiKey";
    /** 设置用户id */
    private static readonly LOG_SET_USER_ID: string = "la_logUserId";
    /** app key */
    private static APP_KEY: string = "3437b23f038afa01e3c220886da2deda";
    /** 埋点url */
    private static readonly HTTP_HOST: string = "https://api2.amplitude.com/batch";
    /** ios sdk类名 */
    private static readonly NAME_SPACE_IOS: string = "LaLogUtli";
    /** android sdk类名 */
    private static readonly NAME_SPACE_ANDROID: string = "amplitude/LaLogUtli";

    private static packagePath: string = PlatformSystem.instance.isAndroid ? SpotSystem.NAME_SPACE_ANDROID : SpotSystem.NAME_SPACE_IOS;
    private static _instance: SpotSystem;

    private baseInfo: any;

    public static get instance(): SpotSystem {
        if (SpotSystem._instance == null) {
            SpotSystem._instance = new SpotSystem();
        }
        return SpotSystem._instance;
    }

    /**
     * @param baseInfo 公参
     */
    public init(baseInfo: any, app_key: string): Promise<void> {
        return new Promise((res, rej) => {
            SpotSystem.APP_KEY = app_key;
            this.baseInfo = baseInfo;
            cc.log(`init spot system, info: ${this.baseInfo}`)
            if (PlatformSystem.instance.isNative) {
                // PlatformSystem.instance.adapter.callFunction(SpotSystem.LOG_INIT, app_key, SpotSystem.packagePath);
                AppHelper.amplitude_logInitWithApiKey(app_key)
            }
            res();
        })
    }

    /**
     * 埋点
     * @param name 名称
     * @param params 参数
     */
    public send(name: string, param: any = {}): void {
        if (this.baseInfo) {
            if (PlatformSystem.instance.isNative) {
                this.sendSdk(name, param);
            } else if (PlatformSystem.instance.isBrowser) {
                this.sendHttp(name, param);
            }
        } else {
            cc.error(`amplitude not init`);
        }
    }

    public setUserInfo(userInfo: string): void {

    }

    public clearUserInfo(): void {

    }

    public setUserId(userId: string): void {

    }

    public clearUserId(): void {

    }

    /**
     * 原生sdk埋点
     * @param name 名称
     * @param params 参数
     */
    private sendSdk(name: string, param): void {
        try {
            let data = JSON.stringify(param);
            AppHelper.amplitude_logEvent(name, data);
        } catch (error) {
            cc.error(error);
        }
    }

    /**
     * http api 埋点
     * @param name 名称
     * @param params 参数
     * @see https://analytics.amplitude.com/demo/connections/project/168342/sources/setup/HTTP_API?source=connections+page%3A+sources
     */
    private sendHttp(name: string, args): void {
        let str: string = name;
        let obj: any = {
            "api_key": SpotSystem.APP_KEY,
            "events": [
                {
                    "event_type": str,
                    "time": Date.now(),
                    "event_properties": args,
                    ...this.baseInfo
                }
            ]
        }
        // cc.log(`spot: ${JSON.stringify(obj)}`)
        HttpSystem.instance.httpPost(SpotSystem.HTTP_HOST, obj).catch((error) => {
            cc.error(error);    // 埋点错误不做处理
        })
    }

    public release(): void {

    }
}