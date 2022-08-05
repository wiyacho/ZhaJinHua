import AssetsManager from "../manager/assetsManager";
import Main from "../app";
import { BUNDLE_LESSON_COMPLETE, BUNDLE_LOADING, BUNDLE_QUIT_LESSON_ALERT, BUNDLE_TOP_BAR, PICTURE_BOOK_LIST_CONFIG } from "../config/config";
import { BACK, CONTINUE, POPUP_QUIT_LESSON_ALERT } from "../config/event";
import PictureBookListState from "./pictureBookListState";
import { kit } from "../../kit/kit";
import Spot from "../config/spot";
import HallStateV2 from "./HallStateV2";
import ModelManager from "../../kit/model/ModelManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ExtracurricularBooKState implements kit.fsm.State<Main> {

    private bookNode: cc.Node;
    private currentId: any;
    public entity: Main;
    public bookBundle: string[];


    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        return true
    }

    public async enter(_data?: any): Promise<void> {
        let data = _data.data
        await this.openBook(data.id)

        // 添加加载动画
        let loadingNode = AssetsManager.instance.getGlobalNode(BUNDLE_LOADING)
        loadingNode.zIndex = cc.macro.MAX_ZINDEX
        this.entity.uiNode.addChild(loadingNode)

        kit.manager.Event.on(BACK, this.onBack, this);
        kit.manager.Event.on(CONTINUE, this.onContinue, this);
        kit.manager.Event.on(POPUP_QUIT_LESSON_ALERT, this.popupQuitAlert, this);
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);


        return Promise.resolve();
    }

    // 打开绘本
    private openBook(chapterId: number): Promise<void> {
        this.currentId = chapterId;
        return new Promise((res, rej) => {
            let list: string[] = []
            cc.log(`加载课程id：${chapterId}`)
            let config: any = PICTURE_BOOK_LIST_CONFIG.find((element: any) => {
                if (chapterId === element.id) {
                    element.assets.forEach((url: string) => {
                        list.push(`${url}`)
                    })
                    return true
                }
            })
            list.unshift(config.main);
            list.unshift('book_base')
            this.bookBundle = list;
            kit.manager.resources.loadBundleList(list).then((result: cc.AssetManager.Bundle[]) => {
                kit.manager.resources.loadRes("book_base", `${config.main}`, kit.manager.Resources.Type.Normal, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                    if (error) {
                        cc.error(error)
                        return
                    }
                    this.bookNode = cc.instantiate(prefab)
                    this.entity.contentNode.addChild(this.bookNode);
                    kit.system.timer.doFrameOnce(1, () => {
                        kit.manager.Event.emit(kit.consts.Event.LIFE_CYCLE_PARAMS, config.params);
                    });
                    this.entity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING))

                    // 添加顶部按钮条
                    let topBar: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR)
                    this.entity.uiNode.addChild(topBar);
                    topBar.getComponent(BUNDLE_TOP_BAR).init({ isShowNext: false });
                    kit.system.spot.send(Spot.AELC_EnterPictureBook, { PictureBookID: chapterId });
                    res();
                })
            }).catch((error) => {
                cc.error(error);
                rej(error);
            })
        })
    }


    // 关闭绘本
    private closeBook(): void {
        if (!cc.isValid(this.bookNode)) {
            return
        }
        this.currentId = null;
        if (this.bookNode) {
            this.bookNode.destroy();
            this.bookNode = null;
        }
        kit.manager.resources.releaseAsset(this.bookBundle);
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }

    public exit(data?: any): void {
        kit.manager.Event.off(BACK, this.onBack, this);
        kit.manager.Event.off(CONTINUE, this.onContinue, this);
        kit.manager.Event.off(POPUP_QUIT_LESSON_ALERT, this.popupQuitAlert, this);
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_COMPLETE, this.onLessonComplete, this);
        let ui: cc.Node = AssetsManager.instance.getGlobalNode(BUNDLE_TOP_BAR);
        this.entity.uiNode.removeChild(ui);
        this.closeBook()
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
        kit.system.spot.send(Spot.AELC_FinishPictureBook, { PictureBookID: this.currentId });

    }

    private onBack(): void {
        kit.system.spot.send(Spot.AELC_QuitPictureBook, { PictureBookID: this.currentId });
        this.entity.changeState(PictureBookListState);
    }

    private onContinue(): void {
        // kit.system.spot.send(Spot.AELC_PICTUREBOOKID_PAUSE_CONTINUE, this.currentId);
    }
}
