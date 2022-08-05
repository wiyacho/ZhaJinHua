import Assembler2D from "./Assembler2D";

export default class SpriteAssembler extends Assembler2D {

    private _whiteColor: number = 4294967295;
    private _colorList: number[] = [];

    public set colorList(val: cc.Color[]) {
        let newColorList = [];
        for(let i = 0; i < val.length; i++) {
            let v = 0;
            let color = val[i] as any;
            newColorList[i] = color._val;
        }
        this._colorList = newColorList;
    }

    updateRenderData(sprite: cc.Sprite) {
        this.packToDynamicAtlas(sprite, sprite._spriteFrame);
        super.updateRenderData(sprite);
    }

    updateUVs(sprite: any) {
        let uv = sprite._spriteFrame.uv;
        // console.log("xxxx", uv);
        // uv = [0,1,      2,2,    0,0,        2,0];
        let uvOffset = this.uvOffset;
        let floatsPerVert = this.floatsPerVert;
        let verts = this._renderData.vDatas[0];
        for (let i = 0; i < 4; i++) {
            let srcOffset = i * 2;
            let dstOffset = floatsPerVert * i + uvOffset;
            verts[dstOffset] = uv[srcOffset];
            verts[dstOffset + 1] = uv[srcOffset + 1];
        }
    }

    updateVerts(sprite: any) {
        let node = sprite.node,
            cw = node.width, ch = node.height,
            appx = node.anchorX * cw, appy = node.anchorY * ch,
            l, b, r, t;
        if (sprite.trim) {
            l = -appx;
            b = -appy;
            r = cw - appx;
            t = ch - appy;
        }
        else {
            let frame = sprite.spriteFrame,
                ow = frame._originalSize.width, oh = frame._originalSize.height,
                rw = frame._rect.width, rh = frame._rect.height,
                offset = frame._offset,
                scaleX = cw / ow, scaleY = ch / oh;
            let trimLeft = offset.x + (ow - rw) / 2;
            let trimRight = offset.x - (ow - rw) / 2;
            let trimBottom = offset.y + (oh - rh) / 2;
            let trimTop = offset.y - (oh - rh) / 2;
            l = trimLeft * scaleX - appx;
            b = trimBottom * scaleY - appy;
            r = cw + trimRight * scaleX - appx;
            t = ch + trimTop * scaleY - appy;
        }

        let local = this._local;
        local[0] = l;
        local[1] = b;
        local[2] = r;
        local[3] = t;
        this.updateWorldVerts(sprite);
    }

    updateColor(comp: any, color: any) {
        let uintVerts = this._renderData.uintVDatas[0];
        if(!uintVerts) return;
        color = color != null ? color : comp.node.color._val;
        let floatsPerVert = this.floatsPerVert;
        let colorOffset = this.colorOffset;
        let d = 0;

        for(let i = colorOffset, len = uintVerts.length; i < len; i += floatsPerVert) {
            color = this._colorList[d];
            !color ? color = this._whiteColor : null;
            uintVerts[i] = color;
            d++;
        }
    }
}