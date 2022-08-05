import { kit } from "../../kit/kit";
import IComponent from "./IComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseComponent extends cc.Component implements IComponent {
    public ui: kit.util.UiContainer;

    public onLoad() {
        this.ui = kit.util.Ui.seekAllSubView(this.node);
        this.init();
    }

    public init(data?: any): void {
    }

}
