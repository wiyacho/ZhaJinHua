import { kit } from "../../../../kit/kit";
import { STATE_TO_GAME, STATE_TO_HALL, STATE_TO_LESSON } from "../../../../Script/config/event";
import { UserDataManager } from "../../../../Script/manager/userDataManager";
import { GameItemData } from "../../../../Script/structure/interfaceVo";

const { ccclass, property } = cc._decorator;
@ccclass
export default class gameIconItem extends cc.Component {

    @property(cc.Node)
    public item: cc.Node = null;

    @property(sp.Skeleton)
    public lockSpine: sp.Skeleton = null;

    @property(cc.SpriteFrame)
    public spriteFrame_arr: cc.SpriteFrame[] = [];

    private bookInfo: GameItemData;
    public lessonType: number = 0      // 0解锁 1未解锁
    public isLock: boolean = false
    private isClick: boolean = true

    public onLoad() {

    }

    public start() {

    }

    public init(data: GameItemData) {
        this.bookInfo = data
        // this.lessonType = UserDataManager.instance.getPicAndGameLockState()

        // 暂时写死
        this.isLock = this.bookInfo.unlock;
        this.lockSpine.node.active = !this.isLock

        this.item.getComponent(cc.Sprite).spriteFrame = this.spriteFrame_arr[this.bookInfo.id]
    }

    public onClick(): void {
        if (!this.isClick) { return }
        if (this.isLock)  // 解锁
        {
            // 进入对应绘本
            kit.manager.Event.emit(STATE_TO_GAME, this.bookInfo);
        } else {   // 返回到大厅
            this.isClick = false
            this.lockSpine.clearTracks()
            this.lockSpine.setToSetupPose()
            this.lockSpine.setAnimation(0, "dou", false)
            this.lockSpine.setCompleteListener(() => {
                if (this.bookInfo.id == 0) {
                    kit.manager.Event.emit(STATE_TO_HALL)
                }
                this.isClick = true
            })
        }
    }

    public open(): void {

    }
    public close(): void {

    }

}
