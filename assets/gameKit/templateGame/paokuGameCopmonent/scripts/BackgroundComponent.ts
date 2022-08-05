
const {ccclass, property} = cc._decorator;
enum Mtype {
    VERTICAL_P,
    VERTICAL_N, 
    HORIZONTAL_P,
    HORIZONTAL_N,
  }
@ccclass
export default class BackgroundComponent extends cc.Component {

    lubg1:cc.Node = null;
    lubg2:cc.Node = null;

    centerNode1:cc.Node = null;
    centerNode2:cc.Node = null;

    // @property({
    //     type:cc.Integer,
    //     tooltip:"循环速度",
    //     min:0,
    //     max:1000,
    //     step:50,
    //     slide:true,
    // })
    speed: number;

    @property({ type: cc.Enum(Mtype),tooltip:"VERTICAL_P:垂直向下滚动  VERTICAL_N:垂直向上滚动 HORIZONTAL_P:水平向左滚动 HORIZONTAL_N:水平向右滚动" })
    mtype: Mtype = Mtype.VERTICAL_P;

    isRunmap = false;//滚动开关
    cur_lubg:cc.Node = null;
    cur_Centerlubg:cc.Node = null;
    luOffset = 0;
    onLoad () {
        this.lubg1 = this.node.getChildByName("bgNode1");
        this.lubg2 = this.node.getChildByName("bgNode2");
        this.centerNode1 = this.node.getChildByName("centerNode1");
        this.centerNode2 = this.node.getChildByName("centerNode2");
    }

    start () {
        this.cur_Centerlubg = this.centerNode1;
        this.cur_lubg = this.lubg1;
        this.setbgfix();
    }

    setbgfix(){
        let frameSize: cc.Size = cc.winSize;        
        let frameAspectRatio: number = frameSize.width / frameSize.height
        let screenSize: cc.Size = { ...frameSize } as cc.Size

        let ratio: number = this.node.width / this.node.height
        if (ratio > frameAspectRatio) {
            let width = this.node.width * screenSize.height / this.node.height
            this.lubg1.width = width + 3
            this.lubg1.height = screenSize.height
            this.lubg2.width = width + 3
            this.lubg2.height = screenSize.height
            switch (this.mtype) {
                case Mtype.VERTICAL_P:
                    this.lubg2.y = screenSize.height;
                    this.luOffset = screenSize.height;
                    break;
                case Mtype.VERTICAL_N:
                    this.lubg2.y = -screenSize.height;
                    this.luOffset = screenSize.height;
                    break;
                case Mtype.HORIZONTAL_P:
                    this.lubg2.x = width;
                    if (this.centerNode2) {
                        this.centerNode2.x = width;
                    }
                    this.luOffset = width;
                    break;
                case Mtype.HORIZONTAL_N:
                    this.lubg2.x = -width;
                    this.luOffset = width;
                    break;
                default:
                    break;
            }
        } else {
            // let height = this.node.height * screenSize.width / this.node.width
            let height = cc.winSize.height;
            this.lubg1.width = screenSize.width + 3
            this.lubg1.height = height
            this.lubg2.width = screenSize.width + 3
            this.lubg2.height = height
            if (this.centerNode2) { 
                this.centerNode1.width = screenSize.width
                this.centerNode1.height = height
                this.centerNode2.width = screenSize.width
                this.centerNode2.height = height
            }
            
            switch (this.mtype) {
                case Mtype.VERTICAL_P:
                    this.lubg2.y = height;
                    this.luOffset = height;
                    break;
                case Mtype.VERTICAL_N:
                    this.lubg2.y = -height;
                    this.luOffset = height;
                    break;
                case Mtype.HORIZONTAL_P:
                    this.lubg2.x = screenSize.width - 3;
                    this.luOffset = screenSize.width;
                    if (this.centerNode2) {
                        this.centerNode2.x = screenSize.width;
                    }
                    break;
                case Mtype.HORIZONTAL_N:
                    this.lubg2.x = -screenSize.width;
                    this.luOffset = screenSize.width;
                    break;
                default:
                    break;
            }
        }
        this.luOffset -=3
    }

    runlubg(dt){
        var s = dt * this.speed;
        var centerSpeed = dt * (this.speed + 80)
        switch (this.mtype) {
            case Mtype.VERTICAL_P:
                this.lubg1.y -= s;
                this.lubg2.y -= s;
                if (this.cur_lubg.y <= -this.luOffset) {
                    if(this.cur_lubg == this.lubg2) {
                        this.lubg2.y = this.lubg1.y + this.luOffset;
                        this.cur_lubg = this.lubg1;
                    }
                    else {
                        this.lubg1.y = this.lubg2.y + this.luOffset;
                        this.cur_lubg = this.lubg2;
                    }
                }
                break;
            case Mtype.VERTICAL_N:
                this.lubg1.y += s;
                this.lubg2.y += s;
                if (this.cur_lubg.y >= this.luOffset) {
                    if(this.cur_lubg == this.lubg2) {
                        this.lubg2.y = this.lubg1.y - this.luOffset;
                        this.cur_lubg = this.lubg1;
                    }
                    else {
                        this.lubg1.y = this.lubg2.y - this.luOffset;
                        this.cur_lubg = this.lubg2;
                    }
                }
                break;
            case Mtype.HORIZONTAL_P:
                this.lubg1.x -= s;
                this.lubg2.x -= s;
                if ( this.centerNode1 &&  this.centerNode2) {
                    this.centerNode1.x -= centerSpeed;
                    this.centerNode2.x -= centerSpeed;
                    if (this.cur_Centerlubg.x <= -this.luOffset) {
                        if(this.cur_Centerlubg == this.centerNode2) {
                            this.centerNode2.x = this.centerNode1.x + this.luOffset;
                            this.cur_Centerlubg = this.centerNode1;
                        }
                        else {
                            this.centerNode1.x = this.centerNode2.x + this.luOffset;
                            this.cur_Centerlubg = this.centerNode2;
                        }
                    }
                }
                if (this.cur_lubg.x <= -this.luOffset) {
                    if(this.cur_lubg == this.lubg2) {
                        this.lubg2.x = this.lubg1.x + this.luOffset;
                        this.cur_lubg = this.lubg1;
                    }
                    else {
                        this.lubg1.x = this.lubg2.x + this.luOffset;
                        this.cur_lubg = this.lubg2;
                    }
                }
                break;
            case Mtype.HORIZONTAL_N:
                this.lubg1.x += s;
                this.lubg2.x += s;
                if (this.cur_lubg.x >= this.luOffset) {
                    if(this.cur_lubg == this.lubg2) {
                        this.lubg2.x = this.lubg1.x - this.luOffset;
                        this.cur_lubg = this.lubg1;
                    }
                    else {
                        this.lubg1.x = this.lubg2.x - this.luOffset;
                        this.cur_lubg = this.lubg2;
                    }
                }
                break;
            default:
                break;
        }
        
    }
    
    update (dt) {
        if (this.isRunmap) {
           this.runlubg(dt);
        }
    }
}
