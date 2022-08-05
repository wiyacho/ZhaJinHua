import { ConfigDataManager } from './../manager/ConfigDataManager';
import { EncourageWallDataManager } from './../manager/EncourageWallDataManager';
import Main from "../app";
import { BUNDLE_COMPONENTS, BUNDLE_ROOT, GAME_VERSION, PRELOAD_LIST, SPOT_KEY, URL_BASE, URL_BASE_TEST } from "../config/config";
import FollowReadState from "./globalState/FollowReadState";
import { GameDataManager } from "../manager/GameDataManager";
import { PicBookDataManager } from "../manager/PicBookDataManager";
import { kit } from '../../kit/kit';
import AssetsManager from '../manager/assetsManager';
import ModelManager from '../../kit/model/ModelManager';
import Spot from '../config/spot';
import CommonTipsState from './globalState/CommonTipsState';
import NetworkState from './globalState/NetworkState';
import BackGroundMusicState from './globalState/BackGroundMusicState';
import HallStateV2 from './HallStateV2';
import UserModel from '../modle/UserModel';
import GameBoardState from './GameBoardState';

export default class InitState implements kit.fsm.State<Main> {
    public entity: Main;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public async enter(data?: any): Promise<void> {
        this.entity.host = kit.system.platform.isDebug ? URL_BASE_TEST : URL_BASE;
        // 初始化配置
        // 初始化网络
        this.entity.stateMachine.AddGlobalState(NetworkState);
        // if (ModelManager.instance.UserToken == "" || ModelManager.instance.UserToken == "testToken") {
        //     ModelManager.instance.getModel(UserModel).reqToken();
        // }
        // 加载大厅
        // 拉取app配置
        // 拉取用户信息
        // 初始化第三方sdk


        // 游戏列表
        GameDataManager.instance.init();
        // 绘本列表
        PicBookDataManager.instance.init();

        // 激励墙
        await EncourageWallDataManager.instance.init();

        let phoneInfo = JSON.parse(ModelManager.instance.phoneInfo);
        // 业务埋点
        let baseInfo: any = {
            "user_id": ModelManager.instance.UserId,
            "device_id": phoneInfo.device_uuid,
            "app_version": GAME_VERSION,
            "os_version": phoneInfo.os_ver || cc.sys.osVersion,
            "os_name": phoneInfo.os_type || cc.sys.os,
            "country": ModelManager.instance.CountryName,
            "platform": phoneInfo.os_type,
            "language": "English",
            ...phoneInfo
        }
        // @ts-ignore
        if (ModelManager.instance.UserId != -1) {
            baseInfo.UserID = ModelManager.instance.UserId;
            cc.log(`baseInfo.UserID:${baseInfo.UserID}`);
        }
        await kit.system.spot.init(baseInfo, SPOT_KEY);

        await this.preloadComponents();

        this.entity.stateMachine.AddGlobalState(FollowReadState);
        this.entity.stateMachine.AddGlobalState(CommonTipsState);

        if (kit.system.platform.isDebug) {
            await ModelManager.instance.getModel(UserModel).reqToken();
            await ConfigDataManager.instance.init();
            this.entity.stateMachine.AddGlobalState(BackGroundMusicState);
            // 调试模式直接进入大厅
            this.entity.stateMachine.ChangeState(HallStateV2);
            return;
        }
        if (kit.system.platform.isGameBoard) {
            this.entity.stateMachine.ChangeState(GameBoardState);
        } else {
            // this.entity.stateMachine.ChangeState(FirstPageState);
            await ModelManager.instance.getModel(UserModel).reqToken();
            if (ModelManager.instance.CountryName == "") {
                ModelManager.instance.getModel(UserModel).messageCountryInfo()
            }
            await ConfigDataManager.instance.init();
            this.entity.stateMachine.AddGlobalState(BackGroundMusicState);
            this.entity.stateMachine.ChangeState(HallStateV2);
            if (kit.system.platform.isNative) {
                AppHelper.amplitude_logUserId(ModelManager.instance.UserId);
                kit.system.spot.send(Spot.AELC_openAPP);
                // @ts-ignore
                jsb.Device.setKeepScreenOn(true);
                let searchPaths = jsb.fileUtils.getSearchPaths();
                cc.log('searchPaths:>>>>>>>>>>>>>>>>>' + JSON.stringify(searchPaths))
            };
        }
        return Promise.resolve()
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
    }

    // 预加载通用模块
    private preloadComponents(): Promise<any> {
        let list: Promise<void>[] = []
        return new Promise((res, rej) => {
            kit.manager.resources.loadBundle(`${BUNDLE_ROOT}/${BUNDLE_COMPONENTS}`).then((bundle: cc.AssetManager.Bundle) => {
                PRELOAD_LIST.forEach((element: string) => {
                    list.push(
                        new Promise<void>((resPre, rejPre) => {
                            bundle.load(`${element}/${element}`, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
                                if (error) {
                                    cc.error(`preload components error,target is empty.component name:${element}`);
                                    rejPre(error);
                                    return;
                                }
                                let node: cc.Node = cc.instantiate(prefab);
                                AssetsManager.instance.addGlobalNode(node);
                                resPre()
                            })
                        })
                    )
                })
                return Promise.all(list).then(res);
            })
            // this.toHall()
        })
    }

}