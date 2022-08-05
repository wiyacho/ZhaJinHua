import SpriteAssembler from "./SpriteAssembler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LSprite extends cc.Sprite {

    @property({type: [cc.Color], displayName: "顶点颜色", tooltip: "左下->右下->左上->右上"})
    colorList: cc.Color[] = [];

    flushProperties() {
        // //@ts-ignore
        // let assembler: MovingBGAssembler = this._assembler;
        // if (!assembler)
        //     return;
        // this.setVertsDirty();
    }

    _resetAssembler() {
        this.setVertsDirty();
        let assembler = this._assembler = new SpriteAssembler();
        assembler.colorList = this.colorList;
        this.flushProperties();

        assembler.init(this);

        // @ts-ignore
        this._updateColor(); // may no need
    }

}