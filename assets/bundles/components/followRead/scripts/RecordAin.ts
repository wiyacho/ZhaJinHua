import ResourcesManager, { ResourceType } from "../../../../kit/manager/ResourcesManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordAin extends cc.Component {

    @property(cc.Node)
    micNode: cc.Node = null;

    // @property(cc.Node)
    // centerNode: cc.Node = null;

    @property({ type: [cc.Node], displayName: "右边动画组" })
    rightNode: cc.Node[] = [];

    @property({ type: [cc.Node], displayName: "右边动画组" })
    leftNode: cc.Node[] = [];

    /** 单词卡图片 */
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    evaluatingText: cc.Label = null;

    @property(sp.Skeleton)
    tibanSpine: sp.Skeleton = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    // 进度条
    @property(sp.Skeleton)
    sliderSpine: sp.Skeleton = null;

    @property(sp.Skeleton)
    micSpine: sp.Skeleton = null;



    show() {
        this.micSpine.setAnimation(0, "idle", true);
        this.sliderSpine.setAnimation(0, "idle", true);
        this.tibanSpine.setAnimation(0, "dancika chuxian", false);
        this.micNode.y = -300;
        cc.tween(this.micNode)
            .to(0.4, { y: 0 })
            .start();
    }

    shank() {
        cc.tween(this.icon.node)
            .by(0.4, { scale: 0.3 })
            .by(0.2, { scale: -0.1 })
            .by(0.4, { scale: 0.2 })
            .by(0.2, { scale: -0.4 })
            .delay(1)
            .union()
            .repeat(3)
            .start();
    }

    initeAniFun(sec) {
        this.icon.node.scale = 1;
        let timeScale = 10 / sec;
        this.sliderSpine.setAnimation(0, "click", false);
        this.micSpine.setAnimation(0, "click", true);
        this.sliderSpine.timeScale = Math.floor(timeScale) - 0.1;
        // let comp = this.centerNode.getComponent(cc.Sprite);
        // cc.tween(comp).
        //     set({ fillRange: 0 }).
        //     to(
        //         sec,
        //         { fillRange: -1 },
        //         {
        //             progress: (start, end, current, time) => {
        //                 let c = time * (end - start);
        //                 // point.angle = sAngle + 360 * c;
        //                 return c;
        //             }
        //         }
        //     ).
        //     start();
        // let clip = anim.currentClip || anim.defaultClip;
        // console.log('开始时间：' +sec);
        // if (clip) {
        //     clip.speed = sec * 0.1;
        //     anim.play();
        //     console.log(clip.speed);
        // }
        let n = 0;
        this.schedule(() => {
            this.rightNode[n].getComponent(cc.Animation).play()
            this.leftNode[n].getComponent(cc.Animation).play()
            n += 1;
        }, 0.2, 4, 0.2);
    }

    stopAni() {
        this.micSpine.setAnimation(0, "idle", true);
        this.sliderSpine.setAnimation(0, "idle", true);
        // let n = 0;
        // this.schedule(() => {
        //     this.rightNode[n].getComponent(cc.Animation).stop()
        //     this.leftNode[n].getComponent(cc.Animation).stop()
        //     n += 1;
        // }, 0.2, 4, 0.2);
        // let comp = this.centerNode.getComponent(cc.Sprite);
        // comp.fillRange = 0;
    }


    loading(active: boolean) {
        this.loadingNode.active = active;
        this.micActive(!active);
    }

    micActive(active: boolean) {
        this.micSpine.node.active = active;
        this.sliderSpine.node.active = active;
    }

    setLogo(bundleName: string, path: string, evaluatingText: string) {
        this.evaluatingText.string = evaluatingText;
        this.icon.node.scale = 1;
        ResourcesManager.instance.loadRes(bundleName, path, ResourceType.Normal, cc.SpriteFrame, (e, res) => {
            if (e) {
                this.icon.spriteFrame = null;
                return;
            }
            this.icon.spriteFrame = res;
        })
    }

    release() {
        this.icon.spriteFrame = null;
    }
}
