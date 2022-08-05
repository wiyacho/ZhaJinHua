import { FOLLOW_CLIENT_TO_MODULE, FOLLOW_MODULE_TO_CLIENT, LIFE_CYCLE_COMPLETE } from "../../../kit/events/events";
import { kit } from "../../../kit/kit";
import ResourcesManager, { ResourceType } from "../../../kit/manager/ResourcesManager";
import AudioManager from "../../../kit/system/audio/AudioManager";
import EventSystem from "../../../kit/system/event/EventSystem";
import gameTask from "../gameTask/scripts/gameTask";
import { GameTaskInitParam } from "../structure/CompInterface";
import { SpineUtils } from "../utils/SpineUtils";
import BaseChapterComponent from "./BaseChapterComponent";

/**
 * 课程游戏基类， 课程游戏的功能抽离
 */
const { ccclass } = cc._decorator;

@ccclass
export default class ChapterGameComponent extends BaseChapterComponent {
    // 评测参数
    public recordData: any = null;

    // 任务组件参数
    public taskData: GameTaskInitParam = null;
    public gameTaskCom: gameTask = null;

    public override onLoad() {
        super.onLoad();
        cc.log(`ChapterGameComponent onLoad params: ${this.params}`)

        this.initData();
        this.initComponents();

        this.scheduleOnce(() => {
            this.onGameInitialed();
        }, 2);
    }

    /**
     * 子游戏可以根据需求重载,修改参数
     */
    public initData() {
        this.recordData = {
            evaluatingType: 1,
            evaluatingText: "",
            tryTimes: 1,
            evaluationScore: 35,
            recordTime: 3,
        };

        // this.taskData = {
        //     bundleName: 'SweepLeaves',
        //     imgList: ['res/task1', 'res/task2']
        // };
    }

    /**
     * 游戏初始化完成
     */
    public onGameInitialed() {

    }
    public override registerEvent() {
        super.registerEvent()
        EventSystem.on(FOLLOW_MODULE_TO_CLIENT, this.onRecordResult, this);
    }

    public override unregisterEvent() {
        super.unregisterEvent()
        EventSystem.off(FOLLOW_MODULE_TO_CLIENT, this.onRecordResult, this);
    }
    /**
     * 组件加载完成
     */
    public componentsLoadComplete() {
        cc.log(`components load complete`)
        this.onChapterReady();
    }
    /**
     * 子游戏可以根据需求重载
     */
    public initComponents() {
        Promise.all([
            this.initRecordAudioComp(),
            this.initTaskComp(),
        ]).then(() => {
            this.componentsLoadComplete();
        }).catch((error) => {
            cc.warn(`initComponents error: ${error}`);
        });
    }

    // 录音组件
    /**
     * https://pplingo.atlassian.net/wiki/spaces/ED/pages/246644739/APP
     * @param recordData
     * @returns
     */
    public initRecordAudioComp(): Promise<void> {
        return new Promise<void>((resolve) => {
            EventSystem.emit(FOLLOW_CLIENT_TO_MODULE, {
                eventName: "initComponent",
                extra: this.recordData,
            });
            resolve();
        }).catch((error) => {
            cc.warn(`initRecordAudioComp error: ${error}`);
        });
    }

