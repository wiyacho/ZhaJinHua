import AudioManager from "../../../../kit/system/audio/AudioManager";
import { GameTaskInitParam, GameTaskShowParam } from "../../structure/CompInterface";

/**
 * 课程游戏侧边任务
 * 使用：子类重载ChapterGameComponent的initData，并给taskData赋值，然后通过 gameTaskCom
 * 调用接口
    let showParams: GameTaskShowParam = {
        taskIndex:1,
        complete:false,
        callFunc1:()=>{
        },
        callFunc2: () => {
        },
        callFunc3: () => {
        },
    }
    this.showTaskList(showParams);
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class gameTask extends cc.Component {

    @property(cc.Widget)
    public nodeWidget: cc.Widget = null;

    @property(cc.Node)
    public topBtn: cc.Node = null;

    private moveLen = 400; // 任务栏移动距离
    public taskHideTime = 4; // 任务栏隐藏倒计时
    private moveTime = 0.5; // 任务栏移动时间

    public taskData: GameTaskInitParam = null;
    public params: any;

    public initData(taskData) {
        this.taskData = taskData;
    }
    public onLoad() {
        this.node.active = false;
        this.topBtn.active = false;
        this.updateTaskPos();
        // let showParams: GameTaskShowParam = {
        //     taskIndex:1,
        //     complete:false,
        //     callFunc1:()=>{
        //     },
        //     callFunc2: () => {
        //     },
        //     callFunc3: () => {
        //     },
        // }
        // this.showTaskList(showParams);

        // this.scheduleOnce(()=>{
        //     showParams.taskIndex = 0;
        //     showParams.complete = true;
        //     this.showTaskList(showParams);
        // }, 8);

        // this.scheduleOnce(() => {
        //     showParams.taskIndex = 1;
        //     showParams.complete = true;
        //     this.showTaskList(showParams);
        // }, 16);
    }

    private updateTaskPos() {
        this.nodeWidget.right = -this.node.width;
        this.nodeWidget.updateAlignment();
    }

    /** 显示任务栏 */
    public async showTaskList(params: GameTaskShowParam) {
        if (!params || (params.taskIndex == undefined)) {
            cc.error(`show task params error! params:${JSON.stringify(params)}`);
            return
        }
        let taskIndex = params.taskIndex;
        let complete = params.complete;
        if (taskIndex >= this.taskData.imgList.length) {
            cc.error(`task index error!`)
            return
        }
        await this.updateTaskImg(taskIndex);
        this.moveAni(params, () => {
            this.showSealSpine(complete);
        });
    }

    private updateTaskImg(taskIndex) {
        return new Promise<void>((resolve, reject) => {
            let bundle = cc.assetManager.getBundle(this.taskData.bundleName);
            if (bundle) {
                bundle.load(this.taskData.imgList[taskIndex], cc.SpriteFrame, (err: Error, asset: cc.SpriteFrame) => {
                    this.node.getChildByName('task').getComponent(cc.Sprite).spriteFrame = asset;
                    this.node.active = true;
                    resolve();
                });
            }
        });
    }

    private showSealSpine(complete) {
        if (!complete) {
            return
        }
        let sealNode = this.node.getChildByName("sealNode");
        sealNode.active = true;
        let sk = sealNode.getComponent(sp.Skeleton);
        let en: sp.spine.TrackEntry = sk.setAnimation(0, "gaizhang", false);
        sk.setTrackCompleteListener(en, () => {
            AudioManager.playEffect("common", `gameTask/audio/SE_luoyefense_03`);
            AudioManager.playEffect("common", `gameTask/audio/6_congratulations`);
        });
    }

    private moveAni(params, callFuc) {
        this.params = params;
        cc.tween(this.node)
            .by(this.moveTime, { x: -this.moveLen })
            .call(() => {
                params.callFunc1 && params.callFunc1();
                callFuc && callFuc();
                this.topBtn.active = true;

            })
            .delay(this.taskHideTime)
            .call(() => {
                params.callFunc2 && params.callFunc2();
                this.topBtn.active = false;
            })
            .by(this.moveTime, { x: this.moveLen })
            .call(() => {
                params.callFunc3 && params.callFunc3();
                let sealNode = this.node.getChildByName("sealNode");
                sealNode.active = false;
            })
            .start();
    }

    public onTopBtnClicked(event) {
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .by(this.moveTime, { x: this.moveLen })
            .call(() => {
                this.params && this.params.callFunc3 && this.params.callFunc3();
                let sealNode = this.node.getChildByName("sealNode");
                sealNode.active = false;
            })
            .start();

        // btn
        this.topBtn.active = false;
        // call fun
        this.params && this.params.callFunc2 && this.params.callFunc2();
    }

}


