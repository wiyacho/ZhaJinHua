import ResourcesManager, { ResourceType } from "../../../../kit/manager/ResourcesManager";
import AudioManager from "../../../../kit/system/audio/AudioManager";
import EventSystem from "../../../../kit/system/event/EventSystem";
import { SpineUtils } from "../../../common/utils/SpineUtils";
import { PropType, WordType } from "./PaokuEnum";
import PaokuGameController from "./PaokuGameController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaokuProp extends cc.Component {

    @property({ type: cc.Enum(PropType),tooltip:"VERTICAL_P:垂直向下滚动  VERTICAL_N:垂直向上滚动 HORIZONTAL_P:水平向左滚动 HORIZONTAL_N:水平向右滚动" })
    propType: PropType = PropType.CONSUME;

    @property({ type: cc.Enum(WordType), tooltip: "propType 是word类型 需要选择wordType"})
    wordType: WordType = WordType.word_1;

    private consume: cc.Node;
    private word: cc.Node;


    public get type(): PropType {
        return this.propType;
    }

    start () {
        EventSystem.on("hideProp", this.hide, this);
        EventSystem.on("refeshProp", this.refesh, this);
        EventSystem.on("refeshPropLevel", this.changeLevel, this);

        this.consume = this.node.getChildByName("consume");
        this.word = this.node.getChildByName("word");

        this.consume.active = false;
        this.word.active = false;
       

        if (this.propType == PropType.CONSUME) {
            this.consume.active = true;
            return;
        }
        this.word.active = true;
        let config = PaokuGameController.instance.GameConfig;
        let level = PaokuGameController.instance.currentLevel;
        if (!this.word.getComponent(cc.Sprite)) {
            return;
        }
        if (PaokuGameController.instance.isShowCurrentLevel) {
            this.wordType = PaokuGameController.instance.propCount;
        } 
        ResourcesManager.instance.loadRes(config.bundleName, `textures/level/word_level${level}_${this.wordType}`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
            this.word.getComponent(cc.Sprite).spriteFrame = res;
        })

        this.scheduleOnce(() => {
            cc.tween(this.node)
            .sequence(
                cc.tween(this.node)
                .by(1, {y: 20}),
                cc.tween(this.node)
                .by(1, {y: -20}) )
            .repeatForever()
            .start();
        }, 0);
    }

    // 刷新下一等级单词
    public changeLevel () {
        // 地图移动node
        if (!this.IsInView()) {
            return;
        }
        let config = PaokuGameController.instance.GameConfig;
        let level = PaokuGameController.instance.currentLevel;
        this.wordType = PaokuGameController.instance.propCount;
        cc.log("替换图片");
        ResourcesManager.instance.loadRes(config.bundleName, `textures/level/word_level${level}_${this.wordType}`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
            this.word.getComponent(cc.Sprite).spriteFrame = res;
        })
    }

    private IsInView()
    {
        let cameraNode = cc.Camera.main.node;
        let wordPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        let nodePos = cameraNode.parent.convertToNodeSpaceAR(wordPos);
        if (nodePos.x > cc.winSize.width / 2 + this.node.width) {
            return true;
        }
        return false;
    }
    public hide () {
        this.node.active = false;
    }

    refesh () {
        this.consume = this.node.getChildByName("consume");
        this.word = this.node.getChildByName("word");

        this.consume.active = false;
        this.word.active = false;
       

        if (this.propType == PropType.CONSUME) {
            this.consume.active = true;
            return;
        }
        this.word.active = true;
        let config = PaokuGameController.instance.GameConfig;
        let level = PaokuGameController.instance.currentLevel;
        if (PaokuGameController.instance.isShowCurrentLevel) {
            this.wordType = PaokuGameController.instance.propCount;
        } 
        if (!this.word.getComponent(cc.Sprite)) {
            return;
        }
        ResourcesManager.instance.loadRes(config.bundleName, `textures/level/word_level${level}_${this.wordType}`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
            if (this.word) {
                this.word.getComponent(cc.Sprite).spriteFrame = res;
            }
        })
    }

    public onEnter () {
        
        if (this.propType == PropType.CONSUME) {
            this.enterConsume();
            return;
        }
        this.enterWord();
    }

    // 吃到word
    private enterWord () {
        this.word.getComponent(cc.BoxCollider).enabled = false;
        let config = PaokuGameController.instance.GameConfig;
        let level = PaokuGameController.instance.currentLevel;
        let audio = config.LevelData[level].words[this.wordType - 1].audio;
        if (config.LevelData[level].hasGameSondBundle) {
            AudioManager.playEffect("gameSound", audio);
        }else {
            AudioManager.playEffect(config.bundleName, audio);
        }
        ResourcesManager.instance.loadRes("templateGame", "paokuGameCopmonent/prefab/xingxing", ResourceType.Normal, cc.Prefab, (e, res: cc.Prefab) => {
            let prefab = cc.instantiate(res);
            this.node.addChild(prefab);
            let spine = prefab.getComponent(sp.Skeleton);
            spine.setAnimation(0, "13_1_zhengfangti xiaoshixiaoguo", false);
        });
        cc.tween(this.word)
        .to(0.5, {opacity: 0})
        .call(() => {
            this.node.active = false;
        })
        .start();
    }
    
    // 吃到消耗品 beizidangao zhujiao
    private enterConsume () {
        let spine = this.consume.getComponent(sp.Skeleton);
        if (!spine) {
            this.consume.active = false;
            return;
        }
        SpineUtils.playSpine(spine, "zhujiao", false);
    }

    onDestroy () {
        EventSystem.off("refeshProp", this.refesh, this);
        EventSystem.off("hideProp", this.hide, this);
        EventSystem.off("refeshPropLevel", this.changeLevel, this);
    }
}
