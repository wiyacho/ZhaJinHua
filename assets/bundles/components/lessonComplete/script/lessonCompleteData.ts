import ChapterVo from "../../../../Script/structure/lessonVo"
export const MESSAGE_COMPLETE = "message_complete"
export const BUNDLE_NAME = "components"   
export const MUSIC_PATH = "lessonComplete/audio/"
export class lessonCompleteData {

    private static _instance: lessonCompleteData
    public lessonInfo :ChapterVo[] =  []         //所有环节数据
    public curChapterData :ChapterVo             //当前环节数据
    public curChapterId :number = null          //当前环节ID
    public lessonType: number = 1               //通用动画类型
  
    public init(data){
        this.lessonInfo = data?.lessonInfo?.chapters
        this.curChapterData = data?.curChapterData 
        this.curChapterId = data?.curChapterData?.chapterId
        this.lessonType = data?.lessonType
    }

    /* 获取所有宝箱状态 */
    public getAllBoxState(){
        let arr = []
        this.lessonInfo.map((item,index)=>{ arr[index] = item.complete})
        return arr
    }

    /* 获取当前环节下标 */
    public getCurChapterIndex(){
        let c_index = 0
        this.lessonInfo.find((item,index)=>{
            if(item.chapterId == this.curChapterId)
            {
                c_index = index
            }
        })
        return c_index
    }

    /* 获取当前环节是否首次完成状态 */
    public getCurChapterIsFirstComplete(){
        return this.curChapterData && this.curChapterData.isFirstComplete || false
    }

    /* 获取当前环节模版图标 */
    public getCurChapterIcon(){
        let icon_config = {     //模版图标配置
            3:[
                "lessonComplete/res/chapter3_1",
                "lessonComplete/res/chapter3_2",
                "lessonComplete/res/chapter3_3"
            ],
            4:[
                "lessonComplete/res/chapter4_1",
                "lessonComplete/res/chapter4_2",
                "lessonComplete/res/chapter4_3",
                "lessonComplete/res/chapter4_4"
            ]
        }
        let len = this.lessonInfo.length
        let c_index = this.getCurChapterIndex()
        let c_data = icon_config[len]
        return c_data[c_index] 
    }


    public static get instance(): lessonCompleteData {
        if (!lessonCompleteData._instance) {
            lessonCompleteData._instance = new lessonCompleteData();
        }
        return lessonCompleteData._instance;
    }
}
