export default interface IHttpSystem {

    /**
     * 初始化
     * @param outAdapter 
     */
    init(outAdapter: Function): Promise<void> | void;
    /**
     * 释放时
     */
    release(): void;
    /**
     * 回调形式的HTTP get 请求，注意第3个参数为回调方法
     * 发送get请求
     * @param url 地址
     * @param params url参数
     * @param result_handler 回调方法
     * @param type 类型
     * @param retry_count 重试次数
     * @param type_not_set_to_open 把type不作为openGet的参数，之前竟然把type作为onComplete参数的同时，也作为openGet的参数
     */
    httpGetWithCallBack(url: string, params?: object, result_handler?: Function, type?: string, retry_count?: number, type_not_set_to_open?: boolean): void;
    /**
     * 发送get请求
     * @param url 地址
     * @param params url参数
     * @param type 类型
     * @param retry_count 重试次数
     * 
     * @param type_not_set_to_open 把type不作为openGet的参数，之前竟然把type作为onComplete参数的同时，也作为openGet的参数
     */
    httpGet(url: string, params?: object, type?: string, retry_count?: number, result_handler?: Function, type_not_set_to_open?: boolean): Promise<any>;

    /**
    * 发送一个post请求
    * @param url 地址
    * @param body 包体
    * @param params url参数
    * @param retryCount 重试次数
    * @param resultHandler 
    */
    httpPost(url: string, body?: any, params?: object, retryCount?: number, resultHandler?: Function): Promise<any>;

    /**
     * 回调的方式发送一个post请求，注意第4个参数为回调方法
     * @param url 地址
     * @param body 包体
     * @param resultHandler 
     * @param params url参数
     * @param retryCount 重试次数
     */
    httpPostWithCallBack(url: string, body?: any, params?: object, resultHandler?: Function, retryCount?: number): void;
}