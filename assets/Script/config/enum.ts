
/**
 * 环节类型
 * @see https://pplingo.atlassian.net/wiki/spaces/ED/pages/205424294/AI+MVP0#2.3-%E8%AF%BE%E7%A8%8B%E5%A4%A7%E7%BA%B2
 */
export const enum CHAPTER_TYPE {
    // L1
    Context = 1,
    Word = 2,
    Story = 3,
    Tasks = 4,
    // L2
    Rhyme = 1,
    BreakThrough = 2,
    Culture = 3,

    Report = 100
}

/**
 * 课程类型 MVP版本只有 L1， L2
 * @see https://pplingo.atlassian.net/wiki/spaces/ED/pages/205424294/AI+MVP0#2.3-%E8%AF%BE%E7%A8%8B%E5%A4%A7%E7%BA%B2
 */
export const enum LESSON_TYPE {
    L1 = 1,
    L2 = 2,
}

/**
 * 环节状态刷新
 */
export enum UpdateChapterType {
    // 进入环节
    enterChapter = 1,
    // 完成环节
    completeChapter = 2,
}

/**
 * 绘本列表和外部游戏列表是否解锁
 * lock 未解锁
 * unlock 1 解锁
 */
export enum PicAndGameLockState {
    lock = 0,
    unlock
}

// 学习状态 ： 未查看、即将查看、已查看、学习完成
export const enum CHAPTER_STATE {
    // 未解锁
    lock = 0,
    // 即将查看
    next2view,
    // 已查看未学习
    viewed,
    // 学习完成
    learned
}

/**
 * 通用返回状态 用于判断通用返回需要回到哪个列表
 */
export enum BACK_STATE {
    // 大厅
    LessonState = 0,
    // 课程外游戏列表
    GameListState,
    // 课程外绘本列表
    PictureBookListState,
    // 激励墙
    EncourageListState,
}

/** 奖励类型类型 */
export enum REWARD_TYPE {
    prop = 1,        // 道具 gameid  id
    game = 2,        // 游戏 gameid  id -1
    pictureBook = 3  // 绘本 id
}


// 环节完成状态:0-未完成;1-进行中;2-已完成
export const enum CHAPTER_STATE_V2 {
    unComplete = 0,
    ongoing,
    completed
}

// 环节类型:1-视频;2-游戏;3-绘本;4:报告;
export const enum CHAPTER_TYPE_V2 {
    video = 1,
    game,
    book,
    report
}

// 课程状态:0-未完成;1-学习中（包括已解锁未查看）;2-已完成
export const enum LESSON_STATE_V2 {
    unComplete = 0,
    ongoing,
    completed
}

// 课程类型:1-词汇课;2-小测;3-语法课;
export const enum LESSON_TYPE_V2 {
    wordLesson = 1,
    testLesson = 2,
    grammarLesson = 3,
}

/* 家长门跳转TYPE */
export const enum PARENT_DOOR_TYPE {
    USER_FEED_BACK = 0   // 用户反馈
}