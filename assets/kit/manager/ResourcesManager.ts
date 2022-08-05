import ResLoader from "../framework/load/ResLoader";
import LogSystem from "../system/log/LogSystem";

/**
 * 资源加载类型， Global 不会被释放bundle
 */
export enum ResourceType {
    default,
    Global,
    Normal
}

class Asset {
    public bundle: cc.AssetManager.Bundle;
    private assetMap: Map<string, cc.Asset>;
    private resType: ResourceType;

    constructor(resType) {
        this.assetMap = new Map();
        this.resType = resType;
    }

    public loadBundle(bundleName): Promise<any> {
        return new Promise((reslove, reject) => {
            ResLoader.loadBundle(bundleName, null, (e, bundle: cc.AssetManager.Bundle) => {
                if (e) {
                    reject(e);
                    return;
                }
                this.bundle = bundle;
                reslove(bundle);
            })
        }).catch(e => cc.log(e))
    }

    public loadRes(path: string, type: typeof cc.Asset, finishCb: (e, asset) => void) {
        if (this.assetMap.has(path)) {
            let asset = this.assetMap.get(path);
            if (finishCb) {
                finishCb(null, asset);
            }
            return;
        }
        ResLoader.loadRes(path, type, (e, res: cc.Asset) => {
            this.assetMap.set(path, res);
            // res.addRef();

            if (finishCb) {
                finishCb(null, this.assetMap.get(path));
                return;
            }
        }, this.bundle);
    }

    public release(releaseComponents?: boolean): string {
        if (this.bundle.name == 'components' && !releaseComponents) {
            cc.log('components 不释放');
            return;
        }
        this.assetMap.forEach((res, key) => {
            // cc.log(`释放${res.name}`);
            // res.decRef();
            if (res) {
                cc.log(`释放${res.name}`);
                cc.assetManager.releaseAsset(res)
                this.bundle.release(key);
            }

        });
        this.assetMap.clear();
        if (this.resType == ResourceType.Global) {
            return "";
        }
        cc.log(`释放bundle${this.bundle.name}`);
        cc.assetManager.removeBundle(this.bundle);
        return this.bundle.name;
    }

    public releaseWithOutBundle(releaseComponents?: boolean): string {
        this.assetMap.forEach((res, key) => {
            // cc.log(`释放${res.name}`);
            // res.decRef();
            cc.log(`释放${res.name}`);
            cc.assetManager.releaseAsset(res)
            this.bundle.release(key);
        });
        this.assetMap.clear();
        if (this.resType == ResourceType.Global) {
            return "";
        }
        return this.bundle.name;
    }
}

export default class ResourcesManager {
    private static _instance: ResourcesManager;

    private assetsMap: Map<string, Asset>;

    public static get instance(): ResourcesManager {
        if (!ResourcesManager._instance) {
            ResourcesManager._instance = new ResourcesManager();
        }
        return ResourcesManager._instance;
    }

    constructor() {
        this.assetsMap = new Map();
    }

    /**
     * 加载单个资源
     * @param {string} bundleName
     * @param {string} resPath 
     * @param {kit.manager.Resources.type} resType 加载类型 
     * @param {typeof cc.Asset} assetType 
     * @param {(error, res) => void} finishCb  加载完成回调
     * @returns 
     */
    public loadRes(bundleName: string, resPath: string, resType: ResourceType, assetType: typeof cc.Asset, finishCb: (error, res) => void): Promise<any> {
        return new Promise(async (resolve, rej) => {
            if (bundleName == "" || resPath == "") {
                LogSystem.error(`ResourcesManager loadRes bundleName or resPath null`);
                rej();
                return;
            }

            if (this.assetsMap.has(bundleName)) {
                let asset = this.assetsMap.get(bundleName);
                asset.loadRes(resPath, assetType, (e, res) => {

                    if (finishCb) {
                        finishCb(e, res);
                    }
                    if (e) {
                        rej(e);
                    } else {
                        resolve(res);
                    }

                })
                return;
            }

            let assetClip = new Asset(resType);
            await assetClip.loadBundle(bundleName);
            assetClip.loadRes(resPath, assetType, (e, asset) => {
                this.assetsMap.set(bundleName, assetClip);
                if (finishCb) {
                    finishCb(e, asset);
                }
                if (e) {
                    rej(e);
                } else {
                    resolve(asset);
                }

            });

        }).catch(e => () => {
            if (finishCb) {
                finishCb(e, null);
            }
        })
    }

    /**
     * 加载bundle list
     * @param nameList 
     * @returns 
     */
    public loadBundleList(nameList: string[]): Promise<cc.AssetManager.Bundle[] | void> {
        let list: Promise<any>[] = [];
        for (let key in nameList) {
            list.push(
                this.loadBundle(nameList[key])
            )
        }
        return Promise.all(list).catch((e) => cc.log(e));
    }

    /** 加载单个bundle */
    public loadBundle(bundleName: string): Promise<cc.AssetManager.Bundle | void> {
        return new Promise<cc.AssetManager.Bundle>(async (res, rej) => {
            if (this.assetsMap.has(bundleName)) {
                let bundle = this.assetsMap.get(bundleName).bundle;
                res(bundle);
                return;
            }
            let assetClip = new Asset(ResourceType.Normal);
            this.assetsMap.set(bundleName, assetClip);

            await assetClip.loadBundle(bundleName);
            res(assetClip.bundle);
        }).catch(e => {
            cc.log(e);
        })
    }

    /**
     * 释放资源
     * @param {?string | string[]} bundleName 传入null或者“”释放加载过的所有资源， 传入bundleName string 释放对应bundleName以及加载的资源，传入bundleName list释放对应的资源和bundle
     * @param {?boolean} releaseComponents 释放需要释放Component里的资源 默认不释放， ❗️游戏内禁止释放
     * @returns 
     */
    public releaseAsset(bundleName?: string | string[], releaseComponents?: boolean) {
        cc.log("释放资源", bundleName);
        if (bundleName && typeof bundleName == "string" && bundleName != "") {
            let element = this.assetsMap.get(bundleName);
            if (element) {
                let releaseKey = element.release(releaseComponents);
                if (releaseKey != '') {
                    this.assetsMap.delete(releaseKey);
                }
            }
            return;
        }
        // 多个释放
        if (bundleName && typeof bundleName == "object") {
            bundleName.forEach((item) => {
                let element = this.assetsMap.get(item);
                if (!element) {
                    return;
                }
                let releaseKey = element.release(releaseComponents);
                if (releaseKey != '') {
                    this.assetsMap.delete(releaseKey);
                }
            })
            return;
        }
        this.assetsMap.forEach(element => {
            if (element) {
                let releaseKey = element.release(releaseComponents);
                if (releaseKey != '') {
                    this.assetsMap.delete(releaseKey);
                }
            }
        });

    }

    public releaseRes(bundle?: cc.AssetManager.Bundle) {
        if (bundle) {
            let element = this.assetsMap.get(bundle.name);
            if (!element) {
                cc.assetManager.removeBundle(bundle);
                return;
            }
            let releaseKey = element.releaseWithOutBundle();
            if (releaseKey != '') {
                this.assetsMap.delete(releaseKey);
            }
            cc.log(this.assetsMap);
            cc.assetManager.removeBundle(bundle);
        }
    }

}
