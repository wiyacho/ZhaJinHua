
import { CHAPTER_CONFIG_LIST } from "../config/config";
import { CHAPTER_STATE_V2, CHAPTER_TYPE_V2, LESSON_STATE_V2, LESSON_TYPE_V2 } from "../config/enum";
import AppUtils from "../utils/AppUtils";

// 课程配置
export class ChapterVo_V2 {
    // 课程环节ID
    public lessonChapterId: number;
    // 环节ID
    public chapterId: number;
    // 环节名
    public chapterName: string;
    // 课程ID
    public lessonId: number;
    // 课程名
    public lessonName: string;
    // zip包 url
    public storyUrl: string;
    // 环节icon
    public iconUrl: string;
    // 资源包url(视频、绘本等)
    public fileUrl: string;
    // 环节完成状态:0-未完成;1-进行中;2-已完成;
    public chapterStatus: CHAPTER_STATE_V2;
    // 环节类型:1-视频;2-游戏;3-绘本;4:报告;
    public type: CHAPTER_TYPE_V2;

    // 入口名称
    public fileName: string;


    constructor(data?: any) {
        if (data) {
            this.parse(data);
        }
    }

    public parse(data: any): void {
        this.lessonChapterId = data?.lessonChapterId;
        this.chapterId = data?.chapterId;
        this.lessonId = data?.lessonId;
        this.fileName = data?.fileName;
        this.chapterName = data?.chapterName;
        this.lessonName = data?.lessonName;
        this.storyUrl = data?.storyUrl;
        this.iconUrl = data?.iconUrl;
        this.fileUrl = data?.fileUrl;
        this.chapterStatus = data?.chapterStatus || CHAPTER_STATE_V2.unComplete;
        this.type = data?.type;

        if (this.type == CHAPTER_TYPE_V2.video) { // 接口下发的fileName 有时候是空的！！
            this.fileName = 'video'
        }
    }

    public get entryName() : string {
        return this.fileName;
    }

    /**
     * 获取课程入口配置
     */
    public getChapterConfig(): any {
        let entryName = this.entryName;
        let gameConfig = null;
        if (cc.sys.isNative) {
            let genPath = AppUtils.getAppWritablePath();
            let path = `${genPath}assets/${entryName}/game_config.json`
            let config = jsb.fileUtils.getStringFromFile(path);
            gameConfig = config && JSON.parse(config);
        }
     
        let json 
        if (!gameConfig) {
            gameConfig = CHAPTER_CONFIG_LIST
        }
        json = this.getConfig(gameConfig,entryName)
        //在game_config 中未找到 CHAPTER_CONFIG_LIST保底
        if(!json){
            json = this.getConfig(CHAPTER_CONFIG_LIST,entryName)
        }
        return json
    }

    public getConfig(config,entryName){
        for (const iterator of config) {
            let asset:[string] = iterator.assets;
            if (asset.find((name) => entryName == name)){
                return iterator;
            }
        }
        return null
    }

    /**
     * 设置课程完成状态
     */
    public setChapterComplete() {
        this.chapterStatus = CHAPTER_STATE_V2.completed;
    }


}


// 单元配置
export class LessonVo_V2 {
    // 课程ID
    public lessonId: number;
    // 课程名
    public lessonName: string;
    // 课程icon url
    public lessonIcon: string;
    // 课程类型:1-词汇课;2-小测;3-语法课;
    public lessonType: LESSON_TYPE_V2;
    // 课程类型:1-词汇课;2-小测;3-语法课;
    public lessonStatus: LESSON_STATE_V2;

    constructor(data?: any) {
        if (data) {
            this.parse(data);
        }
    }

    public parse(data: any): void {
        this.lessonId = data?.lessonId;
        this.lessonName = data?.lessonName;
        this.lessonIcon = data?.lessonIcon;
        this.lessonType = data?.lessonType;
        this.lessonStatus = data?.lessonStatus;
    }


    public get lessonComplete() {
        return this.lessonStatus == LESSON_STATE_V2.completed || !this.lessonId;
    }
}

