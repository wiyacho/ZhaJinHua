import TemplateGameBase from "./TemplateGameBase";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ComponentBase extends cc.Component {

    gameBase:TemplateGameBase = null;
    // onLoad () {}

    start () {
        
    }

    initData(data){
        //给gameBase赋值
        this.gameBase = data;
    }

    // update (dt) {}
}
