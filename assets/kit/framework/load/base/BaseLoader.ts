/**
 * 资源加载基类，负责处理资源加载逻辑（本地/远程下载/网络动态资源）
 * @author Yue
 */
export default abstract class BaseLoader {
    /**
     * 资源统一加载接口
     * @param {string} path 资源路径
     * @param {cc.Asset} type 资源类型
     * @param {(err, res) => void} onComplete 加载完成回调
     * @param {cc.AssetManager.Bundle | string} bundle 资源所属bundle，可选。
     * @param {(finish: number, total: number, item: cc.AssetManager.RequestItem) => void} onProgress 加载进度
     */
    public loadRes(path: string, options: typeof cc.Asset | Record<string, any>, onComplete: (err, res) => void, bundle?: cc.AssetManager.Bundle, onProgress?: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void): void {
        if (this.isNetRes(path)) {
            // 加载网络资源
            this.loadNetRes(path, options, onComplete);
        } else if (this.isRemoteRes(path)) {
            // 加载远程待下载资源
            this.loadRemoteRes(path, options, onComplete);
        } else {
            // 加载本地资源
            this.loadLocalRes(path, options, onProgress, onComplete, bundle);
        }
    }

    // 加载网络资源
    public abstract loadNetRes(path: string, options: typeof cc.Asset | Record<string, any>, callback: (err, res) => void): void;
    // 加载远程待下载资源
    public abstract loadRemoteRes(path: string, type: typeof cc.Asset | Record<string, any>, callback: (err, res) => void): void;
    // 加载本地资源
    public abstract loadLocalRes(path: string, type: typeof cc.Asset | Record<string, any>, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (err, res) => void, bundle?: cc.AssetManager.Bundle): void;

    /**
     * 判断是否是远程待下载资源
     * @param {string} path 资源路径 
     */
    public isRemoteRes(path: string): boolean {
        return false;
    }

    public isNetRes(path: string): boolean {
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("zybhost://")) {
            return true;
        }
        return false;
    }
}