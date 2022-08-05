// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskBoard extends cc.Component {
    private contents: cc.Prefab[] = []
    private contentNodes: cc.Node[] = []
    /**
     * 完成图标
     */
    @property({ type: sp.Skeleton, displayName: '任务完成' })
    finishIcon: sp.Skeleton = null


    /**
     * 面板位置
     */
    @property({ type: [cc.Node], displayName: '面板位置' })
    poses: cc.Node[] = []

    /**
     * 移动完毕:isShowing是否显示状态
     */
    // onMoveEnded: (isShowing: boolean) => void = null

    private move_duration = 0.4

    /**
     * 当前页
     */
    private currPage = 0

    isShowing: boolean = false

    /**
     * 面板
     */
    @property({ type: cc.Node, displayName: '面板' })
    panel: cc.Node = null

    /**
     * mask
     */
    @property({ type: cc.Node, displayName: 'mask' })
    mask: cc.Node = null

    /**
     * 内容区域
     */
    @property({ type: cc.Node, displayName: '内容区域' })
    safearea: cc.Node = null

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
        let sw = cc.Canvas.instance.designResolution
        this.poses[0].x = sw.width / 2 - 220
        this.poses[0].y = -sw.height / 2
        this.poses[1].x = sw.width / 2 + 220
        this.poses[1].y = -sw.height / 2
        this.panel.x = this.poses[1].x
        this.panel.y = this.poses[1].y
    }

    start() {

    }

    // update (dt) {}

    /**
     * 显示
     * @param pageIndex 页码，默认:0
     */
    show(pageIndex: number,onMoveEnded:Function = null) {
        this.finishIcon.node.active = false
        this.node.active = true
        if (this.contents.length > 0) {
            let pre = this.contents[pageIndex]
            let ch = cc.instantiate(pre)
            ch.active = true
            this.safearea.addChild(ch)
            ch.x = 0
            ch.y = 0
        } else {
            if (this.contentNodes.length > 0) {
                let pre = this.contentNodes[pageIndex]
                let ch = cc.instantiate(pre)
                ch.active = true
                this.safearea.addChild(ch)
                ch.x = 0
                ch.y = 0
            }
        }
        this.panel.active = true
        let fade = cc.fadeIn(this.move_duration).easing(cc.easeSineOut())
        this.mask.runAction(fade)
        this.moveTo(this.poses[0], this.move_duration, () => {
            this.isShowing = true
            if (onMoveEnded) {
                onMoveEnded(this.isShowing)
            }
        })
    }

    onClosed:Function = null

    /**
     * 收起
     */
    hide(onMoveEnded:Function = null) {
        let fade = cc.fadeOut(this.move_duration).easing(cc.easeSineOut())
        this.mask.runAction(fade)
        this.moveTo(this.poses[1], this.move_duration, () => {
            this.isShowing = false
            this.node.active = false
            this.panel.active = false
            if (this.safearea.children.length > 0) {
                let ch = this.safearea.children[0]
                ch.removeFromParent()
                ch.destroy()
            }
            this.hideFinishIcon()
            if (onMoveEnded) {
                onMoveEnded(this.isShowing)
            }
            if(this.onClosed){
                let oc = this.onClosed
                oc()
            }
        })
    }

    /**
     * 内容可设置prefab也可设置node,内容区大小为330x340px
     * @param prefabs 
     */
    setPrefabs(prefabs: cc.Prefab[]) {
        this.contents = prefabs
    }

    /**
     * 内容可设置prefab也可设置node,内容区大小为330x340px
     * @param nodes 
     */
    setNodes(nodes: cc.Node[]) {
        this.contentNodes = nodes
    }

    /**
     * 播放完成盖章动画
     */
    playFinished() {
        this.finishIcon.node.active = true
        this.finishIcon.setAnimation(0, 'gaizhang', false)
    }

    hideFinishIcon() {
        this.finishIcon.node.active = false
        // this.finishIcon.setAnimation(0, '', false)
    }

    onClick() {
        // if (this.isShowing) {
        //     this.hide()
        // } else {
        //     this.show()
        // }

    }

    private flag_block = false

    /**
    * 飘动到
    * @param pos 
    */
    moveTo(pos: cc.Node, duration = 1, callback: () => void = () => void {}) {
        this.flag_block = true
        let mov = cc.moveTo(duration, pos.x, pos.y).easing(cc.easeBackOut())
        let seq = cc.sequence(mov, cc.callFunc(() => {
            this.flag_block = false
            callback()
        }))
        this.panel.runAction(seq)
    }

    private initPos: cc.Vec2 = cc.Vec2.ZERO
    private currPos: cc.Vec2 = cc.Vec2.ZERO

    private onTouchBegan(event: cc.Event.EventTouch) {
        console.log('onTouchBegan >>>>>>>>>>>>')
        this.currPos.x = event.getLocationX()
        this.currPos.y = event.getLocationY()
        this.initPos.x = event.getLocationX()
        this.initPos.y = event.getLocationY()
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        console.log('onTouchEnd >>>>>>>>>>>>')
        // console.log(`touch x: ${event.getLocationX()} y: ${event.getLocationY()}`)
        let currX = event.getLocationX()
        let currY = event.getLocationY()

        let dis = Math.sqrt((currX - this.initPos.x) * (currX - this.initPos.x) + (currY - this.initPos.y) * (currY - this.initPos.y))
        if (dis < 20) {
            //收起
            this.hide()
        }
    }


}
