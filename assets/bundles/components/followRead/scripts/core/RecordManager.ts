import IPlatform from "../../../../../kit/framework/platform/IPlatform";
import { kit } from "../../../../../kit/kit";
import { RecordCallBack, RecordNativeFunction } from "./RecordConfig";
import RecordEngine from "./RecordEngine";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordManager {

    private static _instance: RecordManager = null;

    public static get instance() {
        if (this._instance == null) {
            this._instance = new RecordManager();
        }
        return this._instance;
    }

    public PERMISSION_ALERT_CANCEL = 'PermissionAlertCancel';

    /** 事件回调 */
    private listenerMap: Map<string, (data) => void>;

    private adapter: IPlatform | RecordEngine;

    private moduleName = kit.system.platform.isAndroid ? 'recordModule/RecordWrapper' : 'RecordWrapper';

    public init() {
        this.listenerMap = new Map();
        if (kit.system.platform.isDebug || kit.system.platform.isGameBoard) {
            this.adapter = new RecordEngine();
        } else {
            this.adapter = kit.system.platform.adapter;
        }
    }

    public readyRecord() {
        this.callNativeFunction(RecordNativeFunction.readyRecordAction, "");
    }

    // 调用开始录音
    public startRecord(parm) {
        this.callNativeFunction(RecordNativeFunction.startRecordAction, parm);
    }
    // 停止录音
    public stopRecord() {
        this.callNativeFunction(RecordNativeFunction.stopRecordAction, "");
    }

    // 调用音频评测
    public evaluatingRecord(parm) {
        this.callNativeFunction(RecordNativeFunction.uploadRecordAction, parm);
    }

    // ------------- 回调
    // 准备回调
    public readyRecordCb(parm: any) {
        this.sendCallBack(RecordCallBack.ReadyRecordCb, parm)
    }

    // 开始录音回调
    public startRecordCb(parm: any) {
        this.sendCallBack(RecordCallBack.StartRecordCb, parm)
    }

    // 停止录音回调
    public stopRecordCb(parm: any) {
        this.sendCallBack(RecordCallBack.StopRecordCb, parm)
    }

    // 评测结果回调
    public resultCb(parm: any) {
        this.sendCallBack(RecordCallBack.ResultCb, parm)
    }



    /**
     * 注册回调事件
     * @param callBack
     * @param cb
     */
    public addCallBackListener(option: { key: RecordCallBack; callBack: (data) => void }[]) {
        for (let temp of option) {
            this.listenerMap.set(temp.key, temp.callBack);
        }
    }

    /**
     * 触发sdk回调事件
     */
    public sendCallBack(callBack: RecordCallBack, data: any) {
        let cb = this.listenerMap.get(callBack);
        if (cb) {
            cb(data);
        }
    }

    /**
     * 播放本地音频
     * @param fileName 
     */
    public playNaticeAuido(fileName: string) {
        return this.adapter.callFunctionResult(RecordNativeFunction.playAvdio, fileName, this.moduleName);
    }

    /** 停止本地音频 */
    public stopAuido(fileName: string) {
        this.callNativeFunction(RecordNativeFunction.stopAudio, fileName);
    }

    public callNativeFunction(funcName: RecordNativeFunction, parm) {
        cc.log("调用callNativeFunction " + funcName + "  " + this.moduleName);
        this.adapter.callFunction(funcName, parm, this.moduleName);
    }

    public applyPermission() {
        this.callNativeFunction(RecordNativeFunction.applyPermissionAction, "");
    }

    public initAudioUtil (parm) {
        this.callNativeFunction(RecordNativeFunction.initAudioUtil, parm);
    }
}
