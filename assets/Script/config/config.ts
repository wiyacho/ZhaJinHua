
export const GAME_NAME: string = 'chinese ai'
export const GAME_VERSION: string = '1.0.1.0'

export const CHANNEL: string = '99999';
export const USER_ID: string = '007';

export const LESSON_TYPE_VIDEO: string = "video";
export const LESSON_TYPE_GAME: string = "game";
export const LESSON_TYPE_PICTURE_BOOK: string = "pictureBook";

export const DOMAIN_LIST = {
    LOCAL: "",
    DEV: "https://test235-cnapi.lingo-ace.com",
    TEST: "https://test-ebu-cnapi.lingoace.com",
    PRO: "https://ebu-cnapi.lingoace.com"
}

const FEEDBACK_H5_LIST = {
    LOCAL: "https://test-ops-api-ebu.lingoace.com/static/chineseAiMobile/feedback.html",
    DEV: "https://test-ops-api-ebu.lingoace.com/static/chineseAiMobile/feedback.html",
    TEST: "https://test-ops-api-ebu.lingoace.com/static/chineseAiMobile/feedback.html",
    PRO: "https://ebu-ops.lingoace.com/static/chineseAiMobile/feedback.html",   //线上
}

export enum DEV_MODE_LIST {
    LOCAL = "LOCAL",
    DEV = "DEV",
    TEST = "TEST",
    PRO = "PRO"
}

export var DEV_MODE = DEV_MODE_LIST.TEST;
if (cc.sys.isNative) {
    if (AppHelper.isDebug()) {
        DEV_MODE = DEV_MODE_LIST.TEST;
    } else {
        DEV_MODE = DEV_MODE_LIST.PRO;
    }
} else {
    DEV_MODE = DEV_MODE_LIST.TEST;
}

cc.log('DEV_MODE:' + DEV_MODE)

// @ts-ignore
export const SPOT_KEY = (DEV_MODE == DEV_MODE_LIST.PRO) ? 'eef5802eb9965b792ed48d7c212d6867' : '3437b23f038afa01e3c220886da2deda';

export const HOSTURL = DOMAIN_LIST[DEV_MODE];
export const FEEDBACKURL = FEEDBACK_H5_LIST[DEV_MODE]

/**
 * 配置文件字段
 * main:必选参数，入口bundle名字,同时也是默认入口prefab名字
 * assets:必选参数，所有依赖的bundle名字
 * params:必选参数，传递给章节逻辑的参数
 * entry: 可选参数，指定的入口prefab名字(一个bundle可以有多个prefab入口，对应不同配置)
 */
