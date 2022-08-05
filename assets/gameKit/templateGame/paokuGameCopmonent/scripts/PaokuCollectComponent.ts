import ResourcesManager, { ResourceType } from "../../../../kit/manager/ResourcesManager";
import EventSystem from "../../../../kit/system/event/EventSystem";
import PaokuGameController from "./PaokuGameController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PaokuCollectComponent extends cc.Component {

    private totalCount: number;
    private curCount: number[] = [];

    public initFill () {
        let level = PaokuGameController.instance.currentLevel;
        let wordConfig = PaokuGameController.instance.GameConfig.LevelData[level].words;

        let count = PaokuGameController.instance.GameConfig.LevelData[level].wordCount;
        let bundle = PaokuGameController.instance.GameConfig.bundleName;
        this.totalCount = count;
        cc.log("prop count: " +  this.totalCount);
       
        for (let i = 0; i < wordConfig.length; i ++) {
            let config = wordConfig[i];
            cc.log(config);
            this.curCount[i] = 0;
            let cardBg = this.node.getChildByName(`word${config.type}_bg`).getComponent(cc.Sprite);
            let fillSprite = this.node.getChildByName(`word${config.type}_fill`).getComponent(cc.Sprite);

            ResourcesManager.instance.loadRes(bundle, `textures/level/card_level${level}_${config.type}_gray`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
                cardBg.spriteFrame = res;
            });
            ResourcesManager.instance.loadRes(bundle, `textures/level/card_level${level}_${config.type}`, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
                fillSprite.spriteFrame = res;
                fillSprite.fillRange = 0;
            })
        }
    }

    onFill (wordType): number {
        let fillSprite = this.node.getChildByName(`word${wordType}_fill`).getComponent(cc.Sprite);
        let count = this.curCount[wordType - 1];
        let step = 1 / this.totalCount;
        let from = count * step;
        let nextIndex = count + 1
        let end = nextIndex * step;
        count++;
        this.curCount[wordType - 1] = count;
        if (fillSprite.fillRange < 1) {
            // 抖动
            cc.tween(fillSprite.node)
            .by(0.3, {scale: 0.2})
            .by(0.1, {scale: -0.2})
            .start();
            cc.tween(this.node.getChildByName(`word${wordType}_bg`))
            .by(0.3, {scale: 0.2})
            .by(0.1, {scale: -0.2})
            .start();
        }
       
        cc.tween(fillSprite)
        .set({ fillRange: from })
        .to(0.3, { fillRange: end })
        .call(() => {
            for (let i = 0; i < this.curCount.length; i ++) {
                if (this.curCount[i] < this.totalCount) {
                    return;
                }
            }
            cc.log("paokuLevelEnd  + " + this.curCount + " totalCount " + this.totalCount);
            EventSystem.emit("paokuLevelEnd");
        })
        .start()
        return end;
    }

    // 单词卡飞
    fly (wordType, wordPos): Promise<void> {
        return new Promise((resolve, reject) => {
            this.appear(false);
            let nodePos = this.node.convertToNodeSpaceAR(wordPos);
            let flyNode = this.node.getChildByName(`word${wordType}_fill`);
            let cloneNode = cc.instantiate(flyNode);
            cloneNode.active = true;
            cloneNode.name = "flyNode";
            this.node.addChild(cloneNode);
            let scale = cloneNode.scale;
            cc.tween(cloneNode)
            .to(0.5, {x: nodePos.x, y: nodePos.y, scale: 0.5})
            //.delay(1)
            .call(() => {
                resolve();
                cloneNode.destroy();
            })
            .start();
        });
    }

    appear (active: boolean) {
        let level = PaokuGameController.instance.currentLevel;
        let wordConfig = PaokuGameController.instance.GameConfig.LevelData[level].words;
        for (let i = 0; i < wordConfig.length; i ++) {
            let config = wordConfig[i];
            cc.log(config);
            this.curCount[i] = 0;
            let cardBg = this.node.getChildByName(`word${config.type}_bg`);
            let fillSprite = this.node.getChildByName(`word${config.type}_fill`);
            cardBg.active = active;
            fillSprite.active = active;
        }
    }
}
