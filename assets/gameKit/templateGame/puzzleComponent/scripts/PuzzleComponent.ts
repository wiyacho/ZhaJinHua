import AudioManager from "../../../../kit/system/audio/AudioManager";
import { RoundStateType } from "../../../common/structure/CompEnum";
import ComponentBase from "../../scripts/ComponentBase";

const { ccclass, property } = cc._decorator;

const DRAG_CORRECT_DISTANCE = 50;
@ccclass
export default class PuzzleComponent extends ComponentBase {

    @property({ displayName: "拖拽元素数量" })
    puzzleCount: number = -1;

    @property({ displayName: "心的数量" })
    bloodCount: number = 3;
    //拖拽碎片
    puzzleItemNodes: cc.Node[] = [];
    //拖拽目的地
    puzzleDesNodes: cc.Node[] = [];
    //爱心node
    bloodNodes: cc.Node[] = [];

    _offsetPos: cc.Vec2;

    onLoad() {
        this.initPuzzleDesNodes();
        this.initPuzzleItem();
        this.initDragEvent();
        this.initBloodNode();
    }
    initPuzzleDesNodes() {
        let length = this.puzzleCount;
        for (let index = 1; index <= length; index++) {
            let node = this.node.getChildByName(`ptbg${index}`);
            this.puzzleDesNodes.push(node);
        }
    }

    initPuzzleItem() {
        for (let index = 1; index <= this.puzzleCount; index++) {
            let node = this.node.getChildByName(`dragItem${index}`);
            this.puzzleItemNodes.push(node);
            node['originpos'] = node.position;
        }
    }

    initBloodNode() {
        for (let index = 1; index <= this.bloodCount; index++) {
            let node = cc.find(`heartContr/heartsp${index}`, this.node);
            this.bloodNodes.push(node);
        }

        this.node.getChildByName("heartContr").getComponent(cc.Layout).enabled = false;
    }

    initDragEvent() {
        for (let index = 0; index < this.puzzleItemNodes.length; index++) {
            let node = this.puzzleItemNodes[index];
            node.on(cc.Node.EventType.TOUCH_START, this.onBegin, this);
            node.on(cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
            node.on(cc.Node.EventType.TOUCH_END, this.onEnd, this);
            node.on(cc.Node.EventType.TOUCH_CANCEL, this.onCancel, this);
        }
    }

    gameOver(succ: boolean) {
        cc.log(` game over succ: ${succ}`)
        this.offAllDragEvent();

        //选择正确
        this.gameBase.roundStateTypeChanged(RoundStateType.RoundComplete, { win: succ ? 1 : 0 })
    }

    onBegin(e: cc.Event.EventTouch): void {
        let touchNode: cc.Node = e.target;
        let local = e.getLocation();
        local = touchNode.parent.convertToNodeSpaceAR(local);
        this._offsetPos = cc.v2(touchNode.position.sub(cc.v3(local)));
        touchNode.zIndex = cc.macro.MAX_ZINDEX;
    }

    onMove(e: cc.Event.EventTouch): void {
        let touchNode: cc.Node = e.target;
        let local = e.getLocation();
        local = touchNode.parent.convertToNodeSpaceAR(local);
        touchNode.position = cc.v3(local.add(this._offsetPos));
        this.showHotTips(touchNode)
        this.checkDragRight(touchNode);

    }

    /* 热区提示颜色引导  */
    showHotTips(node: cc.Node) {
        let len = this.puzzleDesNodes.length
        for (let i = 0; i < len; i++) {
            let dragPos = node.position;
            let targetPos = this.puzzleDesNodes[i].position;
            let lens = dragPos.sub(targetPos).len();
            if (lens <= DRAG_CORRECT_DISTANCE) {
                this.puzzleDesNodes[i].color = cc.color(80, 80, 80)
            } else {
                this.puzzleDesNodes[i].color = cc.color(255, 255, 255)
            }
        }
    }

    checkDragRight(node: cc.Node, dragEnd: boolean = false) {
        let index = +node.name[node.name.length - 1] - 1;
        if (index >= 0 && index < this.puzzleCount) {
            let dragPos = node.position;
            let targetPos = this.puzzleDesNodes[index].position;
            let len = dragPos.sub(targetPos).len();
            if (len <= DRAG_CORRECT_DISTANCE) {
                if (dragEnd) {
                    this.dragCorrect(node, targetPos);
                } else {
                    //TODO: 
                }
            } else {
                if (dragEnd) {
                    this.dragWrong(node);
                }
            }
        } else {
            cc.error(`drag error! name: ${node.name}`);
        }
    }

    dragCorrect(node: cc.Node, targetPos: cc.Vec3) {
        // cc.log("dragCorrect")
        node.position = targetPos;
        node.scale = 1.85;
        this.offTouchEvent(node);


        let index = this.puzzleItemNodes.indexOf(node);
        this.puzzleItemNodes.splice(index, 1);
        //选择正确
        this.gameBase.roundStateTypeChanged(RoundStateType.RoundProceeding)
        if (this.puzzleItemNodes.length <= 0) {
            this.gameOver(true);
        }
    }

    dragWrong(node:cc.Node){
        // cc.log("dragWrong")
        node.position = node['originpos'];
        AudioManager.playEffect("templateGame", "puzzleComponent/audio/game_error")
        let bloodNode = this.bloodNodes.pop();
        bloodNode.destroy();

        if (this.bloodNodes.length <= 0) {
            this.gameOver(false);
        }
    }


    onEnd(e: cc.Event.EventTouch): void {
        let touchNode: cc.Node = e.target;
        this.checkDragRight(touchNode, true);
        touchNode.zIndex = 1;
        this.puzzleDesNodes.map(item => item.color = cc.color(255, 255, 255))
    }

    onCancel(e: cc.Event.EventTouch): void {
        let touchNode: cc.Node = e.target;
        touchNode.zIndex = 1;

    }

    offAllDragEvent() {
        for (let index = 0; index < this.puzzleItemNodes.length; index++) {
            let node = this.puzzleItemNodes[index];
            this.offTouchEvent(node);
        }
    }

    offTouchEvent(node:cc.Node){
        node.off(cc.Node.EventType.TOUCH_START);
        node.off(cc.Node.EventType.TOUCH_MOVE);
        node.off(cc.Node.EventType.TOUCH_END);
        node.off(cc.Node.EventType.TOUCH_CANCEL);
    }
    
}
