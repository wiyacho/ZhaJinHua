/**
 * spine 动画播放
 */

import TimerSystem from "../../../kit/system/timer/TimerSystem";
import { AnimationConfig } from "../structure/CompInterface";

export class SpineUtils {

    /**
     * 播放一个动作
     * @param sp spine 组件
     * @param info 播放参数
     */
    public static playSpineAsync(sp: sp.Skeleton, info: AnimationConfig): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (info.loop) {
                sp.setAnimation(0, info.name, true);
                TimerSystem.instance.doOnce(info.duration * 1000 || 0, () => {
                    if (cc.isValid(sp.node)) {
                        resolve(true)
                    } else {
                        cc.warn(`sp.node  is valid false! animation name ${info.name}`);
                        resolve(false)
                    }
                }, null, null, false);
            } else {
                let te = sp.setAnimation(0, info.name, false);
                if (!te) {
                    resolve(true);
                    return;
                };
                sp.setTrackCompleteListener(te, () => {
                    resolve(true);
                });
            }

        })
    }

    /**
     * 根据配置播放动画
     * @param sp spine 组件
     * @param config AnimationConfig[]
     */
    public static async playSpineAniByConfig(sp: sp.Skeleton, config: AnimationConfig[]) {
        for (let index = 0; index < config.length; index++) {
            const info = config[index];
            info.func && info.func();
            await SpineUtils.playSpineAsync(sp, info);
        }

    }

    /**
     * 播放spine
     * @param spinCmpt 组件
     * @param animName 动画名称
     * @param loop 是否循环
     * @param finishCb 第一个动画完成回调
     * @param finishCount 第一个动画播放次数
     * @param nextName 下一个动画名称
     * @param nextLoop 循环
     */
    public static playSpine(spinCmpt: sp.Skeleton, animName: string, loop: boolean, finishCb?: () => void, finishCount: number = 1, nextName?: string, nextLoop?: boolean): void {
        if (!spinCmpt) {
            cc.warn(`playSpine:${animName}, sp.Skeleton null`);
            return;
        }
        if (animName == '') {
            cc.warn(`playSpine:${animName}`);
            return;
        }
        spinCmpt.node.active = true;
        spinCmpt.setAnimation(0, animName, loop);
        spinCmpt.setCompleteListener(null);

        if (finishCb) {
            let count = 0;
            spinCmpt.setCompleteListener(() => {
                if (spinCmpt.animation == animName) {
                    count++
                    if (count >= finishCount) {
                        finishCb();
                        if (nextName && nextName != "") {
                            spinCmpt.setAnimation(0, nextName, nextLoop);
                        }
                        spinCmpt.setCompleteListener(null);
                    }
                }
            })
            return;
        }

        if (nextName && nextName != "") {
            spinCmpt.addAnimation(0, nextName, nextLoop);
        }
    }

}
