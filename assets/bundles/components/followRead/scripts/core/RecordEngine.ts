import { kit } from "../../../../../kit/kit";
import { RecordNativeFunction } from "./RecordConfig";
import RecordManager from "./RecordManager";

export default class RecordEngine {
    callFunctionResult(funName: RecordNativeFunction) {
        return 2;
    }
    callFunction(funName: RecordNativeFunction) {
        cc.log(funName);
        switch (funName) {
            case RecordNativeFunction.readyRecordAction:
                this.readyRecord();
                break;
            case RecordNativeFunction.startRecordAction:
                this.startRecord();
                break;
            case RecordNativeFunction.stopRecordAction:
                this.stopRecord();
                break;
            case RecordNativeFunction.uploadRecordAction:
                this.envRecord();
                break;
            case RecordNativeFunction.applyPermissionAction:
                this.applyPermissionAct();
                break;
        }
    }

    readyRecord() {
        kit.system.timer.doFrameOnce(2, () => {
            RecordManager.instance.readyRecordCb({ code: 200, result: true });
        }, this);
    }

    startRecord() {
        kit.system.timer.doFrameOnce(2, () => {
            RecordManager.instance.startRecordCb({ code: 200 });
        }, this);
    }

    stopRecord() {
        kit.system.timer.doFrameOnce(2, () => {
            RecordManager.instance.stopRecordCb({ code: 200, url: "" });
        }, this);
    }

    envRecord() {
        kit.system.timer.doOnce(2000, () => {
            RecordManager.instance.resultCb({ code: 200, score: 20 });
        }, this);
    }

    applyPermissionAct() {
        this.startRecord();
    }

}
