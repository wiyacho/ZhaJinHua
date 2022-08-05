import { DEV_MODE, DEV_MODE_LIST } from './../config/config';
import { ChapterReportParams } from './../modle/LessonModel';
import { kit } from '../../kit/kit';
import { ChapterVo_V2, LessonVo_V2 } from '../structure/lessonVoV2';
import LessonModel from "../modle/LessonModel";
import ModelManager from "../../kit/model/ModelManager";
import Spot from '../config/spot';
import { CHAPTER_STATE_V2 } from '../config/enum';
import EventSystem from '../../kit/system/event/EventSystem';
import { OPEN_LESSON_LIST } from '../config/event';

// 课程内容管理器
export default class LessonManagerV2 {
    private static _instance: LessonManagerV2;
    private _lessonList: LessonVo_V2[];
    private _chapterList: ChapterVo_V2[];

    public locLessonId: number;
    public locChapterId: number;
    // 当前正在学习课程id，课程包含具体学习环节
    private _curViewLessonId: number;
    // 环节数据
    private _currentChapter: ChapterVo_V2;

    public static get instance(): LessonManagerV2 {
        if (!LessonManagerV2._instance) {
            LessonManagerV2._instance = new LessonManagerV2();
        }
        return LessonManagerV2._instance;
    }

    constructor() {
        this._lessonList = [];
        this._chapterList = [];
    }

    public destroy() {
        this._lessonList = [];
        this._chapterList = [];

    }

    public async init(): Promise<any> {
        this.initLessonData();
    }

    public async initLessonData() {
        return new Promise<void>(async (resolve, reject) => {
            this._lessonList = [];
            let lessonConfig = await this.getLessonData();
            if (!lessonConfig) {
                cc.error(' get lesson list null! ');
                resolve();
                return
            }
            //
            this.locLessonId = lessonConfig.locationLessonId;
            if (lessonConfig && lessonConfig.lessonList) {
                for (const key in lessonConfig.lessonList) {
                    if (Object.prototype.hasOwnProperty.call(lessonConfig.lessonList, key)) {
                        const config = lessonConfig.lessonList[key];
                        let lessonData: LessonVo_V2 = new LessonVo_V2(config);
                        // cc.log(` lessonId: ${lessonData.lessonId}  complete: ${lessonData.lessonType}`, lessonData)
                        this._lessonList.push(lessonData);

                    }
                }
            } else {
                cc.error('get lessonList error!')
            }

            cc.log(`lessonList:`, this._lessonList);
            resolve()
        })
    }

    public setLessonList(lessonConfig) {
        if (!lessonConfig) {
            cc.error(' set lesson list null! ');
            return
        }
        //
        this._lessonList = [];
        this.locLessonId = lessonConfig.locationLessonId;
        if (lessonConfig && lessonConfig.lessonList) {
            for (const key in lessonConfig.lessonList) {
                if (Object.prototype.hasOwnProperty.call(lessonConfig.lessonList, key)) {
                    const config = lessonConfig.lessonList[key];
                    let lessonData: LessonVo_V2 = new LessonVo_V2(config);
                    // cc.log(` lessonId: ${lessonData.lessonId}  complete: ${lessonData.lessonType}`, lessonData)
                    this._lessonList.push(lessonData);

                }
            }

            EventSystem.emit(OPEN_LESSON_LIST)
        } else {
            cc.error('get lessonList error!')
        }
    }


    public async initChapterData(lessonData: LessonVo_V2) {
        return new Promise<void>(async (resolve, reject) => {
            this._chapterList = [];
            let chapterConfig = await this.getChapterData(lessonData.lessonId);
            if (!chapterConfig) {
                cc.error(' get chapter list null! ')
                return
            }
            this.locChapterId = chapterConfig.locationLessonChapterId;
            if (chapterConfig && chapterConfig.chapterList) {
                for (const key in chapterConfig.chapterList) {
                    if (Object.prototype.hasOwnProperty.call(chapterConfig.chapterList, key)) {
                        const config = chapterConfig.chapterList[key];
                        config.lessonName = lessonData.lessonName;
                        let chapterData: ChapterVo_V2 = new ChapterVo_V2(config);
                        // cc.log(` lessonId: ${chapterData.lessonId}  complete: ${chapterData.chapterStatus}  entryName: ${chapterData.entryName}`, chapterData)
                        this._chapterList.push(chapterData);
                        if (this.locChapterId == chapterData.lessonChapterId) {
                            this._currentChapter = chapterData;
                        }
                    }
                }
            } else {
                cc.error('get _chapterList error!')
            }

            if (!this._currentChapter) {
                this._currentChapter = this._chapterList[0]
            }
            cc.log(`_chapterList:`, this._chapterList);
            cc.log(`_currentChapter:`, this._currentChapter);
            resolve();
        });
    }

