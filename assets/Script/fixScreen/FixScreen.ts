const { ccclass, property } = cc._decorator;
/**
 * 根据屏幕物理形状动态设置设计尺寸,设置实际的设计尺寸(至少有一个维度与1334x750相同，另一个维度为扩展维度,保证设计尺寸不比1334x750小)
 */
@ccclass
export default class FixScreen extends cc.Component {
    private lock = false

    public onLoad() {
        this.relayout()
    }

    public relayout() {
        if (this.lock) {
            return
        }
        this.lock = true
        // 根据屏幕物理形状动态设置设计尺寸
        let frameSize = cc.view.getFrameSize() // 屏幕尺寸
        let designResolution = cc.Canvas.instance.designResolution
        let designSize = cc.size(designResolution.width, designResolution.height)
        cc.log("canvas designSize:", designSize)
        let frameAspectRatio = frameSize.width / frameSize.height
        let designAspectRatio = designSize.width / designSize.height
        let screenSize = { ...designSize } as cc.Size

        if (frameAspectRatio < designAspectRatio) {
            screenSize.height = Math.ceil(designSize.width / frameAspectRatio)
        } else {
            screenSize.width = Math.ceil(designSize.height * frameAspectRatio)
        }
        // 设置实际的设计尺寸(更改canvas的形状)
        cc.Canvas.instance.designResolution = screenSize

        this.lock = false
    }

    // public onWindowSizeChanged() {
    //     cc.log("onWindowSizeChanged")
    //     this.relayout()
    // }
}
