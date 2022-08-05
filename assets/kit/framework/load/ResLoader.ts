import BaseLoader from "./base/BaseLoader";
import { AtlasLoader, AudioLoader, DefaultLoader, ImageLoader, JsonLoader, PrefabLoader, SpineLoader, TextLoader } from "./base/loader-index";
import { LoaderObserver, LoaderObserverParam } from "./LoaderObserver";

/**
 * 远程spine数据配置
 */
export class RemoteSpineData {
    public json: string;
    public atlas: string;
    public images: string[];
}

export default class ResLoader {

    // 加载器map集合
    private static _defaultMap: Map<{prototype: cc.Asset}, BaseLoader>;
    // 默认loader
    private static _defaultLoader: DefaultLoader = null;
    // 是否初始化
    private static _init: boolean = false;
    // 加载器观察者列表
    private static _observerList: LoaderObserver[] = [];

    /** 初始化加载器 */
    public static init (): void {
        if (!ResLoader._init) {
            ResLoader._defaultMap = new Map();
            ResLoader._defaultMap.set(cc.SpriteFrame, new ImageLoader());
            ResLoader._defaultMap.set(cc.SpriteAtlas, new AtlasLoader());
            ResLoader._defaultMap.set(cc.AudioClip, new AudioLoader());
            ResLoader._defaultMap.set(cc.JsonAsset, new JsonLoader());
            ResLoader._defaultMap.set(cc.TextAsset, new TextLoader());
            ResLoader._defaultMap.set(cc.Prefab, new PrefabLoader());
            ResLoader._defaultMap.set(sp.SkeletonData, new SpineLoader());
            // 默认加载器
            ResLoader._defaultLoader = new DefaultLoader();
        }
        ResLoader._init = true;
    }

    /**
     * 注册观察者
     * @param {LoaderObserver} observer 自定义观察者
     */
    public static addObserver (observer: LoaderObserver): void {
        ResLoader._observerList.push(observer);
    }

    /**
     * 移除观察者
     * @param {LoaderObserver} observer 自定义观察者 
     * @returns {boolean} 是否移除成功
     */
    public static removeObserver (observer: LoaderObserver): boolean {
        for (let i = ResLoader._observerList.length - 1; i >= 0; i--) {
            let obs = ResLoader._observerList[i];
            if (obs === observer) {
                ResLoader._observerList.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * 通用资源加载接口（包括本地资源、网络资源和远程资源）
     * @param {string} path 资源路径，可以是本地资源、网络资源和远程资源
     * @param {cc.Asset | Record<string, any>} options 资源类型 | 远程资源可选参数
     * @param {(err, res) => void} onComplete 加载完成回调
     * @param {cc.AssetManager.Bundle | string} bundle 资源所属bundle，可选。
     * @param {(finish: number, total: number, item: cc.AssetManager.RequestItem) => void} onProgress 加载进度
     */
    public static loadRes (
        path: string, 
        options: typeof cc.Asset | Record<string, any>, 
        onComplete: (err, res) => void, 
        bundle?: cc.AssetManager.Bundle | string, 
        onProgress?: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void): void {
        // 初始化resloader
        ResLoader.init();
        let curBundle: cc.AssetManager.Bundle = null;
        let tempType = null;
        if (typeof options !== "object") {
            tempType = options;
            if (bundle && typeof bundle === "string" && bundle !== "") {
                curBundle = cc.assetManager.getBundle(bundle);
            } else if (bundle && typeof bundle !== "string") {
                curBundle = bundle as cc.AssetManager.Bundle;
            } else {
                curBundle = cc.resources as cc.AssetManager.Bundle;
            }
            if (curBundle) {
                let as = curBundle.get(path, tempType);
                if (as) {
                    ResLoader.__beforeLoadRes(new LoaderObserverParam(path, tempType, curBundle, 0, null));
                    onComplete(null, as);
                    ResLoader.__afterLoadRes(new LoaderObserverParam(path, tempType, curBundle, 0, null));
                    return;
                }
            }
        }
        let param = new LoaderObserverParam(path, tempType, curBundle, 0, null);
        ResLoader.__beforeLoadRes(param);
        let loader = ResLoader._defaultMap.get(tempType);
        if (!loader) {
            if (typeof options !== "object") {
                cc.log(`assets type: ${tempType} is not exists, default loader insteaded!`);
            }
            loader = ResLoader._defaultLoader;
        }
        let startTime = new Date().getTime();
        loader.loadRes(path, options, (_err, _res) => {
            if (onComplete) {
                param.time = new Date().getTime() - startTime; // 计算下载时间
                ResLoader.__afterLoadRes(param);
                onComplete(_err, _res);
            }
        }, curBundle, onProgress);
    }

    private static __beforeLoadRes (param: LoaderObserverParam): void {
        for (let obs of ResLoader._observerList) {
            obs.beforeLoadRes(param);
        }
    }

    private static __afterLoadRes (param: LoaderObserverParam): void {
        for (let obs of ResLoader._observerList) {
            obs.afterLoadRes(param);
        }
    }

    /**
     * 加载目录
     * @param {string} dir 资源目录
     * @param {cc.Asset} type 资源类型
     * @param {(finish: number, total: number, item: cc.AssetManager.RequestItem) => void} onProgress 加载进度回调
     * @param {(error: Error, assets: Array<T>) => void} onComplete 加载完成回调
     * @param {cc.AssetManager.Bundle | string} bundle 资源所属bundle，可选。 
     */
    public static loadDir<T extends cc.Asset> (dir: string, type: typeof cc.Asset, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: Array<T>) => void, bundle?: cc.AssetManager.Bundle | string): void {
        let curBundle: cc.AssetManager.Bundle = null;
        if (bundle && typeof bundle === "string" && bundle !== "") {
            curBundle = cc.assetManager.getBundle(bundle);
        } else if (bundle && typeof bundle !== "string") {
            curBundle = bundle as cc.AssetManager.Bundle;
        } else {
            curBundle = cc.resources as cc.AssetManager.Bundle;
        }
        if (!curBundle) {
            onComplete(new Error(`bundle ${bundle} is not exists!`), null);
            return;
        }
        curBundle.loadDir(dir, type, onProgress, onComplete);
    }

    /**
     * 加载bundle
     * @param {string} nameOrUrl bundle名称或地址
     * @param {Record<string, any>} options 下载bundle的可选参数
     * @param {(err: Error, bundle: cc.AssetManager.Bundle) => void} onComplete 加载完成回调
     */
    public static loadBundle (nameOrUrl: string, options: Record<string, any>, onComplete: (err: Error, bundle: cc.AssetManager.Bundle) => void): void {
        let param = new LoaderObserverParam(nameOrUrl, null, null, 0, null);
        let startTime = new Date().getTime();
        ResLoader.__beforeLoadBundle(param);
        cc.assetManager.loadBundle(nameOrUrl, options, (_err, _bundle) => {
            param.time = new Date().getTime() - startTime; // 加载时间处理
            ResLoader.__afterLoadBundle(param);
            if (onComplete) {
                onComplete(_err, _bundle);
            }
        });
    }

    private static __beforeLoadBundle (param: LoaderObserverParam): void {
        for (let obs of ResLoader._observerList) {
            obs.beforeLoadBundle(param);
        }
    }

    private static __afterLoadBundle (param: LoaderObserverParam): void {
        for (let obs of ResLoader._observerList) {
            obs.afterLoadBundle(param);
        }
    }
}