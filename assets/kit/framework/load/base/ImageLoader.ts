
import BaseLoader from "./BaseLoader";

export class ImageLoader extends BaseLoader {

    public loadNetRes(path: string, type: typeof cc.Asset | Record<string, any>, callback: (err: any, res: any) => void): void {
        // 加载网络图片资源
        cc.assetManager.loadRemote(path, type, (e, tex: cc.Texture2D) => {
            if (e) {
                cc.error(e);
            }
            if (callback) {
                callback(e, new cc.SpriteFrame(tex));
            }
        });
    }

    public loadRemoteRes(path: string, type: any, callback: (err: any, res: any) => void): void {
        // 加载远程待下载图片资源
        cc.log(path, type, callback);
        throw new Error("ImageLoader loadRemoteRes method not implemented.");
    }

    public loadLocalRes(path: string, type: any, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, callback: (err: any, res: any) => void, bundle?: cc.AssetManager.Bundle): void {
        if (bundle) {
            bundle.load(path, type, onProgress, callback);
        } else {
            cc.resources.load(path, type, onProgress, callback);
        }
    }
}