// 课程配置-测试
export const CHAPTER_CONFIG_LIST: any[] = [
    // D1 红色
    { id: 10, main: 'video', assets: ['video'], params: { url: "mp4/day1" } },
    { id: 11, main: 'redSantaClaus', assets: ['common', 'redSantaClaus'], params: {} },
    // { id: 12, main: 'book_player', assets: ['common', 'book_player', 'picture_balloon'], params: { bundle:'picture_balloon' } },  //新版绘本配置方法
    { id: 12, main: 'book_base', assets: ['book_base', 'PicktureBookNode9'], params: { bookNum: 9, maxPage: 6 } },
    { id: 13, main: 'quizGameRed', assets: ['common', , 'templateGame', 'quizGameRed'], params: {} },
    // D2 黄色
    { id: 1, main: 'video', assets: ['video'], params: { url: "mp4/day2" } },
    { id: 2, main: 'SweepLeaves', assets: ['common', 'SweepLeaves'], params: {} },
    { id: 3, main: 'book_base', assets: ['book_base', 'PicktureBookNode1'], params: { bookNum: 1, maxPage: 7 } },
    { id: 4, main: 'rocketProject', assets: ['common', 'rocketProject'], params: {} },
    // D3 蓝色
    { id: 20, main: 'video', assets: ['video'], params: { url: "mp4/day3" } },
    { id: 21, main: 'paintingColor', assets: ['common', 'paintingColor'], params: {} },
    { id: 22, main: 'book_base', assets: ['book_base', 'PicktureBookNode8'], params: { bookNum: 8, maxPage: 10 } },
    { id: 23, main: 'quizGameBlue', assets: ['common', 'templateGame', 'quizGameBlue'], params: {} },
    // D4 气球
    { id: 15, main: 'video', assets: ['video'], params: { url: "mp4/day4" } },
    { id: 16, main: 'Bubble', assets: ['common', 'Bubble'], params: {} },
    { id: 17, main: 'book_base', assets: ['book_base', 'PicktureBookNode7'], params: { bookNum: 7, maxPage: 10 } },
    { id: 18, main: 'quziGamePanda', assets: ['common', 'templateGame', 'quziGamePanda'], params: {} },
    // D5
    { id: 5, main: 'video', assets: ['video'], params: { url: "mp4/day5_1" } },
    { id: 6, main: 'game_lesson_5', assets: ['game_lesson_5'], params: {} },
    { id: 7, main: 'video', assets: ['video'], params: { url: "mp4/day5_2" } },
    { name:"L1day5大测",main: "day5BigTest",assets: ["common", "day5BigTest","prizeClaw","playFootball","train"], params: { } },
    { name: '星球回声', main: 'recordStarEcho', assets: ["common", 'recordRollerCoaster', 'recordStarEcho'], params: {} },
    { name:"打怪兽",main: "testHitMonster", assets: ["common","testMonsterBase","testHitMonster" ], params: { } },
    { name:"糖果怪兽",main: "testCandyMonster", assets: ["common","testMonsterBase","testCandyMonster" ], params: { } },
    { name: '刮刮乐-红黄蓝', main: 'guagualev1', assets: ["common","guaguale_common","guagualev1"], params: {} },
    { name: '刮刮乐-粉紫绿', main: 'guagualev2', assets: ["common","guaguale_common","guagualev2"], params: {} },
    { name: '星球过山车', main: 'rollerCoasterXingkong', assets: ['common', 'recordRollerCoaster', 'rollerCoasterXingkong'], params: {} },
    { name: '糖果过山车', main: 'rollerCoasterCandy', assets: ['common', 'recordRollerCoaster', 'rollerCoasterCandy'], params: {} },
    { name: '棒棒糖回声', main: 'recordCandyEcho', assets: ['common', 'recordRollerCoaster', 'recordCandyEcho'], params: {} },
    { "name":"跳冰块","main": "jump_block_ice", "assets": ["common", "jump_block","jump_block_ice"], "params": { } },
    { "name":"跳云朵","main": "jump_block_cloud", "assets": ["common", "jump_block","jump_block_cloud"], "params": { } },
]

// bundle根目录
export const BUNDLE_ROOT: string = "bundles";
// 模块块子包目录
export const BUNDLE_HALL: string = "hall";
export const BUNDLE_HALL_V2: string = "hallV2";
export const BUNDLE_FIRST_PAGE: string = "firstPage";
export const BUNDLE_REPORT: string = "report";
export const BUNDLE_GAME_LIST: string = "gameList";
export const BUNDLE_PICTURE_BOOK_LIST: string = "pictureBookList";
export const BUNDLE_USER_FEED_BACK: string = "userFeedBack";
export const BUNDLE_PARENT_DOOR: string = "parentDoor";
// 通用模块目录
export const BUNDLE_COMPONENTS: string = "components";
// 跟读模块
export const BUNDLE_FOLLOW_READ: string = "followRead";
// 课程完成
export const BUNDLE_LESSON_COMPLETE: string = "lessonComplete";
// 视频
export const BUNDLE_VIDEO: string = "video";
// 顶部按钮模块
export const BUNDLE_TOP_BAR: string = "topBar";

