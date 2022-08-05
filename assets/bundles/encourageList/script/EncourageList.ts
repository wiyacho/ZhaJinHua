import { kit } from "../../../kit/kit";
import { BUNDLE_ENCOURAGE_LIST } from "../../../Script/config/config";
import { STATE_TO_HALL } from "../../../Script/config/event";
import BaseComponent from "../../components/baseComponent";
import EncourageData from "./EncourageData";
import EncourageDetail from "./EncourageDetail";
import EncourageItem from "./EncourageItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EncourageList extends BaseComponent {

    /** 激励item */
    @property(cc.Prefab)
    encourageItem: cc.Prefab = null;

    private startPos = cc.v2(256, 194);

    private offsetY = 362;

    private offsetX = 362;

    public init(data?: any): void {
        kit.manager.Event.on(EncourageData.SHOW_DETAIL, this.showDetail, this);
        this.ui.onClick("btn_back", this.onBtnBack, this);
        this.showList();
    }

    public showList() {
        let list = EncourageData.instance.encourageList();
        for (let i = 0; i < list.length; i++) {
            let prefab = cc.instantiate(this.encourageItem);
            prefab.name = `item_node${i + 1}`
            this.ui.getNode("content").addChild(prefab);
            this.setItemPosition(prefab, i + 1, list[i]);
        }
    }

    /** 设置位置 */
    private setItemPosition(node: cc.Node, index: number, data) {
        let direction;
        if (index % 4 == 1) {
            node.x = this.startPos.x + (index == 1 ? 0 : (362 * (Math.floor(index / 4) * 2)));
            node.y = this.startPos.y;
            direction = 1;
        }

        if (index % 4 == 2) {
            node.x = this.startPos.x + (index == 2 ? 0 : (362 * (Math.floor(index / 4) * 2)));
            node.y = this.startPos.y - this.offsetY;
            direction = 2;
        }

        if (index % 4 == 3) {
            node.x = this.startPos.x + (index == 3 ? 362 : (362 * (Math.floor(index / 4) * 2 + 1)));
            node.y = this.startPos.y - this.offsetY;
            direction = 3;
        }

        if (index % 4 == 0) {
            node.x = this.startPos.x + (index == 4 ? 362 : (362 * (Math.floor(index / 4) * 2 - 1)));
            node.y = this.startPos.y;
            direction = 2;
        }
        let component = node.getComponent(EncourageItem);
        component.init(data, index, direction);
    }

    // 显示详情
    public showDetail() {
        let lessonId = EncourageData.instance.clickLesson;
        EncourageData.instance.clickLesson = -1;
        if (lessonId == -1) {
            return;
        }
        kit.manager.resources.loadRes(BUNDLE_ENCOURAGE_LIST, `prefab/encourageDetail`, kit.manager.Resources.Type.Normal, cc.Prefab, (e, res: cc.Prefab) => {
            if (e) {
                cc.log(`prefab/encourageDetail error ${e}`);
                return;
            }
            let detail = cc.instantiate(res);
            this.ui.getNode("detailNode").addChild(detail);
            detail.getComponent(EncourageDetail).init(lessonId);
        })
    }

    onBtnBack() {
        kit.manager.Event.emit(STATE_TO_HALL);
    }

    onDestroy() {
        EncourageData.instance.release();
        kit.manager.Event.off(EncourageData.SHOW_DETAIL, this.showDetail, this);
    }
}
