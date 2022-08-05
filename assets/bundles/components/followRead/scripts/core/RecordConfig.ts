/** 语音sdk静态配置 */
export class RecordStaticConfig {    
    public static readonly fly = "FLY";
    public static readonly singSong = "SINGSONG";

    public static SDKTYPE = "";

    public static staticConfig () {
        cc.log("语音sdk参数 ", RecordStaticConfig.SDKTYPE);

        return RecordStaticConfig[RecordStaticConfig.SDKTYPE]();
    }

    private static SINGSONG () {
        return cc.sys.os === cc.sys.OS_ANDROID ? {
            "appKey": "a0007bw", 
            "secretKey": "kFPwfrSIxyO12CUDwUdR806aqMCVy7kv",
            "frontTime": 1.2,
            "backTime": 8,
            "userId": ""
        }: {
            "appKey": "t0007bw", 
            "secretKey": "ic4frYPL695OyEdHYuXRfWmiE13JULNP",
            "frontTime": 1.2,
            "backTime": 8,
            "userId": "",
            'type': RecordStaticConfig.singSong
        }
    }

    private static FLY () {
        return {
            "appid": "g98d5722",
            "apiKey": "4d72e5f374599ab9330b1f02f3f7c16e",
            "hostUrl": "http://ise-api-sg.xf-yun.com/v2/ise",
            "apiSecret": "b69bd8f7c7c8b04122dde1352ac4fd3e",
            'type': RecordStaticConfig.fly
        }
    }
}



export class RecordConfig {
    // 测评类型
    public evaluatingType: number;
    // 测评内容
    public evaluatingText: string;
    // 倒计时
    public recordTime: number;
    // 重试次数
    public tryTimes: number;
    // 分数
    public evaluationScore: number;
    public evaluatingName: string = "ChineseAi.mp3"; // 录音文件名字
    public appid = "g98d5722";
    public apiKey = "4d72e5f374599ab9330b1f02f3f7c16e";
    public hostUrl = "http://ise-api-sg.xf-yun.com/v2/ise";
    public apiSecret = "b69bd8f7c7c8b04122dde1352ac4fd3e"
    public extra?: any;
}

//////////////////////////////// enum
export enum RecordCallBack {
    ReadyRecordCb = 'ReadyRecordCb',      // 准备录音回调
    StartRecordCb = 'StartRecordCb',      // 开始录音回调
    StopRecordCb = 'StopRecordCb',       // 停止录音回调
    ResultCb = 'ResultCb',         // 评测结果回调
    AudioFinishPlaying = "AudioFinishPlaying" // 录音播放完成
}

// native事件名称
export enum RecordNativeFunction {
    initAudioUtil = "initAudioUtil",
    // 准备
    readyRecordAction = 'readyRecordAction',
    // 开始录音
    startRecordAction = 'startRecordAction',
    // 停止录音
    stopRecordAction = 'stopRecordAction',
    // 上传评测
    uploadRecordAction = 'uploadRecordAction',
    // 跳转设置
    applyPermissionAction = 'applyPermissionAction',
    // 检测权限
    checkRecordAudioPermission = 'checkRecordAudioPermission',
    // 播放音频 
    playAvdio = 'playAvdio',
    // 停止播放音频
    stopAudio = 'stopAudio',
    
}


export enum RecordState {
    Idle = "idle",
    Readying = "readying",
    Ready = "ready",
    Recording = "recording",
    Stoping = "stoping",
    Stop = "stop",
}

/** 组件类型 */
export enum FollowQuestionType {
    Follow = 'follow',  // 跟读
    Recongnition = 'recongnition', // 认读（需要评分）
    Record = 'record'   // 录音
}