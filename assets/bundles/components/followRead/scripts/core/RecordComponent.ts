import { kit } from "../../../../../kit/kit";
import { BUNDLE_COMPONENTS } from "../../../../../Script/config/config";
import { FollowQuestionType, RecordCallBack, RecordConfig, RecordState } from "./RecordConfig";
import RecordManager from "./RecordManager";
import RecordAni from "../RecordAin";
import { BACK, NEXT_LESSON, ON_GAME_PASS, ON_GAME_RESUME, PRE_LESSON } from "../../../../../Script/config/event";

const { ccclass, property } = cc._decorator;

/**
 * 组建基类 语音题组建继承RecordComponent
 */
@ccclass
export default class RecordComponent extends cc.Component {
    // 配置
    public recordConfig: RecordConfig;
    // 是否中途中断
    public isBreak: boolean = true;

    public recordType: FollowQuestionType;

    public bundleName = 'components'

    public content: cc.Node = null;

    // 动画组件
    public recordAni: RecordAni;

    // 当前评测次数
    public curtryTime: number = 1;

    // 点击次数（测试环境后门）
    private starTime: number = 0;

    // 录音权限
    private hasPermission = true;

    private gamePass = false;

    // 开始录音参数
    public get startParm(): string {
        let json = {
            "evaluatingText": this.recordConfig.evaluatingText,
            "evaluatingName": this.recordConfig.evaluatingName,
            "hostUrl": this.recordConfig.hostUrl,
            "apiKey": this.recordConfig.apiKey,
            "apiSecret": this.recordConfig.apiSecret,
            "appid": this.recordConfig.appid,
            "recordTime": this.recordConfig.recordTime
        }
        return JSON.stringify(json);
    }

    // 评测参数
    public get evaluationParm(): string {
        let josn = {
            "evaluatingType": this.recordConfig.evaluatingType,
            "evaluatingText": this.recordConfig.evaluatingText,
            "evaluatingName": this.recordConfig.evaluatingName
        }
        return JSON.stringify(josn);
    }

    // 录音状态
    protected _status: RecordState;
    public get status(): RecordState {
        return this._status;
    }

    public set status(v: RecordState) {
        this._status = v;
        this.historyStatus.push(v);
        cc.log("历史状态", this.historyStatus);
    }

    // 历史录音状态
    public _historyStatus: RecordState[];
    public get historyStatus(): RecordState[] {
        return this._historyStatus;
    }

    onload () {
        kit.manager.Event.on(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, this.onToClientEvent, this);
    }

    initEvent() {
        this.content = this.node.getChildByName("content");
        this.recordAni = this.node.getComponent(RecordAni);

        kit.manager.Event.on(BACK, this.onBack, this);
        kit.manager.Event.on(NEXT_LESSON, this.onBack, this);
        kit.manager.Event.on(PRE_LESSON, this.onBack, this);
        kit.manager.Event.on(RecordManager.instance.PERMISSION_ALERT_CANCEL, this.permissionAlertCancel, this);
        kit.manager.Event.on(ON_GAME_RESUME, this.onGameResume, this);
        kit.manager.Event.on(ON_GAME_PASS, this.onGamePass, this);


        this.init();
    }

    onToClientEvent (data: any) {
        if (data.data.eventName == RecordCallBack.ResultCb) {
            this.release();
        }
    }

