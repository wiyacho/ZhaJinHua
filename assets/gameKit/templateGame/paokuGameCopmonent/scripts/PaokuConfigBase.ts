
export default interface PaoKuPlayerConfigBase {
    // 背景移动速度
    backGroundMoveSpeed: number;
    // 前景移动速度
    frountNodeMoveSpeed: number;

    // 跳跃高度
    jumpHeight: number;

    // bundleName 
    bundleName: string;
    // 关卡数量
    levelCount: number;

    /////// player
    // idle 动画
    anim_idle: string;
    // move 动画
    anim_move: string;
    // jump 动画
    anim_jump_up: string;
    anim_jump_stay: string;
    anim_jump_down: string;
    // 开心
    anim_happy: string;
    // 眩晕
    anim_heart: string;
    // 抬头看
    anim_look: string;

    // 变大
    anim_small_to_big: string;
    // 变小
    anim_big_to_small: string;

    anim_big_move: string;

    anim_big_jump?: string;

    LevelData: any;

}


