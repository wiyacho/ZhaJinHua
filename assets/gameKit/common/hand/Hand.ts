const { ccclass, property } = cc._decorator;

@ccclass
export default class Hand extends cc.Component {

    @property({ type: sp.Skeleton, displayName: '手动画' })
    public sp: sp.Skeleton = null

    @property({ type: cc.Node, displayName: '手' })
    public cursor: cc.Node = null

    @property({ type: cc.Node, displayName: 'Mask' })
    public mask: cc.Node = null

    @property({ type: cc.Node, displayName: 'Bg' })
    public bg: cc.Node = null

    /**
     * 回调事件
     */
    public onCompleted: () => void = null

    public onLoad() {
        this.sp.setCompleteListener(() => {
            if (this.onCompleted) {
                const cb = this.onCompleted
                cb()
            }
        })
    }

    /**
     * 播放点击
     */
    public playClick() {
        this.fadeIn()
        this.node.active = true
        this.cursor.angle = 0
        this.sp.setAnimation(0, 'dian', false)
    }

    private fadeIn() {
        this.sp.setCompleteListener(() => {
            if (this.onCompleted) {
                const cb = this.onCompleted
                cb()
            }
        })
        let fade = cc.fadeIn(this.move_duration).easing(cc.easeSineOut())
        this.bg.runAction(fade)
    }

    /**
     * 左滑
     */
    public playSwipeLeft() {
        this.playSwipeByAngle(0, 'you-zuo', false)
    }

    /**
     * 右滑
     */
    public playSwipeRight() {
        this.playSwipeByAngle(0, 'zuo-you', false)
    }

    /**
     * 下滑
     */
    public playSwipeUp() {
        this.playSwipeByAngle(90, 'zuo-you', false)
    }

    /**
     * 上滑
     */
    public playSwipeDown() {
        this.playSwipeByAngle(90, 'you-zuo', false)
    }

    /**
     * 按下
     */
    public playDown(callback?: Function): void {
        this.playSwipeByAngle(0, 'changdian', false);
        if (callback) {
            this.sp.setCompleteListener(callback);
        }
    }

    /**
     * 按下
     */
    public playUp(callback?: Function): void {
        this.playSwipeByAngle(0, 'changdian-2', false);
        this.sp.setCompleteListener(() => {
            // this.sp.node.active = false;
            if (callback) {
                callback();
            }
        });
    }


    /**
     * 任意角度滑动
     */
    public playSwipeByAngle(angle, name, loop) {
        this.fadeIn()
        this.node.active = true
        this.cursor.angle = angle
        this.sp.setAnimation(0, name, loop)
    }

    private times = 1
    private currTime = 0
    private from = null
    private to = null

    private dragTw: cc.Tween = null

    private stopDragTw() {
        if (this.dragTw != null) {
            this.dragTw.stop()
            this.dragTw = null
        }
        // this.cursor.stopAllActions()
        cc.Tween.stopAllByTarget(this.cursor)
        // this.sp.setAnimation(0, '', false)
        // this.sp.setCompleteListener(() => {
            // if (this.onCompleted) {
            //     const cb = this.onCompleted
            //     cb()
            // }
        // })
    }

    /**
     * 两点间拖拽
     * @param from 起点世界坐标
     * @param to   终点世界坐标
     * @param times  次数
     */
    public playDrag(fromWorldPos: cc.Vec3, toWorldPos: cc.Vec3, times = 1) {
        let from = this.node.parent.convertToNodeSpaceAR(fromWorldPos)
        let to = this.node.parent.convertToNodeSpaceAR(toWorldPos)
        this.stopDragTw()
        this.times = times
        this.currTime = 0
        this.from = from
        this.to = to
        this.fadeIn()
        let angle = to.angle(from) * Math.PI / 180
        this.cursor.angle = angle
        this.node.active = true
        this.handAction()
    }

    public playDrag2(fromWorldPos: cc.Vec3, toWorldPos: cc.Vec3, times = 1) {
        let from = this.node.parent.convertToNodeSpaceAR(fromWorldPos)
        let to = this.node.parent.convertToNodeSpaceAR(toWorldPos)
        this.stopDragTw()
        this.times = times
        this.currTime = 0
        this.from = from
        this.to = to
        this.fadeIn()
        let angle = to.angle(from) * Math.PI / 180
        this.cursor.angle = angle
        this.node.active = true
        this.handAction2()
    }

    private onPlayDragOnceFinished() {
        this.stopDragTw()
        this.currTime++
        if (this.currTime >= this.times) {
            if (this.onCompleted) {
                const cb = this.onCompleted
                cb()
                this.hide()
            }
        } else {
            this.handAction()
        }
    }

    private handAction() {
        this.cursor.x = this.from.x
        this.cursor.y = this.from.y

        this.sp.setCompleteListener(() => {

            this.dragTw = cc.tween(this.cursor).to(0.5, { x: this.to.x, y: this.to.y }).delay(0.5).call(() => {
                this.sp.setCompleteListener(() => {
                    this.dragTw = cc.tween(this.cursor).to(0.5, { x: this.from.x, y: this.from.y }).call(() => {
                        this.onPlayDragOnceFinished()
                    }).start()
                })
                this.sp.setAnimation(0, 'changdian-2', false)
            }).start()
        })
        this.sp.setAnimation(0, 'changdian', false)
    }

    /**
     * 第二种版本
     */
    private handAction2() {
        this.cursor.x = this.from.x
        this.cursor.y = this.from.y

        this.sp.setCompleteListener(() => {

            this.dragTw = cc.tween(this.cursor).to(0.5, { x: this.to.x, y: this.to.y }).delay(0.5).call(() => {
                this.onPlayDragOnceFinished()
            }).start()
        })
        this.sp.setAnimation(0, 'changdian', false)
    }


    public move_duration = 0.4
    /**
     * 隐藏
     */
    public hide() {
        // this.target = null
        // let fade = cc.fadeOut(this.move_duration).easing(cc.easeSineOut())
        // this.bg.runAction(fade)
        this.stopDragTw()
        this.node.active = false
        this.sp.animation = "";
    }

    get isShowing() {
        return this.node.active
    }

    /**
     * 设置目标区域
     * @param x
     * @param y
     * @param w
     * @param h
     */
    public setTargetBound(x: number, y: number, w: number, h: number) {
        this.mask.width = w
        this.mask.height = h
        this.mask.x = x
        this.mask.y = y
        // bg坐标
        const screenSize = cc.Canvas.instance.designResolution
        this.bg.width = screenSize.width
        this.bg.height = screenSize.height
        this.bg.x = -this.mask.x
        this.bg.y = -this.mask.y
        this.cursor.x = this.mask.x
        this.cursor.y = this.mask.y
    }

    /**
     * 设置目标区域
     * @param target
     * @param parent
     * @param expand 扩边
     */
    public setTargetNode(target: cc.Node, parent: cc.Node, expand: number = 0) {
        if (target == null) {
            return
        }
        let worldPos = target.convertToWorldSpaceAR(cc.Vec2.ZERO)
        this.mask.width = target.width;
        this.mask.height = target.height;
        let localPos = parent.convertToNodeSpaceAR(worldPos)
        this.setTargetBound(localPos.x, localPos.y, target.width + expand, target.height + expand)
    }

}
