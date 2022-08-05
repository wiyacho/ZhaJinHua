import { ChapterVo_V2 } from './../structure/lessonVoV2';
import { kit } from "../../kit/kit";
import LessonManagerV2 from "./LessonManagerV2";
import { Downloader } from '../utils/Downloader';
import AppUtils from '../utils/AppUtils';
import { CHAPTER_TYPE_V2 } from '../config/enum';
import Spot from '../config/spot';
import HotUpdate from '../utils/HotUpdate';

const DOWNLOAD_MANAGER_SAVE_KEY = 'DOWNLOAD_MANAGER_SAVE_KEY';

export class DownLoadManager {
    private static _instance: DownLoadManager;
    private _downLoadData: {};
    private _curDownLoadList: DownLoadVo[];
    public static get instance(): DownLoadManager {
        if (!DownLoadManager._instance) {
            DownLoadManager._instance = new DownLoadManager();
        }
        return DownLoadManager._instance;
    }

    constructor() {
        this._curDownLoadList = [];
    }

    initDownLoadInfo() {
        if (!cc.sys.isNative) return;
        this.checkDir();
        let chapterList = LessonManagerV2.instance.totalChapterData;
        let saveData = kit.util.LocalStorage.getObject(DOWNLOAD_MANAGER_SAVE_KEY) || {};
        this._downLoadData = saveData;
        this._curDownLoadList = [];
        // cc.log('=====init saveData: ', saveData)
        // cc.log('=====init chapterList: ', chapterList)
        chapterList.forEach((val: ChapterVo_V2) => {
            if (val.type < CHAPTER_TYPE_V2.report && val.type != CHAPTER_TYPE_V2.video) {
                let downLoadInfo: DownLoadVo = {
                    id: val.lessonChapterId,
                    lessonId: val.lessonId,
                    chapterId: val.chapterId,
                    zipUrl: val.storyUrl,
                    fileName: val.fileName,
                    lessonName: val.lessonName,
                    chapterName: val.chapterName,
                    downLoaded: DownLoadState.nostart,
                }

                if (saveData && saveData[val.lessonChapterId] && val.storyUrl == saveData[val.lessonChapterId]) {
                    downLoadInfo.downLoaded = DownLoadState.complete;
                } else {
                    let index = this._curDownLoadList.findIndex((info) => {
                        return info.zipUrl == downLoadInfo.zipUrl
                    });
                    if (index == -1) {
                        this._curDownLoadList.push(downLoadInfo);
                    }
                }
            }
        });
        // cc.log('=====init this._curDownLoadList: ', this._curDownLoadList)
        // 开始下载
        // this.startDownload();
    }

    /**
     * 检查章节zip是否下载成功
     * @param id  lessonChapterId
     * @param succFunc 下载成功回调 
     * @param progressFunc 下载中回调
     * @returns 
     */
    public checkDownLoaded(id: number, succFunc: (suc: boolean) => void, progressFunc: (percent: number) => void): boolean {
        let downLoadInfo = this._curDownLoadList.find(info => info.id == id);
        // cc.log(" ======downLoadInfo: ", downLoadInfo)
        // if (downLoadInfo && downLoadInfo.downLoaded == DownLoadState.downloading) {  //需要下载并且未下载
        //     downLoadInfo.succFunc = succFunc;
        //     downLoadInfo.progressFunc = progressFunc;
        //     return true;
        // } else {
        //     succFunc(true);
        //     return false;
        // }

        if (downLoadInfo && downLoadInfo.downLoaded == DownLoadState.nostart) {  //需要下载并且未下载
            downLoadInfo.succFunc = succFunc;
            downLoadInfo.progressFunc = progressFunc;
            this.startDownLoadByInfo(downLoadInfo);
            return true;
        } else {
            succFunc(true);
            return false;
        }
    }

    public startDownload() {
        this.checkDir();
        this._curDownLoadList.forEach((info: DownLoadVo) => {
            if (info.downLoaded == DownLoadState.nostart) {
                // cc.log(" ===start downLoad: ", info)
                info.downLoaded = DownLoadState.downloading;
                let url = info.zipUrl;
                let arr = url.split('/');
                let zipName = arr[arr.length - 1];
                let path = AppUtils.getAppWritablePath() + "assets/" + zipName;
                Downloader.Instance().download(url, path, 0, 1, (succ) => {
                    if (succ) {
                        this.downLoadSuccess(info.id, url, zipName);
                    } else {
                        this.downLoadFailed(info.id, url, zipName);
                    }
                }, (bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) => {
                    let percent = totalBytesReceived / totalBytesExpected;
                    this.downLoadProgress(info.id, url, percent);
                });
            }
        });
    }
    //TODO: 需求变更，每次课程开始下载zip
    private startDownLoadByInfo(info: DownLoadVo) {
        info.downLoaded = DownLoadState.downloading;
        let url = info.zipUrl;
        let arr = url.split('/');
        let zipName = arr[arr.length - 1];
        let path = AppUtils.getAppWritablePath() + "assets/" + zipName;
        Downloader.Instance().download(url, path, 0, 1, (succ) => {
            if (succ) {
                this.downLoadSuccess(info.id, url, zipName);
            } else {
                this.downLoadFailed(info.id, url, zipName);
            }
        }, (bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) => {
            let percent = totalBytesReceived / totalBytesExpected;
            this.downLoadProgress(info.id, url, percent);
        });
    }


