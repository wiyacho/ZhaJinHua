// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Events from "../../kit/events/events";
import { kit } from "../../kit/kit";
import ModelManager from "../../kit/model/ModelManager";
import EventSystem from "../../kit/system/event/EventSystem";
import { HOSTURL } from "../config/config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HotUpdate extends cc.Component {
    // @property(cc.Asset)
    // manifestUrl: cc.Asset = null
    @property(cc.Label)
    desc: cc.Label = null
    @property(cc.Label)
    byteLabel: cc.Label = null
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null
    // @property(cc.ProgressBar)
    // fileBar: cc.ProgressBar = null

    @property(cc.Label)
    title: cc.Label = null

    @property(cc.Label)
    content: cc.Label = null

    @property({ type: cc.Node, displayName: 'tip' })
    tip: cc.Node = null

    testByOSS = false

    @property({ type: [cc.AudioClip], displayName: "音频" })
    sounds: cc.AudioClip[] = []

    private storagePath: string = '' //存储目录
    private am: jsb.AssetsManager = null
    private updating = false
    private canRetry = false
    private checkListener = null
    private updateListener = null
    private versionCompareHandle = null
    private customManifestStr = '' //TODO
    skip: cc.Node;
    enter: cc.Node;
    loading: sp.Skeleton;
    loadingNode: cc.Node;
    sp_login: sp.Skeleton;
    button: sp.Skeleton;
    sp_logo: sp.Skeleton;
    frame: cc.Node;
    sp_logo_node: cc.Node;
    sp_login_node: cc.Node;
    res_ver: cc.Label;
    loadingMask: cc.Node;
    codeTranslate(code) {
        let ret = ''
        switch (code) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST: {
                ret = '未找到本地资源版本文件'//"No local manifest file found, hot update skipped.";
            }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST: {
                ret = '下载manifest失败'
            }
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST: {
                ret = '下载版本文件失败'//"Fail to download manifest file, hot update skipped.";
            }
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE: {
                ret = '资源为最新版本'//"Already up to date with the latest remote version.";
            }
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND: {
                ret = '发现新资源'//'New version found, please try to update.';
            }
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION: {
                ret = '更新进度更新'
            }
                break
            case jsb.EventAssetsManager.ASSET_UPDATED: {
                ret = '资源更新完毕'
            }
                break
            case jsb.EventAssetsManager.ERROR_UPDATING: {
                ret = '更新错误'
            }
                break
            case jsb.EventAssetsManager.UPDATE_FINISHED: {
                ret = '更新完成'
            }
                break
            case jsb.EventAssetsManager.UPDATE_FAILED: {
                ret = '更新失败'
            }
                break
            case jsb.EventAssetsManager.ERROR_DECOMPRESS: {
                ret = '解压失败'
            }
                break
        }
        return ret
    }

    // LIFE-CYCLE CALLBACKS:
    /**
     * 检查状态
     * @param event 
     */
    checkCb(event) {
        console.log('[hotfix] Code: ' + event.getEventCode() + '' + this.codeTranslate(event.getEventCode()));
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST: {
                this.desc.string = '未找到本地资源版本文件'//"No local manifest file found, hot update skipped.";
            }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST: {
                this.desc.string = '下载版本文件失败'//"Fail to download manifest file, hot update skipped.";
            }
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE: {
                this.desc.string = '资源为最新版本'//"Already up to date with the latest remote version.";
            }
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND: {
                this.desc.string = '发现新资源'//'New version found, please try to update.';
                // this.checkBtn.active = false;
                this.progressBar.progress = 0;
                let bytes = this.am.getDownloadedBytes()
                let mstr = ''
                if (bytes < 1024) {
                    mstr = bytes + 'Bytes'
                } else if (bytes >= 1024 && bytes < 1024 * 1024) {
                    mstr = Math.floor(bytes / 1024) + 'K'
                } else {
                    mstr = Math.floor(bytes / 1024 / 1024) + 'M'
                }
                // UIManager.getInstance().confirm('发现新资源，是否现在更新?', (b) => {
                //     if (b) {
                // this.hotUpdate()
                //     } else {
                //         cc.game.end()
                //     }
                // }, '确定', '取消')
            }
                break;
            default:
                return;
        }

        this.am.setEventCallback(null);
        this.checkListener = null;
        this.updating = false;
        if (event.getEventCode() == jsb.EventAssetsManager.NEW_VERSION_FOUND) {
            this.hotUpdate()
        }
    }


    retryType = 0 // 0 net 1 download
    retryTypeNet = 0
    retryTypeDownload = 1

    showTip(type) {
        this.retryType = type
        this.title.string = 'Data Download Failed'
        this.content.string = 'Please check if your phone is connected to the internet'
        this.tip.active = true
    }

    onOK() {
        this.tip.active = false
        if (this.retryType == this.retryTypeNet) {
            this.needRetry = true
        } else {
            this.retry()
        }
    }

    /**
     * 更新回调
     * @param event 
     */
    updateCb(event) {
        console.log('[hotfix] Code: ' + event.getEventCode() + '' + this.codeTranslate(event.getEventCode()));
        let needRestart = false;
        let failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.desc.string = '未找到本地资源版本文件'//'No local manifest file found, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this.progressBar.progress = event.getPercent();
                // this.fileBar.progress = event.getPercentByFile();

                this.desc.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                let per = Math.ceil(this.progressBar.progress * 100)
                this.byteLabel.string = `%${per}`

                let msg = event.getMessage();
                if (msg) {
                    this.desc.string = 'Updated file: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.desc.string = '下载版本文件失败'//'Fail to download manifest file, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.desc.string = '资源为最新版本'//'Already up to date with the latest remote version.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.desc.string = '资源更新完成. ' + event.getMessage();//'Update finished. ' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.desc.string = '资源更新不成功. ' + event.getMessage();//'Update failed. ' + event.getMessage();
                // this.retryBtn.active = true;
                this.updating = false;
                this.canRetry = true;
                this.showTip(this.retryTypeDownload)
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.desc.string = '资源错误: ' + event.getAssetId() + ', ' + event.getMessage();//'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.desc.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this.am.setEventCallback(null);
            this.updateListener = null;
            this.updating = false;
        }

        if (needRestart) {
            this.am.setEventCallback(null);
            this.updateListener = null;
            // Prepend the manifest's search path
            let searchPaths = jsb.fileUtils.getSearchPaths();
            // let newPaths = this.am.getLocalManifest().getSearchPaths();
            // console.log('[hotfix] newPaths' + JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, [this.storagePath]);
            searchPaths = HotUpdate.sortSearchPath(searchPaths)
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();

            setTimeout(() => {
                AppHelper.setRestart(true)
                cc.game.restart();
            }, 1000)
        }
    }

    loadCustomManifest() {
        if (this.am.getState() === jsb.AssetsManager.State.UNINITED) {
            var manifest = new jsb.Manifest(this.customManifestStr, this.storagePath);
            this.am.loadLocalManifest(manifest, this.storagePath);
            this.desc.string = 'Using custom manifest';
        }
    }

    retry() {
        if (!this.updating && this.canRetry) {
            // this.retryBtn.active = false;
            this.canRetry = false;

            this.desc.string = 'Retry failed Assets...';
            this.am.downloadFailedAssets();
        }
    }

    getManifestUrl(): string {
        let url: string = 'project.manifest'
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            url = 'project-android.manifest'
        } else {
            url = 'project.manifest'
        }
        return url
    }

    checkUpdate() {
        if (this.updating) {
            this.desc.string = 'Checking or updating ...';
            return;
        }
        // if (this.am.getState() === jsb.AssetsManager.State.UNINITED) {
        //     // Resolve md5 url
        //     // var url = this.manifestUrl.nativeUrl;

        //     // if (cc.loader.md5Pipe) {
        //     //     url = cc.loader.md5Pipe.transformURL(url);
        //     // }
        //     // var url = this.getManifestUrl();
        //     // this.am.loadLocalManifest(url);
        // }
        if (!this.am.getLocalManifest() || !this.am.getLocalManifest().isLoaded()) {
            this.desc.string = 'Failed to load local manifest ...';
            return;
        }
        this.am.setEventCallback(this.checkCb.bind(this));

        this.am.checkUpdate();
        this.updating = true;
    }

    hotUpdate() {
        if (this.am && !this.updating) {
            this.loadingNode.active = false
            this.progressBar.node.active = true
            this.am.setEventCallback(this.updateCb.bind(this));
            console.log('[hotfix] hotUpdate>>>>>>>>>>>')
            // if (this.am.getState() === jsb.AssetsManager.State.UNINITED) {
            //     console.log('hotUpdate>>>>>>>>>>>3')
            //     // Resolve md5 url
            //     // var url = this.manifestUrl.nativeUrl;
            //     // if (cc.loader.md5Pipe) {
            //     //     url = cc.loader.md5Pipe.transformURL(url);
            //     // }
            //     var url = this.getManifestUrl();
            //     this.am.loadLocalManifest(url);
            // }

            // this.failCount = 0;
            this.am.update();
            // this.updateBtn.active = false;
            this.updating = true;
        }
    }

    show() {
        // if (this.updateUI.active === false) {
        //     this.updateUI.active = true;
        // }
        this.checkUpdate()
    }

    fixBg() {
        let frameSize: cc.Size = cc.view.getFrameSize() // 屏幕尺寸
        let designResolution: cc.Size = cc.Canvas.instance.designResolution
        let designSize: cc.Size = cc.size(designResolution.width, designResolution.height)  // cc.Canvas.instance.designResolution
        let frameAspectRatio: number = frameSize.width / frameSize.height
        let screenSize: cc.Size = { ...designSize } as cc.Size

        //login
        let imageSize = cc.size(1624, 750)
        let ratio: number = imageSize.width / imageSize.height
        if (ratio > frameAspectRatio) {
            let width = imageSize.width * screenSize.height / imageSize.height
            let scale = width / imageSize.width
            this.sp_login_node.scale = scale
        } else {
            let height = imageSize.height * screenSize.width / imageSize.width
            let scale = height / imageSize.height
            this.sp_login_node.scale = scale
        }
        //logo
        imageSize = cc.size(1334, 1000.5)
        ratio = imageSize.width / imageSize.height
        if (ratio > frameAspectRatio) {
            let width = imageSize.width * screenSize.height / imageSize.height
            let scale = width / imageSize.width
            this.sp_logo_node.scale = scale
        } else {
            let height = imageSize.height * screenSize.width / imageSize.width
            let scale = height / imageSize.height
            this.sp_logo_node.scale = scale
        }
        // let widget = this.loadingNode.getComponent(cc.Widget)
        // widget.verticalCenter *= this.sp_logo_node.scale
    }

    private snd_in = 0
    private snd_logo = 0
    onLogoFinished() {
        this.scheduleOnce(() => {
            this.sp_logo_node.active = false
            this.sp_login_node.active = true
            this.res_ver.node.active = true
            this.sp_login.setAnimation(0, 'in', false)
            this.snd_in = cc.audioEngine.playEffect(this.sounds[1], false)
        }, 1)
    }

    onLoginSpineFinished() {
        if (this.sp_login.animation == 'in') {
            this.sp_login.setAnimation(0, 'idle', true)
            this.loadingNode.active = true
            this.scheduleOnce(() => {
                if (cc.sys.isNative) {
                    this.startCheckVersion()
                } else {
                    this.scheduleOnce(() => {
                        EventSystem.emit(Events.HOTFIX_OK, { result: true, code: 8 })
                    }, 1)
                }
            }, 3)
        }
    }

    startCheckVersion() {
        // this.checkUpdate()
        //加载本地manifest
        // var url = this.getManifestUrl();
        // this.am.loadLocalManifest(url);
        let localManifest = this.am.getLocalManifest()
        //设置ModelManager.instance.hotVer（header中使用）
        ModelManager.instance.hotVer = localManifest.getVersion()
        console.log('[hotfix] curr res version:' + ModelManager.instance.hotVer)
        let hosturl = HOSTURL + '/cnapi/v/init'
        if (this.testByOSS) {
            hosturl = 'https://math-thinking.oss-cn-beijing.aliyuncs.com/qt/tools/book/hotfix/ver.txt'
        }
        console.log('[hotfix] hosturl >>>>>>> :' + hosturl)
        this.post(hosturl, null, null, (error) => {
            this.scheduleOnce(() => {
                this.showTip(this.retryTypeNet)
            }, 1.5)
        }, null)
    }

    private needRetry = false
    update() {
        if (this.progressBar.node.active) {
            this.loadingMask.width = 402 * this.progressBar.progress
        }
        if (this.needRetry) {
            this.needRetry = false
            console.log('[hotfix] 重试请求版本号')
            this.startCheckVersion()
        }
    }

    onPost(msg) {
        if (!msg.data) {
            console.log('[hotfix] stringify msg:' + JSON.stringify(msg))
            this.showTip(this.retryTypeNet)
            return
        }
        console.log('[hotfix] stringify msg:' + JSON.stringify(msg))
        if (msg.data.hotLatestVersion == undefined || msg.data.hotLatestVersion == null) {
            EventSystem.emit(Events.HOTFIX_OK, { result: true, code: 8 })
        } else {
            ModelManager.instance.hotLatestVersion = msg.data.hotLatestVersion
            ModelManager.instance.hotUpdatePath = msg.data.hotUpdatePath
            console.log('[hotfix] remote hotupdate version:' + ModelManager.instance.hotLatestVersion)
            console.log('[hotfix] remote hotupdate url:' + ModelManager.instance.hotUpdatePath)
            let localManifest = this.am.getLocalManifest()
            localManifest.setManifestFileUrl(ModelManager.instance.hotUpdatePath + '/project.manifest')
            localManifest.setVersionFileUrl(ModelManager.instance.hotUpdatePath + '/version.manifest')
            localManifest.setPackageUrl(ModelManager.instance.hotUpdatePath)
            if (ModelManager.instance.hotVer != ModelManager.instance.hotLatestVersion) {
                // this.am.setEventCallback(null);
                // this.checkListener = null;
                // this.updating = false;
                // this.am.setState(jsb.AssetsManager.State.PREDOWNLOAD_MANIFEST)
                // this.hotUpdate()
                this.checkUpdate()
            } else {
                EventSystem.emit(Events.HOTFIX_OK, { result: true, code: 8 })
            }
        }
    }

    debug = false
    // use this for initialization
    onLoad() {
        this.frame = cc.find('frame', this.node)
        this.skip = cc.find('skip', this.frame)
        this.skip.active = false
        this.progressBar.node.active = false
        this.desc.node.active = this.debug

        this.sp_login_node = cc.find('sp_login_node', this.frame)
        this.sp_login = cc.find('sp_login', this.sp_login_node).getComponent(sp.Skeleton)
        this.sp_logo_node = cc.find('sp_logo_node', this.frame)
        this.sp_logo = cc.find('sp_logo', this.sp_logo_node).getComponent(sp.Skeleton)
        this.loadingNode = cc.find('loading', this.sp_login_node)
        this.loading = cc.find('loading', this.loadingNode).getComponent(sp.Skeleton)
        this.button = cc.find('button', this.frame).getComponent(sp.Skeleton)

        this.sp_login_node.active = false
        this.sp_logo_node.active = true
        this.button.node.active = false
        this.loadingNode.active = false

        this.loadingMask = cc.find('mask', this.progressBar.node)

        this.tip.active = false

        this.res_ver = cc.find('res_version', this.node).getComponent(cc.Label)
        this.res_ver.node.active = false

        this.sp_logo.setCompleteListener(() => {
            this.onLogoFinished()
        })

        this.sp_login.setCompleteListener(() => {
            this.onLoginSpineFinished()
        })

        this.res_ver.string = 'Rev. 1.0.0'
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            return;
        }

        this.scheduleOnce(() => kit.system.platform.adapter.onGameReady())
        this.storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'hotupdate');
        cc.log('Storage path for remote asset : ' + this.storagePath);

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this.versionCompareHandle = (versionA, versionB) => {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this.am = new jsb.AssetsManager('', this.storagePath, this.versionCompareHandle);
        // this.am = jsb.AssetsManager.create()

        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this.am.setVerifyCallback((path, asset: any) => {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                this.desc.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                this.desc.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        this.desc.string = 'Hot update is ready, please check or directly update.';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            // this.am.setMaxConcurrentTask(2);
            if (this.am['setMaxConcurrentTask']) {
                this.am['setMaxConcurrentTask'](2)
            }
            this.desc.string = "Max concurrent tasks count have been limited to 2";
        }

        this.progressBar.progress = 0;
        // this.fileBar.progress = 0;

        var url = this.getManifestUrl();
        this.am.loadLocalManifest(url);

        let localManifest = this.am.getLocalManifest()
        let ver = localManifest.getVersion()
        this.res_ver.string = 'Rev. ' + ver
        this.res_ver.node.active = false
        if (cc.sys.isNative) {
            // @ts-ignore
            jsb.Device.setKeepScreenOn(true);
        };

        if (AppHelper.isRestart()) { //热更后重启，不走更新流程，只是作为遮挡黑屏的UI
            AppHelper.setRestart(false)
            this.sp_login_node.active = true
            this.sp_logo_node.active = false
            this.res_ver.node.active = true
            this.sp_login.setAnimation(0, 'idle', true)
            EventSystem.emit(Events.HOTFIX_OK, { result: true, code: 8 })
        } else {
            this.sp_logo.setAnimation(0, 'kaiping2', false)
            this.snd_logo = cc.audioEngine.playEffect(this.sounds[0], false)
        }
    }

    start() {
        this.fixBg()
    }

    onDestroy() {
        if (this.updateListener) {
            this.am.setEventCallback(null);
            this.updateListener = null;
        }
        // if (this.snd_in != 0) {
        //     cc.audioEngine.stopEffect(this.snd_in)
        //     this.snd_in = 0
        // }
        // if (this.snd_logo != 0) {
        //     cc.audioEngine.stopEffect(this.snd_logo)
        //     this.snd_logo = 0
        // }
        cc.audioEngine.stopAllEffects()
    }

    onSkip() {

    }

    onLogin() {

    }

    static sortSearchPath(searchPaths) {
        let newArr = []
        for (let i = 0; i < searchPaths.length; i++) {
            const element = searchPaths[i];
            if (newArr.indexOf(element) == -1) {
                newArr.push(element)
            }
        }
        newArr.sort((a: string, b: string) => {
            if (a.indexOf('hotupdate') != -1 || a.indexOf('ChineseAi') != -1) {
                return -1
            }
            return 1
        })
        return newArr
    }

    post(url: string, data: string | FormData, callBack = null, errCall = null, otherData = null) {
        let headerList = null
        if (otherData) {
            headerList = otherData.headerList
        }
        let xhr = new XMLHttpRequest();
        if (this.testByOSS) {
            xhr.open("GET", url, true);
        } else {
            xhr.open("POST", url, true);
        }
        console.log('[hotfix] post ', url, data)

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        xhr.setRequestHeader("hotVer", ModelManager.instance.hotVer)

        let hadResponsed = false

        let _ = cc.tween(this.node).delay(7).call(() => {
            if (!hadResponsed) {
                this.showTip(this.retryTypeNet)
            }
        }).start()

        let resFunc = () => {
            hadResponsed = true
            cc.Tween.stopAllByTarget(this.node)
        }
        // xhr["data"] = { "successCallBack": callBack, "errorCallBack": errCall }
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                resFunc()
                var response = xhr.responseText;
                cc.log("response", response);
                // if (callBack) {
                // callBack(JSON.parse(response))
                // }
                this.onPost(JSON.parse(response))
            } else {
                resFunc()
                if (errCall) {
                    errCall();
                }
            }
        }

        xhr.onerror = (event) => {
            console.log("[hotfix] xhr error", event)
            resFunc()
            if (errCall) {
                errCall(event)
            }
        }

        xhr.ontimeout = (event) => {
            resFunc()
            console.log("[hotfix] xhr ontimeout", event)
            if (errCall) {
                errCall(event)
            }
        }

        xhr.send(data);
    }

}
