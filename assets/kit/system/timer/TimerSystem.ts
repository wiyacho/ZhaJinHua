import ASystem from "../interface/ASystem";

/**
 * 时间系统
 */
export default class TimerSystem extends ASystem {

    private static _instance: TimerSystem;
    private static INTERVAL: number = 1 / 60;

    private _pool: TimerHandler[] = new Array<TimerHandler>();
    private _handlers: any = {};
    private _currTimer: number = 0;
    private _currFrame: number = 0;
    private _count: number = 0;
    private _index: number = 0;
    private _startTime: number = 0;

    private _counterMap:Map<string, TimerCounter> = new Map();

    public static get instance(): TimerSystem {
        if (TimerSystem._instance == null) {
            TimerSystem._instance = new TimerSystem();
        }
        return TimerSystem._instance;
    }

    public init(): Promise<void> {
        return new Promise((res, rej) => {
            this._startTime = Date.now();
            this._currTimer = Date.now();
            cc.director.getScheduler().enableForTarget(this)
            cc.director.getScheduler().schedule(this.onEnterFrame, this, TimerSystem.INTERVAL);
            res();
        })
    }


    public onEnterFrame(elapsed?: any): void {
        this._currFrame++;
        this._currTimer = Date.now();
        let k: any;
        for (k in this._handlers) {
            if (k !== "undefined") {
                let handler: TimerHandler = this._handlers[k];
                let t: number = handler.userFrame ? this._currFrame : this._currTimer;
                if (t >= handler.exeTime) {
                    let method: Function = handler.method;
                    let args: any[] = handler.args || [elapsed];
                    if (handler.repeat) {
                        while (t >= handler.exeTime && k in this._handlers) {
                            handler.exeTime += handler.delay;
                            method.apply(handler.thisObj, args);

                        }
                    } else {
                        method.apply(handler.thisObj, args);
                        this.clearTimer(k);
                    }
                }
            } else {
                console.log(k);
            }
        }
    }

    private create(useFrame: boolean, repeat: boolean, delay: number, method: Function, thisObj: any = null, args: any[] = null, cover: boolean = true): any {
        let key: any;
        if (cover) {
            // 先删除相同函数的计时
            this.clearTimer(method);
            key = method;
        } else {
            key = this._index++;
        }

        // 如果执行时间小于1，直接执行
        if (delay < 1) {
            method.apply(null, args)
            return -1;
        }
        let handler: TimerHandler = this._pool.length > 0 ? this._pool.pop() : new TimerHandler();
        handler.userFrame = useFrame;
        handler.repeat = repeat;
        handler.delay = delay;
        handler.method = method;
        handler.thisObj = thisObj;

        handler.args = args;
        handler.exeTime = delay + (useFrame ? this._currFrame : this._currTimer);
        this._handlers[key] = handler;
        this._count++;
        return key;
    }

    /**
     * TODO: 未完成！！！！
     * @param signKey 
     * @returns 
     */
    public timerStart(signKey:string){
        if (!signKey) {
            cc.error('timerStart signKey null!')
            return
        }

        if (this._counterMap.has(signKey)) {
            let counter = this._counterMap.get(signKey);
            let durTime = counter.durTime;
            counter.resetDurTime();
            return durTime;
        }

        let counter = new TimerCounter(signKey);
        this._counterMap.set(signKey, counter);
    }


    public timerEnd(signKey: string) {
        if (!signKey) {
            cc.error('timerStart signKey null!')
            return
        }

        if (!this._counterMap.has(signKey)) {
            return 0;
        }

        let counter = this._counterMap.get(signKey);
        let durTime = counter.durTime;
        this._counterMap.delete(signKey);
        return durTime
    }

    /**定时执行一次
     * @params    delay  延迟时间(单位毫秒)
     * @params    method 结束时的回调方法
     * @params    args   回调参数
     * @params    cover  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖)
     * @return  cover=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
     */
    public doOnce(delay: number, method: Function, thisObj: any = null, args: any[] = null, cover: boolean = true): any {
        return this.create(false, false, delay, method, thisObj, args, cover);
    }

    /**定时重复执行
     * @params    delay  延迟时间(单位毫秒)
     * @params    method 结束时的回调方法
     * @params    args   回调参数
     * @params    cover  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖)
     * @return  cover=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
     */
    public doLoop(delay: number, method: Function, thisObj: any = null, args: any[] = null, cover: boolean = true): any {
        return this.create(false, true, delay, method, thisObj, args, cover);
    }

    /**定时执行一次(基于帧率)
     * @params    delay  延迟时间(单位为帧)
     * @params    method 结束时的回调方法
     * @params    args   回调参数
     * @params    cover  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖)
     * @return  cover=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
     */
    public doFrameOnce(delay: number, method: Function, thisObj: any = null, args: any[] = null, cover: boolean = true): any {
        return this.create(true, false, delay, method, thisObj, args, cover);
    }

    /**定时重复执行(基于帧率)
     * @params    delay  延迟时间(单位为帧)
     * @params    method 结束时的回调方法
     * @params    args   回调参数
     * @params    cover  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖)
     * @return  cover=true时返回回调函数本身，否则返回唯一ID，均用来作为clearTimer的参数
     */
    public doFrameLoop(delay: number, method: Function, thisObj: any = null, args: any[] = null, cover: boolean = true): any {
        return this.create(true, true, delay, method, thisObj, args, cover);
    }

    /** 定时器执行数量 */
    public get count(): number {
        return this._count;
    }

    /**清理定时器
     * @params    method 创建时的cover=true时method为回调函数本身，否则method为返回的唯一ID
     */
    public clearTimer(method: any): void {
        let handler: TimerHandler = this._handlers[method];
        if (handler != null) {
            delete this._handlers[method];
            handler.clear();
            this._pool.push(handler);
            this._count--;
        }
    }

    /**
     * 方法是否在定时器的队列中
     */
    public running(method: any): boolean {
        if (this._handlers[method] != null) {
            return true;
        }
        return false;
    }

    public release(): void {
        for (let handler in this._handlers) {
            this.clearTimer(this._handlers[handler]);
        }
    }

}

class TimerHandler {
    /** 执行间隔 */
    public delay: number = 0;
    /** 是否重复执行 */
    public repeat: boolean;
    /** 是否用帧率 */
    public userFrame: boolean;
    /** 执行时间 */
    public exeTime: number = 0;
    /** 处理方法 */
    public method: Function;
    /** 参数 */
    public args: any[];
    /** this对象 */
    public thisObj: any;

    /** 清理 */
    public clear(): void {
        this.method = null;
        this.args = null;
        this.thisObj = null;
    }
}

/**
 * 计时器
 */
class TimerCounter {
    public signKey:string;
    public durTime:number;//持续时间

    public constructor(signKey){
        this.signKey = signKey;
    }

    public resetDurTime(){
        this.durTime = 0;
    }
}