    // 获取课程列表
    private getLessonData(): Promise<any> {
        return new Promise(async (res, rej) => {
            let data = await ModelManager.instance.getModel(LessonModel).reqLessonList();
            res(data)

        })
    }

    getChapterData(lessonId: number): Promise<any> {
        return new Promise(async (res, rej) => {
            let data = await ModelManager.instance.getModel(LessonModel).reqChapterInfo(lessonId);
            res(data)
        })
    }
    /**
     * 获取所有课程数据
     */
    public get totalLessonData(): LessonVo_V2[] {
        return this._lessonList;
    }

    /**
     * 获取当前课程所有环节数据
     */
    public get totalChapterData(): ChapterVo_V2[] {
        return this._chapterList;
    }

    // 环节开始
    public chapterBegin(chapterData: ChapterVo_V2): void {
        this._currentChapter = chapterData;
        //
        let params: ChapterReportParams = {
            lessonId: chapterData.lessonId,
            chapterId: chapterData.chapterId,
            lessonChapterId: chapterData.lessonChapterId,
            speedVal: 0,
            type: chapterData.type

        }
        ModelManager.instance.getModel(LessonModel).report(params);
    }

    // 环节完成记录学习进度
    public chapterComplete(chapterData: ChapterVo_V2): void {
        let data = this._chapterList.find(data => data.lessonChapterId == chapterData.lessonChapterId);

        let comp1 = this._chapterList.every(data => data.chapterStatus == CHAPTER_STATE_V2.completed);
        data.setChapterComplete();
        let comp2 = this._chapterList.every(data => data.chapterStatus == CHAPTER_STATE_V2.completed);

        //
        let params: ChapterReportParams = {
            lessonId: chapterData.lessonId,
            chapterId: chapterData.chapterId,
            lessonChapterId: chapterData.lessonChapterId,
            speedVal: 1,
            type: chapterData.type
        }
        ModelManager.instance.getModel<LessonModel>(LessonModel).report(params);

        // 完成环节
        kit.system.spot.send(Spot.AELC_FinishModule,
            {
                CourseID: chapterData.lessonId,
                CourseName: chapterData.lessonName,
                ModuleName: chapterData.chapterName
            });

        if (!comp1 && comp2) { // 首次完成
            kit.system.spot.send(Spot.AELC_FinishCouse,
                {
                    CourseID: chapterData.lessonId,
                    CourseName: chapterData.lessonName
                });
        }

    }

    // 环节退出
    public chapterExit(chapterData: ChapterVo_V2): void {

    }

    // 当前环节
    public get currentChapterData(): ChapterVo_V2 {
        return this._currentChapter;
    }

    // 所有课程已查看
    public get allLessonViewed(): boolean {
        // return this.lessonList.every((ele) => ele.chapterAllViewed);
        return false
    }

    // 所有课程已查看
    public get allLessonComplete(): boolean {
        return this._lessonList.every((ele) => ele.lessonComplete);
    }
    /**
     * 获取当前正在浏览的课程的数据
     * @returns
     */
    public getCurViewLessonData(): LessonVo_V2 {
        return this.getLessonDataById(this.currentChapterData.lessonId);
    }

    public getNextLessonDataByLessonId(lessonId: number): LessonVo_V2 {
        let index = this._lessonList.findIndex((lessonInfo) => {
            return lessonInfo.lessonId == lessonId;
        });
        if (this._lessonList.length > index + 1) {
            return this._lessonList[index + 1];
        }
        return null;
    }
    /**
     * 获取lessonData
     */
    public getLessonDataById(lessonId: number) {
        let lessonData = this._lessonList.find((ele) => ele.lessonId == lessonId);
        return lessonData;
    }

    /**
     * 获取上一环节数据
     */
    public getPreChapterData(): ChapterVo_V2 {
        let index
        this._chapterList.find((chapterInfo, _index) => {
            if (chapterInfo.chapterId == this.currentChapterData.chapterId) {
                index = _index;
            }
        });
        return this._chapterList[index - 1] || null;
    }

    /**
     * 获取下一环节数据
     */
    public getNextChapterData(): ChapterVo_V2 {
        let index
        this._chapterList.find((chapterInfo, _index) => {
            if (chapterInfo.chapterId == this.currentChapterData.chapterId) {
                index = _index;
            }
        });
        return this._chapterList[index + 1] || null;
    }
}


