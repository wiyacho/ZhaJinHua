import { kit } from "../../../../kit/kit";
import AppUtils from "../../../../Script/utils/AppUtils";
import RecordComponent from "./core/RecordComponent";
import { RecordCallBack, RecordState } from "./core/RecordConfig";
import RecordManager from "./core/RecordManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordingQuestion extends RecordComponent {
    // 收到开始录音处理
    readFollowAudio() {
        super.readFollowAudio();
        if (!this.content.active) {
            this.content.active = true;
            this.recordAni.show();
        }
        // --TODO 播放读一读 单词卡缩放
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
        cc.log("结束录音回调", parm);

        let audioUrl = parm.audioUrl //kit.system.platform.isAndroid ? parm.audioUrl : this.recordConfig.evaluatingName;

        // 语音sdk修改，低版本ios需要做兼容！
        if (kit.system.platform.isIOS && !AppUtils.checkAppVersion('1.1.8')) {
            audioUrl = this.recordConfig.evaluatingName;
        }
        cc.log(audioUrl);
        this.recordAni.loading(false);
        this.status = RecordState.Stoping;
        super.stopRecordCb(parm);
        // ———TODO切换等待
        if (parm && parm != '') {
            let time = 1;
            time = RecordManager.instance.playNaticeAuido(audioUrl);
            if (!time || time == -1) {
                time = this.recordConfig.recordTime;
            }
            cc.log("录音时间" + time);
            kit.system.timer.doOnce(time * 1000, () => {
                kit.manager.Audio.resumeMusic();
                this.isBreak = true;
                kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.AudioFinishPlaying, extra: { duration: time } });
            }, this);
        }
        this.recordAni.stopAni();
        this.content.active = false;
        this.release();
        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.StopRecordCb, extra: parm });
    }
}