// 顶部按钮模块
export const BUNDLE_TOP_BAR_V2: string = "topBarV2";
// 退出课程二次确认框
export const BUNDLE_QUIT_LESSON_ALERT: string = "quitLessonAlert";
// 课程奖励模块
export const BUNDLE_LESSON_AWARD: string = "lessonAward";
// 加载-通用
export const BUNDLE_LOADING: string = "loading";
// 加载-课程专用
export const BUNDLE_LOADING_LESSON: string = "loadingLesson";
// 新手引导
export const BUNDLE_NOVICE_GUIDE = "noviceGuide";
// 通用资源
export const BUNDLE_COMMON_RESOURCES = "commonRes";
// 绘本基础bundle
export const BUNDLE_BOOK_BASE = "book_base";
// 激励强列表
export const BUNDLE_ENCOURAGE_LIST = "encourageList";
// 通用弹窗
export const BUNDLE_COMMON_TIPS = "commonTips";

// 预加载列表
export const PRELOAD_LIST: string[] = [BUNDLE_TOP_BAR, BUNDLE_TOP_BAR_V2, BUNDLE_COMMON_TIPS,
    BUNDLE_LESSON_COMPLETE, BUNDLE_QUIT_LESSON_ALERT, BUNDLE_LOADING, BUNDLE_LOADING_LESSON, BUNDLE_FOLLOW_READ];

// 大厅课程列表配置-测试 TODO:
export const LESSON_LIST_CONFIG: any[] = [
    {
        lessonId: 1,
        lessonType: 1,
        chapters: [
            { chapterId: 10, chapterType: 1, type: LESSON_TYPE_VIDEO, complete: false },
            { chapterId: 11, chapterType: 2, type: LESSON_TYPE_GAME, complete: false },
            { chapterId: 12, chapterType: 3, type: LESSON_TYPE_PICTURE_BOOK, complete: false },
            { chapterId: 13, chapterType: 4, type: LESSON_TYPE_GAME, complete: false },
        ],
        report: { isComplete: false },
        rewardInfo: {
            type: 2,
            iconUrl: "item_1001",
            propId: 1003,
            gameId: 0
        }
    },
    {
        lessonId: 2,
        lessonType: 1,
        chapters: [
            { chapterId: 1, chapterType: 1, type: LESSON_TYPE_VIDEO, complete: false },
            { chapterId: 2, chapterType: 2, type: LESSON_TYPE_GAME, complete: false },
            { chapterId: 3, chapterType: 3, type: LESSON_TYPE_PICTURE_BOOK, complete: false },
            { chapterId: 4, chapterType: 4, type: LESSON_TYPE_GAME, complete: false },
        ],
        report: { isComplete: false },
        rewardInfo: {
            type: 2,
            iconUrl: "item_1002",
            propId: 1004,
            gameId: 0
        }
    },
    {
        lessonId: 3,
        lessonType: 1,
        chapters: [
            { chapterId: 20, chapterType: 1, type: LESSON_TYPE_VIDEO, complete: false },
            { chapterId: 21, chapterType: 2, type: LESSON_TYPE_GAME, complete: false },
            { chapterId: 22, chapterType: 3, type: LESSON_TYPE_PICTURE_BOOK, complete: false },
            { chapterId: 23, chapterType: 4, type: LESSON_TYPE_GAME, complete: false },
        ],
        report: { isComplete: false },
        rewardInfo: {
            type: 2,
            iconUrl: "item_1003",
            propId: -1,
            gameId: 1
        }
    },
    {
        lessonId: 4,
        lessonType: 1,
        chapters: [
            { chapterId: 15, chapterType: 1, type: LESSON_TYPE_VIDEO, complete: false },
            { chapterId: 16, chapterType: 2, type: LESSON_TYPE_GAME, complete: false },
            { chapterId: 17, chapterType: 3, type: LESSON_TYPE_PICTURE_BOOK, complete: false },
            { chapterId: 18, chapterType: 4, type: LESSON_TYPE_GAME, complete: false },
        ],
        report: { isComplete: false },
        rewardInfo: {
            type: 1,
            iconUrl: "item_1004",
            propId: -1,
            gameId: 1
        }
    },
    {
        lessonId: 5,
        lessonType: 1,
        chapters: [
            { chapterId: 5, chapterType: 1, type: LESSON_TYPE_VIDEO, complete: false },
            { chapterId: 6, chapterType: 2, type: LESSON_TYPE_GAME, complete: false },
            { chapterId: 7, chapterType: 3, type: LESSON_TYPE_VIDEO, complete: false },
        ],
        report: { isComplete: false },
        rewardInfo: {
            type: 3,
            iconUrl: "item_1005",
            propId: -1,
            gameId: 0
        }
    },
]

