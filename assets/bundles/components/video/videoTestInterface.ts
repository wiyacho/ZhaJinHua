import ResourcesManager, { ResourceType } from "../../../kit/manager/ResourcesManager";
// import { Downloader } from "../../../Script/utils/Downloader";
import VideoInterface from "./videoInterface";

const {ccclass, property} = cc._decorator;

@ccclass
export default class videoTestInterface extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property
    text: string = 'hello';

    videoPlayer:cc.VideoPlayer = null;
    onLoad(){
        this.videoPlayer = this.node.getChildByName("VideoPlayer").getComponent(cc.VideoPlayer);
    }

    onClick1() {
        // let url = "https://stage.cdn.lingoace.com/english/20210803/W5_3_conversation.mp4";
        // console.log("onClick1");

        // this.node.parent.getChildByName('bg').active = false;
        // VideoInterface.playVideo(url);

        if (!cc.sys.isNative) {
            return
        }
        let url = 'http://staticv2.longxi.shop/dev/test/test.zip';
        let genPath = jsb.fileUtils.getWritablePath() + "ChineseAi/"
        if (!jsb.fileUtils.isDirectoryExist(genPath)) {
            jsb.fileUtils.createDirectory(genPath)
        }
        if (!jsb.fileUtils.isDirectoryExist(genPath + "assets/")) {
            jsb.fileUtils.createDirectory(genPath + "assets/")
        }

        jsb.fileUtils.addSearchPath(genPath, true);

        console.log(" ===>>>>jsb.fileUtils.getSearchPaths(): ", JSON.stringify(jsb.fileUtils.getSearchPaths()));

        let path = jsb.fileUtils.getWritablePath() + "ChineseAi/assets/test.zip";
        // Downloader.Instance().download(url, path, 1, 1, (succ) => {
        //     cc.log(" ===succ: ", succ)
        // });
    }

    onClick2() {
        console.log("onClick2");
        // VideoInterface.pauseVideo();
        if (!cc.sys.isNative) {
            return
        }
        let path = jsb.fileUtils.getWritablePath() + "ChineseAi/assets/test.zip";
        // let manager = new jsb.AssetsManager();
        // manager.decompressZipAsync(path, (status: boolean, zipPath: string) => {
        //     cc.log(`status: ${status}  zipPath:${zipPath}`)
        //     let genPath = jsb.fileUtils.getWritablePath() + "ChineseAi/"
        //     var searchPaths: string[] = jsb.fileUtils.getSearchPaths();
        //     searchPaths.unshift(genPath);
        //     jsb.fileUtils.setSearchPaths(searchPaths);
        //     ResourcesManager.instance.loadRes("test", "test", ResourceType.Normal, cc.Prefab, (error: Error, scene: cc.Prefab)=>{
        //         let node = cc.instantiate(scene);
        //         node.parent = this.node;
        //     })
        // })
    }

    onClick3() {
        console.log("onClick3");
        // VideoInterface.resumeVideo();
        let image = "http://staticv2.longxi.shop/dev/test/image/xing.png";
        let ske = "http://staticv2.longxi.shop/dev/test/image/xing.json";
        let atlas = "http://staticv2.longxi.shop/dev/test/image/xing.atlas";
        // let arr = image.split('/');
        // cc.assetManager.loadAny([{ url: atlas, ext: '.atlas' }, { url: ske, ext: '.json' }], (error, assets) => {
        //     cc.assetManager.loadRemote(image, { ext: '.png' }, (error, imgAsset) => {
        //         let texture = new cc.Texture2D();
        //         texture.image = imgAsset;
        //         let asset = new sp.SkeletonData();
        //         asset.skeletonJson = assets[1];
        //         asset.atlasText = assets[0];
        //         asset.textures = [texture];
        //         this.spine.skeletonData = asset;
        //         cc.log(`down load succ`)
        //         this.spine.setAnimation(0, 'xing', true);
        //     });
        // });

        cc.assetManager.loadRemote(image, (error, texture:cc.Texture2D) => {
            cc.assetManager.loadAny({ url: atlas, type: 'txt' }, (error, atlasJson) => {
                cc.assetManager.loadAny({ url: ske, type: 'txt' }, (error, spineJson) => {
                    var asset = new sp.SkeletonData();
                    asset._uuid = ske;
                    asset.skeletonJson = spineJson;
                    asset.atlasText = atlasJson;
                    asset.textures = [texture];
                    asset.textureNames = ['xing.png'];
                    this.spine.skeletonData = asset;
                    this.spine.animation = 'xing';
                    this.spine._updateSkeletonData();
                });
            });
        });
    }

    onClick4() {
        let url = "https://cdn.lingoace.com/english/20210812/W5L4_video.mp4";
        console.log("onClick4");
        VideoInterface.playVideo(url);
    }

    onClick5() {
        this.node.parent.getChildByName('bg_img').active = false;
        this.videoPlayer.play();
    }
}
