/**
 * 埋点需求文档参看：
 * @see https://pplingo.atlassian.net/wiki/spaces/ED/pages/280364487/V1.0.0
 */
export default class Spot {
    // AELC_开机页
    public static readonly AELC_openAPP: string = "AELC_openAPP";
    // 进入APP
    public static readonly AELC_Home: string = "AELC_Home";
    // AELC_首页绘本
    public static readonly AELC_OpenPictureBookList: string = "AELC_OpenPictureBookList";
    // AELC_首页游戏
    public static readonly AELC_OpenGameList: string = "AELC_OpenGameList";
    // AELC_课程ID_环节ID
    public static readonly AELC_EnterModule: string = "AELC_EnterModule";

    // AELC_退出课程
    public static readonly AELC_QuitCourse: string = "AELC_QuitCourse";
    // AELC_完成课程
    public static readonly AELC_FinishCouse: string = "AELC_FinishCouse";
    // AELC_完成环节
    public static readonly AELC_FinishModule: string = "AELC_FinishModule";

    // AELC_返回上一个
    public static readonly AELC_JumpBack: string = "AELC_JumpBack";
    // AELC_跳到下一个
    public static readonly AELC_Next: string = "AELC_Next";
    // AELC_下载课件
    public static readonly AELC_Download: string = "AELC_Download";
    // AELC_绘本列表退出
    public static readonly AELC_QuitPictureBookList: string = "AELC_QuitPictureBookList";
    // AELC_点击绘本
    public static readonly AELC_EnterPictureBook: string = "AELC_EnterPictureBook";
    // AELC_退出绘本
    public static readonly AELC_QuitPictureBook: string = "AELC_QuitPictureBook";
    // AELC_完成绘本
    public static readonly AELC_FinishPictureBook: string = "AELC_FinishPictureBook";
    // AELC_退出游戏列表页
    public static readonly AELC_QuitGameList: string = "AELC_QuitGameList";
    // AELC_游戏ID
    public static readonly AELC_EnterGame: string = "AELC_EnterGame";
    // AELC_退出游戏
    public static readonly AELC_QuitGame: string = "AELC_QuitGame";
    // AELC_完成游戏
    // public static readonly AELC_FinishGame: string = "AELC_FinishGame";
    // AELC_网络异常_继续
    public static readonly AELC_NetworkFailure_continue: string = "AELC_NetworkFailure_continue";
    // AELC_网络异常_取消
    public static readonly AELC__NetworkFailure_cancel: string = "AELC__NetworkFailure_cancel";
    // AELC_权限_录音_取消
    public static readonly AELC_jurisdiction_record_cancel: string = "AELC_jurisdiction_record_cancel";
    // AELC_权限_录音_设置
    public static readonly AELC_jurisdiction_record_setting: string = "AELC_jurisdiction_record_setting";

    // AELC_查看服务协议
    public static readonly AELC_Servicepolicy: string = "AELC_Servicepolicy";
    // AELC_家长门验证返回
    public static readonly AELC_QuitVerify: string = "AELC_QuitVerify";
    // AELC_家长门验证成功
    public static readonly AELC_PassVerify: string = "AELC_PassVerify";
    // AELC_用户反馈提交反馈
    public static readonly AELC_PassFeedback: string = "AELC_PassFeedback";
    /** new end */
}