import ResourcesManager, { ResourceType } from "../../../kit/manager/ResourcesManager";
import EventSystem from "../../../kit/system/event/EventSystem";
import PaokuGameController from "../paokuGameCopmonent/scripts/PaokuGameController";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PaokuFollowCmpt extends cc.Component {

    private posY;
    onLoad() {
        cc.log("注册开始录音");
        EventSystem.on("paokuRecordMoveIn", this.moveIn, this);
        // 事件
        EventSystem.on("paokuRecord", this.startRecord, this);
        EventSystem.on("paokuRecordEnd", this.end, this);
        let wordIcon = this.node.getChildByName("wordIcon");
        this.posY = wordIcon.y
        this.node.active = false;
    }

    moveIn () {
        let posX = cc.winSize.width / 2 + this.node.width;
        this.node.x = posX;

        cc.tween(this.node)
        .delay(0.5)
        .call(() => {
            this.node.active = true;
        })
        .to(3, {x: 0})
        .call(() => {
            EventSystem.emit("paokuFollowReady");
        })
        .start();
        let anim = this.node.getChildByName("recordNode").getComponent("recordAin");
        let config = PaokuGameController.instance.GameConfig;
        let wordIconSprite = this.node.getChildByName("wordIcon").getComponent(cc.Sprite);
        let wordSprite = this.node.getChildByName("word").getComponent(cc.Sprite);
        wordIconSprite.node.y = this.posY;
        ResourcesManager.instance.loadRes(config.bundleName, `textures/level/follow_card_level${PaokuGameController.instance.currentLevel}`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
            wordIconSprite.spriteFrame = res;
            wordIconSprite.node.scale = 0;
            anim.setWord(null, res);

        });
        ResourcesManager.instance.loadRes(config.bundleName, `textures/level/follow_level${PaokuGameController.instance.currentLevel}`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
            wordSprite.spriteFrame = res;
            anim.setWord(res, null);
        });
        anim.node.active = false;
    }

    moveOut () {
        let posX = - cc.winSize.width / 2 - this.node.width;
        cc.tween(this.node)
        .to(5, {x: posX})
        .call(() => {
            this.node.active = false;
        })
        .start();
    }

    hideRecord () {
        let anim = this.node.getChildByName("recordNode");
        anim.active = false;
    }

    showRecord () {
        let anim = this.node.getChildByName("recordNode");
        anim.active = true;
    }

    startRecord() {
        cc.log("开始倒计时");
        let time = 3;
        if (PaokuGameController.instance.GameConfig.LevelData.recordTime) {
            time = PaokuGameController.instance.GameConfig.LevelData.recordTime;
        }
        let anim = this.node.getChildByName("recordNode").getComponent("recordAin");
        anim.initeAniFun(time);
    }

    end() {
        let anim = this.node.getChildByName("recordNode").getComponent("recordAin");
        anim.stopAni();
    }


    shank () {
        let wordIconSprite = this.node.getChildByName("wordIcon").getComponent(cc.Sprite);
        wordIconSprite.node.scale = 0.5;
        cc.tween(wordIconSprite.node)
        .to(0.5, {scale: 1})
        .to(0.2, {scale: 0.5})
        .start();
    }

    onDestroy() {
        EventSystem.off("paokuRecordMoveIn", this.moveIn, this);
        EventSystem.off("paokuRecordEnd", this.end, this);
        EventSystem.off("paokuRecord", this.startRecord, this);
    }
}
