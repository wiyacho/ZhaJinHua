import AndroidAdapter from "./AndroidAdapter";
import IosAdapter from "./IosAdapter";
import WebAdapter from "./WebAdapter";
import IPlatform from "./IPlatform";
import ASystem from "../../system/interface/ASystem";
import DebuggerAdapter from "./DebuggerAdapter";
import { kit } from "../../kit";

/**
 * 平台适配系统
 * @export
 * @class PlatformSystem
 * @extends {ASystem}
 */
export default class PlatformSystem extends ASystem {
    private static _instance: PlatformSystem;

    public adapter: IPlatform;

    public get isBrowser(): boolean {
        return cc.sys.isBrowser;
    }

    public get isWXBrowser(): boolean {
        return this.isBrowser && cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT;
    }

    public get isSafariBrowser(): boolean {
        return this.isBrowser && cc.sys.browserType === cc.sys.BROWSER_TYPE_SAFARI;
    }

    public get isNative(): boolean {
        return cc.sys.isNative;
    }

    public get isDebug(): boolean {
        return this.adapter instanceof DebuggerAdapter;
    }

    /**
     * 是否是微信小游戏
     */
    public get isWeChat(): boolean {
        return cc.sys.platform === cc.sys.WECHAT_GAME;
    }

    public get isAndroid(): boolean {
        return cc.sys.os === cc.sys.OS_ANDROID;
    }

    public get isIOS(): boolean {
        return cc.sys.os === cc.sys.OS_IOS;
    }

    public async init(...args: any[]): Promise<any> {
        if (this.isWeChat) {
            // this.adapter = new WXLittleGameAdapter();
        }
        else if (this.isBrowser) {
            if (window.location.href.indexOf('localhost:') > -1) {
                this.adapter = new DebuggerAdapter();
            } else {
                this.adapter = new WebAdapter();
            }
        }
        else if (this.isNative) {
            if (this.isAndroid) {
                this.adapter = new AndroidAdapter();
            } else if (this.isIOS) {
                this.adapter = new IosAdapter();
            }
        }
        return Promise.resolve();
    }

    public release(): void {
        this.adapter = null;
        PlatformSystem._instance = null;
    }

    public static get instance(): PlatformSystem {
        if (PlatformSystem._instance == null) {
            PlatformSystem._instance = new PlatformSystem();
        }
        return PlatformSystem._instance;
    }

    /**
     * 是否是游戏看板模式
     */
    public get isGameBoard(): boolean {
        if (window.location && window.location.href) {
            let type = kit.util.Url.getQueryString("type");
            cc.log(`type:${type}`);
            if (type === "gameBoard") {
                return true;
            }
        }
        return false;
    }
}