import { Http } from "./Http";

/**
 * # HTTP工具包
 * 封装http请求,兼容IE5 和 IE6。
 * ## 使用示例
 * * 快捷调用
 * ```
 * HttpSystem.httpGet("www.baidu.com");
 * HttpSystem.httpPost("www.baidu.com",{name:"fb",age:33});
 * ```
 * * 常规调用
 * ```
 * let req = new HttpSystem();
 * req.open("baidu.com", "get", {cointype: 8, gameid: GlobalConfig.GAME_ID, group: 1});
 * req.onResult(resultHandler);
 * req.setRequestHeader({"Content-Type": "application/x-www-form-urlencoded", "token": token});
 * req.send();
 * ```
 * * 链式调用
 * ```
 * let req = new HttpSystem();
 * req.open(AppConfig.getInstance().shop_list_URL, "get", {cointype: 8, gameid: GlobalConfig.GAME_ID, group: 1}).onResult(resultHandler).setRequestHeader({"Content-Type": "application/x-www-form-urlencoded", "token": token}).send();
 * ```
 * 
 * * Promise
 * ```
 * let result = await HttpSystem.httpGet(`/api/m-course?contentId=24`);
 * ```
 * ```
 * HttpSystem.httpPost("api/dosomething",{name:1,age:20}).then(res=>{}).catch(e => false);
 * ```
 * ## HTTP请求方法

 * 方法    | 描述
 * --- | ---
 * GET | 请求指定的页面信息，并返回实体主体。
 * HEAD | 类似于get请求，只不过返回的响应中没有具体的内容，用于获取报头
 * POST | 向指定资源提交数据进行处理请求（例如提交表单或者上传文件）。数据被包含在请求体中。POST请求可能会导致新的资源的建立和/或已有资源的修改。
 * PUT  | 从客户端向服务器传送的数据取代指定的文档的内容。
 * DELETE | 请求服务器删除指定的页面。
 * CONNECT | HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器。
 * OPTIONS | 允许客户端查看服务器的性能。
 * TRACE | 回显服务器收到的请求，主要用于测试或诊断。
 *
 * @version 1.0
 */
export default class HttpSystem {
    private static _instance: HttpSystem;
    private outAdapter: Function;

    public static get instance(): HttpSystem {
        if (HttpSystem._instance == null) {
            HttpSystem._instance = new HttpSystem();
        }
        return HttpSystem._instance;
    }

    /**
     * @param {Function} outAdapter 发生错误的回调
     * @memberof HttpSystem
     */
    public async init(outAdapter: Function): Promise<void> {
        return new Promise((res) => {
            this.outAdapter = outAdapter;
            res();
        })
    }

    public release(): void {
        this.outAdapter = null;
        HttpSystem._instance = null;
    }
    /**
     * 发送get请求
     * @param url 地址
     * @param params url参数
     */
    public httpGet(url: string, params?: object, header?: string): Promise<any> {
        console.log(`httpget:url = ${url}`)
        return new Promise((resolve, reject) => {
            let headerJson = { 'Content-Type': 'application/json; charset=utf-8' };
            if (header && header != "") {
                let json = JSON.parse(header);
                for (let key in json) {
                    headerJson[key] = json[key];
                }
            }
            let xhr: Http = new Http();
            xhr.onComplete(resolve);
            xhr.onError((error, errInfo, response) => {
                if (this.outAdapter) {
                    this.outAdapter(`网络错误 ${error},${url}`, errInfo, response);
                }
                reject()
            });
            xhr.openGet(Http.getUrl(url, params));
            xhr.setRequestHeader(headerJson);
            xhr.send();
        }).catch(reason => {
            if (this.outAdapter) {
                this.outAdapter(reason && reason.message || '网络错误' + url);
            }
        })
    }

    /**
     * 发送一个post请求
     * @param url 地址
     * @param body 包体
     * @param params url参数
     */
    public httpPost(url: string, body?: any, params?: object, header?: string,): Promise<any> {
        console.log(`httpPost:url = ${Http.getUrl(url, params)}`)
        return new Promise((resolve, reject) => {
            let headerJson = { 'Content-Type': 'application/json; charset=utf-8' };
            if (header && header != "") {
                let json = JSON.parse(header);
                for (let key in json) {
                    headerJson[key] = json[key];
                }
            }

            let xhr: Http = new Http();
            xhr.onComplete(resolve);
            xhr.onError((error, errInfo, response) => {
                if (this.outAdapter) {
                    this.outAdapter(`网络错误 ${error},${url}`, errInfo, response);
                }
                reject()
            });
            xhr.openPost(Http.getUrl(url, params));
            xhr.setRequestHeader(headerJson);
            xhr.send(body);
        }).catch(reason => {
            if (this.outAdapter) {
                this.outAdapter(reason && reason.message || '网络错误' + url);
            }
        })
    }
}