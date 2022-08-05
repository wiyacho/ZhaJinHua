import PaokuEntity from "./PaokuEntity";

export default interface PaokuGameSystem {
    entity: PaokuEntity;
    // 游戏开始
    onGameStart (): void;
    // 开场动画结束
    onStartAni (): void;
    // 跳动
    onJumpState (type?: string): void;
    // 跳动
    onMoveState (): void;
    // 引导环节
    onGuideStep (): void;
    /** 回答正确 */
    onAnswerCorrect (): void;
    /** 回答错误 */
    onAnswerWrong (): void;
    /** 激励后 */
    onInspirinAfter (): void;
    // 跟读环节
    onFollowRead (): void;
    // 碰到障碍
    onEnterObstacle (): void;
    // 吃到道具
    onEnterProp (): void;
    // 吃到学习点
    onEnterEnergy (wordType): void;
    // 切换下一关
    onNextLevel (): void;
    // 游戏结束
    onGameOver (): void;
}
