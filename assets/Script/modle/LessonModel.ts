import { kit } from "../../kit/kit";
import EventSystem from "../../kit/system/event/EventSystem";
import LessonManagerV2 from "../manager/LessonManagerV2";
export default class LessonModel extends kit.model.modelBase {

    public reqLessonList (cb?: (msg) => void) {
        return new Promise((res, reject) => {
            let message = new MessageLessonList();
            this.registerCallBack(message, (msg) => {
                let data;
                if (msg && msg.code == 200 && msg.data) {
                    data = msg.data;
                }
                res(data);
            });
            this.sendMessage(message);
        });
    }

    public resLessonList (data) {
        cc.log("返回list", data);
        let msg = data.data;
        if (msg && msg.code == 200 && msg.data) {
            LessonManagerV2.instance.setLessonList(msg.data);
        }
    }

    public reqChapterInfo(lessonId:number, cb?: (msg) => void) {
        return new Promise((res, reject) => {
            let message = new MessageChapterInfo();
            message.param.lessonId = lessonId;
            this.registerCallBack(message, (msg) => {
                let data;
                if (msg && msg.code == 200 && msg.data) {
                    data = msg.data;
                }
                res(data);
            });
            this.sendMessage(message);
        });
    }

    /**
     * 上报学习进度
     */
    public report(params: ChapterReportParams) {
        return new Promise((res, reject) => {
            let message = new MessageChapterReport();
            message.param = params;
            this.registerCallBack(message, (msg) => {
                let data;
                if (msg && msg.code == 200 && msg.data) {
                    data = msg.data;
                }
                res(data);
            });
            this.sendMessage(message);
        });
    }

    /** 注册回调 */
    public messageCallBack(): {key: string, callBack: (responseData) => void, target: any}[] {
        return [{key: "/cnapi/lesson/list", callBack: this.resLessonList, target: this}];
    }
}


/** 课程列表 */
export class MessageLessonList extends kit.model.messageBase{
    messageApi = "/cnapi/lesson/list";
    param = {};
    debugData = {
        "code": 200,
        "message": "success",
        "data": {
            "lessonList": [{
                "lessonId": 1,
                "name": "Lesson1",
                "lessonIcon": "https://stage.cdn.lingoace.com/chineseai/20211102/0558395d5e4049469eb6f3e604738d48.png",
                "lessonType": 1,
                "lessonStatus": 1
            }, {
                "lessonId": 2,
                "name": "lesson 2",
                "lessonIcon": "https://stage.cdn.lingoace.com/chineseai/20211102/1c16859f343b4054bb50e205c2314e33.png",
                "lessonType": 1,
                "lessonStatus": 0
            }, {
                "lessonId": 3,
                "name": "lesson 3",
                "lessonIcon": "https://stage.cdn.lingoace.com/english/20211025/e6caa76d87ed4bb8b5bab2a6cbe64f73.png",
                "lessonType": 1,
                "lessonStatus": 0
            }, {
                "lessonId": 4,
                "name": "lesson 4",
                "lessonIcon": "https://stage.cdn.lingoace.com/english/20211025/454158d264654925b75d814473df3d0a.png",
                "lessonType": 1,
                "lessonStatus": 0
            }, {
                "lessonId": 5,
                "name": "lesson 5",
                "lessonIcon": "https://stage.cdn.lingoace.com/english/20211025/58d2562d984946c89e533a3507650db1.png",
                "lessonType": 2,
                "lessonStatus": 0
            }],
            "locationLessonId": 1
        }
    };
}
    

/** 课程列表 */
export class MessageChapterInfo extends kit.model.messageBase {
    messageApi = "/cnapi/lesson/detail";
    param: { lessonId: number } = { lessonId:-1};
    debugData = {
        "code": 200,
        "message": "success",
        "data": {
            "chapterList": [{
                "type": 1,
                "lessonChapterId": 9,
                "lessonId": 1,
                "chapterId": 7,
                "fileName": "video",
                "storyUrl": "https://stage.cdn.lingoace.com/english/20211102/8dce9cf4df2f464f9a3017616d0f455d.zip",
                "fileUrl": "https://stage.cdn.lingoace.com/english/20211026/6f352a1e803647edb77e1f5e198253f0.mp4",
                "iconUrl": "https://stage.cdn.lingoace.com/chineseai/20211029/7c93979d6ca94d8d8b9b3095af76353f.png",
                "chapterStatus": 1
            }, {
                "type": 1,
                "lessonChapterId": 29,
                "lessonId": 1,
                "chapterId": 17,
                "fileName": "video",
                "storyUrl": "https://stage.cdn.lingoace.com/english/20211102/8dce9cf4df2f464f9a3017616d0f455d.zip",
                "fileUrl": "https://stage.cdn.lingoace.com/english/20211026/6f352a1e803647edb77e1f5e198253f0.mp4",
                "iconUrl": "https://stage.cdn.lingoace.com/chineseai/20211029/7c93979d6ca94d8d8b9b3095af76353f.png",
                "chapterStatus": 1
            }, {
                "type": 1,
                "lessonChapterId": 19,
                "lessonId": 1,
                "chapterId": 27,
                "fileName": "video",
                "storyUrl": "https://stage.cdn.lingoace.com/english/20211102/8dce9cf4df2f464f9a3017616d0f455d.zip",
                "fileUrl": "https://stage.cdn.lingoace.com/english/20211026/6f352a1e803647edb77e1f5e198253f0.mp4",
                "iconUrl": "https://stage.cdn.lingoace.com/chineseai/20211029/7c93979d6ca94d8d8b9b3095af76353f.png",
                "chapterStatus": 1
            }, {
                "type": 1,
                "lessonChapterId": 39,
                "lessonId": 1,
                "chapterId": 37,
                "fileName": "video",
                "storyUrl": "https://stage.cdn.lingoace.com/english/20211102/8dce9cf4df2f464f9a3017616d0f455d.zip",
                "fileUrl": "https://stage.cdn.lingoace.com/english/20211026/6f352a1e803647edb77e1f5e198253f0.mp4",
                "iconUrl": "https://stage.cdn.lingoace.com/chineseai/20211029/7c93979d6ca94d8d8b9b3095af76353f.png",
                "chapterStatus": 1
            }, {
                "type": 4,
                "chapterStatus": 0
            }],
            "locationLessonChapterId": 39
        }
    };
}

export class MessageChapterReport extends kit.model.messageBase {
    messageApi = "/cnapi/lesson/chapter/report";
    param: ChapterReportParams;
    showTips = false;
}





export interface ChapterReportParams {
    lessonId: number; //课程ID
    chapterId: number; //环节ID
    lessonChapterId: number; //课程环节ID
    speedVal: number; //完成进度:0:进入;1-已完成;
    type: number;
}