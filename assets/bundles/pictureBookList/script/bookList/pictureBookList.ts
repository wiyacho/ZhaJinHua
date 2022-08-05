import { STATE_TO_HALL } from "../../../../Script/config/event";
import { oneBookData } from "./bookListItem";
import { PicBookDataManager } from "../../../../Script/manager/PicBookDataManager";
import pictureBookItem from "./pictureBookItem";
import { kit } from "../../../../kit/kit";
const { ccclass, property } = cc._decorator;
@ccclass
export default class pictureBookList extends cc.Component {

    @property(cc.Prefab)
    public itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    public listNode: cc.Node = null;

    public onLoad() {
        this.initList()
    }

    public start() {

    }

    public initList() {
        // 加载绘本列表
        let bookData: any = PicBookDataManager.instance.getPicBookListData();
        bookData.forEach((element: oneBookData) => {
            let bookItem: cc.Node = cc.instantiate(this.itemPrefab);
            let pictureBookItemComponent: pictureBookItem = bookItem.getComponent<pictureBookItem>(pictureBookItem);
            pictureBookItemComponent.init(element);
            this.listNode.addChild(bookItem);
        });
    }

    public onBackClick(): void {
        kit.manager.Event.emit(STATE_TO_HALL);
    }

    onDestroy() {

    }
}