    // 任务组件
    public initTaskComp(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.taskData) {
                let bundle = cc.assetManager.getBundle("common");
                if (bundle) {
                    bundle.load("gameTask/gameTask", cc.Prefab, (error: Error, assets: cc.Prefab) => {
                        let taskNode = cc.instantiate(assets);
                        this.gameTaskCom = taskNode.getComponent("gameTask");
                        this.gameTaskCom && this.gameTaskCom.initData(this.taskData);
                        taskNode.parent = this.node;
                        resolve();
                    });
                } else {
                    resolve();
                }
            } else {
                resolve();
            }

        }).catch((error) => {
            cc.warn(`initTaskComp error: ${error}`);
        });
    }


    /**
     * 开始录音
     * https://pplingo.atlassian.net/wiki/spaces/ED/pages/246644739/APP
     * @param evaluatingText 评测关键词
     * @param bundleName
     * @param audioUrl 音频路径
     * @param iconPath 单词卡路径
     * @param recordType recordType:  题目类型（跟读/认读/录音）， 类型： follow：跟读。 recongnition： 认读， record： 录音（没有评测）
     * @returns
     */
    public startRecordAudio(evaluatingText: string, bundleName?: string, audioUrl?: string, iconPath?: string, recordType?: string) {
        let recordTimes = {
            'follow': 3,
            'recongnition': 8,
            'record': 5,
        }
        if (recordType) {
            this.recordData.recordType = recordType
            this.recordData.recordTime = recordTimes[recordType]
        }
        this.initRecordAudioComp();
        EventSystem.emit(FOLLOW_CLIENT_TO_MODULE, { eventName: "startRecord", extra: { evaluatingText, bundleName, audioUrl, iconPath, recordType } }); // 开始录音
    }


    /**
     * 评测完成回调
     * https://pplingo.atlassian.net/wiki/spaces/ED/pages/246644739/APP
     * @param result
     * RecordCallBack {
     *   ReadyRecordCb = 'ReadyRecordCb', // 准备录音回调
     *   StartRecordCb = 'StartRecordCb', // 开始录音回调
     *   StopRecordCb = 'StopRecordCb', // 停止录音回调
     *   ResultCb = 'ResultCb', // 评测结果回调
     *   AudioFinishPlaying = "AudioFinishPlaying" // 录音播放完成
     *   }
     */
    public onRecordResult(result) {
        cc.log(` recordResult result.data: ${result.data}`);

    }

    /**
     * 上报完成一轮游戏(每轮都报)
     * @param index 第几轮
     * @param isSuccess 是否成功完成
     */
    public reportRoundCompleted(index, isSuccess) {
        cc.log(`report round data  index: ${index}  isSuccess: ${isSuccess}`);
    }

    /**
     * 游戏结局
     * @param isSuccess 是否通过
     * @param extraData 转场动画信息
     */
    public onGameEnd(isSuccess: boolean = true, extraData?: { bundleName: string, spinePath: string, bgPath: string, audioName: string }) {
        cc.log(" onGameEnd ~~");
        EventSystem.emit(kit.consts.Event.LIFE_CYCLE_GAME_END);
        if (extraData) {
            this.loadSpineNode(extraData.bundleName, extraData.spinePath, extraData.bgPath, extraData.audioName);
            return;
        }
        // 游戏结束
        EventSystem.emit(LIFE_CYCLE_COMPLETE);
    }
    // public onGameEnd(isSuccess:boolean = true, bundleName?: string, spinePath?: string, bgPath?: string) {
    //     cc.log(" onGameEnd ~~");
    //     if (bundleName && spinePath && bgPath) {
    //         this.loadSpineNode(bundleName, spinePath, bgPath);
    //         return;
    //     }
    //     //游戏结束
    //     EventSystem.emit(LIFE_CYCLE_COMPLETE);
    // }
    public override onDestroy() {
        super.onDestroy();
    }

    private loadSpineNode(bundleName: string, spinePath: string, bgPath: string, audioName) {
        let rootNode = new cc.Node("game_ani_end");
        let spineNode = new cc.Node();
        let spriteNode = new cc.Node();
        let spineCmpt = spineNode.addComponent(sp.Skeleton);
        let spriteCmpt = spriteNode.addComponent(cc.Sprite);
        rootNode.addChild(spriteNode);
        rootNode.addChild(spineNode);
        spriteCmpt.addComponent(cc.BlockInputEvents);
        ResourcesManager.instance.loadRes(bundleName, bgPath, ResourceType.Normal, cc.SpriteFrame, (err, res) => {
            if (err) {
                cc.error(err);
                return
            }
            spriteCmpt.spriteFrame = res;
            spriteNode.width = cc.winSize.width;
            spriteNode.height = cc.winSize.height;
        });
        ResourcesManager.instance.loadRes(bundleName, spinePath, ResourceType.Normal, sp.SkeletonData, (err, res) => {
            if (err) {
                cc.error(err);
                return
            }
            spineCmpt.skeletonData = res;
            AudioManager.playEffect("gameSound", audioName);
            SpineUtils.playSpine(spineCmpt, "sc_14", false, () => {
                // kit.system.timer.doFrameOnce(1000, ()=>{
                //     if (rootNode) {
                //         rootNode.destroy();
                //     }
                // })
                // 游戏结束
                EventSystem.emit(LIFE_CYCLE_COMPLETE);
            });
        });
        this.node.parent.addChild(rootNode);
    }
}
