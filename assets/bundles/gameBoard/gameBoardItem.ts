import { kit } from "../../kit/kit";
import { GAME_BOARD_OPEN_GAME } from "../../Script/config/event";
import IGameBoardItemConfig from "./IGameBoardItemConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameBoardItem extends cc.Component {

    @property(cc.Label)
    titleLabel: cc.Label = null;

    private config: IGameBoardItemConfig

    public setData(config: IGameBoardItemConfig): void {
        this.titleLabel.string = config.name || config.main;
        this.config = config;
    }

    private onClick(event: any): void {
        cc.log(`onClick\t${this.titleLabel.string}`);
        // window.gameConfig = this.config;
        // cc.director.loadScene("main");
        kit.manager.Event.emit(GAME_BOARD_OPEN_GAME, this.config);
    }
}
