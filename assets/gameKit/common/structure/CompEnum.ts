/**
 *  模板游戏state 类型
 */
export enum RoundStateType {
    None = -1,
    RoundOpenAniStart = 0,      // 开场动画开始
    RoundOpenAniComplete,       // 开场动画播完
    RoundStart,             // 环节开始
    RoundProceeding,        // 环节进行中，多选，拼图之类的同步进度信息
    RoundComplete,          // 环节完成
    RoundEndAniStart,       // 完成动画开始播放
    RoundEndAniComplete,    // 完成动画播放结束
}