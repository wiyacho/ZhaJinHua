
const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelIndicator extends cc.Component {

    @property([cc.SpriteFrame])
    indicatorImgs: cc.SpriteFrame[] = [];


    @property([cc.SpriteFrame])
    lineImgs: cc.SpriteFrame[] = [];

    @property(cc.Node)
    itemNode:cc.Node = null;

    @property(cc.Node)
    lineNode: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;


    indicatorNodes: cc.Node[] = [];
    lineNodes: cc.Node[] = [];

    maxRound:number = -1;

    initData(maxRound){
        this.maxRound = maxRound;

        this.initIndicator();
    }
    
    initIndicator(){
        for (let index = 0; index < this.maxRound; index++) {
            let node = cc.instantiate(this.itemNode);
            node.active = true;
            node.parent = this.content;
            this.indicatorNodes.push(node);
        }
        this.indicatorNodes.reverse();

        this.scheduleOnce(()=>{
            this.content.getComponent(cc.Layout).enabled = false;
            this.initLine();
        })
    }

    initLine(){
        for (let index = 1; index < this.maxRound; index++) {
            let node = cc.instantiate(this.lineNode);
            node.active = true;
            node.parent = this.content;
            this.lineNodes.push(node);
            node.zIndex = cc.macro.MIN_ZINDEX;
            node.x = this.indicatorNodes[index].x - this.indicatorNodes[index].width/2-9;
            node.getComponent(cc.Sprite).spriteFrame = this.lineImgs[1];
        }
    }

    updateCurIndicator(index:number, comp:boolean){
        let spIndex = comp ? 1 : 2;
        this.indicatorNodes[index].getComponent(cc.Sprite).spriteFrame = this.indicatorImgs[spIndex];

        if (index>0) {
            this.lineNodes[index-1].getComponent(cc.Sprite).spriteFrame = this.lineImgs[0];
        }
    }

}
