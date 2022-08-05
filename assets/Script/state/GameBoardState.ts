import { kit } from "../../kit/kit";
import { BUNDLE_TOP_BAR_V2, BUNDLE_LESSON_COMPLETE } from "../config/config";
import AssetsManager from "../manager/assetsManager";
import GameBoard from "../../bundles/gameBoard/GameBoard";
import { GAME_BOARD_OPEN_GAME, NEXT_LESSON } from "../config/event";
import { ResourceType } from "../../kit/manager/ResourcesManager";
import { CHAPTER_TYPE_V2 } from "../config/enum";

/**
 * 游戏列表模式
 */
export default class GameBoardState implements kit.fsm.State<GameBoard> {
    public entity: GameBoard;
    private listNode: cc.Node;
    private lessonNode: cc.Node;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public async enter(data?: any): Promise<void> {
        kit.Loader.loadBundle('gameBoard', null, (error: any, bundle: cc.AssetManager.Bundle) => {
            if (error) {
                cc.error(error);
                return;
            }
            bundle.load('gameBoard', (error: any, prefab: cc.Prefab) => {
                this.listNode = cc.instantiate(prefab)
                this.entity.contentNode.addChild(this.listNode);
            })
        })
        kit.manager.Event.on(GAME_BOARD_OPEN_GAME, this.onOpenGame, this);
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
        return Promise.resolve()
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        kit.manager.Event.off(GAME_BOARD_OPEN_GAME, this.onOpenGame, this)
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
    }

    private async onOpenGame(event: any): void {
        this.listNode.active = false;
        // 添加顶部按钮条
        let topBar: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR_V2)
        this.entity.uiNode.addChild(topBar);
        topBar.getComponent("TopBarV2").init({ isShowNext: true });
        await this.loadCommon(event.data);
        await this.loadLocalProject(event.data);
    }

    private loadCommon(config: any): any {
        return new Promise((res, rej) => {
            let list = [];
            list.push("gameSound");
            config.assets.forEach((url: string) => {
                list.push(url)
            })
            list.push("gameSound");
            cc.log('assets list', list);
            kit.manager.resources.loadBundleList(list).then((bundles: cc.AssetManager.Bundle[]) => {
                cc.log('assets list', bundles);
                res(res)
            }).catch((error) => {
                cc.error(error)
                rej(error)
            })
        })
    }

    // 加载包内课程bundle
    private loadLocalProject(lessonData: any): Promise<void> {
        return new Promise((res, rej) => {
            let bundleName = '';
            let config: any = lessonData;
            bundleName = config.main;

            // 视频参数传输 TODO: 分类型加载拆分
            if (lessonData.type == CHAPTER_TYPE_V2.video) {
                config.params.url = lessonData.fileUrl;
            }

            let bookName = 'PicktureBookNode' + config.params.bookNum;
            let mainPrefab = (lessonData.type === CHAPTER_TYPE_V2.book) ? bookName : bundleName;
            if (bundleName == 'book_player' || bundleName == 'book_player_en') {
                mainPrefab = bundleName
            }
            kit.manager.resources.loadRes(bundleName, `${mainPrefab}`, ResourceType.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error);
                    rej(error);
                    return;
                }
                this.lessonNode = cc.instantiate(prefab);
                this.entity.contentNode.addChild(this.lessonNode);
                kit.system.timer.doFrameOnce(1, () => {
                    kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_PARAMS, config.params);
                });
                res();
            })
        })
    }

    private onLessonComplete(): void {
        cc.log('onLessonComplete');
        let param = {
            callback: () => {
                kit.manager.Event.emit(NEXT_LESSON);
            }
        }
        let node = AssetsManager.instance.getGlobalNode(BUNDLE_LESSON_COMPLETE);
        node.getComponent(BUNDLE_LESSON_COMPLETE).init(param);
        this.entity.uiNode.addChild(node);
    }
}

