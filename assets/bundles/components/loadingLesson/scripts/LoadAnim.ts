// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadAnim extends cc.Component {

    spine: sp.Skeleton = null

    anchor: cc.Node = null

    spine_name = ''

    static JUMP_DUARATION = 1

    onLoad() {
        this.spine = this.node.getComponent(sp.Skeleton)
        this.spine.setCompleteListener(() => {
            if (this.currResolve) {
                const cb = this.currResolve
                this.currResolve = null
                cb()
            }
        })
    }

    start() {
    }

    private currResolve: Function = null

    async play(name: string, loop = false) {
        return new Promise<void>((resolve) => {
            this.spine.setAnimation(0, name, loop)
            this.currResolve = resolve
        })
    }
}
