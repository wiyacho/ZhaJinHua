import ResourcesManager, { ResourceType } from "../../../../kit/manager/ResourcesManager";
import AudioManager from "../../../../kit/system/audio/AudioManager";
import ChapterGameComponent from "../../../common/scripts/ChapterGameComponent";
import { SpineUtils } from "../../../common/utils/SpineUtils";
import BackgroundComponent from "./BackgroundComponent";
import GameMapComponent from "./GameMapComponent";
import PaokuClickComponent from "./PaokuClickComponent";
import PaokuCollectComponent from "./PaokuCollectComponent";
import PaoKuPlayerConfigBase from "./PaokuConfigBase";
import { WordType } from "./PaokuEnum";
import PaokuGameAudio from "./PaokuGameAudio";
import PaokuGameController, { PaokuState } from "./PaokuGameController";
import PaokuGameSystem from "./PaokuGameSystem";
import PaoKuPlayer from "./PaoKuPlayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaokuEntity extends ChapterGameComponent {
    // 游戏角色
    @property(PaoKuPlayer)
    playerNode: PaoKuPlayer = null;
    // config
    public gameConfig: PaoKuPlayerConfigBase;

    public controller = PaokuGameController.instance;

    // 道具填充
    public paokuCollectCmpt: PaokuCollectComponent;

    public recordTryTime = 0;

    onLoad () {
        var manager = cc.director.getCollisionManager(); //
　　     manager.enabled = true; // 开启碰撞
        // manager.enabledDebugDraw = true;
        super.onLoad();
    }

    
    public create (gameSystem: PaokuGameSystem, gameConfig: PaoKuPlayerConfigBase) {
        gameSystem.entity = this;
        PaokuGameAudio.instance.setBundleName(gameConfig.bundleName);
        this.gameConfig = gameConfig;
        this.paokuCollectCmpt = this.node.getComponentInChildren(PaokuCollectComponent);
        // this.playerNode = cc.find("paokuGameNode/player_node", this.node).getComponent(PaoKuPlayer);
        // 点击组件
        this.node.addComponent(PaokuClickComponent);
        let mapCmpt = cc.find("paokuGameNode/mapNode", this.node).getComponent(GameMapComponent);
        let backCmpt = cc.find("paokuGameNode/backgroundNode", this.node).getComponent(BackgroundComponent);
        this.controller.initGame(gameSystem, gameConfig, mapCmpt, backCmpt);
        this.paokuCollectCmpt.initFill();

    }

    // 游戏开始
    onGameStart () {
        // 播放倒数动画
        cc.log("11111");
        PaokuGameAudio.instance.bgm();
        ResourcesManager.instance.loadRes(this.gameConfig.bundleName, "prefabs/cutDown", ResourceType.Normal, cc.Prefab, (e, res: cc.Prefab) => {
            if (res) {
                let cutDown = cc.instantiate(res);
                this.node.addChild(cutDown);
                let spine = cutDown.getComponent(sp.Skeleton);
                PaokuGameAudio.instance.ready_go();
                let cutDownAnim = "123-go";
                if (this.gameConfig.LevelData.cutDownAnim) {
                    cutDownAnim = this.gameConfig.LevelData.cutDownAnim
                }
                SpineUtils.playSpine(spine, cutDownAnim, false, () => {
                    cutDown.destroy();
                    this.controller.goState(PaokuState.onStartAni);
                }, 1)
            }
        });
        
    }

    onGuaide () {
        this.playerNode.playIdle();
        ResourcesManager.instance.loadRes("templateGame", "paokuGameCopmonent/prefab/hand", ResourceType.Normal, cc.Prefab, (e, res) => {
            if (this.controller.currentPaokuState == PaokuState.onJumpState) {
                return;
            }
            let hand = cc.instantiate(res);
            this.node.addChild(hand);
            this.scheduleOnce(() => {
                this.controller.isCanClick = true;
            }, 1)
        });
    }

    onMove () {
        this.playerNode.playMove();
        PaokuGameAudio.instance.run();
    }

    // 开始动画结束
    onStartAniEnd () {
        // 设置背景移动
        this.controller.go();
        this.playerNode.playMove();
    }

    // 跳跃
   onJump (type) {
        PaokuGameAudio.instance.stopRun();
        let handeNode = this.node.getChildByName("hand");
        if (handeNode) {
            handeNode.destroy();
        }
        if (type == "big") {
            this.playerNode.playBigJump();
            return;
        }
        this.playerNode.playJump();
    }

    // 吃到变大
    onConsume () {
        this.controller.isCanClick = false;
        // this.playerNode.moveCenter(() => {

        // }, 0.6); 
        this.scheduleOnce(() => {
            if (this.controller.currentPaokuState == PaokuState.onGameOver) {
                return;
            }
            this.toSmall();
        }, 6);
        this.playerNode.playBig();
        // 加速移动
        this.controller.speedUp();
        // 变大5秒
    }  
    // 吃到单词卡
    onWord (wordType: WordType) {
        this.paokuCollectCmpt.onFill(wordType);
    }

    // // 吃到变大
    // onConsume () {
        
    //     this.controller.isCanClick = false;
    //     // this.playerNode.moveCenter(() => {

    //     // }, 0.6); 
    //     this.scheduleOnce(() => {
    //         if (this.controller.currentPaokuState == PaokuState.onGameOver) {
    //             return;
    //         }
    //         this.toSmall();
    //      }, 6);
    //     this.playerNode.playBig();
    //     // 加速移动
    //     this.controller.speedUp();
    //     // 变大5秒
    // }

    /** 变小 */
    public toSmall () {
        this.unscheduleAllCallbacks();
        if (this.controller.currentPaokuState == PaokuState.onFollowRead) {
            return;
        } 
        this.controller.isCanClick = false;
        this.playerNode.plauSmall(() => {
            // this.controller.isCanClick = true;
            if (this.controller.currentPaokuState == PaokuState.onFollowRead) {
                return;
            }   
            this.controller.go();
            this.controller.goState(PaokuState.onMoveState);
            this.controller.isCanClick = true;
        });

        // this.playerNode.moveGamePos( () => {
        //     this.controller.isCanClick = true;
        // });
       
    }

    // 进入跟读
    onEnterFollowRecord () {
        this.toSmall();
        PaokuGameAudio.instance.stopRun();
        AudioManager.passMusic();
    }

    public nextLevel () {
        this.playerNode.moveIn(() => {
            // 背景开始移动
            this.controller.goState(PaokuState.onMoveState);
            this.controller.isCanClick = true;
        });
    }

    public onEnterObstacle () {
        this.playerNode.playHeart( () => {
            this.controller.goState(PaokuState.onMoveState);
            this.controller.go();
            this.controller.isCanClick = true;
        });
    }

    public gameOver () {
        cc.log("移动到中间");
        this.controller.stopMove();
        this.controller.isCanClick = false;
        this.playerNode.moveCenter(() => {
            PaokuGameAudio.instance.stopRun();
            this.playerNode.playHappy(() => {
            });
        });
    }

    public unregisterEvent() {
        cc.log("释放controller");
        this.controller.release();
    }
}
