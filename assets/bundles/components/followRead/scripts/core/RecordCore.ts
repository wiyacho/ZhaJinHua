import { kit } from "../../../../../kit/kit";
import RecordManager from "./RecordManager";

export enum RecordReturnStatus {
    // 准备录音回调
    OnReadyRecordCb = 'readyRecordCb',
    // 开始录音回调
    OnStartRecordCb = 'startRecordCb',
    // 停止录音回调
    OnStopRecordCb = 'stopRecordCb',
    // 评测结果
    OnResultCb = 'evaluatingResultCb',
    // 权限检测回调
    OnPermissionCb = 'permissionCb'
}

export enum ErrorCode {

}

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordCore extends cc.Component {

    // {"mathName":"readyRecordCb","param":"{\"code\":200}"}
    public static recordListen(msg: any) {
        let param = msg.param;
        if (param && param != "") {
            cc.log("recordListen 接收", param);
            param = JSON.parse(param);
        }

        switch (msg.mathName) {
            case RecordReturnStatus.OnReadyRecordCb:
                RecordManager.instance.readyRecordCb(param);
                break;
            case RecordReturnStatus.OnStartRecordCb:
                RecordManager.instance.startRecordCb(param);
                break;
            case RecordReturnStatus.OnStopRecordCb:
                RecordManager.instance.stopRecordCb(param);
                break;
            case RecordReturnStatus.OnResultCb:
                RecordManager.instance.resultCb(param);
                break;
            case RecordReturnStatus.OnPermissionCb:
                kit.manager.Event.emit("OnPermissionCb", param);
            default:
                break;
        }
    }
}

(window as any).RecordProxyListen = RecordCore.recordListen;
