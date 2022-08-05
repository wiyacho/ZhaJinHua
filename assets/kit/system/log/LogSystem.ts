import ASystem from "../interface/ASystem";

/**
 * 日志系统
 * 设计目标主要是作为程序运行的日志，可以输出是控制台或者app本地，当遇到出现问题且没有报错的时候，排查问题的依据
 */
export default class LogSystem extends ASystem {
    private static _instance: LogSystem;

    public isDebug: boolean = true;
    private gameName: string = "";
    private gameVersion: string = "";
    private outAdapter: Function;
    private isPrintTime: boolean = false;

    public static get instance(): LogSystem {
        if (LogSystem._instance == null) {
            LogSystem._instance = new LogSystem();
        }
        return LogSystem._instance;
    }

    /**
     * 初始化日志系统
     * @param {(message: string) => void} [outAdapter] 日志信息输出适配器，输出的字符串已json格式化
     * @param {string} [gameName] 游戏名称
     * @param {string} [gameVersion] 游戏版本
     * @returns {Promise<any>}
     * @memberof LogSystem
     */
    public init(outAdapter?: (message: string) => void, gameName?: string, gameVersion?: string, isPrintTime: boolean = false): Promise<void> {
        return new Promise((res, rea) => {
            this.gameName = gameName || "";
            this.gameVersion = gameVersion || "";
            this.outAdapter = outAdapter;
            this.isPrintTime = isPrintTime;
            res();
        })
    }

    public release(): void {
        this.outAdapter = null;
        LogSystem._instance = null;
    }

    private print(type: string, messages: any): void {
        // TODO 正式环境关闭复杂日志显示
        let gameName: string = this.gameName ? "[" + this.gameName + "]" : '';
        let gameVersion: string = this.gameName ? "[" + this.gameVersion + "]" : '';
        console[type](new Date().toLocaleString() + " " + type + " " + gameName + " " + gameVersion + "\t", messages);
        if (this && this.outAdapter) {
            this.outAdapter(new Date().toLocaleString() + type + " " + gameName + " " + gameVersion + "\t", messages);
        }
    }

    private obj2String(messages: any): string {
        let str = "";
        messages.forEach((element) => {
            if (typeof messages == "object") {
                str += JSON.stringify(element);
            } else {
                str += element;
            }
        })
        return str;
    }

    public static error(messages): void {
        LogSystem.instance.print("error", messages);
    }

    public static warn(messages): void {
        LogSystem.instance.print("warn", messages);
    }

    /**
     * 仅debug模式输出log
     * @static
     * @param {*} messages
     * @memberof LogSystem
     */
    public static log(messages): void {
        if (LogSystem.instance.isDebug) {
            LogSystem.instance.print("log", messages);
        }
    }

    public static info(messages): void {
        LogSystem.instance.print("info", messages);
    }
}

// /** 日志序列化组件，存于本地的日志缓存逻辑模块 */
// export class LogSerializer {
//     private static _instance: LogSerializer;

//     public static get instanceOrigin(): LogSerializer {
//         return LogSerializer._instance;
//     }
//     public static get instance(): LogSerializer {
//         if (LogSerializer._instance == null) {
//             LogSerializer._instance = new LogSerializer();
//         }
//         return LogSerializer._instance;
//     }

//     /** 日志缓存最大条数，超过条数后，最开始的日志将会被抹除 */
//     public maxLogCount: number = 500;
//     /** 日志清理结点，当然日志量达到最maxLogCount的一定倍率时，清空到maxLogCount */
//     public logClearRate: number = 1.8;
//     /** 日志数组 */
//     private m_logArray: string[] = [];
//     /** 日志文件路径 */
//     private m_logFilePath: string = "";
//     /** 工作状态 */
//     private m_working: boolean = false;
//     /**开始记录日志 */
//     public static getLogFilePath() {
//         if (cc.sys.isBrowser) {
//             return "";
//         }
//         return OSPathManager.cocosPath + "ccc_runtime_log.txt"
//     }
//     public begin() {

