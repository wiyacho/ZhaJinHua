
const { ccclass, property } = cc._decorator;

@ccclass
// loading-通用
export default class Loading extends cc.Component {

    @property(sp.Skeleton)
    public loadingAnimation: sp.Skeleton = null;

    public onLoad(): void {
        // this.loadingAnimation.node.opacity = 0;
        // kit.system.timer.doOnce(500, this.showAnimation, this)
    }

    public onDestroy(): void {
        // kit.system.timer.clearTimer(this.showAnimation);
    }

    private showAnimation(): void {
        // this.loadingAnimation.node.opacity = 255;
    }

}
