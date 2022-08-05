import AssetsManager from "../manager/assetsManager";
import Main from "../app";
import { BUNDLE_LESSON_COMPLETE, BUNDLE_LOADING, BUNDLE_QUIT_LESSON_ALERT, BUNDLE_TOP_BAR, GAME_LIST_CONFIG } from "../config/config";
import { BACK, CONTINUE, POPUP_QUIT_LESSON_ALERT } from "../config/event";
import GameListState from "./gameListState";
import { kit } from "../../kit/kit";
import Spot from "../config/spot";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ExtracurricularGameState implements kit.fsm.State<Main> {

    private gameNode: cc.Node;
    private currentId: any;
    public entity: Main;
    public gameBundle: string[];

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public async enter(_data?: any): Promise<void> {
        let data = _data.data;
        this.currentId = data.id;
        await this.openGame(data.id);

        // 添加加载动画
        let loadingNode = AssetsManager.instance.getGlobalNode(BUNDLE_LOADING)
        loadingNode.zIndex = cc.macro.MAX_ZINDEX
        this.entity.uiNode.addChild(loadingNode)

        kit.manager.Event.on(BACK, this.onBack, this);
        kit.manager.Event.on(CONTINUE, this.onContinue, this);
        kit.manager.Event.on(POPUP_QUIT_LESSON_ALERT, this.popupQuitAlert, this);
        kit.manager.Event.on(kit.consts.Event.SET_TOP_BAR_ACTIVE, this.setTopBarActive, this);
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
    }

    // 打开游戏
    private openGame(chapterId: number): Promise<void> {
        return new Promise((res, rej) => {
            let list: string[] = [];
            cc.log(`加载课程id：${chapterId}`);
            let config: any = GAME_LIST_CONFIG.find((element: any) => {
                if (chapterId === element.id) {
                    element.assets.forEach((url: string) => {
                        // list.push(`${this.entity.host}${url}`);
                        list.push(`${url}`);
                    })
                    return true;
                }
            })
            this.gameBundle = list
            kit.manager.resources.loadBundleList(list).then((result: cc.AssetManager.Bundle[]) => {
                kit.manager.resources.loadRes(config.main, `${config.main}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                    if (error) {
                        cc.error(error)
                        return
                    }
                    this.gameNode = cc.instantiate(prefab);
                    this.entity.contentNode.addChild(this.gameNode);
                    kit.system.timer.doFrameOnce(1, () => {
                        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_PARAMS, config.params);
                    });
                    this.entity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING));

                    // 添加顶部按钮条
                    let topBar: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR);
                    this.entity.uiNode.addChild(topBar);
                    topBar.getComponent(BUNDLE_TOP_BAR).init({ isShowNext: false });
                    kit.system.spot.send(Spot.AELC_EnterGame, { GameID: chapterId });

                    res();
                })
            }).catch((error) => {
                cc.error(error);
                rej(error);
            })
        })
    }

    // 关闭游戏
    private closeGame(): void {
        if (!cc.isValid(this.gameNode)) {
            return
        }
        if (this.gameNode) {
            this.gameNode.destroy();
            this.gameNode = null;
        }
        kit.manager.resources.releaseAsset(this.gameBundle);
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        kit.manager.Event.off(BACK, this.onBack, this);
        kit.manager.Event.off(CONTINUE, this.onContinue, this);
        kit.manager.Event.off(kit.consts.Event.SET_TOP_BAR_ACTIVE, this.setTopBarActive, this);
        kit.manager.Event.off(POPUP_QUIT_LESSON_ALERT, this.popupQuitAlert, this);
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
        let ui: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR);
        this.entity.uiNode.removeChild(ui);
        this.closeGame()
    }

    private popupQuitAlert(): void {
        // let alert: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_QUIT_LESSON_ALERT);
        // kit.manager.Popup.show(alert, null, { mode: kit.manager.Popup.cacheMode.Frequent });
        this.onBack();
    }

    private onLessonComplete(): void {
        let param = {
            lessonType: 1, callback: () => {
                this.onBack()
            }
        }
        let node = AssetsManager.instance.getGlobalNode(BUNDLE_LESSON_COMPLETE);
        node.getComponent(BUNDLE_LESSON_COMPLETE).init(param);
        this.entity.uiNode.addChild(node);
        // kit.system.spot.send(Spot.AELC_FinishGame, { GameID: this.currentId, GameName: '' });

    }

    public setTopBarActive(eventData) {
        let data = eventData.data
        this.entity.uiNode.getChildByName(BUNDLE_TOP_BAR).active = data.active;
    }

    private onBack(): void {
        kit.system.spot.send(Spot.AELC_QuitGame, { GameID: this.currentId });

        kit.manager.Audio.pauseLoopEffects();
        this.entity.changeState(GameListState);
    }

    private onContinue(): void {
        // kit.system.spot.send(Spot.AELC_GAMEID_PAUSE_CONTINUE, this.currentId);
    }
}
