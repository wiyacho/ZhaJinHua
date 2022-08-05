/**
 * 生命周期-创建完毕
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_CREATED代替
 */
export const LIFE_CYCLE_CREATED: string = "lifeCycleCreated";
/**
 * 生命周期-就绪
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_READY
 */
export const LIFE_CYCLE_READY: string = "lifeCycleReady";
/**
 * 生命周期-完成
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_COMPLETE
 */
export const LIFE_CYCLE_COMPLETE: string = "lifeCycleComplete";
/**
 * 生命周期-阻塞事件
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_BLOCK
 */
export const LIFE_CYCLE_BLOCK: string = "lifeCycleBlock";
/**
 * 生命周期-取消阻塞事件
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_UNBLOCK
 */
export const LIFE_CYCLE_UNBLOCK: string = "lifeCycleUnblock";
/**
 * 生命周期-给子模块传参
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_PARAMS
 */
export const LIFE_CYCLE_PARAMS: string = "lifeCycleParams";
/**
 * 生命周期-返回(不弹出确认框直接退出，用于有失败概念的游戏使用)
 * @deprecated 废弃，推荐使用Events.LIFE_CYCLE_BACK
 */
export const LIFE_CYCLE_BACK: string = "lifeCycleBack";
/**
 * 跟读模块-子游戏TO跟读模块事件
 * @deprecated 废弃，推荐使用Events.FOLLOW_CLIENT_TO_MODULE
 */
export const FOLLOW_CLIENT_TO_MODULE: string = 'followClientToModule';
/**
 * 跟读模块-子游戏TO跟读模块事件
 * @deprecated 废弃，推荐使用Events.FOLLOW_MODULE_TO_CLIENT
 */
export const FOLLOW_MODULE_TO_CLIENT: string = 'followModuleToClient';
/**
 * 视频 框架-子游戏
 * @deprecated 废弃，推荐使用Events.VIDEO_CLIENT_TO_MODULE
 */
export const VIDEO_CLIENT_TO_MODULE: string = 'voidClient2Module';
/**
 *  视频 子游戏-框架
 * @deprecated 废弃，推荐使用Events.VIDEO_MODULE_TO_CLIENT
 */
export const VIDEO_MODULE_TO_CLIENT: string = 'voidModule2Client';
/**
 * 控制容器顶部按钮 (用于有自身有二级返回的游戏使用)
 * @deprecated 废弃，推荐使用Events.SET_TOP_BAR_ACTIVE
 */
export const SET_TOP_BAR_ACTIVE: string = "setTopBarActive";


export default class Events {
    // 生命周期-创建完毕
    public static readonly LIFE_CYCLE_CREATED: string = "lifeCycleCreated";
    // 生命周期-就绪
    public static readonly LIFE_CYCLE_READY: string = "lifeCycleReady";
    // 生命周期-游戏结束（执行顺序：游戏结束，播放奖励动画，完成）
    public static readonly LIFE_CYCLE_GAME_END: string = "lifeCycleGameEnd";
    // 生命周期-完成
    public static readonly LIFE_CYCLE_COMPLETE: string = "lifeCycleComplete";
    // 生命周期-阻塞事件
    public static readonly LIFE_CYCLE_BLOCK: string = "lifeCycleBlock";
    // 生命周期-取消阻塞事件
    public static readonly LIFE_CYCLE_UNBLOCK: string = "lifeCycleUnblock";
    // 给子模块传参
    public static readonly LIFE_CYCLE_PARAMS: string = "lifeCycleParams";
    // 生命周期-返回(不弹出确认框直接退出，用于有失败概念的游戏使用)
    public static readonly LIFE_CYCLE_BACK: string = "lifeCycleBack";

    // 跟读模块-子游戏TO跟读模块事件
    public static readonly FOLLOW_CLIENT_TO_MODULE: string = 'followClientToModule';
    // 跟读模块-子游戏TO跟读模块事件
    public static readonly FOLLOW_MODULE_TO_CLIENT: string = 'followModuleToClient';

    // 视频 框架-子游戏
    public static readonly VIDEO_CLIENT_TO_MODULE: string = 'voidClient2Module';
    // 视频 子游戏-框架(暂停、播放、卡顿、拖拽进度等) 枚举参考：VideoEventTransType
    public static readonly VIDEO_MODULE_TO_CLIENT: string = 'voidModule2Client';

    // 控制容器顶部按钮 (用于有自身有二级返回的游戏使用)
    public static readonly SET_TOP_BAR_ACTIVE: string = "setTopBarActive";

    // 展示通用弹窗
    public static readonly SHOW_COMMON_TIPS_POP: string = "showCommonTipsPop";

    //热更ok
    public static readonly HOTFIX_OK: string = "hotfix_ok";
    public static readonly HOTFIX_RM: string = "hotfix_rm";

}