import ResourcesManager, { ResourceType } from "../../../kit/manager/ResourcesManager"

export class LessonUtil {

    /* 正确反馈动画 */
    public static getRightFeedBackAni(): Promise<cc.Node> {
        return new Promise<cc.Node>((res, rej) => {
            ResourcesManager.instance.loadRes("common", `feedBack/right`, ResourceType.Normal, cc.Prefab, (e, pre) => {
                if (pre) {
                    let node = cc.instantiate(pre)
                    let ske = node.getComponent(sp.Skeleton)
                    ske.setCompleteListener(() => node.destroy())
                    res(node)
                } else {
                    cc.log(e)
                    rej()
                }
            })
        })
    }

    /* 错误反馈动画 */
    public static getErrorFeedBackAni(): Promise<cc.Node> {
        return new Promise<cc.Node>((res, rej) => {
            ResourcesManager.instance.loadRes("common", `feedBack/error`, ResourceType.Normal, cc.Prefab, (e, pre) => {
                if (pre) {
                    let node = cc.instantiate(pre)
                    let ske = node.getComponent(sp.Skeleton)
                    ske.setCompleteListener(() => node.destroy())
                    res(node)
                } else {
                    cc.log(e)
                    rej()
                }
            })
        })
    }
}