import { EncourageWallDataManager } from './EncourageWallDataManager';
import { UserDataManager } from './userDataManager';
import { CHAPTER_STATE, REWARD_TYPE } from './../config/enum';
import { LESSON_LIST_CONFIG } from "../config/config";
import { CHAPTER_TYPE } from "../config/enum";
import ChapterVo, { LessonVo } from "../structure/lessonVo";
import { PicBookDataManager } from './PicBookDataManager';
import { GameDataManager } from './GameDataManager';
import { kit } from '../../kit/kit';

const LESSON_MANAGER_SAVE_KEY = 'LESSON_MANAGER_SAVE_KEY';
const LESSON_COMPLETE_SAVE_KEY = 'LESSON_COMPLETE_SAVE_KEY';
// 课程内容管理器
export default class LessonManager {
    private static _instance: LessonManager;
    private lessonList: LessonVo[]; // TODO:后续可能用下面的map管理
    private lessonStructureList: kit.structure.LinkList<ChapterVo>;

    // 当前正在学习课程id，课程包含具体学习环节
    private _curViewLessonId: number;
    // 环节数据
    private _currentChapter: ChapterVo;

    public static get instance(): LessonManager {
        if (!LessonManager._instance) {
            LessonManager._instance = new LessonManager();
        }
        return LessonManager._instance;
    }

    constructor() {
        this.lessonList = [];
        this.registerEvent();
    }

    public destroy() {
        this.lessonList = [];
        this.unRegisterEvent();
    }

    private registerEvent() {

    }

    private unRegisterEvent() {

    }

    public updateChapterViewState() {

    }

    /**
     * 从学习报告设置当前正在查看的lessonId
     */
    public setCurViewLessonId(lessonId: number) {
        this._curViewLessonId = lessonId;
        this.getCurViewLessonData().reportViewed = true;
        this.save();
    }

    /**
     * 设置学习报告页完成状态
     */
    public setReportCompleteState(com: boolean = true) {
        this.getCurViewLessonData().setLessonReportCompleteState(com);
        this.save();
    }

    public async init(): Promise<any> {
        let lessonConfig = await this.getLessonConfig();
        this.initLessonData(lessonConfig);
        let temp: ChapterVo[] = [];
        this.lessonList.forEach((element: LessonVo) => {
            element.chapters.forEach((lesson: ChapterVo) => {
                temp.push(lesson);
            })
        })
        this.lessonStructureList = kit.structure.LinkList.from<ChapterVo>(temp);
        cc.log(`lessonStructureList:`, this.lessonStructureList);
    }

    // 获取课程列表
    private getLessonConfig(): Promise<any> {
        return new Promise((res, rej) => {
            if (false && kit.system.platform.adapter.isPrintLog) {
                // axios.post(LESSON_LIST).then((result) => {
                //     res(result);
                // }).catch((error) => {
                //     rej(error);
                // })
            } else {

                res(LESSON_LIST_CONFIG);
            }
        })
    }

    private initLessonData(lessonConfig: any) {
        let stateConfig = kit.util.LocalStorage.getObject(LESSON_MANAGER_SAVE_KEY) || {};
        for (const key in lessonConfig) {
            if (Object.prototype.hasOwnProperty.call(lessonConfig, key)) {
                const config = lessonConfig[key];
                let lessonData: LessonVo = new LessonVo(config);
                // 获取本地存储完成状态的数据
                let lessonState = stateConfig[lessonData.lessonId];
                if (lessonState) {
                    lessonData.setLessonReportCompleteState(lessonState['report']["isComplete"])
                    lessonData.setLessonChapterCompleteState(lessonState['chapters'])
                    lessonData.reportViewed = lessonState.reportViewed;
                    lessonData.rewardInfo = lessonState.rewardInfo;
                }
                cc.log(` lessonId: ${lessonData.lessonId}  complete: ${lessonData.complete}`, lessonData)
                this.lessonList.push(lessonData);

            }
        }
        // cc.log(" ====>>>11this.lessonList: ", this.lessonList);

        // 查找下一个待学习
        this.updateNext2LearnChapter();
    }

    /**
     * 获取lessonData
     */
    public getLessonDataById(lessonId: number) {
        let lessonData = this.lessonList.find((ele) => ele.lessonId == lessonId);
        return lessonData;
    }

    /**
     * 获取所有课程数据
     */
    public get totalLessonData(): LessonVo[] {
        return this.lessonList;
    }

    // 当前环节
    public get currentChapterData(): ChapterVo {
        return this._currentChapter;
    }

    // 所有课程已查看
    public get allLessonViewed(): boolean {
        return this.lessonList.every((ele) => ele.chapterAllViewed);
    }

    // 所有课程已完成
    public get allLessonComplete(): boolean {
        return this.lessonList.every((ele) => ele.complete);
    }

