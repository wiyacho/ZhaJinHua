import ResourcesManager, { ResourceType } from "../../../../kit/manager/ResourcesManager";
import EventSystem from "../../../../kit/system/event/EventSystem";
import { SpineUtils } from "../../../common/utils/SpineUtils";
import PaokuCollisionComponent from "./PaokuCollisionComponent";
import PaoKuPlayerConfigBase from "./PaokuConfigBase";
import { ColliderGroup } from "./PaokuEnum";
import PaokuGameAudio from "./PaokuGameAudio";
import PaokuGameController, { PaokuState } from "./PaokuGameController";
import PaokuProp from "./PaokuProp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PaoKuPlayer extends cc.Component {

    private playerSpine: sp.Skeleton;
    private playerNode: cc.Node;

    private config: PaoKuPlayerConfigBase;

    private controller: PaokuGameController;

    private speedY = 0;

    private startPosY = 0;

    private isJumping = false;
    private isBigJump = false;

    // 是不是道具倒计时到了该从大变小
    private isTimeToSmall = false;

    onLoad() {
        EventSystem.on("PaikuOnCollisionEnter", this.onCollisionEnter, this);
        //EventSystem.on("PaikuOnCollisionStay", this.onCollisionStay, this);
        EventSystem.on("PaikuOnCollisionExit", this.onCollisionExit, this);
    }

    /** 初始化角色 */
    public initPlayer() {
        let controller = PaokuGameController.instance;
        let level = controller.currentLevel;
        // 加载角色 
        this.config = controller.GameConfig;
        this.controller = controller;
        let posX = cc.winSize.width / 3;
        ResourcesManager.instance.loadRes(this.config.bundleName, `prefabs/player/player_level${level}`, ResourceType.Normal, cc.Prefab, (e, res: cc.Prefab) => {
            let prefab = cc.instantiate(res);
            this.node.addChild(prefab);
            prefab.x = -posX;
            this.playerSpine = prefab.getComponentInChildren(sp.Skeleton);
            // 角色添加碰撞
            prefab.addComponent(PaokuCollisionComponent);
            this.playerNode = prefab;
            this.playIdle();
            this.scheduleOnce(() => {

                this.startPosY = prefab.y - 10;
            }, 1);
        });
    }

    // move
    public playMove() {
        // 不打断结束动画
        if (this.playerSpine.animation == this.config.anim_happy) {
            return;
        }
        if (this.controller.currentPaokuState == PaokuState.onEnterProp) {
            SpineUtils.playSpine(this.playerSpine, this.config.anim_big_move, true);
        }
        SpineUtils.playSpine(this.playerSpine, this.config.anim_move, true);
    }

    public playIdle() {
        SpineUtils.playSpine(this.playerSpine, this.config.anim_idle, true);

    }

    public playJump() {
        if (this.isJumping) {
            return;
        }
        PaokuGameAudio.instance.jump();
        this.isJumping = true;
        this.speedY = this.config.jumpHeight;
        if (this.config.anim_jump_up != "") {
            SpineUtils.playSpine(this.playerSpine, this.config.anim_jump_up, false);
        }
    }

    /** 变大跳跃 */
    public playBigJump () {
        if (this.isBigJump) {
            return;
        }
        
        // 在表小过程中点跳不执行
        if (this.playerSpine.animation == this.config.anim_big_to_small) {
            return;
        }
        this.isBigJump = true;
        PaokuGameAudio.instance.jump();

        if (this.config.anim_big_jump && this.config.anim_big_jump != "") {
            this.scheduleOnce(() => {
                PaokuGameAudio.instance.playBoom();
                let camera = cc.Camera.main.node;
                cc.tween(camera)
                .by(0.1, {y: -10})
                .by(0.06, {y: 10})
                .start();
            }, 0.4)
            SpineUtils.playSpine(this.playerSpine, this.config.anim_big_jump, false, () => {
                this.isBigJump = false;
                PaokuGameAudio.instance.run();
                SpineUtils.playSpine(this.playerSpine, this.config.anim_big_move, true);
                this.controller.isCanClick = true;
            }, 1);
        }
    }

    public playHeart(cb: () => void) {
        if (this.config.anim_heart != "") {
            SpineUtils.playSpine(this.playerSpine, this.config.anim_heart, false, () => {
                cb();
            }, 1);
        }
    }

    public playHappy (cb: () => void) {
        PaokuGameAudio.instance.playHappy();
        SpineUtils.playSpine(this.playerSpine, this.config.anim_happy, true, () => {
            cb();
        }, 1, this.config.anim_happy, true);
    }

    /** 从小变大 */
    public playBig() {
        PaokuGameAudio.instance.playBig();
        SpineUtils.playSpine(this.playerSpine, this.config.anim_small_to_big, false, () => {
            SpineUtils.playSpine(this.playerSpine, this.config.anim_big_move, true);
            let box = this.playerNode.getComponent(cc.BoxCollider);
            box.offset = cc.v2(0, 125);
            box.size  = new cc.Size(60, 400);
            this.controller.isCanClick = true;
        }, 1);
    }

    /** 从大变小 */
    public plauSmall(cb?: () => void) {
        this.isBigJump = false;
        PaokuGameAudio.instance.playSmall();
        let box = this.playerNode.getComponent(cc.BoxCollider);
        box.offset = cc.v2(0, 0);
        box.size  = new cc.Size(60, 150);    
        SpineUtils.playSpine(this.playerSpine, this.config.anim_big_to_small, false, ()=> {
            cb && cb();
        });
    }

    public playLook(cb: () => void) {
        PaokuGameAudio.instance.playTaitou();
        if (this.config.anim_look != "") {
            SpineUtils.playSpine(this.playerSpine, this.config.anim_look, false, cb, 1);
        }
    }

    public moveCenter (cb: () => void, time: number = 2, x?: number) {
        this.playMove();
        if (x) {
            cc.tween(this.playerNode)
            .to(0, {x: x})
            .to(time, {x: 0})
            .call(() => {
                cb && cb();
            })
            .start();
            return;
        }
        cc.tween(this.playerNode)
        .to(time, {x: 0})
        .call(() => {
            cb && cb();
        })
        .start();
    }

    public moveGamePos (cb: () => void) {
        let posX = cc.winSize.width / 3;
        this.playMove();
        cc.tween(this.playerNode)
        .to(1, {x: -posX})
        .call(() => {
            cb();
        }) 
        .start();
    }

    /** 移出屏幕 */
    public moveOut (cb: () => void) {
        this.playMove();
        cc.tween(this.playerNode)
        .to(3, {x: cc.winSize.width / 2 + this.playerNode.width})
        .call(() => {
            cb && cb();
        })
        .start();
        //this.playerNode.getComponent(cc.BoxCollider).enabled = false;
    }

    public moveIn (cb: () => void) {
        this.playerNode && this.playerNode.destroy();
        let level = this.controller.currentLevel;
        // 加载角色 
        let posX = cc.winSize.width / 3;
        ResourcesManager.instance.loadRes(this.config.bundleName, `prefabs/player/player_level${level}`, ResourceType.Normal, cc.Prefab, (e, res: cc.Prefab) => {
            if (!cc.isValid(this.node)) {
                return;
            }
            let prefab = cc.instantiate(res);
            this.node.addChild(prefab);
            prefab.x = -cc.winSize.width / 2 - prefab.width;
            this.playerSpine = prefab.getComponentInChildren(sp.Skeleton);
            // 角色添加碰撞
            prefab.addComponent(PaokuCollisionComponent);
            this.playerNode = prefab;
            this.playMove();

            cc.tween(prefab)
            .to(2, {x: -posX})
            .call(() => {
                cb && cb();
            })
            .start();
        });
    }

    update(dt: number) {
        if (!this.isJumping) {
            return;
        }
        if (!cc.isValid(this.playerNode)) {
            return;
        }
        if (this.speedY) {
            this.playerNode.y += this.speedY * dt;
        }
        // 跳到空中的动画
        if (this.speedY == 0) {
            // 跳起来吃到道具不播放
            if (PaokuGameController.instance.currentPaokuState != PaokuState.onEnterProp && this.config.anim_jump_stay != "") {
                SpineUtils.playSpine(this.playerSpine, this.config.anim_jump_stay, false);
            }
        }
        // 下降动画
        if (this.speedY < 100 && this.playerSpine.animation != this.config.anim_jump_down && this.controller.currentPaokuState == PaokuState.onJumpState) {
            if (this.config.anim_jump_stay != "" && this.config.anim_jump_down != "") {
                this.playerSpine.setMix(this.config.anim_jump_stay, this.config.anim_jump_down, 0.1);
                SpineUtils.playSpine(this.playerSpine, this.config.anim_jump_down, false);
            }
        }
        this.speedY = Math.max(this.speedY - 50, -600);//模拟重力
        // 防止掉到地面下
        if (this.playerNode.y <= this.startPosY) {
            this.playerNode.y = this.startPosY;
        }

        // 吃到道具就在原地跑动
        if (PaokuGameController.instance.currentPaokuState == PaokuState.onEnterProp) {
            this.isJumping = false;
            this.speedY = 0;
            cc.tween(this.playerNode)
            .to(0.3, {y: this.startPosY})
            .start();
        }
    }


    //todo aabb reset, but still check by preAabb, result 'this.colliderTarget = other.node'
    onCollisionEnter(data) {
        let other: cc.BoxCollider, self: cc.BoxCollider;
        other = data.data.other;
        self = data.data.self;
        let selfW = self.world;
        let otherW = other.world;
        if (other.node.group == ColliderGroup.FLOOR) {
            
            if (otherW.preAabb.xMin > selfW.preAabb.xMax && otherW.aabb.xMin <= selfW.aabb.xMax) {//人物右边刚开始碰撞floor左边
                if (otherW.preAabb.yMax <= selfW.preAabb.yMin) {
                    // cc.log("左侧进入 人物下边缘>=floor上边缘")
                    this.setPositionToRun(other);
                } else if (otherW.preAabb.yMin <= selfW.preAabb.yMin) {
                    // cc.log("左侧进入 人物下边缘>=floor下边缘")
                    this.setPositionToRun(other);
                } else {
                    // cc.log("左侧进入 人底边<floor 上下两边")
                    // this.colliderTarget = other.node;
                }
            } else if (otherW.preAabb.yMax <= selfW.preAabb.yMin) {//top to bottom
                // cc.log("人物下边缘碰撞floor上边缘");
                this.setPositionToRun(other);
            } else if (otherW.preAabb.yMin >= selfW.preAabb.yMax) {//bottom to top

            } else {
                cc.log("其他情况")
            }
        }
        if (other.node.group == ColliderGroup.GROUP) {
            // 是不是引导
            if (other.node.name == "guideNode") {
                EventSystem.emit("PaokuGuide");
                return;
            }
            let cmpt = other.node.parent.getComponent(PaokuProp);
            EventSystem.emit("PaokuEnterProp", cmpt);
        }

        // 碰撞障碍
        if (other.node.group == ColliderGroup.OBSTACLE) {
            EventSystem.emit("paokuEnterObstacle", other.node);
        }
    }

    // onCollisionStay(data) {
    //     let other: cc.BoxCollider, self: cc.BoxCollider;
    //     other = data.data.other;
    //     self = data.data.self;
    // }

    setPositionToRun(other: cc.BoxCollider) {//使人物保持当前位置
        if (this.controller.currentPaokuState == PaokuState.onGameOver) {
            this.playMove();
        }
        this.isJumping = false;
        this.speedY = 0;
        let floorv = cc.v2(this.node.x, other.world.aabb.yMax);
        this.playerNode.y = other.node.parent.convertToNodeSpaceAR(floorv).y + this.playerNode.height / 2;
        if (this.controller.currentPaokuState == PaokuState.onJumpState) {
            this.controller.goState(PaokuState.onMoveState);
        }
    }

    onCollisionExit(data) {
        let other: cc.BoxCollider, self: cc.BoxCollider;
        other = data.data.other;
        self = data.data.self;
        let selfW = self.world;
        let otherW = other.world;
        // 变大不处理
        if (PaokuGameController.instance.currentPaokuState == PaokuState.onEnterProp && this.playerNode.y < 0) {
            return;
        }
        // 从其他地上离开
        switch (other.node.group) {
            case ColliderGroup.FLOOR: // 与Floor碰撞
                if (otherW.preAabb.xMax < selfW.preAabb.xMin + self.node.width / 2) {
                    // cc.log("左侧进入 人物下边缘>=floor上边缘")
                    if (!other.node.name.startsWith("map_") && !this.isJumping) {
                        this.isJumping = true;
                        this.speedY = -400;
                    }
                }
                break;
        }

    }

    onDestroy() {
        EventSystem.off("PaikuOnCollisionEnter", this.onCollisionEnter, this);
       // EventSystem.off("PaikuOnCollisionStay", this.onCollisionStay, this);
        EventSystem.off("PaikuOnCollisionExit", this.onCollisionExit, this);
    }
}
