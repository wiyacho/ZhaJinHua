export default class BundleUtil {
    /**
     * 加载bundle
     * @param bundleName
     * @returns
     */
    public static loadBundle(bundleName: string): Promise<any> {
        return new Promise((res, rej) => {
            // tslint:disable-next-line: no-console
            console.time(bundleName);
            cc.assetManager.loadBundle(bundleName, (error: Error, bundle: cc.AssetManager.Bundle) => {
                // tslint:disable-next-line: no-console
                console.timeEnd(bundleName);
                if (error) {
                    rej(error);
                    return;
                }
                res(bundle);
            })
        })
    }

    /**
     * 加载bundle,并返回其中的scene
     * @param bundleName
     * @param sceneName
     * @returns scene
     */
    public static loadBundleScene(bundleName: string, sceneName: string): Promise<any> {
        return new Promise((res, rej) => {
            BundleUtil.loadBundle(bundleName).then(bundle => {
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
    public static loadBundles(nameList: string[]): Promise<any> {
        let list: Promise<any>[] = [];
        for (let key in nameList) {
            list.push(
                BundleUtil.loadBundle(nameList[key])
            )
        }
        return Promise.all(list);
    }
}
