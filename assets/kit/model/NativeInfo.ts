import PlatformSystem from "../framework/platform/PlatformSystem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NativeInfo {

    private static moduleName = PlatformSystem.instance.isAndroid ? 'NativeInterface' : 'CocosHelper';

    public static generateInfo(): string {
        if (PlatformSystem.instance.isBrowser) {
            return `{"device_uuid": "lingoChineseAi"}`;
        }
        let adapter = PlatformSystem.instance.adapter;
        let result = adapter.callFunctionResult("generateCommNode", "", NativeInfo.moduleName);
        return result;
    }

    public static currentTimeStamp(): number {
        if (PlatformSystem.instance.isBrowser) {
            return (new Date()).getTime();
        }
        let adapter = PlatformSystem.instance.adapter;
        let result = adapter.callFunctionResult("currentTimeStamp", "", NativeInfo.moduleName);
        return result;
    }

    public static getNetworkStatus(): string {
        if (PlatformSystem.instance.isBrowser) {
            return NetworkType.NETWORK_WIFI;
        }
        let adapter = PlatformSystem.instance.adapter;
        let result = adapter.callFunctionResult("getNetworkStatus", "", NativeInfo.moduleName);
        return result;
    }
}

export class GenerateInfo {
    public net_type: string;
    public device_uuid: string;
    public app_channel: string;
    public device_brand: string;
    public width: string;
    public height: string;
    public package_name: string;
    public loc_latlng: string;
    public eTz: string;
    public os_ver: string;
    public app_ver: string;
    public os_type: string;
    public device_model: string;
}
export enum NetworkType {
    NETWORK_WIFI = "NETWORK_WIFI",
    NETWORK_5G = "NETWORK_5G",
    NETWORK_4G = "NETWORK_4G",
    NETWORK_3G = "NETWORK_3G",
    NETWORK_2G = "NETWORK_2G",
    NETWORK_UNKNOWN = "NETWORK_UNKNOWN",
    NETWORK_NO = "NETWORK_NO" // 无网络
}