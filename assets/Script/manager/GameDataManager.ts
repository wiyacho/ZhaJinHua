import { kit } from "../../kit/kit";
import { GAME_LIST_CONFIG } from "../config/config";
import { GameItemData } from "../structure/interfaceVo";

const GAME_LIST_MANAGER_SAVE_KEY = 'GAME_LIST_MANAGER_SAVE_KEY';

export  class GameDataManager {
    private gameItemList: GameItemData[]; 
    private static _instance: GameDataManager;

    public static get instance(): GameDataManager {
        if (!GameDataManager._instance) {
            GameDataManager._instance = new GameDataManager();
        }
        return GameDataManager._instance;
    }

    constructor() {
        this.gameItemList = [];
    }

    public async init(): Promise<any> {
        let gameListConfig = await this.getGameListConfig();
        let unLockData = kit.util.LocalStorage.getObject(GAME_LIST_MANAGER_SAVE_KEY)||{};

        for (const key in gameListConfig) {
            const config = gameListConfig[key];
            let data = new GameItemData(config, ((unLockData[config.id] && unLockData[config.id].unlock) || config.unlock));
            this.gameItemList.push(data);

        }

        cc.log(" ===this.gameItemList: ", this.gameItemList);
    }

    // 获取课程列表
    private getGameListConfig(): Promise<any> {
        return new Promise((res, rej) => {
            res(GAME_LIST_CONFIG);
        })
    }


    getGameListData(): GameItemData[]{
        return this.gameItemList;
    }

    getGameDataById(id:number): GameItemData{
        return this.gameItemList.find(ele=>{
            return ele.id == id;
        })
    }

    setGameItemUnlockById(id: number){
        let gameData = this.gameItemList.find(ele => {
            return ele.id == id;
        })
        if (gameData) {
            gameData.setUnlock();
        }else{
            cc.warn(`game data nil! game id: ${id}`);
        }

        this.save();
    }

    save(){
        let obj = {}
        this.gameItemList.forEach((val: GameItemData) => {
            let key = val.id;
            obj[key] = {}
            obj[key]['unlock'] = val.unlock;
        
        })
        kit.util.LocalStorage.setObject(GAME_LIST_MANAGER_SAVE_KEY, obj);
    }

}
