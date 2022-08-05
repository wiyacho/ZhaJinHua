import AudioManager from "../../../../kit/system/audio/AudioManager";
import EventSystem from "../../../../kit/system/event/EventSystem";
import BackgroundComponent from "./BackgroundComponent";
import GameMapComponent from "./GameMapComponent";
import PaoKuPlayerConfigBase from "./PaokuConfigBase";
import { PropType } from "./PaokuEnum";
import PaokuGameSystem from "./PaokuGameSystem";
import PaokuProp from "./PaokuProp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaokuGameController {
    private static _instance: PaokuGameController = null;
    public static get instance (): PaokuGameController {
        if (!PaokuGameController._instance) {
            PaokuGameController._instance = new PaokuGameController();
        }
        return PaokuGameController._instance;
    }

    mapComponent: GameMapComponent = null;

    backgroundComponent: BackgroundComponent = null;

    /** 跑酷状态 */
    private paokuSystem;
    public currentPaokuState: PaokuState;

    private gameConfig: PaoKuPlayerConfigBase;
    public get GameConfig (): PaoKuPlayerConfigBase{
        return this.gameConfig;
    }

    public isCanClick = false;

    // 当前关卡level
    public currentLevel = 1;

    // 引导是否结束
    private isOverGuide = false;

    // 只出现没吃满的单词
    public isShowCurrentLevel = false;
    public propCount = 1;

    public initGame (paokuSystem: PaokuGameSystem, gameConfig: PaoKuPlayerConfigBase, mapCmpt: GameMapComponent, backgroundComponent: BackgroundComponent) {
        this.paokuSystem = paokuSystem;
        this.gameConfig = gameConfig;
        this.mapComponent = mapCmpt;
        this.backgroundComponent = backgroundComponent;
        this.currentPaokuState = PaokuState.onGameStart;
        this.goState(PaokuState.onGameStart);
        
        this.isOverGuide = false;
        EventSystem.on("PaokuGameClick", this.onClick, this);
        EventSystem.on("PaokuEnterProp", this.onHandleProp, this);
        EventSystem.on("PaokuGuide", this.onGuide, this);
        EventSystem.on("paokuLevelEnd", this.onLevelEnd, this); 
        EventSystem.on("paokuFollowReady", this.onFollowReady, this); 
        EventSystem.on("paokuEnterObstacle", this.onEnterObstacle, this); 

        
    }

    private pushState = [PaokuState.onGameOver, PaokuState.onEnterObstacle, PaokuState.onJumpState, PaokuState.onMoveState, PaokuState.onGuideStep, PaokuState.onFollowRead, PaokuState.onNextLevel, PaokuState.onEnterProp]
    public goState (state: PaokuState, parms?: any) {
        if (this.currentPaokuState == PaokuState.onGameOver) {
            return;
        }
        if (this.pushState.indexOf(state) > -1) {
            if (this.currentPaokuState == PaokuState.onEnterProp && state == PaokuState.onJumpState) {
                this.currentPaokuState = PaokuState.onEnterProp;
            } else {
                this.currentPaokuState = state;
            }
        }
        this.paokuSystem[state] &&  this.paokuSystem[state](parms);
    }

    /** 开始移动 */
    public go() {
        this.backgroundComponent.speed = this.gameConfig.backGroundMoveSpeed;
        this.backgroundComponent.isRunmap = true;
        this.mapComponent.setMapSpeed(this.gameConfig.frountNodeMoveSpeed);
        this.isCanClick = true;
    }

    /** 加速移动 */
    public speedUp () {
        this.backgroundComponent.speed *= 4;
        this.mapComponent.speed *= 2;
    }

    /** 停止移动 */
    public stopMove () {
        this.backgroundComponent.isRunmap = false;
        cc.log("停止移动");
        this.mapComponent.setMapSpeed(0);
    }

    /** 点击事件 */
    public onClick () {
        if (!this.isCanClick) {
            return;
        }
        if (this.currentPaokuState == PaokuState.onFollowRead) {
            return;
        }
        // 吃到道具 变大
        if (this.currentPaokuState == PaokuState.onEnterProp) {
            this.goState(PaokuState.onJumpState, "big");
            return;
        }
        this.isOverGuide = true;
        if (this.currentPaokuState == PaokuState.onGuideStep) {
            this.go();
            this.isOverGuide = true;
        }
        if (!this.isOverGuide) {
            return;
        }
        this.goState(PaokuState.onJumpState);
    }

    // 处理吃到道具
    public onHandleProp (data) {
        let cmpt: PaokuProp = data.data;
        if (!cmpt) {
            return;
        }
        if (!this.isCanClick) {
            return;
        }
        cmpt.onEnter();
        if (cmpt.type == PropType.CONSUME) {
            this.goState(PaokuState.onEnterProp);
        } else if (cmpt.type == PropType.WORD) {
            this.goState(PaokuState.onEnterEnergy, cmpt.wordType);
        }
    }

    /** 碰到障碍 */
    public onEnterObstacle (data) {
        let node = data.data as cc.Node;
        if (this.currentPaokuState == PaokuState.onEnterProp) {
            // 撞飞
            cc.tween(node)
            .by(1, {x: 80, y: 120, angle: 1000, opacity: -255, scale: -1})
            .start();
            return;
        }
        node.active = false;
        this.stopMove();
        this.isCanClick = false;
        cc.log("障碍碰撞");
        this.goState(PaokuState.onEnterObstacle)
    }

    public onGuide () {
        if (this.isOverGuide) {
            return;
        }

        this.stopMove();
        this.goState(PaokuState.onGuideStep);
    }

    public onLevelEnd () {
        cc.log("当前关结束");
        // 是否需要跟读
        if (this.gameConfig.LevelData[this.currentLevel].needfollow) {
            EventSystem.emit("paokuRecordMoveIn");
            EventSystem.emit("hideProp");
            return;
        }
        if (this.currentLevel > this.gameConfig.levelCount) {
            EventSystem.emit("hideProp");
            // 游戏结束
            this.goState(PaokuState.onGameOver);
            return;
        }
        // 切换下一关
        this.goState(PaokuState.onNextLevel);
    }   

    public onFollowReady () {
        cc.log("跟读页面");
        this.stopMove();
        // 进入跟读环节
        this.goState(PaokuState.onFollowRead);
    }

    public onFollowEnd(): boolean {
        // 恢复背景音乐
        AudioManager.resumeMusic();
        this.currentLevel ++;
        if (this.currentLevel > this.gameConfig.levelCount) {
            // 游戏结束
            this.goState(PaokuState.onGameOver);
            return true;
        }
        cc.log("设置跟读结束");
        this.goState(PaokuState.onMoveState);
        return false;
    }

    public release () {
        PaokuGameController._instance = null;
        EventSystem.off("PaokuGameClick", this.onClick, this);
        EventSystem.off("PaokuEnterProp", this.onHandleProp, this);
        EventSystem.off("PaokuGuide", this.onGuide, this);
        EventSystem.off("paokuLevelEnd", this.onLevelEnd, this); 
        EventSystem.off("paokuFollowReady", this.onFollowReady, this); 
        EventSystem.off("paokuEnterObstacle", this.onEnterObstacle, this);
    }

}

export enum PaokuState {
    // 游戏开始
    onGameStart = "onGameStart",
    // 开场动画结束
    onStartAni = "onStartAni",
    /** 跳跃 */
    onJumpState = "onJumpState",
    /** 吃到道具跳跃 */
    onPropJump = "onPropJump",
    /** move */
    onMoveState = "onMoveState",
    // 引导环节
    onGuideStep = 'onGuideStep',
    /** 回答正确 */
    onAnswerCorrect = 'onAnswerCorrect',
    /** 回答错误 */
    onAnswerWrong = 'onAnswerWrong',
    /** 激励后 */
    onInspirinAfter = 'onInspirinAfter',
    // 跟读环节
    onFollowRead = 'onFollowRead',
    // 碰到障碍
    onEnterObstacle = 'onEnterObstacle',
    // 吃到道具
    onEnterProp = 'onEnterProp',
    // 吃到学习点
    onEnterEnergy = 'onEnterEnergy',
    // 切换下一关
    onNextLevel = 'onNextLevel',
    // 游戏结束
    onGameOver = 'onGameOver'
}
