
export class ErrorSendInterval {
    public static readonly RATE_DEFAULT: number = 5;
    public static readonly RATE_LOW: number = 10;
}

/**
 * 错误捕获系统
 * @export
 * @class ErrorSystem
 * # 注册错误监听
 * ```
 * ErrorSystem.instance.init(false,this.errorOutAdapter,ErrorSendInterval.RATE_LOW)
 * ```
 */
export default class ErrorSystem {
    private static _instance: ErrorSystem;

    private errorMap: any = {};
    private outAdapter: Function;
    private minInterval: number;

    public static get instance(): ErrorSystem {
        if (ErrorSystem._instance == null) {
            ErrorSystem._instance = new ErrorSystem();
        }
        return ErrorSystem._instance;
    }

    /**
     * 注册全局错误捕获
     * @param {boolean} isNative 是否是native环境
     * @param {(exception: string) => void} outAdapter 输出适配器
     * @returns {Promise<any>}
     * @memberof ErrorSyStem
     */
    public init(isNative: boolean, outAdapter?: (exception: string) => void): Promise<void> {
        this.outAdapter = outAdapter;
        return new Promise((res, rea) => {
            if (isNative) {
                // @ts-ignore
                window.__errorHandler = (errorMessage, file, line, message, error) => {
                    let exception: any = {};
                    exception.errorMessage = errorMessage;
                    exception.file = file;
                    exception.line = line;
                    exception.message = message;
                    exception.error = error;
                    // @ts-ignore
                    if (window.exception != JSON.stringify(exception)) {
                        // @ts-ignore
                        window.exception = JSON.stringify(exception);
                    }
                    //TODO: 发送请求上报异常
                    this.outAdapter(exception);
                };
                // @ts-ignore
            } else {
                //捕获promise错误
                window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
                    let message: string = String(event.reason.stack)
                    this.outAdapter({ "unhandledrejection": String(event.reason.stack) });
                })
                window.onerror = (errorMessage, file, line, message, error) => {
                    let exception: any = {};
                    exception.errorMessage = errorMessage;
                    exception.file = file;
                    exception.line = line;
                    exception.message = message;
                    exception.error = error;
                    // @ts-ignore
                    if (window.exception != JSON.stringify(exception)) {
                        // @ts-ignore
                        window.exception = JSON.stringify(exception);
                    }
                    //TODO: 发送请求上报异常
                    this.outAdapter(exception);
                };
            }
            res();
        })
    }

    // private send(exception: any): void {
    //     let str: string = JSON.stringify(exception);
    //     if (this.errorMap[exception]) {
    //         this.errorMap[exception] += 1;
    //         if (this.errorMap[exception] >= this.minInterval) {
    //             this.outAdapter(str);
    //             this.errorMap[exception] = null;
    //             delete this.errorMap[exception];
    //         }
    //     } else {
    //         this.errorMap[exception] = 1;
    //         this.outAdapter(str);
    //     }
    // }

    public release(): void {
        this.outAdapter = null;
        this.errorMap = null;
        ErrorSystem._instance = null;
    }
}