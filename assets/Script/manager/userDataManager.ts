import { kit } from '../../kit/kit';

const USER_GUILD_STEP = "USER_GUILD_STEP";

// 主要负责用户信息管理
export class UserDataManager {
    private static _instance: UserDataManager;

    private _guideStep: number = 0;

    constructor() {
        this._guideStep = kit.util.LocalStorage.getInt(USER_GUILD_STEP) || 0;
    }

    public get guideStep(): number {
        return this._guideStep;
    }

    public set guideStep(value: number) {
        this._guideStep = value;
        kit.util.LocalStorage.setInt(USER_GUILD_STEP, value);
    }

    public static get instance(): UserDataManager {
        if (!UserDataManager._instance) {
            UserDataManager._instance = new UserDataManager();
        }
        return UserDataManager._instance;
    }

}