    private async downLoadSuccess(id: number, zipUrl: string, zipName: string) {
        this._downLoadData[id] = zipUrl;
        let downLoadInfo = this._curDownLoadList.find(info => info.id == id);
        // cc.log(` === download succ id: ${id}  zipUrl: ${zipUrl}  zipName:${zipName}`);
        // await this.decompressZip(zipName, downLoadInfo.fileName);
        downLoadInfo.downLoaded = DownLoadState.complete;
        downLoadInfo.succFunc && downLoadInfo.succFunc(true);
        this.save();

        kit.system.spot.send(Spot.AELC_Download, {
            CourseID: downLoadInfo.lessonId,
            ModuleID: downLoadInfo.chapterId,
            "Download success": 1,
            CoursenName: downLoadInfo.lessonName,
            ModuleName: downLoadInfo.chapterName
        });

        // cc.log(" ====this._curDownLoadList： ", this._curDownLoadList)
    }

    private downLoadProgress(id: number, zipUrl: string, percent: number) {
        // cc.log(` === id: ${id}  zipUrl: ${zipUrl}  percent:${percent}`);
        let downLoadInfo = this._curDownLoadList.find(info => info.id == id);
        downLoadInfo.progressFunc && downLoadInfo.progressFunc(percent);

    }

    private downLoadFailed(id: number, zipUrl: string, zipName: string) {
        cc.log(`${zipName} download failed! url: ${zipUrl}`)
        let downLoadInfo = this._curDownLoadList.find(info => info.id == id);
        downLoadInfo.downLoaded = DownLoadState.nostart;
        // 下载失败不回调业务
        downLoadInfo.succFunc && downLoadInfo.succFunc(false);
        kit.system.spot.send(Spot.AELC_Download, {
            CourseID: downLoadInfo.lessonId,
            ModuleID: downLoadInfo.chapterId,
            "Download success": 2,
            CoursenName: downLoadInfo.lessonName,
            ModuleName: downLoadInfo.chapterName
        });

    }


    public decompressZip(id: number) {
        return new Promise<void>((resolve, reject) => {
            let chapterList = LessonManagerV2.instance.totalChapterData;
            let chapterInfo = chapterList.find(data => data.lessonChapterId == id);
            let manager = new jsb.AssetsManager();
            let url = chapterInfo.storyUrl;
            let arr = url.split('/');
            let zipName = arr[arr.length - 1];
            let bundleName = chapterInfo.fileName;
            let path = AppUtils.getAppWritablePath() + "assets/" + zipName;
            if (jsb.fileUtils.isFileExist(path)) {
                // jsb.fileUtils.removeDirectory(AppUtils.getAppWritablePath() + "assets/" + bundleName);
                manager.decompressZipAsync(path, (status: boolean, zipPath: string) => {
                    cc.log(`decompress status: ${status}  zipPath:${zipPath}  zipName:${bundleName}  `)
                    jsb.fileUtils.removeFile(path);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    private checkDir() {
        let genPath = jsb.fileUtils.getWritablePath() + "ChineseAi/"
        if (!jsb.fileUtils.isDirectoryExist(genPath)) {
            jsb.fileUtils.createDirectory(genPath)
        }
        if (!jsb.fileUtils.isDirectoryExist(genPath + "assets/")) {
            jsb.fileUtils.createDirectory(genPath + "assets/")
        }

        var searchPaths: string[] = jsb.fileUtils.getSearchPaths();
        searchPaths.unshift(genPath);
        searchPaths = HotUpdate.sortSearchPath(searchPaths);
        jsb.fileUtils.setSearchPaths(searchPaths);
    }

    save() {
        // cc.log(" ====>>>>>this._downLoadData: ", this._downLoadData)
        kit.util.LocalStorage.setObject(DOWNLOAD_MANAGER_SAVE_KEY, this._downLoadData);
    }

}

interface DownLoadVo {
    id: number; // 
    lessonId: number; //
    chapterId: number; //
    zipUrl: string;
    fileName: string;
    lessonName: string;
    chapterName: string;
    downLoaded: DownLoadState;
    succFunc?: (succ) => void;
    progressFunc?: (percent: number) => void;
}

interface DownLoadFuncVo {
    id: number; // 
    succFunc?: (succ) => void;
    progressFunc?: (percent: number) => void;
}

enum DownLoadState {
    nostart = 0,   //未开始
    downloading,    //下载中
    complete        //已完成
}
