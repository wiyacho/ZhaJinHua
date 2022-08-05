/**
 * 延迟节点
 */
export class Delay {
    public key: string;   // key
    public time: number;   // 间隔多久
    public current: number;   // 当前时间戳

    constructor(k, v) {
        this.key = k;
        this.time = v;
    }
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class DelayUtils {
    /**
     * 延迟队列
     */
    private static delayMap: { [key: string]: Delay; } = {
        "button": new Delay("button", 1000)
    };

    /**
     * 检测是否延迟
     * @param key
     * @returns true : 延迟 false : 不需要延迟
     */
    public static CheckDelay(key: string): boolean {

        let delay = DelayUtils.delayMap[key];
        if (!delay) { return true; }

        let tick = (new Date()).getTime();

        let time = tick - delay.current

        if (time < delay.time) { return true; }

        delay.current = tick;

        return false;
    }
}
