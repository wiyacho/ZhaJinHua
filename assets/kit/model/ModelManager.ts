import PlatformSystem from "../framework/platform/PlatformSystem";
import { LocalStorageUtils } from "../utils/LocalStorageUtils";
import ModelBase from "./ModelBase";
import NativeInfo from "./NativeInfo";
import NetHelper from "./NetHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModelManager {
    /** 测试token */
    public static readonly testToken = "";
    /** 测试phoneInfo */
    public static readonly testPhoneInfo = "";

    private static _instance: ModelManager = null;
    public static get instance() {
        if (!ModelManager._instance) {
            ModelManager._instance = new ModelManager();
        }
        return ModelManager._instance;
    }

    /** token */
    private userToken: string;
    public set UserToken(value: string) {
        this.userToken = value;
    }
    public get UserToken(): string {
        if (ModelManager.testToken != "") {
            return ModelManager.testToken;
        }
        return this.userToken;
    }

    /** userId */
    private userId: string;
    public set UserId(value: string) {
        this.userId = value;
        
    }
    public get UserId(): string {
        return this.userId;
    }

    /** 国家名称 */
    private countryName: string;
    public set CountryName(value: string) {
        this.countryName = value;
    }
    public get CountryName(): string {
        return this.countryName;
    }

    // 手机信息
    private generateInfo: string;
    public get phoneInfo(): string {
        if (ModelManager.testPhoneInfo != "") {
            return ModelManager.testPhoneInfo;
        }
        return this.generateInfo;
    }
    public set phoneInfo(value: string) {
        cc.log(`phoneInfo:${value}`)
        this.generateInfo = value;
    }
    // 时间戳
    private _timestamp: number;
    public get timestamp() {
        return this._timestamp;
    }

    // hotfix version
    private _hotVer:string;
    public get hotVer(){
        return this._hotVer
    }

    public set hotVer(value){
        this._hotVer = value
    }

    private _hotUpdatePath:string;
    public get hotUpdatePath(){
        return this._hotUpdatePath
    }

    public set hotUpdatePath(value){
        this._hotUpdatePath = value
    }

    private _hotLatestVersion:string;
    public get hotLatestVersion(){
        return this._hotLatestVersion
    }

    public set hotLatestVersion(value){
        this._hotLatestVersion = value
    }

    private _cityName:string;
    public get cityName(){
        return this._cityName
    }

    public set cityName(value){
        this._cityName = value
    }
    
    /**  token 过期时间 */
    private _expireTime: number;
    public set expireTime(value: number) {
        this._expireTime = value;
    }
    public get expireTime(): number {
        return this._expireTime;
    }

    private _modelList: Map<any, any> = new Map();

    public init(url:string, errorCb: (states, message, response) => void) {
        NetHelper.setHostUrl(url);
        NetHelper.init(errorCb);
        this.generateInfo = NativeInfo.generateInfo();
        this._timestamp = NativeInfo.currentTimeStamp();
        let userInfo = LocalStorageUtils.getObject("USER_INFO") || {}
        this.userToken = userInfo.token || "";
        this.UserId = userInfo.userId || -1;
        this.expireTime = userInfo.expireTime || 0;
    }

    public registerModel(model: { new(): ModelBase }): void {
        let key = model;
        if (this._modelList.get(key)) {
        } else {
            let m = new model();
            m.init();
            this._modelList.set(key, m);
        }
    }

    /**
     * 获取model对象
     */

    public getModel<T extends ModelBase>(model: new () => T): T {
        let key = model;

        if (!this._modelList.has(key)) {
            this.registerModel(model);
        }
        return this._modelList.get(key);
    }

    public removeAllModel() {
        for (let key in this._modelList) {
            let model: ModelBase = this._modelList[key];
            model.clear();
            this._modelList.delete(key);
        }
        this._modelList.clear();
    }

    /** 清理所有model */
    public clearAllModel(): void {
        let keyList = Array.from(this._modelList.keys());
        for (let key of keyList) {
            let model: ModelBase = this._modelList.get(key);
            if (model) {
                model.clear();
            }
        }
    }

    /** 重新初始化所有model */
    public reInitAllModel(): void {
        let keyList = Array.from(this._modelList.keys());
        for (let key of keyList) {
            let model: ModelBase = this._modelList.get(key);
            if (model) {
                model.init();
            }
        }
    }
}
