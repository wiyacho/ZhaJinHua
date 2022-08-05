import { kit } from "../../kit/kit";
import { PICTURE_BOOK_LIST_CONFIG } from "../config/config";
import { BookItemData } from "../structure/interfaceVo";

const BOOK_LIST_MANAGER_SAVE_KEY = 'BOOK_LIST_MANAGER_SAVE_KEY';

export  class PicBookDataManager {
    private picBookItemList: BookItemData[]; 
    private static _instance: PicBookDataManager;

    public static get instance(): PicBookDataManager {
        if (!PicBookDataManager._instance) {
            PicBookDataManager._instance = new PicBookDataManager();
        }
        return PicBookDataManager._instance;
    }

    constructor() {
        this.picBookItemList = [];
    }

    public async init(): Promise<any> {
        let picBookListConfig = await this.getPicBookListConfig();
        let unLockData = kit.util.LocalStorage.getObject(BOOK_LIST_MANAGER_SAVE_KEY)||{};
        for (const key in picBookListConfig) {
            const config = picBookListConfig[key];
            let data = new BookItemData(config, (unLockData[config.id] && unLockData[config.id].unlock) || config.unlock);
            this.picBookItemList.push(data);

        }

        cc.log(" ===this.picBookItemList: ", this.picBookItemList);
    }

    // 获取课程列表
    private getPicBookListConfig(): Promise<any> {
        return new Promise((res, rej) => {
            res(PICTURE_BOOK_LIST_CONFIG);
        })
    }

    getPicBookListData():BookItemData[]{
        return this.picBookItemList;
    }


    getPicBookDataById(id:number): BookItemData{
        return this.picBookItemList.find(ele=>{
            return ele.id == id;
        })
    }

    setPicBookItemUnlockById(id: number){
        let picBookData = this.picBookItemList.find(ele => {
            return ele.id == id;
        })
        if (picBookData) {
            picBookData.setUnlock();
        } else {
            cc.warn(`picBook data nil! picBook id: ${id}`);
        }

        this.save();
    }

    save(){
        let obj = {}
        this.picBookItemList.forEach((val: BookItemData) => {
            let key = val.id;
            obj[key] = {}
            obj[key]['unlock'] = val.unlock;
        
        })
        kit.util.LocalStorage.setObject(BOOK_LIST_MANAGER_SAVE_KEY, obj);
    }

}
