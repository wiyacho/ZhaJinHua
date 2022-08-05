import { kit } from "../../kit/kit";
import { URL_BASE } from "../../Script/config/config";
import IGameBoardItemConfig from "./IGameBoardItemConfig";
import GameBoardItem from "./gameBoardItem";

const { ccclass, property } = cc._decorator;

/**
 * 游戏列表 内部使用
 */
@ccclass
export default class GameBoard extends cc.Component implements kit.fsm.Entity {

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.JsonAsset)
    configJson: cc.JsonAsset = null;

    @property(cc.Node)
    listNode: cc.Node = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;


    @property(cc.Node)
    uiNode: cc.Node = null;


    @property(cc.Node)
    contentNode: cc.Node = null;


    private list: IGameBoardItemConfig[]
    private itemList: GameBoardItem[];

    public sid: string = 'Main';
    public stateMachine: kit.fsm.StateManager<GameBoard>;
    public host: string = URL_BASE;

    start() {

    }

    async onLoad() {
        this.list = this.configJson.json.list;
        this.itemList = [];

        this.titleLabel.string = `中文游戏,总数量：${this.list.length}`;

        this.list.forEach((element: IGameBoardItemConfig) => {
            let node: cc.Node = cc.instantiate(this.itemPrefab);
            let item: GameBoardItem = node.getComponent(GameBoardItem);
            item.setData(element);
            this.itemList.push(item);
            this.listNode.addChild(node);
        })
    }
}


