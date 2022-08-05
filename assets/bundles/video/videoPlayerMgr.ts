import Events, { LIFE_CYCLE_BLOCK, LIFE_CYCLE_COMPLETE, LIFE_CYCLE_PARAMS, LIFE_CYCLE_READY, LIFE_CYCLE_UNBLOCK } from "../../kit/events/events";
import { kit } from "../../kit/kit";
import { VideoEventTransType } from "../../kit/structure/ClientModuleEnum";
import { commonTipsOptions } from "../../kit/structure/ClientModuleInterface";
import { TIPS_TYPE } from "../../kit/structure/ClientTipsEnum";
import EventSystem from "../../kit/system/event/EventSystem";

// cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
const { ccclass, property } = cc._decorator;
@ccclass
export default class VideoPlayerMgr extends cc.Component {

    @property(cc.VideoPlayer)
    public video: cc.VideoPlayer = null;

    @property(cc.Node)
    public progress: cc.Node = null

    @property(cc.Node)
    public videoControl: cc.Node = null

    @property(cc.Slider)
    public slider: cc.Slider = null;

    @property(cc.Label)
    public curTime: cc.Label = null;

    @property(cc.Label)
    public maxTime: cc.Label = null;

    @property(cc.Node)
    public pauseBtn: cc.Node = null

    @property(cc.Node)
    public resumeBtn: cc.Node = null

    @property(cc.Node)
    public handelBtn: cc.Node = null

    public isReady: boolean = false
    public progressMax: number = 0

    public onLoad() {
        this.regisEvent()
        this.videoControl.active = false
        this.progress.getComponent(cc.ProgressBar).progress = 0
        cc.Camera.main.backgroundColor = cc.color(0, 0, 0, 0);
    }

    public checkNetWorkStatus() {
        let tips_type: string = ""
        let net_work = kit.model.nativeInfo.getNetworkStatus()
        if (net_work === kit.model.netWork.networkType.NETWORK_NO) {
            tips_type = TIPS_TYPE.NO_NETWORK
        } else if (net_work != kit.model.netWork.networkType.NETWORK_WIFI) {
            tips_type = TIPS_TYPE.NOT_WIFI
        } else {
            return
        }
        this.video.pause()
        let params: commonTipsOptions = {
            tipsType: tips_type,
            confirmCallback: () => {
                this.video.play()
            },
            cancelCallback: () => {
                kit.manager.Event.emit("back");
            },
        }
        kit.manager.Event.emit(kit.consts.Event.SHOW_COMMON_TIPS_POP, params);
    }

    public loadVideo(event) {
        // let bundle = cc.assetManager.getBundle("video");
        // TimerSystem.instance.doFrameOnce(1, ()=>{
        //     bundle.load(data.data.url, (error: Error, video: any)=>{
        //         this.video.clip = video;
        //         // EventSystem.emit(LIFE_CYCLE_READY);
        //     });
        // });
        this.video.remoteURL = event.data.url
    }

    public start() {

    }

    public regisEvent() {
        // ** 视频准备好了 可以播放了 */
        this.video.node.on("ready-to-play", this.videoReady, this);

        // ** 表示视频的元信息已加载完成，你可以调用 getDuration 来获取视频总时长。 */
        this.video.node.on("meta-loaded", this.videoLoaded, this);

        // ** 视频播放中 */
        this.video.node.on("playing", this.videoPlaying, this);

        // ** 表示视频暂停播放。 *//
        this.video.node.on("paused", this.videoPaused, this);

        // **视频播放完成。 *//
        this.video.node.on("completed", this.videoCompleted, this);

        // 滑条相关
        this.slider.node.on("slide", this.changeProgress, this);
        this.slider.node.on("touchstart", this.slideStart, this);
        this.slider.node.on("touchend", this.slideClickEnd, this);
        this.handelBtn.on("touchstart", this.handelBtn_start, this);
        this.handelBtn.on("touchend", this.handelBtn_end, this);
        this.handelBtn.on("touchcancel", this.handelBtn_cancel, this);

        EventSystem.on(LIFE_CYCLE_BLOCK, this.videoPause, this);
        EventSystem.on(LIFE_CYCLE_PARAMS, this.loadVideo, this);
        EventSystem.on(LIFE_CYCLE_UNBLOCK, this.videoResume, this);
        EventSystem.on("on_game_pass", this.setIsReadyFalse, this);
        EventSystem.on("on_game_resume", this.setIsReadyTrue, this);
    }

    public setIsReadyFalse(event) {
        console.log("视频进入后台========")
        this.isReady = false
    }

    public setIsReadyTrue(event) {
        console.log("视频进入前台========")
        this.scheduleOnce(() => this.isReady = true,1)
    }

