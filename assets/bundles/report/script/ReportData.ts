import { CHAPTER_STATE_V2, CHAPTER_TYPE_V2 } from "../../../Script/config/enum";
import LessonManagerV2 from "../../../Script/manager/LessonManagerV2";
import { ChapterVo_V2, LessonVo_V2 } from "../../../Script/structure/lessonVoV2";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReportData {
    private static _instance: ReportData = null;
    public static get instance(): ReportData {
        if (ReportData._instance == null) {
            ReportData._instance = new ReportData();
        }
        return ReportData._instance;
    }

    public get lessonVo_V2 (): LessonVo_V2 {
        return LessonManagerV2.instance.getCurViewLessonData();
    }

    public get chapterData (): ChapterVo_V2{
        let data: ChapterVo_V2;
        let _lessonListVo = LessonManagerV2.instance.totalChapterData;
        _lessonListVo.forEach((item, index)=> {
            if (item.type == CHAPTER_TYPE_V2.report) {
                data = item;
            }
        }) 
        return data;
    }

    // 当前课程数据
    public get lessonListVo (): ChapterVo_V2[] {
        let lessonArray = [];
        let _lessonListVo = LessonManagerV2.instance.totalChapterData;
        _lessonListVo.forEach((item, index)=> {
            if (item.type != CHAPTER_TYPE_V2.report) {
                lessonArray.push(_lessonListVo[index]);
            }
        }) 
        return lessonArray;
    }

    // 已完成星星
    public get starCount (): number {
        let count = 0;
        if (!this.lessonListVo) {
            return 0;
        }
        this.lessonListVo.find((item) => {
            if (item.chapterStatus == CHAPTER_STATE_V2.completed) {
                count ++;
            }
        })
        return count;
    }

    public get guideIndex (): number {
        let index = -1;
        for (let i = 0; i < this.lessonListVo.length; i ++) {
            if (index != -1) {
                return index;
            }
            if (this.lessonListVo[i].chapterStatus != CHAPTER_STATE_V2.completed) {
                index = i;
            }
        }
        return index;
    }

    /**
     * 获取激励信息
     */
    public get encourageData (): any {
        let lessonListVo = this.lessonListVo;
        return null;
        // return lessonListVo.rewardInfo;
    }

    /** 是否获得道具显示激励 */
    public showEncourage (): boolean {
        let encourageData = this.getEncourageInfo();
        // // 已经是解锁了
        // if (encourageData && encourageData.lockVal == 0) {
        //     return false;
        // }
        return false;
        // let reportComplete = this.lessonListVo.report.isComplete;
        // // 已经完成过了
        // if (reportComplete) {
        //     return false;
        // }

        // // 有没有完成的环节
        // if (this.guideIndex != -1) {
        //     return false;
        // }

        // return true;
    }

    // 获取游戏信息
    public get gameInfo () {
        return ;
        // let rewardInfo = this.lessonListVo.rewardInfo;
        // let resInfo = {};
        // GAME_LIST_CONFIG.find((item) => {
        //     if (item.id == rewardInfo.gameId) {
        //         resInfo = item;
        //     }
        // })
        // resInfo["params"] = {propId: rewardInfo.propId};
        // cc.log("获取游戏信息",resInfo);
        // return resInfo;
    }

    // 获取绘本信息
    public get bookInfo () {
        return null;
        // let rewardInfo = this.lessonListVo.rewardInfo;
        // let resInfo = {};
        // PICTURE_BOOK_LIST_CONFIG.find((item) => {
        //     if (item.id == rewardInfo.gameId) {
        //         resInfo = item;
        //     }
        // })
        // resInfo["params"] = {propId: rewardInfo.propId};
        // cc.log("获取绘本信息",resInfo);
        // return resInfo;
    }
    /** 学习报告完成 */
    public reportFinish () {
        // LessonManager.instance.setReportCompleteState();
    }

    /** 获取激励信息 */
    public getEncourageInfo () {
        return null;
        // return EncourageWallDataManager.instance.getEncourageDataById(this.lessonListVo.lessonId);
    }
}
