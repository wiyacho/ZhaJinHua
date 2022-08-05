/**
 * 主要定义子游戏和框架交互的事件类型
 * C2M_** 框架到子游戏事件
 * M2C_** 子游戏到框架事件
 */

// 视频与子游戏交互
export enum VideoEventTransType {
    //  视频开始播放
    C2M_VIDEO_PLAY_START,
    //  刷新视频进度
    C2M_UPDATE_PLAY_STATUS = 1,
    //  视频播放完成
    C2M_VIDEO_PLAY_COMPLETE,
    //  播放视频
    M2C_VIDEO_PLAY_START,
    //  暂停视频
    M2C_VIDEO_PLAY_PAUSE,
    //  恢复播放视频
    M2C_VIDEO_PLAY_RESUME,
    //  视频跳转
    M2C_VIDEO_PLAY_SEEKTO,
    //  视频初始化
    M2C_VIDEO_INIT,
    //  视频卸载
    M2C_VIDEO_DESTROY,
}