    public videoReady() {
        // 可以播放了
        cc.log("videoReady===");
        this.progress.getComponent(cc.ProgressBar).progress = 0
        this.video.play();
        this.isReady = true
        this.videoControl.active = true
        EventSystem.emit(LIFE_CYCLE_READY);
        this.videoControl.getComponent("videoCr").show()
        this.checkNetWorkStatus()
    }
    // 临时解决 返回的currentTime不变情况
    public setProgress() {
        this.video.currentTime += 0.01
        this.slider.progress = this.video.currentTime / this.progressMax
        this.progress.getComponent(cc.ProgressBar).progress = this.slider.progress
        this.curTime.string = this.secondToDate(this.video.currentTime);
    }

    public videoLoaded() {
        this.progressMax = this.video.getDuration();
        cc.log("video time ==== " + this.video.getDuration());
        if (this.progressMax == 0) {
            this.progressMax = 0.1
        }
        this.maxTime.string = "/" + this.secondToDate(this.progressMax);
    }

    public videoPlaying() {
        // 播放中
        this.scheduleOnce(()=>{
            this.isReady = true;
        },0.4)
    }

    public slideClickEnd() {
        // 播放中
        this.videoControl.getComponent("videoCr").show()
    }

    public videoPaused() {
       
    }

    public videoCompleted() {
        // 播放完成
        EventSystem.emit(LIFE_CYCLE_COMPLETE);
    }

    // ** 视频暂停 *//
    public videoPause(event, choose) {
        this.video.pause();
        this.pauseBtn.active = false;
        this.resumeBtn.active = true;
        if (choose == 1) {
            EventSystem.emit(Events.VIDEO_MODULE_TO_CLIENT, { type: VideoEventTransType.M2C_VIDEO_PLAY_PAUSE });
            cc.log(`${Events.VIDEO_MODULE_TO_CLIENT}, type:${VideoEventTransType.M2C_VIDEO_PLAY_PAUSE}`);
        }

    }
    // ** 视频继续 *//
    public videoResume(event, choose) {
        // this.video.resume();
        this.video.play();
        this.pauseBtn.active = true;
        this.resumeBtn.active = false;
        if (choose == 1) {
            EventSystem.emit(Events.VIDEO_MODULE_TO_CLIENT, { type: VideoEventTransType.M2C_VIDEO_PLAY_RESUME });
            cc.log(`${Events.VIDEO_MODULE_TO_CLIENT}, type:${VideoEventTransType.M2C_VIDEO_PLAY_RESUME}`);
        }
    }

    // ** 格式化时间 *//
    public secondToDate(result) {
        let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
        let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
        return result = m + ":" + s;
    }

    /* 滑动开始 */
    public handelBtn_start() {
        this.videoControl.getComponent("videoCr").show()
    }
    /* 滑动结束 */
    public handelBtn_end() {
        this.videoControl.getComponent("videoCr").schHide()
    }
    /* 滑动取消 */
    public handelBtn_cancel() {
        this.videoControl.getComponent("videoCr").schHide()
    }

    public update(dt) {
        if (this.isReady && !Number.isNaN(this.video.currentTime)) {
            this.slider.progress = this.video.currentTime / this.progressMax;
            this.progress.getComponent(cc.ProgressBar).progress = this.slider.progress;
            this.curTime.string = this.secondToDate(this.video.currentTime);
        }
    }

    // 移除监听
    public onDestroy() {
        cc.Camera.main.backgroundColor = cc.color(0, 0, 0, 255);
        EventSystem.off(LIFE_CYCLE_BLOCK, this.videoPause, this);
        EventSystem.off(LIFE_CYCLE_PARAMS, this.loadVideo, this);
        EventSystem.off(LIFE_CYCLE_UNBLOCK, this.videoResume, this);
        EventSystem.off("on_game_pass", this.setIsReadyFalse, this);
        EventSystem.off("on_game_resume", this.setIsReadyTrue, this);
        if (this.video.node && cc.isValid(this.video.node)) {
            this.video.node.off("ready-to-play", this.videoReady, this);
            this.video.node.off("meta-loaded", this.videoLoaded, this);
            this.video.node.off("playing", this.videoPlaying, this);
            this.video.node.off("paused", this.videoPaused, this);
            this.video.node.off("completed", this.videoCompleted, this);

            this.slider.node.off("touchend", this.slideClickEnd, this);
            this.handelBtn.off("touchstart", this.handelBtn_start, this);
            this.handelBtn.off("touchend", this.handelBtn_end, this);
            this.handelBtn.off("touchcancel", this.handelBtn_cancel, this);
        }

    }

    public slideStart(){
        this.isReady = false;
    }
    public changeProgress() {
        this.progress.getComponent(cc.ProgressBar).progress = this.slider.progress;
        this.video.currentTime = this.slider.progress * this.progressMax;
    }
}
