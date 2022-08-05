import ResLoader from "../framework/load/ResLoader";
import AudioManager from "../system/audio/AudioManager";
import LogSystem from "../system/log/LogSystem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClickCmpt extends cc.Component {

    // 点击音效
    @property(cc.String)
    clickSound: string = "commonRes/sound/btn_click";
    // 默认bundle
    @property(cc.String)
    bundleName = 'components';


    @property({ tooltip: "启用点击反馈" })
    clickAudioEffect: boolean = true;
    // 点击事件
    @property({ type: [cc.Component.EventHandler], tooltip: "点击事件列表" })
    clickEvents: cc.Component.EventHandler[] = [];

    onLoad() {
        if (this.clickEvents.length > 0) {
            this.onCilckEventHandler();
        }
    }

    onCilckEventHandler() {
        this.clickEvents.forEach(item => {
            let targeNode = item.target;
            let tempCmpt = targeNode.getComponent(item["_componentName"]);
            this.onClick(targeNode, tempCmpt[item.handler], tempCmpt, item.customEventData, this.clickAudioEffect)
        })
    }

    /**
     * 注册或发送点击事件，默认带点击音效
     * @param {cc.Node} node 事件节点  
     * @param {string | (event: any) => void} handler 事件名称 | 事件回调函数 
     * @param {any} target 目标 
     * @param {any} param 参数 
     * @param {boolean} clickEffect 点击反馈
     * @param {string} sound 声音，有默认 
     * @param {string} bundleName bundle名称 默认components
     * 
     */
    public onClick<T extends (event: any) => void>(node: cc.Node,
        handler: T,
        target?: any,
        param?: any,
        clickEffect?: boolean,
        sound?: string,
        bundleName?: string | cc.AssetManager.Bundle): void {
        if (!node) {
            LogSystem.warn(`onClick参数node不能为空：${node}`);
            return;
        }

        node.on(cc.Node.EventType.TOUCH_START, (event) => {
            let soundName = sound ? sound : this.clickSound;
            let bundle = bundleName ? bundleName : this.bundleName;
            // 点击反馈
            if (clickEffect) {
                AudioManager.playEffect(bundle, soundName);

            }
            if (handler) { handler.call(target, param); }

        }, target);


    }

    /**
     * 移除节点的点击事件
     * @param {cc.Node | string} node 事件节点 
     */
    public offClick(node: cc.Node): void {
        if (!node) {
            LogSystem.warn(`offClick参数node不能为空：${node}`);
            return;
        }

        node.off(cc.Node.EventType.TOUCH_START);
    }

    public preloadClickEffect() {
        ResLoader.loadRes(this.clickSound, cc.AudioClip, () => { }, this.bundleName);
    }
}