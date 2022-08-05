import { kit } from "../kit";

/**
 * 加载bundle
 * @param bundleName
 * @returns
 */
export function loadBundle(bundleName: string): Promise<any> {
    return new Promise((res, rej) => {
        console.time(bundleName);
        cc.assetManager.loadBundle(bundleName, (error: Error, bundle: cc.AssetManager.Bundle) => {
            console.timeEnd(bundleName);
            if (error) {
                rej(error);
                return;
            }
            res(bundle);
        })
    })
    kit.manager.resources.loadRes
}

/**
 * 加载bundle,并返回其中的scene
 * @param bundleName
 * @param sceneName
 * @returns scene
 */
export function loadBundleScene(bundleName: string, sceneName: string): Promise<any> {
    return new Promise((res, rej) => {
        loadBundle(bundleName).then(bundle => {
            bundle.loadScene(sceneName, (error: Error, scene: any) => {
                if (error) {
                    rej(error);
                    return;
                }
                res(scene)
            })
        }).catch(error => {
            rej(error);
        })
    })
}

/**
 * 加载bundle
 * @param nameList 
 * @returns bundle列表
 */
export function loadBundles(nameList: string[]): Promise<any> {
    let list: Promise<any>[] = [];
    for (let key in nameList) {
        list.push(
            loadBundle(nameList[key])
        )
    }
    return Promise.all(list);
}