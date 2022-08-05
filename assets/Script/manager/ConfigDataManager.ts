import { kit } from "../../kit/kit";
import { GAME_LIST_CONFIG } from "../config/config";
import { GameItemData } from "../structure/interfaceVo";


export class ConfigDataManager {
    private configData: Map<string, any>;
    private static _instance: ConfigDataManager;

    public static get instance(): ConfigDataManager {
        if (!ConfigDataManager._instance) {
            ConfigDataManager._instance = new ConfigDataManager();
        }
        return ConfigDataManager._instance;
    }

    constructor() {
        this.configData = new Map<string, any>();
    }


    public async init(): Promise<any> {
        let configList = [
            "config/lessonconfig",
        ]
        return Promise.all(configList.map((configPath) => {
            return new Promise<void>((resolve, reject) => {
                cc.resources.load(configPath, (err, data)=> {
                    this.configData.set(configPath, data);
                    resolve();
                });
            });
        }));

    }

    public getLessonConfig(): LessonConfig[]{
        return this.configData.get('config/lessonconfig').json;
    }
    

}
