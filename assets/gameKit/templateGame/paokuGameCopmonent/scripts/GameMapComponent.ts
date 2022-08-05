import PaokuGameController, { PaokuState } from "./PaokuGameController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMapComponent extends cc.Component {
    @property({ type: cc.Prefab, displayName: "第一块地图" })
    mapStart: cc.Prefab = null;

    @property({ type: cc.Prefab, displayName: "最后一块地图" })
    mapEnd: cc.Prefab = null;

    @property(cc.Prefab)
    mapItem: cc.Prefab[] = []

    lubg1: cc.Node = null;
    lubg2: cc.Node = null;

    isRunmap: boolean = false;
    cur_lubg: cc.Node = null;
    speed: number = 0;
    luOffset: number = 2668;//一张地图的长度
    // rollIndex:number = 0;
    halfFrame: number = 0;
    mapIndex: number = 1;
    gameEndTag: boolean = false;

    // 第一屏起始位置
    private minPosX: number;

    onLoad() {

        let map1 = cc.instantiate(this.mapStart);
        let map2 = cc.instantiate(this.mapItem[0]);
        this.lubg1 = this.node.getChildByName("pathNode1");
        this.lubg2 = this.node.getChildByName("pathNode2");
        this.lubg1.addChild(map1);
        this.lubg2.addChild(map2);

    }

    start() {//地图适配
        let frameSize: cc.Size = cc.winSize;
        this.halfFrame = frameSize.width / 2;
        this.cur_lubg = this.lubg1;
        this.scheduleOnce(() => {
            this.lubg2.x = this.lubg1.x + this.luOffset;
            this.minPosX = this.lubg1.x;
        }, 0.2)
    }

    setMapSpeed(spd: number) {
        if (spd && spd > 0) {
            this.speed = spd;
            this.isRunmap = true;
        } else {
            this.isRunmap = false;
        }
    }

    private followLu: cc.Node;
    runlubg(dt) {
        var s = dt * this.speed;
        this.lubg1.x -= s;
        this.lubg2.x -= s;
        let offset = this.luOffset;
        
        if (PaokuGameController.instance.currentPaokuState == PaokuState.onFollowRead) {
            cc.log("还是跟读");
            return;
        }
        if (this.cur_lubg.x <= -offset - this.halfFrame) {
            if (this.cur_lubg == this.lubg2) {
                this.addMapToLubg(this.lubg2)
                this.lubg2.x = this.lubg1.x + this.luOffset;
                this.cur_lubg = this.lubg1;
            }
            else {
                this.addMapToLubg(this.lubg1)
                this.lubg1.x = this.lubg2.x + this.luOffset;
                this.cur_lubg = this.lubg2;
                // cc.log("this.lubg1.x",this.lubg1.x)
            }
        }
    }

    addMapToLubg(lu: cc.Node) {
        lu.destroyAllChildren();
        let map = null;
        if (this.gameEndTag) {
            map = cc.instantiate(this.mapEnd);
        }  else {
            this.followLu = null;
            map = cc.instantiate(this.mapItem[this.mapIndex]);
        }
        lu.addChild(map); 
        if (lu && cc.isValid(lu)) {
            let widgets = lu.getComponent(cc.Widget);
            if (widgets) {
                widgets.enabled = false
            }
        }
        this.mapIndex = this.mapIndex + 1 >= this.mapItem.length ? 0 : this.mapIndex + 1;
    }

    update(dt) {
        if (this.isRunmap) {
            this.runlubg(dt);
        }
    }
}