    // 环节开始
    public chapterBegin(chapterData: ChapterVo): void {
        // 记录当前学习的课程、环节、
        this._currentChapter = chapterData;
        this._curViewLessonId = chapterData.lessonId;
        let lessonData = this.getLessonDataById(chapterData.lessonId);
        // 更新环节状态
        lessonData.setChapterState(chapterData.chapterId, CHAPTER_STATE.viewed);
        this.updateNext2LearnChapter();
        this.save();
    }
    // 刷新即将要学习的环节
    private updateNext2LearnChapter() {
        let next2LearnIndex = this.lessonList.findIndex((lessonData) => {
            for (let index = 0; index < lessonData.chapters.length; index++) {
                const chapterDta = lessonData.chapters[index];
                if (chapterDta.chapterState == CHAPTER_STATE.next2view) {
                    return true;
                }
            }
            return false;
        });
        if (next2LearnIndex > -1) {
            // 查找下一个待学习
            return
        }
        let cData: ChapterVo = null;
        let index = this.lessonList.findIndex((lessonData: LessonVo) => {
            for (let index = 0; index < lessonData.chapters.length; index++) {
                const chapterDta = lessonData.chapters[index];
                if (chapterDta.chapterState == CHAPTER_STATE.lock) {
                    cData = chapterDta;
                    return true;
                }
            }
            return false;
        });
        // cc.log(" =====>>> cData: ",cData);
        // console.log(" ====>>>>>>index: ", index);
        if (cData) { // 当全部已查看，cData 未 null
            let lessonData = this.getLessonDataById(cData.lessonId);
            // 更新环节状态
            lessonData.setChapterState(cData.chapterId, CHAPTER_STATE.next2view);
        }
        cc.log(" ===>>this.lessonList： ", this.lessonList);
    }

    // 环节完成记录学习进度
    public chapterComplete(chapterData: ChapterVo): void {
        let lessonData = this.getLessonDataById(chapterData.lessonId);
        // 首次完成
        lessonData.setChapterFirstCompByChapterId(chapterData.chapterId, true);
        // 更新环节状态
        lessonData.setChapterCompStateByChapterId(chapterData.chapterId, true);
        

        this.save();
        // 检查课程是否为新完成 的
        if (lessonData.complete) {
            //更新解锁信息
            this.updateItemUnLockState(chapterData);
            
            // 已经完成的lessonId
            let lessonIds: number[] = kit.util.LocalStorage.getObject(LESSON_COMPLETE_SAVE_KEY) || [];
            if (lessonIds.indexOf(lessonData.lessonId) == -1) {
                lessonIds.push(lessonData.lessonId);
                kit.util.LocalStorage.setObject(LESSON_COMPLETE_SAVE_KEY, lessonIds);
                UserDataManager.instance.setLessonFinished();
                this.saveRewardInfo(chapterData);
            }
        }
    }

    //更新道具解锁信息
    updateItemUnLockState(chapterData: ChapterVo) {
        let lessonData = this.getLessonDataById(chapterData.lessonId);
        let itemInfo = lessonData.rewardInfo;
        if (itemInfo) {
            EncourageWallDataManager.instance.setEncourageItemUnlockById(lessonData.lessonId);
            if (itemInfo.type == REWARD_TYPE.game) {
                GameDataManager.instance.setGameItemUnlockById(itemInfo.gameId);
            } else if (itemInfo.type == REWARD_TYPE.pictureBook) {
                PicBookDataManager.instance.setPicBookItemUnlockById(itemInfo.gameId);
            } else if (itemInfo.type == REWARD_TYPE.prop) {
                GameDataManager.instance.setGameItemUnlockById(itemInfo.gameId);
            }
        }
    }

    // 退出环节
    public chapterExit(lesson: ChapterVo): void {
        // this._currentChapter = null;
        // TODO: 记录课程学习进度，下次进入继续学习
    }
    // 进入学习报告
    public reportEnter(lessonData: LessonVo) {
        this.setCurViewLessonId(lessonData.lessonId);
        this.getLessonDataById(lessonData.lessonId).reportViewed = true;
    }
    /**
     * 根据环节类型获取环节数据
     */
    public getChapterDataByType(type: CHAPTER_TYPE): ChapterVo {
        let curLessonData = this.getLessonDataById(this._curViewLessonId);
        if (!curLessonData) {
            cc.error(`lesson data null! lessonid: ${this._curViewLessonId}`);
            return
        }
        let chapterData = curLessonData.chapters.find((data) => data.chapterType == type);
        if (!chapterData) {
            cc.error(`find data fail! lessonid: ${this._curViewLessonId} chapterType: ${type}`);
        }
        return chapterData;
    }

    /**
     * 获取下一环节数据
     */
    public getNextChapterData(): ChapterVo {
        let nextType = this._currentChapter.chapterType + 1;
        return this.getChapterDataByType(nextType);
    }

    /**
     * 获取上一环节数据
     */
    public getChapterData(): ChapterVo {
        let preType = this._currentChapter.chapterType - 1;
        return this.getChapterDataByType(preType);
    }

    /**
     * 获取当前正在浏览的课程的数据
     * @returns
     */
    public getCurViewLessonData(): LessonVo {
        return this.getLessonDataById(this._curViewLessonId);
    }

    private save() {
        let obj = {}
        this.lessonList.forEach((val: LessonVo) => {
            let key = val.lessonId;
            obj[key] = {}
            obj[key]['report'] = val.report;
            obj[key]['chapters'] = val.chapters;
            obj[key]['reportViewed'] = val.reportViewed;
            obj[key]['rewardInfo'] = val.rewardInfo;
        })
        kit.util.LocalStorage.setObject(LESSON_MANAGER_SAVE_KEY, obj);
    }

    /** 保存lesson奖励信息 */
    private saveRewardInfo (chapterData: ChapterVo) {
        let lessonData = this.getLessonDataById(chapterData.lessonId);
        let rewardInfo: any = kit.util.LocalStorage.getObject("LESSON_REWARD_INFO") || {};
        rewardInfo[chapterData.lessonId] = lessonData.rewardInfo;
        kit.util.LocalStorage.setObject("LESSON_REWARD_INFO", rewardInfo);
    }
}