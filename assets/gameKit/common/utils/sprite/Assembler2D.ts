
// 自定义渲染
// https://docs.cocos.com/creator/manual/zh/advanced-topics/custom-render.html

// 参考引擎
// engine\assemblers\assembler-2d.js

// 参考demo地址
// https://github.com/caogtaa/CCBatchingTricks

// 论坛地址
// https://forum.cocos.org/t/demo/95087

// 每个2d渲染单元里的有:
// 4个顶点属性数据
// 6个顶点索引 -> 三角剖分成2个三角形

// 每个顶点属性由5个32位数据组成
// 顶点属性声明:
// var vfmtPosUvColor = new gfx.VertexFormat([
//     { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },       // 4个uint8
// ]);
// 顶点属性数据排列，每一格是32位 (float32/uint32)
// x|y|u|v|color|x|y|u|v|color|...
// 其中uv在一组数据中的偏移是2，color的偏移是4


// const renderEngine = cc.renderer.renderEngine;

// @ts-ignore
// const gfx = cc.gfx;

// 引擎定义的顶点数据的 buffer 格式, 参考引擎中的 vertex-format.js
// 传递位置及 UV
// let vfmtPosUv = new gfx.VertexFormat([
//     { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 }
// ]);
// 传递位置，UV 及颜色数据
// let vfmtPosUvColor = new gfx.VertexFormat([
//     { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
//     { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
// ]);

export default class Assembler2D extends cc.Assembler {

    verticesCount: number = 4;
    indecesCount: number = 6;
    floatsPerVert: number = 5;

    uvOffset: number = 2;
    colorOffset: number = 4;

    protected _renderData: cc.RenderData = null;
    protected _local: any[] = null;

    init(comp: cc.RenderComponent) {
        super.init(comp);

        this._renderData = new cc.RenderData();
        this._renderData.init(this);

        this.initLocal();
        this.initData();
    }

    get verticesFloats(): number {
        return this.verticesCount * this.floatsPerVert;
    }

    initLocal() {
        this._local = [];
        this._local.length = 4;
    }

    initData() {
        let data = this._renderData;
        data.createQuadData(0, this.verticesFloats, this.indecesCount);
    }

    updateColor(comp: any, color: any) {
        let uintVerts = this._renderData.uintVDatas[0];
        if(!uintVerts) return;
        color = color != null ? color : comp.node.color._val;
        let floatsPerVert = this.floatsPerVert;
        let colorOffset = this.colorOffset;
        for(let i = colorOffset, len = uintVerts.length; i < len; i += floatsPerVert) {
            uintVerts[i] = color;
        }
    }

    protected updateUVs(comp: cc.RenderComponent) {
        // 左下, 右下, 左上, 右上
        let uv = [0,0, 1,0, 0,1, 1,1];
        let uvOffset = this.uvOffset;
        let floatsPerVert = this.floatsPerVert;
        let verts = this._renderData.vDatas[0];

        for(let i = 0; i < 4; i++) {
            let srcOffset = i * 2;
            let dstOffset = floatsPerVert * i + uvOffset;
            verts[dstOffset] = uv[srcOffset];
            verts[dstOffset+1] = uv[srcOffset+1];
        }
    }

    protected updateVerts(comp: cc.RenderComponent) {
        let node: cc.Node = comp.node;
        let cw: number = node.width;
        let ch: number = node.height;
        let appx: number = node.anchorX * cw;
        let appy: number = node.anchorX * ch;
        let l: number = -appx;
        let b: number = -appy;
        let r: number = appx;
        let t: number = appy;
        
        let local = this._local;
        local[0] = l;
        local[1] = b;
        local[2] = r;
        local[3] = t;
        this.updateWorldVerts(comp);
    }

    protected updateRenderData(comp: cc.RenderComponent) {
        if(comp._vertsDirty) {
            this.updateUVs(comp);
            this.updateVerts(comp);
            comp._vertsDirty = false;
        }
    }

    updateWorldVerts(comp: cc.RenderComponent) {
        if(CC_NATIVERENDERER) {
            this.updateWorldVertsNative(comp);
        } else {
            this.updateWorldVertsWebGL(comp);
        }
    }

    /*
        m00 = 1, m01 = 0, m02 = 0, m03 = 0,
        m04 = 0, m05 = 1, m06 = 0, m07 = 0,
        m08 = 0, m09 = 0, m10 = 1, m11 = 0,
        m12 = 0, m13 = 0, m14 = 0, m15 = 1
    */

