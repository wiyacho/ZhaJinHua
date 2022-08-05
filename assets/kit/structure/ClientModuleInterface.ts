import { VideoEventTransType } from './ClientModuleEnum';

/**
 * 主要定义子游戏和框架交互的参数类型
 */
export interface VideoClient2Module {
    type: VideoEventTransType;
    updateParams?: UpdateViewStatusParams;
    completeParams?: CompleteParam;
}

/**
 * 主要定义框架和子游戏交互的参数类型
 */
export interface VideoModule2Client {
    type: VideoEventTransType;
    playParams?: CompleteParam;
    seekToParams?: SeekToParams;
}

interface UpdateViewStatusParams {
    curT: number;
    totalT: number;
    per: number; // 参考，最好自己根据curT和totalT计算
}

interface CompleteParam {
    videoUrl: string;
}

interface SeekToParams {
    seekToT: number; // 要跳转的时间
}

/**
 * 通用弹窗参数
 * @param {string} tipsConfig 描述内容
 * @param {() => void} confirmCallback 确定回调
 * @param {() => void} cancelCallback 取消回调
 */
export interface commonTipsOptions {
    tipsType: string,
    confirmCallback?: Function;
    cancelCallback?: Function;
}

export interface tipsInfoConfig {
    ok_text: string,
    cancel_text: string,
    title: string,
    content: string,
}