//         if (cc.sys.isBrowser) return;
//         if (!cc.sys.isNative) {
//             console.log(`LogSerializer error call begin in not native env.`)
//             return;
//         }

//         if (this.m_working) {
//             console.log(`LogSerializer call begin, but already working.`)
//             return;
//         }

//         this.m_working = true;

//         if (!this.m_logArray) {
//             this.m_logArray = [];
//         }

//         this.m_logFilePath = LogSerializer.getLogFilePath();


//         if (this.m_logFilePath) {
//             console.log(`LogSerializer begin logfilepath is ${this.m_logFilePath}`)
//             if (jsb.fileUtils.isFileExist(this.m_logFilePath)) {
//                 // 认为，已经存储的日志一定是更旧的，因为当前代码处理运行时
//                 let existLogs: string = jsb.fileUtils.getStringFromFile(this.m_logFilePath);
//                 if (existLogs) {

//                     // console.log(`LogSerializer begin append content ${existLogs}`)
//                     this.m_logArray = existLogs.split("\n").concat(this.m_logArray);
//                 }
//             }
//         }
//     }
//     /** 停止记录日志 */
//     public end() {
//         if (cc.sys.isBrowser) return;
//         if (!cc.sys.isNative) {
//             console.log(`LogSerializer error call end in not native env.`)
//             return;
//         }

//         if (!this.m_working) {
//             // 未调用 begin的情况
//             this.begin();
//         }

//         this.flush();

//         this.m_logArray = null;
//         this.m_working = false;
//     }

//     public flush() {
//         if (this.m_logFilePath) {
//             let target_arr = this.m_logArray;
//             if (target_arr.length > 0) {
//                 if (this.m_logArray.length > this.maxLogCount) {
//                     target_arr = this.m_logArray.slice(this.m_logArray.length - this.maxLogCount, this.m_logArray.length);
//                 }
//                 // console.log(`LogSerializer end write to ${this.m_logFilePath} with content ${target_arr.join("\n")}`)
//                 jsb.fileUtils.writeStringToFile(target_arr.join("\n"), this.m_logFilePath);
//                 // this.m_logArray.splice(0, this.m_logArray.length);
//             }
//         }
//     }
//     /** 输出一条log */
//     public log(headStr: string, bodyStr?: string | any): void {
//         if(!this.m_logArray) {
//             console.log(`LogSerializer log already released.`)
//             return;
//         }
//         let log_content: string = headStr + " " + safeStringify(bodyStr);
//         // console.log(`LogSerializer add log ${log_content}`)
//         this.m_logArray.push(log_content);
//         if (this.m_logArray.length >= this.maxLogCount * this.logClearRate) {
//             this.m_logArray.splice(0, this.m_logArray.length - this.maxLogCount);
//         }

//         this.flush();
//     }

//     public getOutAdapter(): Function {
//         // 获取输出适配器时，开启日志打印模块
//         this.begin();
//         return this.log.bind(this);
//     }

//     public static reportLocalLogToServer() {
//         let logFilePath: string = LogSerializer.getLogFilePath();
//         if (cc.sys.isBrowser) {
//             console.log(`LogSerializer reportLocalLogToServer error not native`);
//             return;
//         }
//         if (jsb.fileUtils && jsb.fileUtils.isFileExist(logFilePath)) {
//             let existLogs: string = jsb.fileUtils.getStringFromFile(logFilePath);
//             if (existLogs) {
//                 // test open send
//                 SendLog.forceSend = true;
//                 SendLog.sendBIPoint(LOG_TYPE_ENUM.RUNTIME_LOG, existLogs);
//             }
//         }
//         else {
//             console.log(`LogSerializer reportLocalLogToServer error log file not exist ${logFilePath}`)
//         }
//     }
// }