    private onGameResume () {
        this.gamePass = false;
        if (this.isBreak) {
            return;
        }
        // 有权限弹窗
        let alertNode = this.node.getChildByName("alertNode");
        if (alertNode) {
            return;
        }

        if (this._status == RecordState.Readying) {
            if (this.hasPermission) {
                this.readyRecordCb({"code":200,"result":true});
            }
            return;
        }
       
        this.isBreak = true;
        this.unscheduleAllCallbacks();
        this.content.active = false;
        this._historyStatus = [];
        this.recordAni.stopAni();
        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: false, extra: { code: 203, score: 0 } });

     }

    private onGamePass () {
        this.gamePass = true;
    }
    /**
     * 组建初始化
     * @param data
     */
    public initComponent(data?: any) {
        if (!data) {
            cc.error("语音组建初始化参数 error：", data)
        }
        this.isBreak = false;
        this.recordConfig = new RecordConfig();
        this.recordConfig.evaluatingText = data.evaluatingText;
        this.recordConfig.evaluatingType = data.evaluatingType;
        this.recordConfig.evaluationScore = data.evaluationScore;
        this.recordConfig.extra = data.extra;
        this.recordConfig.tryTimes = data.tryTimes;
        this.recordConfig.recordTime = data.recordTime;

        this.content.active = false;
        let bundleName = data.bundleName;
        let iconPath = data.iconPath;
        if (bundleName && iconPath) {
            this.recordAni.setLogo(bundleName, iconPath, this.recordConfig.evaluatingText);
        } else {
            this.recordAni.release();
        }
        // 注册事件
        this.addCallBackListener([
            { key: RecordCallBack.ReadyRecordCb, callBack: this.readyRecordCb.bind(this) },
            { key: RecordCallBack.StartRecordCb, callBack: this.startRecordCb.bind(this) },
            { key: RecordCallBack.StopRecordCb, callBack: this.stopRecordCb.bind(this) },
            { key: RecordCallBack.ResultCb, callBack: this.resultCb.bind(this) }
        ])
    }

    init() {

    }

    handleStartEvent(data: any) {
        if (this.isBreak) {
            return;
        }
        if (data.extra && data.extra.evaluatingText) {
            this.recordConfig.evaluatingText = data.extra.evaluatingText;
        }
        if (!this.recordConfig.extra) {
            this.recordConfig.extra = {};
        }
        if (data.extra && data.extra.bundleName) {
            this.recordConfig.extra['bundleName'] = data.extra.bundleName;
            this.recordConfig.extra['audioUrl'] = data.extra.audioUrl;
            // 传   了单词卡图片
            if (data.extra.iconPath) {
                this.display(data.extra.bundleName, data.extra.iconPath, this.recordConfig.evaluatingText);
            }
        }
        // 调用准备
        this.readFollowAudio();
    }

    /**
     * 展示ui
     */
    public display(bundleName?: string, iconPath?: string, evaluatingText?: string) {
        this.content.active = true;
        if (iconPath && iconPath != "") {
            this.recordAni.setLogo(bundleName, iconPath, evaluatingText)
        }
    }

    /**
     * 开始录音  重写
     */
    public readFollowAudio() {
        // 停止背景音乐
        kit.manager.Audio.passMusic();
    }

    permissionAlertCancel() {
        // this.startRecord( this.startParm);
        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: false, extra: { code: 203, score: 0 } });
        this.content.active = false;
    }

    /**
     * 注册回调事件
     * @param callBack
     * @param cb
     */
    public addCallBackListener(option: { key: RecordCallBack; callBack: (data) => void }[]) {
        RecordManager.instance.addCallBackListener(option);
    }

    // 准备录音
    public readyRecord() {
        if (this.isBreak) {
            return;
        }
        this._historyStatus = [];
        let bundleName = this.recordConfig.extra['bundleName'];
        let audioUrl = this.recordConfig.extra['audioUrl'];
        cc.log("调用开始录音 " + bundleName + ' ' + audioUrl);
        this.status = RecordState.Idle;
        if (audioUrl && bundleName) {
            kit.manager.Audio.playEffect(bundleName, audioUrl, () => {
                RecordManager.instance.readyRecord();
            });
            return;
        }
        RecordManager.instance.readyRecord();
    }

    // 开始录音
    public startRecord(parm) {
        if (this.isBreak) {
            return;
        }
        this._historyStatus = [];
        cc.log("开始录音");
        // kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/ding', () => {
        RecordManager.instance.startRecord(parm);
        // });
        if (kit.system.platform.isGameBoard) {
            this.starTime = 0;
            cc.log('TOUCH_START')
            this.node.parent.on(cc.Node.EventType.TOUCH_START, this.onTouchStar, this);
        }
    }

    // 停止录音
    public stopRecord() {
        if (this.isBreak) {
            return;
        }
        this.recordAni.loading(true);
        RecordManager.instance.stopRecord();
        this.scheduleOnce(() => {
            this.stopRecordCb({ audioUrl: "" });
        }, 10)
        if (kit.system.platform.isGameBoard) {
            cc.log('添加测试后门')
            this.node.parent.off(cc.Node.EventType.TOUCH_START, this.onTouchStar, this);
        }
    }

    // 评测录音
    public evaluatingRecord(parm) {
        RecordManager.instance.evaluatingRecord(parm);
        this.scheduleOnce(() => {
            this.resultCb({ score: 0, code: 200 });
        }, 8);
    }

    // 准备录音回调
    readyRecordCb(parm) {
        if (this.isBreak) {
            return;
        }
        cc.log("准备录音回调", parm);
        this.status = RecordState.Readying;
        this.hasPermission = parm.result;
        // 没有权限
        if (parm.result == false) {
            let cmptBundle = cc.assetManager.getBundle(BUNDLE_COMPONENTS);
            cmptBundle.load('followRead/prefab/permissPrefab', cc.Prefab, (e, asset: cc.Prefab) => {
                if (e) {
                    cc.warn(e);
                }
                let alertNode = cc.instantiate(asset);
                alertNode.name = "alertNode";
                this.node.addChild(alertNode);
            });
            return;
        }
        if (this.gamePass) {
            return;
        }
        this.startRecord(this.startParm);
    }
    // 开始录音回调
    startRecordCb(parm) {
        if (this.isBreak) {
            return;
        }
        let time = this.recordConfig.recordTime
        this.scheduleOnce(() => {
            this.stopRecord();
        }, time)
        this.status = RecordState.Recording;
        this.recordAni.loading(false);
        // kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/ding');
        this.recordAni.initeAniFun(this.recordConfig.recordTime);

        kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.StartRecordCb, extra: parm });
    }

    // 停止录音回调
    stopRecordCb(parm) {
        // 下一帧
        //this.scheduleOnce(() => {
            this.unscheduleAllCallbacks();
        //}, 0);
    }

    // 评测结果回调
    resultCb(parm) {
        this.scheduleOnce(() => {
            this.unscheduleAllCallbacks();
        }, 0);
    }

    // quitLessonAlert 返回大厅
    private onBack() {
        this.isBreak = true;
        this.content.active = false;
    }

    private onTouchStar(): void {
        this.starTime += 1;
        cc.log(`跟读点击次数：${this.starTime}`);
    }


    protected onTest(): boolean {
        cc.log(`跟读点击次数：${this.starTime}`);
        if (this.starTime > 9) {
            kit.manager.Audio.playEffect(this.bundleName, 'followRead/audio/right')
            cc.log({ eventName: RecordCallBack.ResultCb, success: true, extra: {} });
            this.content.active = false;
            kit.manager.Event.emit(kit.consts.Event.FOLLOW_MODULE_TO_CLIENT, { eventName: RecordCallBack.ResultCb, success: true, extra: {} });
            kit.manager.Audio.resumeMusic();
            return true;
        }
        return false
    }

    release() {
        cc.log("调用release"+ this.name);
        this.gamePass = false;
        this.isBreak = false;
        kit.manager.Event.off(BACK, this.onBack, this);
        kit.manager.Event.off(NEXT_LESSON, this.onBack, this);
        kit.manager.Event.off(PRE_LESSON, this.onBack, this);
        kit.manager.Event.off(RecordManager.instance.PERMISSION_ALERT_CANCEL, this.permissionAlertCancel, this);
        kit.manager.Event.off(ON_GAME_RESUME, this.onGameResume, this);
        kit.manager.Event.off(ON_GAME_PASS, this.onGamePass, this);
        this.node.parent.off(cc.Node.EventType.TOUCH_START, this.onTouchStar, this);
    }
}
