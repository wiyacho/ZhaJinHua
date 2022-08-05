import { kit } from "../../../../kit/kit";
import RecordComponent from "./core/RecordComponent";
import { RecordCallBack, RecordState } from "./core/RecordConfig";
import RecordManager from "./core/RecordManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecognitionQuestion extends RecordComponent {

    // 收到开始录音处理
    readFollowAudio() {
        super.readFollowAudio();
        if (!this.content.active) {
            this.content.active = true;
            this.recordAni.show();
        }
        // ————TODO 替换播放读一读
        kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/read', () => {
            this.scheduleOnce(() => {
                this.readyRecord();
            }, 0.5)
        });
    }
    // 准备录音
    public readyRecord() {
        if (this.isBreak) {
            return;
        }
        this._historyStatus = [];
        this._status = RecordState.Idle;
        RecordManager.instance.readyRecord();
    }

    // 停止录音回调
    stopRecordCb(parm) {
        if (this.isBreak) {
            return;
        }
        this.status = RecordState.Stoping;
        super.stopRecordCb(parm);
        // ———TODO切换等待
        cc.log("评测参数", this.evaluationParm);
        this.evaluatingRecord(this.evaluationParm);
        this.recordAni.stopAni();
        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.StopRecordCb, extra: parm });
    }

    // 开始录音回调
    startRecordCb(parm) {
        super.startRecordCb(parm);
        this.recordAni.shank();
    }


    // 评测结果回调
    resultCb(parm) {
        cc.log('测评结果', parm);
        if (this.isBreak) {
            return;
        }
        // 调用过了
        if (this.historyStatus.indexOf(RecordState.Stop) > -1) {
            return;
        }
        this.status = RecordState.Stop;
        super.resultCb(parm);
        this.adapterResult(parm);
    }

    // 处理结果
    adapterResult(parm) {
        this.recordAni.loading(false);
        // 判断评分
        cc.log("分数" + parm.score);
        cc.log("分数" + Number(parm.score), this.recordConfig.evaluationScore);
        this.isBreak = true;
        if (parm.score && Number(parm.score) >= this.recordConfig.evaluationScore) {
            // 播放太棒了
            kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/right')
            cc.log({ eventName: RecordCallBack.ResultCb, success: true, extra: parm });
            this.content.active = false;
            kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: true, extra: parm });
            kit.manager.Audio.resumeMusic();
            return;
        }
        // 判断次数
        // 播放继续努力
        kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/wrong')
        cc.log({ eventName: RecordCallBack.ResultCb, success: false, extra: parm });
        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: false, extra: parm });
        this.content.active = false;
        kit.manager.Audio.resumeMusic();
        return;
    }
}
