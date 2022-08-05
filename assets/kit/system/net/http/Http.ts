import { HttpStateMap } from "./HttpState";

export class Http {
    public static readonly GET: string = "get";
    public static readonly POST: string = "post";

    private static readonly UNSENT: number = 0; // Client has been created. open() not called yet.
    private static readonly OPENED: number = 1; // open() has been called.
    private static readonly HEADERS_RECEIVED: number = 2; // send() has been called, and headers and status are available.
    private static readonly LOADING: number = 3; // Downloading; responseText holds partial data.
    private static readonly DONE: number = 4; // The operation is complete.


    private xhr: XMLHttpRequest;
    private _onComplete: Function;
    private _onError: Function;
    private method: string;
    private target: any;
    private data: any;
    private url: string;

    public constructor() {
        try {
            if (window["XMLHttpRequest"]) {
                this.xhr = new window["XMLHttpRequest"]();
            } else {
                // @ts-ignore
                this.xhr = new ActiveXObject("MSXML2.XMLHTTP");
            }
            this.xhr.timeout = 3000;
        } catch (e) {
            console.error("Http create error", e);
        }
    }

    /**
     * 打开连接
     * @param {string} url 文件在服务器上的位置
     * @param {string} method 请求的类型，GET 或 POST,默认GET
     * @param data 数据，对象或字符
     * @returns {Http}
     */
    public open(url: string, method: string = Http.GET, data?: any): Http {
        this.method = method || "get";
        if (this.method == "get" && data) {
            url = this.spliceUrl(url, data);
        }
        this.url = url;
        this.data = data;
        this.xhr.open(method, url, true);
        return this;
    }

    /**
     * get方法
     * @param {string} url 文件在服务器上的位置
     * @param data 对象或字符
     * @returns {Http}
     */
    public openGet(url: string, data?: any): Http {
        this.open(url, Http.GET, data);
        return this;
    }

    /**
     * post方法
     * @param {string} url 文件在服务器上的位置
     * @param data 对象或字符
     * @returns {Http}
     */
    public openPost(url: string, data?: any): Http {
        this.open(url, Http.POST, data)
        return this;
    }

    /**
     * 返回的结果，包括错误
     * @param {Function} callback
     * @param target this指针
     * @returns {Http}
     */
    public onComplete(callback: Function, target?: any): Http {
        this.target = target;
        this._onComplete = callback;
        return this;
    }

    /**
     * 错误回调
     * @param {Function} callback
     * @param target this指针
     * @returns {Http}
     */
    public onError(callback: Function, target?: any): Http {
        this.target = target;
        this._onError = callback;
        return this;
    }

    /**
     * 将请求发送到服务器。
     * @param data 可以是对象|字符,仅用于 POST 请求
     */
    public send(data?: any): void {
        data = data || this.data;
        if (typeof data === "object") {
            try {
                data = JSON.stringify(data);
            } catch (e) {
                console.error(e);
            }
        }
        this.xhr.onreadystatechange = this.onReadyStateChange.bind(this);
        console.log(`body = ${data}`)
        this.xhr.send(data);
    }

    /**
     * 如果请求已经被发送,则立刻中止请求.
     */
    public abort(): void {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    /**
     * 向请求添加 HTTP 头。
     * @example {token:A1BC,name:guess}
     * @param data 键值对形式都好分割
     * @returns {Http}
     */
    public setRequestHeader(data?: any): Http {
        try {
            for (let key in data) {
                this.xhr.setRequestHeader(key, data[key]);
            }
        } catch (e) {
            console.error(e);
        }
        return this;
    }

    /**
     * 返回所有响应头信息(响应头名和值), 如果响应头还没接受,则返回"".
     */
    public getAllResponseHeaders(): string {
        if (!this.xhr) {
            return "";
        }
        let result: string = this.xhr.getAllResponseHeaders();
        return result ? result : "";
    }

    public onDestroy(): void {
        // TODO 清空其他数据
        this.xhr = null;
    }

    private spliceUrl(url: string, data: any): string {
        let dataStr: string = "";
        for (let key in data) {
            dataStr += key + "=" + data[key] + "&";
        }
        dataStr = dataStr.substr(0, dataStr.length - 1);
        if (dataStr.length > 2) {
            url += url.indexOf("?") < 0 ? "?" + dataStr : url + dataStr;
        }
        return url;
    }

    private onReadyStateChange(): void {
        let xhr = this.xhr;
        if (xhr.readyState == 4) {
            let ioError = xhr.status >= 400 || xhr.status == 0;
            let url = this.url;
            let self = this;
            if (ioError) {
                if (this._onError) {
                    let response = null;
                    if (this.xhr.response) {
                        response = JSON.parse(this.xhr.response)
                    }
                    this._onError(this.xhr.status, HttpStateMap.instance.getErrorInfoById(this.xhr.status), response); // TODO 返回错误码对应的含义
                    // this._onError(this.xhr.status, HttpStateMap.instance.getErrorInfoById(this.xhr.status)); //TODO 返回错误码对应的含义
                }
            } else {
                if (this.xhr.readyState == Http.DONE) {
                    if (this.xhr.status >= 200 && this.xhr.status < 400) {
                        this._onComplete.call(this.target ? this.target : null, JSON.parse(this.xhr.response));
                    } else {
                        this._onComplete.call(this.target ? this.target : null, HttpStateMap.instance.getErrorInfoById(this.xhr.status) // 返回错误码对应的含义
                        );
                    }
                }
            }
        }
    }
    private static stringifyPrimitive(v: any) {
        switch (typeof v) {
            case 'string':
                return v
            case 'boolean':
                return v ? 'true' : 'false'
            case 'number':
                return isFinite(v) ? v : ''
            default:
                return ''
        }
    }

    private static stringify(obj, sep?: string, eq?: string, name?: string) {
        sep = sep || '&'
        eq = eq || '='
        if (obj === null) {
            obj = undefined
        }

        if (typeof obj === 'object') {
            return Object.keys(obj).map(function (k) {
                let ks = encodeURIComponent(Http.stringifyPrimitive(k)) + eq
                if (Array.isArray(obj[k])) {
                    return obj[k].map(function (v) {
                        return ks + encodeURIComponent(Http.stringifyPrimitive(v))
                    }).join(sep)
                } else {
                    return ks + encodeURIComponent(Http.stringifyPrimitive(obj[k]))
                }
            }).join(sep)

        }

        if (!name) { return '' }
        return encodeURIComponent(Http.stringifyPrimitive(name)) + eq +
            encodeURIComponent(Http.stringifyPrimitive(obj))
    };

    public static getUrl(url: string, params?: any) {
        let s = Http.stringify(params)
        let sep = url.indexOf('?') > -1 ? '&' : '?'
        return url + (s ? sep + s : '')
    }
}