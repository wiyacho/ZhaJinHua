import ResLoader from "../framework/load/ResLoader";
import { kit } from "../kit";
import LogSystem from "../system/log/LogSystem";

/**
 * 解析UI节点工具
 */
export default class UIUtils {

    /***
     * 生成子节点的唯一标识快捷访问
     * @param node
     * @param map
     */
    public static createSubNodeMap(node: cc.Node, map: Map<string, cc.Node>) {
        let children = node.children;
        if (!children) {
            return;
        }
        for (let t = 0, len = children.length; t < len; ++t) {
            let subChild = children[t];
            map.set(subChild.name, subChild);
            UIUtils.createSubNodeMap(subChild, map);
        }
    }

    /**
     * 返回当前节点所有节点,一唯一标识存在
     * @param node 父节点
     * @return {Object} 所有子节点的映射map
     */
    public static seekAllSubView(node: cc.Node): UIContainer {
        let map = new Map<string, cc.Node>();
        UIUtils.createSubNodeMap(node, map);
        return new UIContainer(map);
    }
}

export class UIContainer {
    /** 所有节点集合 */
    private _uiNodesMap: Map<string, cc.Node>;

    // 点击音效
    private _clickSound = "commonRes/sound/btn_click";
    // 默认bundle
    private _bundleName = 'components';

    public constructor(nodesMap: Map<string, cc.Node>) {
        this._uiNodesMap = nodesMap;
        this.preloadClickEffect();
    }
    /**
     * 根据节点名字获取节点
     * @param {string}name 节点名字
     * @return {cc.Node}
     */
    public getNode(name: string): cc.Node {
        return this._uiNodesMap.get(name);
    }

    /**
     * 根据节点名字和组件类型获取组件对象
     * @param {string}name 节点名字
     * @param {{prototype: cc.Component}}com 组建类型
     * @return {cc.Component}
     */
    public getComponent<T extends cc.Component>(name: string, com: { prototype: T }): T {
        let node = this._uiNodesMap.get(name);
        if (node) {
            return node.getComponent(com);
        }
        return null;
    }

    /**
     * 注册或发送点击事件，默认带点击音效
     * @param {cc.Node | string} node 事件节点  
     * @param {string | (event: any) => void} handler 事件名称 | 事件回调函数 
     * @param {any} target 目标 
     * @param {any} param 参数 
     * @param {string} sound 声音，有默认 
     * @param {string} bundleName bundle名称 默认components
     */
    public onClick<T extends (event: any) => void>(node: cc.Node | string, handler: T, target?: any, param?: any, sound?: string, bundleName?: string | cc.AssetManager.Bundle): void {
        if (!node) {
            LogSystem.warn(`onClick参数node不能为空：${node}`);
            return;
        }
        let tempNode: cc.Node = null;
        if (typeof node === "string") {
            tempNode = this.getNode(node);
        } else {
            tempNode = node;
        }
        tempNode.on(cc.Node.EventType.TOUCH_START, (event) => {
            let soundName = (typeof sound == "string") ? sound : this._clickSound;
            let bundle = (typeof bundleName == "string") ? bundleName : this._bundleName;
            kit.manager.Audio.playEffect(bundle, soundName);
            if (handler) { handler.call(target, param); }

        }, target);
    }

    /**
     * 移除节点的点击事件
     * @param {cc.Node | string} node 事件节点 
     */
    public offClick(node: cc.Node | string): void {
        if (!node) {
            LogSystem.warn(`offClick参数node不能为空：${node}`);
            return;
        }
        let tempNode: cc.Node = null;
        if (typeof node === "string") {
            tempNode = this.getNode(node);
        } else {
            tempNode = node;
        }
        tempNode.off(cc.Node.EventType.TOUCH_START);
    }

    preloadClickEffect() {
        ResLoader.loadRes(this._clickSound, cc.AudioClip, () => { }, this._bundleName);
    }

}
