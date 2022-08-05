import { kit } from "../../kit/kit";
import { ENCOURAGE_WALL_LIST_CONFIG } from "../config/config";
import { EncourageItemData } from "../structure/interfaceVo";

const ENCOURAGE_LIST_MANAGER_SAVE_KEY = 'ENCOURAGE_LIST_MANAGER_SAVE_KEY';

export class EncourageWallDataManager {
    private encourageItemList: EncourageItemData[];
    private static _instance: EncourageWallDataManager;

    public static get instance(): EncourageWallDataManager {
        if (!EncourageWallDataManager._instance) {
            EncourageWallDataManager._instance = new EncourageWallDataManager();
        }
        return EncourageWallDataManager._instance;
    }

    constructor() {
        this.encourageItemList = [];
    }

    public async init(): Promise<any> {
        let gameListConfig = await this.getGameListConfig();
        let unLockData = kit.util.LocalStorage.getObject(ENCOURAGE_LIST_MANAGER_SAVE_KEY) || {};

        for (const key in gameListConfig) {
            const config = gameListConfig[key];
            let lockState = config.lockVal;
            if (unLockData && unLockData[config.lessonId] && unLockData[config.lessonId].lockVal == 0) {
                lockState = 0;
            }
            let data = new EncourageItemData(config, lockState);
            this.encourageItemList.push(data);
        }

        cc.log(" ===this.gameItemList: ", this.encourageItemList);
        return Promise.resolve();
    }

    // 获取课程列表
    private getGameListConfig(): Promise<any> {
        return new Promise((res, rej) => {
            res(ENCOURAGE_WALL_LIST_CONFIG);
        })
    }


    getEncourageListData(): EncourageItemData[] {
        return this.encourageItemList;
    }

    getEncourageDataById(lessonId: number): EncourageItemData {
        return this.encourageItemList.find(ele => {
            return ele.lessonId == lessonId;
        })
    }

    setEncourageItemUnlockById(lessonId: number) {
        let encourageData = this.encourageItemList.find(ele => {
            return ele.lessonId == lessonId;
        })

        if (encourageData) {
            encourageData.setUnlock();
        } else {
            cc.warn(`encourage data nil! encourage id: ${lessonId}`);
        }

        this.save();
    }

    save() {
        let obj = {}
        this.encourageItemList.forEach((val: EncourageItemData) => {
            let key = val.lessonId;
            obj[key] = {}
            obj[key]['lockVal'] = val.lockVal;

        })
        kit.util.LocalStorage.setObject(ENCOURAGE_LIST_MANAGER_SAVE_KEY, obj);
    }

}