import { kit } from "../../../../kit/kit";
import RecordComponent from "./core/RecordComponent";
import { RecordCallBack, RecordState } from "./core/RecordConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FollowReadQuestion extends RecordComponent {

    init() {
        // super.init(data);
        this.curtryTime = 0;
    }

    // 收到开始录音处理
    readFollowAudio() {
        super.readFollowAudio();
        if (!this.content.active) {
            this.content.active = true;
            this.recordAni.show();
        }
        cc.log("我是跟读");
        kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/follow', () => {
            this.readyRecord();
        });
    }

    // 停止录音回调
    stopRecordCb(parm) {
        if (this.isBreak) {
            return;
        }
        if (this.historyStatus.indexOf(RecordState.Stoping) > -1) {
            return;
        }
        this.status = RecordState.Stoping;
        kit.manager.Audio.stopEffect();
        super.stopRecordCb(parm);
        // ———TODO切换等待
        cc.log("评测参数", this.evaluationParm);
        this.evaluatingRecord(this.evaluationParm);
        this.recordAni.stopAni();
        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.StopRecordCb, extra: parm });
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
        if (kit.system.platform.isGameBoard) {
            if (this.onTest()) {
                return;
            }
        }
        // 判断评分
        cc.log("分数" + parm.score);
        cc.log("分数" + Number(parm.score), this.recordConfig.evaluationScore);
        cc.log("次数" + this.recordConfig.tryTimes, this.curtryTime);
        if (parm.score && Number(parm.score) >= this.recordConfig.evaluationScore) {
            this.curtryTime = 0;
            // 播放太棒了
            kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/right')
            cc.log({ eventName: RecordCallBack.ResultCb, success: true, extra: parm });
            this.content.active = false;
            kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: true, extra: parm });
            kit.manager.Audio.resumeMusic();
            this.isBreak = true;
            return;
        }
        // 判断次数
        if (this.curtryTime >= this.recordConfig.tryTimes) {
            this.curtryTime = 0;
            // 播放继续努力
            kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/wrong')
            cc.log({ eventName: RecordCallBack.ResultCb, success: false, extra: parm });
            kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: false, extra: parm });
            this.content.active = false;
            kit.manager.Audio.resumeMusic();
            this.isBreak = true;
            return;
        }
        this.tryAgain();
    }

    // 再试一次
    private tryAgain() {
        if (this.isBreak) {
            return;
        }
        this.curtryTime++;
        cc.log("再试一次吧");
        kit.system.timer.doOnce(2300, () => {
            let bundleName = this.recordConfig.extra['bundleName'];
            let audioUrl = this.recordConfig.extra['audioUrl'];
            cc.log(bundleName, audioUrl);
            kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/follow', () => {
                if (audioUrl && bundleName) {
                    kit.manager.Audio.playEffect(bundleName, audioUrl, () => {
                        this.startRecord(this.startParm);
                    });
                    return;
                }
                this.startRecord(this.startParm);
            });
        })
        // 播放再试一次吧
        kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/tryAgain')
    }
}
