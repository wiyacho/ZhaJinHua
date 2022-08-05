import { kit } from "../../../kit/kit";
import { BUNDLE_ENCOURAGE_LIST } from "../../../Script/config/config";
import { REWARD_TYPE } from "../../../Script/config/enum";
import { STATE_TO_GAME, STATE_TO_PICTURE_BOOK } from "../../../Script/config/event";
import EncourageData from "./EncourageData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EncourageDetail extends cc.Component {

    // 图标
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    // 按钮绘本/游戏
    @property(cc.Sprite)
    btn_item: cc.Sprite = null;

    // contentNode
    @property(cc.Node)
    contentNode: cc.Node = null;

    private lessonId: number;

    private clickCmpt: kit.component.Click;

    init(lessonId: number) {
        this.clickCmpt = this.node.addComponent(kit.component.Click);
        this.lessonId = lessonId;
        let data = EncourageData.instance.encourageInfo(lessonId);
        let type = data.type;
        if (type == REWARD_TYPE.pictureBook) {
            // 替换图标
            kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `textures/pictureBook`, kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
                if (e) {
                    cc.log(`loadRes textures/icon/${data.iconUrl} error ${e}`);
                    return;
                }
                this.btn_item.spriteFrame = res;
            })
        }

        this.icon.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.icon.node.width = 227;
        this.icon.node.height = 227;
        kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `textures/icon/${data.iconUrl}`, kit.manager.Resources.Type.Normal, cc.SpriteFrame, (e, res) => {
            if (e) {
                cc.log(`loadRes textures/icon/${data.iconUrl} error ${e}`);
                return;
            }
            this.icon.spriteFrame = res;
        })

        this.clickCmpt.onClick(this.contentNode, this.onClose, this);
        this.clickCmpt.onClick(this.btn_item.node, this.changeGame, this);
    }

    /** 跳出到指定游戏 */
    private changeGame() {
        let gameData;
        let data = EncourageData.instance.encourageInfo(this.lessonId);
        switch (data.type) {
            case REWARD_TYPE.game:
            case REWARD_TYPE.prop:
                gameData = EncourageData.instance.gameInfo(this.lessonId);
                kit.manager.Event.emit(STATE_TO_GAME, gameData);
                break;
            case REWARD_TYPE.pictureBook:
                gameData = EncourageData.instance.bookInfo(this.lessonId);
                kit.manager.Event.emit(STATE_TO_PICTURE_BOOK, gameData);
                break;
            default:
                break;
        }
    }

    onClose() {
        this.node.destroy();
    }
}
