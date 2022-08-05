/**
 * 原生主调接口
 * @export
 * @interface INActiveServer
 */
export default interface INActiveServer {
    /**
     * 关闭游戏
     */
    closeGame(): void;
    /**
     * 重新播放音频
     */
    restartPlayVideo(): void;
    /**
     * 视频播放失败
     */
    onVideoError(): void;
}