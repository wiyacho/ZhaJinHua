declare interface Window {
    webframe: {
        Notify: NotifierCenter
    }
    tiGo: TigoManager
    webkit: {
        messageHandlers: {
            callApp: {
                postMessage(msg: string)
            }
        }
    }
    callCocos(msg1)
}


/**
 * 绘本单页
 */
declare interface PageConfig {
    prefab: string
    text: string[]
    sound: any[]
    voice: any[]
    music: string
}

/**
 * 绘本配置
 */
declare interface BookConfig {
    name: string
    /**
     * 3d:3d相机
     * 2d:2d相机
     * verlet:verlet算法
     * bezier:贝塞尔算法s
     */
    turn_mode: string
    page_count: number
    bundle: string
    cover: string
    pages: Map<string, PageConfig>
}

declare namespace cc {
    export class Assembler { }
    export class RenderData {
        uintVDatas: [[number]]
        vDatas: [[number]]
        init(base: PageEffectAssemblerBase)
        createFlexData(p, p2, p3, p4)
        iDatas: [[number]]
        subarray(p, p2): any
    }
}

declare class AppHelper {
    static bugly_init(appId: string, debug: boolean, level: number): void
    static bugly_setUserId(userId: string): void
    static isDebug(): boolean
    static amplitude_logInitWithApiKey(appKey: string): void
    static amplitude_logUserId(userId: string): void
    static amplitude_logEvent(eventName: string, data: any): void
    static isRestart():boolean
    static setRestart(b:boolean):void
}

declare interface LessonConfig {
    lessonId: number;
    name: string;
    spinePath: string;
}