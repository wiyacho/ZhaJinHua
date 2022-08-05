import { kit } from "../../../../kit/kit";
import { STATE_TO_HALL, STATE_TO_LESSON, STATE_TO_PICTURE_BOOK } from "../../../../Script/config/event";
import { UserDataManager } from "../../../../Script/manager/userDataManager";
import { BookItemData } from "../../../../Script/structure/interfaceVo";
import { bookListItem, oneBookData } from "./bookListItem";
const { ccclass, property } = cc._decorator;
@ccclass
export default class pictureBookItem extends cc.Component implements bookListItem {

    @property(cc.Node)
    public item: cc.Node = null;

    @property(cc.Node)
    public lock: cc.Node = null;

    @property(cc.SpriteFrame)
    public spriteFrame_arr: cc.SpriteFrame[] = [];

    private bookInfo: BookItemData;
    public lessonType: number = 0      // 0解锁 1未解锁
    public isLock: boolean = false

    public onLoad() {

    }

    public start() {

    }

    public setItemFrame() {

    }

    public init(data: BookItemData) {
        this.bookInfo = data
        // this.lessonType = UserDataManager.instance.getPicAndGameLockState()
        this.isLock = this.bookInfo.unlock;
        this.lock.active = !this.isLock;
        this.item.getComponent(cc.Sprite).spriteFrame = this.spriteFrame_arr[this.bookInfo.id]
    }

    public onClick(): void {
        if (this.isLock)  // 解锁
        {
            // 进入对应绘本
            kit.manager.Event.emit(STATE_TO_PICTURE_BOOK, this.bookInfo);
        } else {   // 返回到大厅
            kit.manager.Event.emit(STATE_TO_HALL)
        }
    }

    public open(): void {

    }
    public close(): void {

    }
    // update (dt) {}
}