// 课外绘本列表
export const PICTURE_BOOK_LIST_CONFIG: any[] = [
    { id: 0, url: '', main: 'PicktureBookNode', assets: [], params: { bookNum: 0, maxPage: 11 }, unlock: true },
    { id: 1, url: '', main: 'PicktureBookNode2', assets: [], params: { bookNum: 2, maxPage: 11 }, unlock: true },
    { id: 2, url: '', main: 'PicktureBookNode3', assets: [], params: { bookNum: 3, maxPage: 10 }, unlock: true },
    { id: 3, url: '', main: 'PicktureBookNode4', assets: [], params: { bookNum: 4, maxPage: 9 }, unlock: true },
    { id: 4, url: '', main: 'PicktureBookNode5', assets: [], params: { bookNum: 5, maxPage: 9 }, unlock: true },
    { id: 5, url: '', main: 'PicktureBookNode6', assets: [], params: { bookNum: 6, maxPage: 9 }, unlock: true },
]

// 课外游戏列表
export const GAME_LIST_CONFIG: any[] = [
    { id: 0, url: '', main: 'paint', assets: ['paint'], params: {}, unlock: true },
    { id: 1, url: '', main: 'exploreGame', assets: ['common', 'exploreGame'], params: {}, unlock: true },
    { id: 2, url: '', main: 'game1', assets: [], params: {} },
]

// 激励墙列表
export const ENCOURAGE_WALL_LIST_CONFIG: any[] = [
    { lessonId: 1, shipUrl: '', iconUrl: 'item_1001', type: 2, bookId: -1, gameId: 0, propId: 1003, lockVal: 1 },
    { lessonId: 2, shipUrl: '', iconUrl: 'item_1002', type: 2, bookId: -1, gameId: 0, propId: 1004, lockVal: 1 },
    { lessonId: 3, shipUrl: '', iconUrl: 'item_1003', type: 2, bookId: -1, gameId: 1, propId: -1, lockVal: 1 },
    { lessonId: 4, shipUrl: '', iconUrl: 'item_1004', type: 1, bookId: -1, gameId: 1, propId: -1, lockVal: 1 },
    { lessonId: 5, shipUrl: '', iconUrl: 'item_1005', type: 3, bookId: 0, gameId: -1, propId: -1, lockVal: 1 },
]

// 主域名
export const URL_BASE: string = 'http://localhost/';
// 测试域名
export const URL_BASE_TEST: string = 'https://shi-xintao.github.io/bundleTest/';
// 课程配置接口
export const LESSON_LIST: string = URL_BASE_TEST + 'lesson';

// 通用点击音效
export const COMMON_CLICK_SOUND: string = 'commonRes/sound/btn_click';

export const HAS_CLICK_LESSON_ITEM = 'HAS_CLICK_LESSON_ITEM'; // 首次登录是否点击过课程列表
export const HAS_CLICK_PICKBOOK = 'HAS_CLICK_PICKBOOK'; // 首次登录是否点击过
