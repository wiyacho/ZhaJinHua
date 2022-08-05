
export class LoaderObserverParam {
    public url: string;
    public type: typeof cc.Asset;
    public bundle: cc.AssetManager.Bundle;
    public time: number;
    public options: any;

    public constructor (url: string, type: typeof cc.Asset, bundle: cc.AssetManager.Bundle, time: number, options: any) {
        this.url = url;
        this.type = type;
        this.bundle = bundle;
        this.time = time;
        this.options = options;
    }
}

export interface LoaderObserver {
    /**
     * 资源开始加载之前
     * @param {string} url 资源地址
     * @param {cc.Asset} type 资源类型
     */
    beforeLoadRes(param: LoaderObserverParam): void;

    /**
     * 资源开始加载之前
     * @param {string} url 资源地址
     * @param {cc.Asset} type 资源类型
     * @param {number} time 资源加载时间
     */
    afterLoadRes(param: LoaderObserverParam): void;

    /**
     * bundle开始加载之前
     * @param {string} url 资源地址
     * @param {cc.Asset} type 资源类型
     */
    beforeLoadBundle(param: LoaderObserverParam): void;

    /**
     * bundle开始加载之前
     * @param {string} url 资源地址
     * @param {cc.Asset} type 资源类型
     * @param {number} time 资源加载时间
     */
    afterLoadBundle(param: LoaderObserverParam): void;
}