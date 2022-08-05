/** 消息体基类 */
export class MessageBase {
    messageApi: string;
    param: any;
    showTips: boolean = true; // 请求发生错误是否弹窗
    debugData: any; // 本地数据模拟
}