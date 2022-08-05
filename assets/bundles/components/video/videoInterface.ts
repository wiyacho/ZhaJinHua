import { kit } from '../../../kit/kit';

export default class VideoInterface {
    private static className: string = (kit.system.platform.isAndroid && "videoView/VideoViewInterface") || (kit.system.platform.isIOS && "AVPlayerInterface");
    /**
     * 播放视频
     */
    public static playVideo(url: string) {
        if (kit.system.platform.isNative) {
            cc.Camera.main.backgroundColor = cc.color(0, 0, 0, 0);
            if (kit.system.platform.isAndroid) {
                kit.system.platform.adapter.callFunction("play", url, VideoInterface.className);
            } else if (kit.system.platform.isIOS) {
                jsb.reflection.callStaticMethod(VideoInterface.className, "play:", url);
            }
        } else {
            cc.log(`only support native platform!`);
        }
    }

    /**
     * 暂停视频
     */
    public static pauseVideo() {
        if (kit.system.platform.isNative) {
            if (kit.system.platform.isAndroid) {
                kit.system.platform.adapter.callFunction("pauseVideo", "", VideoInterface.className);
            } else if (kit.system.platform.isIOS) {
                jsb.reflection.callStaticMethod(VideoInterface.className, "pauseVideo");
            }
        } else {
            cc.log(`only surport native platform!`);
        }
    }

    /**
     * 恢复视频
     */
    public static resumeVideo() {
        if (kit.system.platform.isNative) {
            if (kit.system.platform.isAndroid) {
                kit.system.platform.adapter.callFunction("resumeVideo", "", VideoInterface.className);
            } else if (kit.system.platform.isIOS) {
                jsb.reflection.callStaticMethod(VideoInterface.className, "resumeVideo");

            }
        } else {
            cc.log(`only support native platform!`);
        }
    }

    /**
     * 视频跳转TODO:
     */
    public static seekToVideo(time: number) {
        if (kit.system.platform.isNative) {
            if (kit.system.platform.isAndroid) {
                // kit.system.platform.adapter.callFunction("resumeVideo", "", VideoInterface.className);
            } else if (kit.system.platform.isIOS) {
                // jsb.reflection.callStaticMethod(VideoInterface.className, "resumeVideo");

            }
            cc.log(`TODO:`);
        } else {
            cc.log(`only support native platform!`);
        }
    }

    /**
     * 刷新视频进度
     */
    public static updateVideoStatus(paramObj: any) {
        cc.log(JSON.stringify(paramObj))
        let param = JSON.parse(paramObj.param);
        // {"mathName":"VideoStatusUpdate","param":"{\"curT\":11627,\"totalT\":60140,\"per\":19.333223342895508}"}
        cc.log(`====>>updateVideoStatus: ${paramObj}  curT: ${param.curT} totalT: ${param.totalT} per: ${param.per}`);
        let params: kit.video.Client2Module = {
            type: kit.video.videoTransType.C2M_UPDATE_PLAY_STATUS,
            updateParams: {
                curT: param.curT,
                totalT: param.totalT,
                per: param.per,
            }
        }
        kit.manager.Event.emit(kit.consts.events.VIDEO_CLIENT_TO_MODULE, params);
    }

    /**
     * 播放开始
     */
    public static videoPlayStart(paramObj: any) {
        let param = JSON.parse(paramObj.param);
        cc.log(`====>>videoPlayEnd: ${paramObj}  videoUrl: ${param.videoUrl}`);
        let params: kit.video.Client2Module = {
            type: kit.video.videoTransType.C2M_VIDEO_PLAY_START,
            completeParams: {
                videoUrl: param.videoUrl
            }
        }
        kit.manager.Event.emit(kit.consts.events.VIDEO_CLIENT_TO_MODULE, params);
    }

    /**
     * 播放完成
     */
    public static videoPlayEnd(paramObj: any) {
        let param = JSON.parse(paramObj.param);
        cc.log(`====>>videoPlayEnd: ${paramObj}  videoUrl: ${param.videoUrl}`);
        let params: kit.video.Client2Module = {
            type: kit.video.videoTransType.C2M_VIDEO_PLAY_COMPLETE,
            completeParams: {
                videoUrl: param.videoUrl
            }
        }
        kit.manager.Event.emit(kit.consts.events.VIDEO_CLIENT_TO_MODULE, params);
        kit.system.timer.doOnce(100, () => {
            cc.Camera.main.backgroundColor = cc.color(0, 0, 0, 255);
        })
    }

    /**
     * VideoListener
     */
    public static VideoListener(msg) {
        cc.log("VideoListener 收到信息", JSON.stringify(msg));
        switch (msg.mathName) {
            case VideoReturnStatus.VideoStart:
                VideoInterface.videoPlayStart(msg);
                break;
            case VideoReturnStatus.VideoEnd:
                VideoInterface.videoPlayEnd(msg);
                break;
            case VideoReturnStatus.VideoStatusUpdate:
                VideoInterface.updateVideoStatus(msg);
                break;
            default:
                break;
        }
    }

    public static handleEvent(_data: any) {
        let data: kit.video.Module2Client = _data.data;
        cc.log(" =====>>>>data: ", data);
        switch (data.type) {
            case kit.video.videoTransType.M2C_VIDEO_INIT:
                break;
            case kit.video.videoTransType.M2C_VIDEO_DESTROY:

                break;
            case kit.video.videoTransType.M2C_VIDEO_PLAY_START: //  播放视频
                VideoInterface.playVideo(data.playParams.videoUrl);
                break;

            case kit.video.videoTransType.M2C_VIDEO_PLAY_PAUSE: //  暂停视频
                VideoInterface.pauseVideo();
                break;
            case kit.video.videoTransType.M2C_VIDEO_PLAY_RESUME: //  恢复播放视频
                VideoInterface.resumeVideo();
                break;
            case kit.video.videoTransType.M2C_VIDEO_PLAY_SEEKTO: //  视频跳转
                VideoInterface.seekToVideo(data.seekToParams.seekToT);
                break;
            default:
                break;
        }
    }
}

enum VideoReturnStatus {
    VideoStart = "VideoStart",
    VideoEnd = "VideoEnd",
    VideoStatusUpdate = "VideoStatusUpdate",
}

(function registEvent() {
    kit.manager.Event.on(kit.consts.Event.VIDEO_MODULE_TO_CLIENT, VideoInterface.handleEvent);
})();

(window as any).VideoProxyListen = VideoInterface.VideoListener;
