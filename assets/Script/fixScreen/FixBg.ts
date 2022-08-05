const { ccclass, property } = cc._decorator;

@ccclass
export default class FixBg extends cc.Component {
    public onLoad() {
    }

    public onEnable() {
        // console.log('FixBg >>>>>>>>>>>>>>')
        this.relayout()
    }

    /**
     * 重新布局
     */
    public relayout() {
        let frameSize: cc.Size = cc.view.getFrameSize() // 屏幕尺寸
        let designResolution: cc.Size = cc.Canvas.instance.designResolution
        let designSize: cc.Size = cc.size(designResolution.width, designResolution.height)  // cc.Canvas.instance.designResolution
        let frameAspectRatio: number = frameSize.width / frameSize.height
        let screenSize: cc.Size = { ...designSize } as cc.Size

        let ratio: number = this.node.width / this.node.height
        if (ratio > frameAspectRatio) {
            let width = this.node.width * screenSize.height / this.node.height
            this.node.width = width
            this.node.height = screenSize.height
        } else {
            let height = this.node.height * screenSize.width / this.node.width
            this.node.width = screenSize.width
            this.node.height = height
        }

        // let wdt: cc.Widget = this.node.getComponent(cc.Widget)
        // if (wdt == null) {
        //     this.node.addComponent(cc.Widget)
        //     wdt = this.node.getComponent(cc.Widget)
        // }
        // wdt.isAlignHorizontalCenter = true
        // wdt.isAlignVerticalCenter = true
    }
}
