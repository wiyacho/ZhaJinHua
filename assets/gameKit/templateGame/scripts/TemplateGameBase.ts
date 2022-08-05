import { LIFE_CYCLE_COMPLETE } from "../../../kit/events/events";
import ResourcesManager, { ResourceType } from "../../../kit/manager/ResourcesManager";
import EventSystem from "../../../kit/system/event/EventSystem";
import ChapterGameComponent from "../../common/scripts/ChapterGameComponent";
import { RoundStateType } from "../../common/structure/CompEnum";
import { Comp2TemplateParams } from "../../common/structure/CompInterface";
import LevelIndicator from "../levelIndicator/scripts/LevelIndicator";
import ComponentBase from "./ComponentBase";


const {ccclass, property} = cc._decorator;

@ccclass
export default class TemplateGameBase extends ChapterGameComponent {

    @property({ type: [cc.Node], displayName: "环节互动组件" })
    roundNodeArr:cc.Node[] = [];

    //当前游戏环节
    curRoundIndex:number = 0;
    //游戏总环节（可以在initData重新赋值）
    MaxRoundIndex:number = 4;


    //当前环节游戏结果
    curRoundResult: Comp2TemplateParams = null;

    //环节指示器
    levelIndicator:LevelIndicator = null;

    curRoundStateType:RoundStateType = RoundStateType.None;

    onLoad () {
        super.onLoad();
        this.initLevelIndicator();
        this.change2NextRound();
    }

    onDestroy() {
        super.onDestroy();
    }

    initLevelIndicator(){
        ResourcesManager.instance.loadRes("templateGame", "levelIndicator/prefab/levelIndicator", ResourceType.Normal,cc.Prefab, (err:Error, asset:cc.Prefab)=>{
            let node = cc.instantiate(asset);
            let size = cc.winSize;
            this.levelIndicator = node.getComponent(LevelIndicator);
            this.levelIndicator.initData(this.MaxRoundIndex);
            this.node.addChild(node);
            node.x = size.width / 2 - 30;
            node.y = size.height / 2 - 70;
        });
    }

    roundStateTypeChanged(stateType: RoundStateType, params?: Comp2TemplateParams){
        this.curRoundStateType = stateType;
        cc.log("===>stateType: ", stateType)
        switch (stateType) {
            case RoundStateType.RoundOpenAniStart:
                this.openAniStart();
                break;
            case RoundStateType.RoundOpenAniComplete:
                this.openAniComplete();
                break;
            case RoundStateType.RoundStart:
                this.roundStart();
                break;
            case RoundStateType.RoundProceeding:
                this.roundProceeding(params);
                break;
            case RoundStateType.RoundComplete:
                this.roundComplete(params);
                break;
            case RoundStateType.RoundEndAniStart:
                this.endAniStart();
                break;
            case RoundStateType.RoundEndAniComplete:
                this.endAniComplete();
                break;
        }
    }

    // 开场动画开始
    openAniStart(){ }
    // 开场动画播完
    openAniComplete() { 
        this.roundStateTypeChanged(RoundStateType.RoundStart);
    }
    // 环节开始
    roundStart(){
        // 最后一个round是语音题，默认写死
        if (this.curRoundIndex == this.MaxRoundIndex - 1) {
            this.startAudioCallFunc();
        }else{
            for (let index = 0; index < this.roundNodeArr.length; index++) {
                const node = this.roundNodeArr[index];
                node.active = (this.curRoundIndex === index);
            }
        }
    }
    // 环节进行中 状态同步
    roundProceeding(params: Comp2TemplateParams){ }
    // 环节完成
    roundComplete(params: Comp2TemplateParams){
        this.curRoundResult = params;
        this.updateRoundStateDisplay();
        this.roundStateTypeChanged(RoundStateType.RoundEndAniStart, params);
        
    }
    // 完成动画开始播放
    endAniStart() { }
    // 完成动画播放结束
    endAniComplete() {
        cc.log(`===>>> curRoundIndex: ${this.curRoundIndex}    MaxRoundIndex:${this.MaxRoundIndex}`)
        this.curRoundIndex++;
        if (this.curRoundIndex>=this.MaxRoundIndex) {
            this.gameEnd();
        }else{
            this.change2NextRound();
        }
    }

    //开始语音测评
    startAudioCallFunc(){
        cc.warn(" 开始语音测评，重写startAudioCallFunc");
    }

    gameEnd(){
        cc.log("game end!");
        //游戏结束
        EventSystem.emit(LIFE_CYCLE_COMPLETE);
    }

    async change2NextRound(){
        await this.gameRoundInit();
        this.roundStateTypeChanged(RoundStateType.RoundOpenAniStart);
    }

    gameRoundInit(){
        for (let index = 0; index < this.roundNodeArr.length; index++) {
            const node = this.roundNodeArr[index];
            node.active = false;
        }

        if (this.roundNodeArr[this.curRoundIndex]) {
            this.roundNodeArr[this.curRoundIndex].getComponent(ComponentBase).initData(this);
        }else{
            cc.log(`this.roundNodeArr[this.curRoundIndex] nil!  curRoundIndex: ${this.curRoundIndex} `)
        }
    }

    /**
     * 关卡指示器
     */
    updateRoundStateDisplay(){
        if (!cc.isValid(this.node)) {
            return
        }
        this.levelIndicator.updateCurIndicator(this.curRoundIndex, !!this.curRoundResult.win);
    }

}



