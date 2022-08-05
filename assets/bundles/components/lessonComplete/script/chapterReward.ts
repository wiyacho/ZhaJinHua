import { kit } from "../../../../kit/kit";
import { BUNDLE_NAME, lessonCompleteData, MESSAGE_COMPLETE, MUSIC_PATH } from "./lessonCompleteData";

const enum COMPLETE_MUSIC {
    JINGXI = "1jingxi",
    OPEN_BOX = "2kaixiang",
    HUANHU = "3huanhu",
    CAIDAI = "4liuxing",
    FUDAI = "5fudai",
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class chapterReward extends cc.Component {

    @property(cc.Node)
    public boxNode: cc.Node = null;

    @property(cc.Node)
    public icon: cc.Node = null;

    @property(cc.Node)
    public starNode: cc.Node = null;

    @property(cc.Prefab)
    public boxPre: cc.Prefab = null;

    @property(sp.Skeleton)
    public tigo: sp.Skeleton = null;

    @property(sp.Skeleton)
    public bag: sp.Skeleton = null;

    @property(sp.Skeleton)
    public light: sp.Skeleton = null;

    public curChapterIndex: number = null;

    public onLoad() {
        this.init()
        this.scheduleOnce(() => {
            this.startCurChapterSpine()
        }, 1)
    }

    public init() {
        let boxData = lessonCompleteData.instance.getAllBoxState()
        this.curChapterIndex = lessonCompleteData.instance.getCurChapterIndex()

        let len = boxData.length
        for (let i = 0; i < len; i++) {
            let node = cc.instantiate(this.boxPre)
            this.boxNode.addChild(node)
        }

        // 设置飞卡片的初始位置
        this.scheduleOnce(() => {
            this.boxNode.getComponent(cc.Layout).enabled = false
            this.icon.active = false
            let node = this.boxNode.children[this.curChapterIndex]
            if (node) {
                let pos = node.parent.convertToWorldSpaceAR(node.position)
                let pos1 = this.node.convertToNodeSpaceAR(pos)
                this.icon.x = pos1.x
                this.icon.y = pos1.y
            }
        })
        this.setCurChapterIcon(this.icon)
        kit.manager.Audio.playEffect(BUNDLE_NAME, `${MUSIC_PATH}${COMPLETE_MUSIC.JINGXI}`);
    }

    /* 设置模版图片 */
    public setCurChapterIcon(node: cc.Node) {
        let icon = lessonCompleteData.instance.getCurChapterIcon()
        kit.Loader.loadRes(icon, cc.SpriteFrame, (err, res) => {
            if (err) {
                cc.log("加载失败", err)
                return
            } else {
                cc.log("替换飞图模版～～～～～～")
                node.getComponent(cc.Sprite).spriteFrame = res
            }
        }, BUNDLE_NAME)
    }
    /* 开始流程动画 */
    public startCurChapterSpine() {
        let spineNode = this.boxNode.children[this.curChapterIndex]
        kit.manager.Audio.playEffect(BUNDLE_NAME, `${MUSIC_PATH}${COMPLETE_MUSIC.OPEN_BOX}`);
        let spine = spineNode.getChildByName("box").getComponent(sp.Skeleton)
        spine.setAnimation(0, "hezi-kai", false)
        spine.setCompleteListener(() => {
            this.icon.active = true
            this.icon.scale = 0.4
            this.tigo.clearTracks()
            this.tigo.setToSetupPose()
            this.tigo.setAnimation(0, "daiji2", false)
            kit.manager.Audio.playEffect(BUNDLE_NAME, `${MUSIC_PATH}${COMPLETE_MUSIC.HUANHU}`);
            cc.tween(this.icon)
                .parallel(
                    cc.tween().to(1.5, { scale: 1 }),
                    // cc.tween().bezierTo(1.5, cc.v2(x,y+60), cc.v2(lightX - 100,lightY -100), cc.v2(lightX,lightY))
                    cc.tween().to(1.5, { position: this.light.node.position }),
                    cc.tween().call(() => kit.manager.Audio.playEffect(BUNDLE_NAME, `${MUSIC_PATH}${COMPLETE_MUSIC.CAIDAI}`)),
                    cc.tween().call(() => {
                        cc.tween(this.boxNode).to(1.5, { opacity: 0 }).start()
                    })
                    .start()
                )
                .call(() => {
                    this.icon.getChildByName("pairticle").active = false
                    this.light.node.active = true
                    this.bag.node.active = true
                    this.bag.node.opacity = 0
                })
                .delay(1.5)
                .call(() => {
                    cc.tween(this.light.node).to(1, { scale: 0 }).start()
                    cc.tween(this.bag.node).to(1, { opacity: 255 }).start()
                    cc.tween(this.tigo.node).to(1, { opacity: 0 }).start(),
                    cc.tween(this.icon).to(1, { scale: 0 })
                        .call(() => {
                            let particle = this.icon.getChildByName("pairticle")
                            particle.active = true
                            particle.parent = this.starNode
                            this.starNode.active = true
                            kit.manager.Audio.playEffect(BUNDLE_NAME, `${MUSIC_PATH}${COMPLETE_MUSIC.CAIDAI}`)
                            cc.tween(this.starNode).to(1.5, { x: this.bag.node.x, y: this.bag.node.y + 70, scale: 0 }).start()
                            cc.tween(this.starNode).delay(1.3).call(() => {
                                kit.manager.Audio.playEffect(BUNDLE_NAME, `${MUSIC_PATH}${COMPLETE_MUSIC.FUDAI}`)
                                particle.active = false
                                this.bag.clearTracks()
                                this.bag.setToSetupPose()
                                this.bag.setAnimation(0, "fudai2", false)
                                this.bag.setCompleteListener(() => {
                                    this.bag.node.active = false
                                    this.scheduleOnce(() => {
                                        kit.manager.Event.emit(MESSAGE_COMPLETE)
                                    }, 0.3)
                                })
                            })
                                .start()
                        })
                        .start()
                })
                .start()
        })
    }

    public start() {

    }
}
