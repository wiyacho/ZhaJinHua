import Events from '../../kit/events/events';
import { kit } from "../../kit/kit";
import { commonTipsOptions } from '../../kit/structure/ClientModuleInterface';
import EventSystem from '../../kit/system/event/EventSystem';
import Main from "../app";
import { BUNDLE_LOADING_LESSON } from '../config/config';
import { CHAPTER_TYPE_V2 } from '../config/enum';
import AssetsManager from '../manager/assetsManager';
import { ChapterVo_V2 } from '../structure/lessonVoV2';
import { DownLoadManager } from './../manager/DownLoadManager';
import HallStateV2 from './HallStateV2';
import lessonStateV2 from './lessonStateV2';
/**
 * 课程环节过渡
 */
export default class loadingStateV2 implements kit.fsm.State<Main> {
    public entity: Main

    private lessonBundle: string[]
    private chapterData: ChapterVo_V2 = null

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        return true
    }

    private needDownload = false

    public enter(data?: ChapterVo_V2): Promise<void> {
        cc.log(`loadingStateV2 enter`)
        let duration = 2000
        return new Promise(async (res, rej) => {
            this.chapterData = data;
            kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_READY, this.onLifeCycleReady, this);
            // kit.manager.Event.on(LOADING_LESSON_ENDED, this.onLoadingLessonEnded, this);
            if (cc.sys.isNative) {
                // 检查是否加载完成
                if (DownLoadManager.instance.checkDownLoaded(this.chapterData.lessonChapterId, this.onDownLoadSuc.bind(this), this.onDownLoadProgress.bind(this))) {
                    this.needDownload = true
                    cc.log('需要下载')
                } else {//不需要下载
                    cc.log('不需要下载')
                    await DownLoadManager.instance.decompressZip(this.chapterData.lessonChapterId);
                    this.needDownload = false
                    kit.system.timer.doOnce(duration, () => {
                        this.openLesson(this.chapterData)
                    })
                    if (loadingStateV2.loading) {
                        loadingStateV2.loading.setProgress(1, 3)
                    }
                }
            } else {
                this.needDownload = false
                kit.system.timer.doOnce(duration, () => {
                    this.openLesson(this.chapterData)
                })
                if (loadingStateV2.loading) {
                    loadingStateV2.loading.setProgress(1, duration / 1000)
                }
            }
            res();
        })
    }

    /**
     * 课程包下载更新
     * @param percent
     */
    private onDownLoadProgress(percent: number) {
        cc.log(" =====onDownLoadProgress: ", percent)
        if (loadingStateV2.loading) {
            loadingStateV2.loading.setProgress(percent)
        }
    }
    /**
     * 课程包下载成功
     * @param suc
     */
    private async onDownLoadSuc(suc: boolean) {
        cc.log(" =====onDownLoadSuc: ", suc)
        if (!suc) {// 下载失败
            // --TODO 下载失败
            let params: commonTipsOptions = {
                tipsType: "DOWNLOAD_FAILED",
                confirmCallback: () => {
                    DownLoadManager.instance.startDownload();
                },
                cancelCallback: () => {
                    this.entity.changeState(HallStateV2)
                    loadingStateV2.hideCloud();
                }
            }
            EventSystem.emit(Events.SHOW_COMMON_TIPS_POP, params);
        } else {
            if (this.needDownload) {
                await DownLoadManager.instance.decompressZip(this.chapterData.lessonChapterId);
                this.openLesson(this.chapterData);
            }
        }


    }
    // /**
    //  * loading课程结束
    //  */
    // private onLoadingLessonEnded() {
    //     cc.log('LOADING_LESSON_ENDED...')
    //     // 移除课程loading
    //     this.loadingEnded = true
    //     // this.judgeState()
    // }

    public onLifeCycleReady() {
        console.log('onLifeCycleReady')
        // if (this.chapterData.type === CHAPTER_TYPE_V2.video) {
        //     loadingStateV2.hideCloud()
        // }
    }


    // 加载包内课程bundle
    private loadLocalProject(chapterId: number): void {
        let list: string[] = []
        cc.log(`加载课程id：${chapterId}`)
        let config = this.chapterData.getChapterConfig();
        if (!config) {
            cc.error(`获取游戏配置错误！ lessonId: ${this.chapterData.lessonId}  chapterId: ${this.chapterData.chapterId}`)
            let params: commonTipsOptions = {
                tipsType: "GET_GAME_CONFIG_ERR",
                cancelCallback: () => {
                    this.entity.changeState(HallStateV2);
                    loadingStateV2.hideCloud();

                }
            }
            EventSystem.emit(Events.SHOW_COMMON_TIPS_POP, params);
            return
        }
        //游戏通用音效
        if(this.chapterData.type === CHAPTER_TYPE_V2.game){
            list.push("gameSound")
        }
        config.assets.forEach((url: string) => {
            list.push(url)
        })
        // cc.log(" ====config: ", config)
        // cc.log(" ====list: ", list)
        this.lessonBundle = list;

        kit.manager.resources.loadBundleList(list).then((res: cc.AssetManager.Bundle[]) => {

            let mainPrefab = (this.chapterData.type === CHAPTER_TYPE_V2.book) ? 'PicktureBookNode1' : config.main;
            if (config.entry && config.entry != '') {
                mainPrefab = config.entry
            }
            kit.manager.resources.loadRes(config.main, `${mainPrefab}`, kit.manager.Resources.Type.Normal, cc.Prefab, async (error: Error, prefab: cc.Prefab) => {
                if (error) {
                    cc.error(error)
                    return
                }
                this.entity.stateMachine.ChangeState(lessonStateV2, { bundles: this.lessonBundle, lesson: this.chapterData });
                if (this.chapterData.type === CHAPTER_TYPE_V2.video) {

                } else {
                    // await loadingStateV2.hideCloud()
                    loadingStateV2.loading.onLessonReady()
                }
            })
        }).catch((error) => {
            cc.error(error)
        })
    }

    // private judgeState() {
    //     if (this.loadingEnded && this.lessonLoaded && !this.lock) {
    //         this.lock = true
    //         // this.entity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING_LESSON))
    //         this.entity.stateMachine.ChangeState(lessonStateV2, { bundles: this.lessonBundle, lesson: this.chapterData })
    //     }
    // }

    // 打开课程
    private openLesson(lessonData: ChapterVo_V2): void {
        cc.log('加载课程')
        switch (lessonData.type) {    // 绘本和视频用以存在的项目所以需要记载scene
            case CHAPTER_TYPE_V2.video:
                this.loadLocalProject(lessonData.chapterId)
                break
            case CHAPTER_TYPE_V2.book:
                this.loadLocalProject(lessonData.chapterId)
                break
            case CHAPTER_TYPE_V2.game:
                this.loadLocalProject(lessonData.chapterId)
                break
        }
    }

    public execute(data?: any): void {

    }

    public exit(data?: any): void {
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_READY, this.onLifeCycleReady, this)
    }

    static ROCKET_IN = 'in'
    static ROCKET_OUT = 'out'
    static ROCKET_IDLE = 'idle'

    static CLOUD_IN = 'in'
    static CLOUD_OUT = 'out'
    static CLOUD_IDLE = 'idle'

    private static currEntity = null
    static loading = null
    /**
     * 覆盖云
     * @param state 
     */
    static async showCloud(entity, type) {
        loadingStateV2.currEntity = entity
        let loadingNode = AssetsManager.instance.getGlobalNode(BUNDLE_LOADING_LESSON);
        loadingNode.zIndex = cc.macro.MAX_ZINDEX;
        entity.uiNode.addChild(loadingNode);
        let loadingLesson = loadingNode.getComponent('LoadingLesson')
        loadingStateV2.loading = loadingLesson
        await loadingLesson.show(type)
    }

    static async hideCloud() {
        await loadingStateV2.loading.hide()
        // if (loadingStateV2.currEntity) {
        //     loadingStateV2.currEntity.uiNode.removeChild(AssetsManager.instance.getGlobalNode(BUNDLE_LOADING_LESSON))
        //     console.log('云被移除')
        // }
    }
}