    updateWorldVertsWebGL(comp: cc.RenderComponent) {
        let local = this._local;
        let verts = this._renderData.vDatas[0];

        let matirx: cc.Mat4 = new cc.Mat4();
        comp.node.getWorldMatrix(matirx);

        let matirxM = matirx.m;
        let a = matirxM[0];
        let b = matirxM[1];
        let c = matirxM[4];
        let d = matirxM[5];
        let tx = matirxM[12];
        let ty = matirxM[13];

        let vl = local[0];
        let vb = local[1];
        let vr = local[2];
        let vt = local[3];

        let justTranslate = a === 1 && b === 0 && c === 0 && d === 1;

        let index = 0;
        let floatsPerVert = this.floatsPerVert;

        if(justTranslate) {
            // left bottom
            verts[index] = vl + tx;
            verts[index+1] = vb + ty;

            index += floatsPerVert;

            // right bottom
            verts[index] = vr + tx;
            verts[index+1] = vb + ty;

            index += floatsPerVert;

            // left top
            verts[index] = vl + tx;
            verts[index+1] = vt + ty;

            index += floatsPerVert;

            // right top
            verts[index] = vr + tx;
            verts[index+1] = vt + ty;
        } else {
            let al = a * vl, ar = a * vr,
            bl = b * vl, br = b * vr,
            cb = c * vb, ct = c * vt,
            db = d * vb, dt = d * vt;

            verts[index] = al + cb + tx;
            verts[index+1] = bl + db + ty;
            index += floatsPerVert;

            verts[index] = ar + cb + tx;
            verts[index+1] = br + db + ty;
            index += floatsPerVert;

            verts[index] = al + ct + tx;
            verts[index+1] = bl + dt + ty;
            index += floatsPerVert;

            verts[index] = ar + ct + tx;
            verts[index+1] = br + dt + ty;
        }
    }

    // copy from \jsb-adapter-master\engine\assemblers\assembler-2d.js
    updateWorldVertsNative(comp: any) {
        let local = this._local;
        let verts = this._renderData.vDatas[0];
        let floatsPerVert = this.floatsPerVert;
      
        let vl = local[0],
            vr = local[2],
            vb = local[1],
            vt = local[3];
      
        let index: number = 0;
        // left bottom
        verts[index] = vl;
        verts[index+1] = vb;
        index += floatsPerVert;
        // right bottom
        verts[index] = vr;
        verts[index+1] = vb;
        index += floatsPerVert;
        // left top
        verts[index] = vl;
        verts[index+1] = vt;
        index += floatsPerVert;
        // right top
        verts[index] = vr;
        verts[index+1] = vt;
    }

    // 纯数据拷贝, 没有什么参考价值.
    // 不用纠结为什么这么写
    fillBuffers(comp: cc.RenderComponent, renderer: any) {
        if(renderer.worldMatDirty) {
            this.updateWorldVerts(comp);
        }

        let renderData = this._renderData;
        let vData = renderData.vDatas[0];
        let iData = renderData.iDatas[0];

        let buffer = this.getBuffer();
        let offsetInfo = buffer.request(this.verticesCount, this.indecesCount);

        // fill vertices
        let vertexOffset = offsetInfo.byteOffset >> 2;
        let vbuf = buffer._vData;

        if (vData.length + vertexOffset > vbuf.length) {
            vbuf.set(vData.subarray(0, vbuf.length - vertexOffset), vertexOffset);
        } else {
            vbuf.set(vData, vertexOffset);
        }

        // fill indices
        let ibuf = buffer._iData,
            indiceOffset = offsetInfo.indiceOffset,
            vertexId = offsetInfo.vertexOffset;             // vertexId是已经在buffer里的顶点数，也是当前顶点序号的基数
        for (let i = 0, l = iData.length; i < l; i++) {
            ibuf[indiceOffset++] = vertexId + iData[i];
        }
    }

    packToDynamicAtlas(comp: any, frame: any) {
        if(CC_TEST) return;

        if (!frame._original && cc.dynamicAtlasManager && frame._texture.packable) {
            let packedFrame = cc.dynamicAtlasManager.insertSpriteFrame(frame);
            //@ts-ignore
            if (packedFrame) {
                frame._setDynamicAtlasFrame(packedFrame);
            }
        }
        let material = comp._materials[0];
        if (!material) return;
        
        if (material.getProperty('texture') !== frame._texture) {
            // texture was packed to dynamic atlas, should update uvs
            comp._vertsDirty = true;
            comp._updateMaterial();
        }
    }

    getBuffer() {
        // cc.renderer._handle.getBuffer("mesh", this.getVfmt());
        //@ts-ignore
        return cc.renderer._handle._meshBuffer;
    }
}