import { kit } from "../../../../kit/kit";
import { STATE_TO_HALL } from "../../../../Script/config/event";
import { GameDataManager } from "../../../../Script/manager/GameDataManager";
import { GameItemData } from "../../../../Script/structure/interfaceVo";
import gameIconItem from "./gameIconItem";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GameList extends cc.Component {

    @property(cc.Prefab)
    public itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    public listNode: cc.Node = null;

    public onLoad() {
        this.initList()
    }

    public initList() {
        // 加载绘本列表
        let gameData: any = GameDataManager.instance.getGameListData();
        gameData.forEach((element: GameItemData) => {
            let bookItem: cc.Node = cc.instantiate(this.itemPrefab);
            let pictureBookItemComponent: gameIconItem = bookItem.getComponent<gameIconItem>(gameIconItem);
            pictureBookItemComponent.init(element);
            this.listNode.addChild(bookItem);
        });
    }
    public onBackClick(): void {
        kit.manager.Event.emit(STATE_TO_HALL);
    }
    public onDestroy() {

    }

}
