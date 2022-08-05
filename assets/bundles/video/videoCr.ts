const {ccclass, property} = cc._decorator;

@ccclass
export default class videoCr extends cc.Component {

    @property(cc.Node)
    content:cc.Node = null

    time:number = 3

    public start () {
        this.node.on("touchend",this.showControl,this);
        this.scheduleOnce(()=>this.showControl(),this.time)
    }

    public onEnable(){
        
    }

    public showControl(){
        this.content.active = !this.content.active
        this.unscheduleAllCallbacks()
        this.scheduleOnce(()=>this.hide(),this.time)
    }

    public hide(){
        if(this.content.active)
        this.content.active = false
    }

    public show(){
        this.content.active = true
        this.unscheduleAllCallbacks()
        console.log("重新计时========")
        this.scheduleOnce(()=>this.hide(),this.time)
    }

    public schHide(){
        this.scheduleOnce(()=>this.hide(),this.time)
    }
}
