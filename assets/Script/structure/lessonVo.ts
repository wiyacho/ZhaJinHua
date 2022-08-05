
import { CHAPTER_TYPE, LESSON_TYPE, CHAPTER_STATE, REWARD_TYPE } from "../config/enum";

// 课程配置
export default class ChapterVo {
    public chapterId: number;
    // 当前环节属于哪一个课程
    public lessonId: number;
    // 环节类型
    public chapterType: CHAPTER_TYPE;
    public type: string;
    public complete: boolean;
    public chapterState?: CHAPTER_STATE;
    public isFirstComplete: boolean;
    constructor(data?: any) {
        if (data) {
            this.parse(data);
        }
    }

    public parse(data: any): void {
        this.lessonId = data?.lessonId;
        this.chapterType = data?.chapterType;
        this.type = data?.type;
        this.chapterId = data?.chapterId;
        this.complete = data?.complete;
        this.chapterState = data?.lessonState || CHAPTER_STATE.lock;
        this.isFirstComplete = false;
    }

    /**
     * 获取是否首次完成
     */
    public getFirstCompleteState() {
        return this.isFirstComplete;
    }
}


// 单元配置
export class LessonVo {
    public lessonId: number;
    // 课程类型 MVP版本只有 L1， L2
    public lessonType: LESSON_TYPE;
    public chapters: ChapterVo[];
    public reportViewed: boolean;
    public report: { isComplete: boolean };
    public rewardInfo: {
        type: REWARD_TYPE;
        iconUrl: string;
        propId: number,
        gameId: number
    };
    constructor(data?: any) {
        if (data) {
            this.parse(data);
        }
    }

    public parse(data: any): void {
        this.lessonId = data?.lessonId;
        this.lessonType = data?.lessonType;
        this.reportViewed = data?.reportViewed || false;
        this.chapters = [];
        if (data?.chapters) {
            for (let index = 0; index < data?.chapters.length; index++) {
                const lesConfig = data?.chapters[index];
                lesConfig.lessonId = this.lessonId; // 环节数据持有lessonId
                let lesVo = new ChapterVo(lesConfig);
                this.chapters.push(lesVo);
            }
        }

        this.report = data?.report;
        this.rewardInfo = data?.rewardInfo;
    }

    /**
     * 获取课程是否完成，不依靠report里面的isComplete
     */
    public get complete(): boolean {
        return this.chapters.every((val) => val.complete);
    }

    /**
     * 获取课程是否完成，不依靠report里面的isComplete
     */
    public get chapterAllViewed(): boolean {
        return this.chapters.every((val) => val.chapterState >= CHAPTER_STATE.viewed);
    }

    public setLessonReportCompleteState(comp: boolean) {
        this.report.isComplete = comp;
    }

    public setLessonChapterCompleteState(chapters: ChapterVo[]) {
        if (!chapters) { return; }
        chapters.forEach((element) => {
            this.setChapterCompStateByChapterId(element.chapterId, element.complete);
            this.setChapterState(element.chapterId, element.chapterState);
        });

    }
    public setChapterCompStateByChapterId(chapterId: number, comp: boolean) {
        let chapterData = this.chapters.find((ele) => ele.chapterId == chapterId);
        if (!chapterData) {
            return 
        }
        //完成
        comp && (chapterData.complete = comp);
        //学习状态
        comp && (chapterData.chapterState = CHAPTER_STATE.learned);
    }

    public setChapterFirstCompByChapterId(chapterId: number, comp: boolean) {
        let chapterData = this.chapters.find((ele) => ele.chapterId == chapterId);
        if (!chapterData) {
            return
        }
        //首次完成
        if (!chapterData.complete && comp) {
            chapterData.isFirstComplete = true;
        }else{
            chapterData.isFirstComplete = false;
        }
    }

    /**
     * 设置环节状态
     */
    public setChapterState(chapterId: number, state: CHAPTER_STATE) {
        let chapterData = this.chapters.find((ele) => ele.chapterId == chapterId);
        if (chapterData) {
            chapterData.chapterState < state && (chapterData.chapterState = state);
            if (chapterData.chapterState == CHAPTER_STATE.learned) {
                chapterData.complete = true;
            }
        }
    }
}

export { ChapterVo };
