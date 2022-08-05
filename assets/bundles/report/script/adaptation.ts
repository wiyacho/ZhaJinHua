
const {ccclass, property} = cc._decorator;

@ccclass
export default class Adaptation extends cc.Component {

    @property([cc.Node])
    adaptNode: cc.Node [] = [];

    onLoad () {
        this.adaptNode.forEach(item => this.adapta(item))
    }
    
    adapta (node: cc.Node) {
        let widthScale = cc.winSize.width / 1334;
        node.width *= widthScale;
        node.height *= widthScale;
        let widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.updateAlignment();
        }
    }
   
}
