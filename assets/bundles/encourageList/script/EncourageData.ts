import { kit } from "../../../kit/kit";
import { GAME_LIST_CONFIG, PICTURE_BOOK_LIST_CONFIG } from "../../../Script/config/config";
import { EncourageWallDataManager } from "../../../Script/manager/EncourageWallDataManager";

const {ccclass} = cc._decorator;

@ccclass
export default class EncourageData {
    public static SHOW_DETAIL = "show_detail";

    private static _instance: EncourageData = null;
    public static get instance(): EncourageData {
        if (EncourageData._instance == null) {
            EncourageData._instance = new EncourageData();
        }
        return EncourageData._instance;
    }

    public paintGameId = 0;
    public paintPropId = [1001, 1002, 1003, 1004, 1005]

    private _clickLessonId: number = -1;
    public set clickLesson (value) {
        this._clickLessonId = value;
    }
    public get clickLesson (): number {
        return this._clickLessonId;
    }

    public encourageList (): any[] {
        return EncourageWallDataManager.instance.getEncourageListData();
    }

    public encourageInfo (lessonId: number): any {
        let list = this.encourageList();
        for (let i = 0; i < list.length; i ++) {
            if (list[i].lessonId == lessonId) {
                return list[i];
            }
        }
        return null;
    }

    public nextEncourageInfo (index: number) {
        let list = this.encourageList();
        if (index == list.length - 1) {
            return null;
        }
        return list[index + 1];
    }


    // 获取游戏信息
    public gameInfo (lessonId: number) {
        let info = this.encourageInfo(lessonId);
        let resInfo = {};
        GAME_LIST_CONFIG.find((item) => {
            if (item.id == info.gameId) {
                resInfo = item;
            }
        })

        resInfo["params"]['gameId'] =  info.gameId.toString();
        resInfo["params"]['propId'] =  info.propId.toString();
        cc.log("获取游戏信息",resInfo);
        return resInfo;
    }


    // 获取绘本信息
    public bookInfo (lessonId: number) {
        let info = this.encourageInfo(lessonId);
        let resInfo = {};
        PICTURE_BOOK_LIST_CONFIG.find((item) => {
            if (item.id == info.gameId) {
                resInfo = item;
            }
        })
        resInfo["params"]['gameId'] =  info.bookId.toString();
        resInfo["params"]['propId'] =  "0";
        cc.log("获取绘本信息",resInfo);
        return resInfo;
    }
    private assetMap : cc.Texture2D[] = [];

    public getPaintIcon (propId: number): Promise<cc.SpriteFrame> {
        if (!kit.system.platform.isNative) {
            return Promise.resolve(null);
        }
        return new Promise<cc.SpriteFrame>((reslove, reject) => {
            let filePath = `${jsb.fileUtils.getWritablePath()}${propId}paint.png`;
            if (!jsb.fileUtils.isFileExist(filePath)) {
                reslove(null);
                return;
            }
            cc.assetManager.loadRemote(filePath,(err,res:cc.Texture2D)=>{
                console.log(res);
                if(err || !res)
                {
                    console.log("加载失败",err);
                    reslove(null);
                    return;
                }
                res.addRef();
                this.assetMap.push(res);
                let spr: cc.SpriteFrame = new cc.SpriteFrame()
                spr.setTexture(res);
                reslove(spr);
            })
        })
    }

    public release () {
        for(let i = 0; i < this.assetMap.length; i ++) {
            this.assetMap[i].decRef();
        }
        this.assetMap = [];
    }
    
}
