
/***
 * 
 * 文件下载管理器
 */
type DownloaderEntity = {
    requestURL: string,
    storagePath: string,
    downloader: jsb.Downloader,
    retry: number,
    priority: number,
    progressCall: (bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) => void,
    callbacks: Array<(success: boolean) => void>
};

export class Downloader {
    /**
     * 正在处理下载的任务
     */
    private _downloadTasks: Map<string, DownloaderEntity> = new Map<string, DownloaderEntity>();
    /**
     * 等待下载的任务
     */
    private _waitDownloadTasks: Array<DownloaderEntity> = [];
    /**
     * 空闲可用的Loader
     */
    private _freeLoaders: Array<jsb.Downloader> = [];

    private static _instance: Downloader = null!;
    public static Instance() { return this._instance || (this._instance = new Downloader()); }
    /**
     * 并行下载数量
     * @param numOfParallel 
     */
    constructor(numOfParallel: number = 10) {
        if (typeof jsb === "undefined") {
            return;
        }
        let concurrentTask = 6
        let timeout = 45
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            concurrentTask = 2
            timeout = 90
        }
        let suffix = '.tmp'
        for (let i = 0; i < numOfParallel; i++) {
            let loader: jsb.Downloader = new jsb.Downloader({ countOfMaxProcessingTasks: concurrentTask, timeoutInSeconds: timeout, tempFileNameSuffix: suffix });
            this._freeLoaders.push(loader);
            loader.setOnFileTaskSuccess(this._taskSuccessHandler.bind(this));
            loader.setOnTaskProgress(this._taskProgressHandler.bind(this));
            loader.setOnTaskError(this._taskErrorHandler.bind(this))
        }
    }
    /**
     * 中断下载
     * @param keys 
     */
    public abort(keys: Array<string>) {
        let newstask: Array<DownloaderEntity> = [];
        for (let waitTask of this._waitDownloadTasks) {
            if (keys.indexOf(waitTask.storagePath) < 0) {
                newstask.push(waitTask);
            }
        }
        this._waitDownloadTasks = newstask;
    }

    /**
     * 下载一个文件
     * @param url  http下载地址
     * @param storagePath 本地文件保存路径
     * @param retry 下载失败重试次数
     * @param priority  下载优先级，默认为0，值越大下载优先级越高
     * @param callback 下载完成回调
     * @param progressCall 下载进度回调
     */
    public download(
        url: string,
        storagePath: string,
        retry: number,
        priority: number,
        callback: (success: boolean) => void = null,
        progressCall: (bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) => void = null) {
        if (typeof jsb === "undefined") {
            cc.log('only support jsb')
            return;
        }
        if (!url || !storagePath) {
            cc.error(`[ TS Downloader ] 参数错误，url和storagePath不能为空！`);
            return;
        }
        let loaderInfo = this._downloadTasks.get(storagePath);
        if (loaderInfo) {
            if (typeof callback === "function") {
                loaderInfo.callbacks = [];
                loaderInfo.callbacks.push(callback);
            }
            return;
        }
        for (let waitTask of this._waitDownloadTasks) {
            if (waitTask.storagePath === storagePath) {
                if (typeof callback === "function") {
                    loaderInfo.callbacks = [];
                    waitTask.callbacks.push(callback);
                }
                if (waitTask.priority < priority) {
                    waitTask.priority = priority;
                    this._waitDownloadTasks.sort((task1, task2) => {
                        return task2.priority - task1.priority;
                    });
                }
                return;
            }
        }
        let downloaderEntity: DownloaderEntity = {
            requestURL: url,
            storagePath: storagePath,
            downloader: null,
            progressCall: progressCall,
            callbacks: [callback],
            retry: retry,
            priority: priority || 0
        };
        this._waitDownloadTasks.push(downloaderEntity);

        // 使任务优先级高的任务提前下载（从大到小排序）
        this._waitDownloadTasks.sort((task1, task2) => {
            return task2.priority - task1.priority;
        });

        this.checkWaitTasks();
    }

    private checkWaitTasks() {
        if (!this._waitDownloadTasks || !this._freeLoaders) {
            return;
        }
        if (this._freeLoaders.length > 0 && this._waitDownloadTasks.length > 0) {
            let waitTask = this._waitDownloadTasks.shift();
            if (waitTask) {
                waitTask.downloader = this._freeLoaders.pop();
                if (jsb.fileUtils.isFileExist(waitTask.storagePath)) {
                    jsb.fileUtils.removeFile(waitTask.storagePath)
                }
                if (jsb.fileUtils.isFileExist(waitTask.storagePath + ".tmp")) {
                    jsb.fileUtils.removeFile(waitTask.storagePath + ".tmp")
                }
                let task = waitTask.downloader.createDownloadFileTask(waitTask.requestURL,
                    waitTask.storagePath, waitTask.storagePath);
                this._downloadTasks.set(task.identifier, waitTask);
                this.checkWaitTasks();
            }
        }
    }

    private _taskSuccessHandler(task: jsb.DownloaderTask) {
        cc.log(`[TS Downloader] 下载成功 ${task.storagePath}`);
        let loaderInfo = this._downloadTasks.get(task.identifier);
        if (!loaderInfo) {
            return;
        }
        let trueFinish = true;  // 流程是否下载成功
        if (!jsb.fileUtils.isFileExist(task.storagePath)) {
            cc.error(`[TS Downloader]下载成功但无法找到该文件 ${task.storagePath}`);
            trueFinish = false;
        }
        for (let cb of loaderInfo.callbacks) {
            if (typeof cb === 'function') {
                cb(trueFinish);
            }
        }
        loaderInfo.callbacks = null;
        // 回收downloader
        this._freeLoaders.push(loaderInfo.downloader);
        loaderInfo.downloader = null;
        this._downloadTasks.delete(task.identifier);
        this.checkWaitTasks();
    }

    private _taskProgressHandler(task: jsb.DownloaderTask, bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) {
        let loaderInfo = this._downloadTasks.get(task.identifier);
        if (!loaderInfo) {
            return;
        }
        loaderInfo.progressCall && typeof loaderInfo.progressCall === 'function' && loaderInfo.progressCall(bytesReceived, totalBytesReceived, totalBytesExpected);
        // cc.log(`bytesReceived: ${bytesReceived}  totalBytesReceived: ${totalBytesReceived}  totalBytesExpected:${totalBytesExpected}`)
    }
    private _taskErrorHandler(task: jsb.DownloaderTask, errorCode: number, errorCodeInternal: number, errorStr: string) {
        cc.log(`[TS Downloader] 下载失败 ${task.requestURL} errorCode=${errorCode} ${errorStr}`);
        if (!this._downloadTasks) {
            return;
        }
        if (!this._freeLoaders) {
            return;
        }
        let loaderInfo = this._downloadTasks.get(task.identifier);
        if (loaderInfo.retry > 0) {
            jsb.fileUtils.removeFile(task.storagePath);
            loaderInfo.retry = loaderInfo.retry - 1;
            cc.log(`[TS Downloader] 尝试重新下载 ${task.requestURL}`);
            loaderInfo.downloader.createDownloadFileTask(loaderInfo.requestURL, task.storagePath, loaderInfo.storagePath);
        } else {
            for (let cb of loaderInfo.callbacks) {
                if (typeof cb === 'function') {
                    cb(false);
                }
            }
            loaderInfo.callbacks = null;
            // 回收downloader
            this._freeLoaders.push(loaderInfo.downloader);
            loaderInfo.downloader = null;
            // 删除下载任务
            this._downloadTasks.delete(task.identifier);
            this.checkWaitTasks();
        }
    }

    destroy() {
        this._downloadTasks.clear();
        this._downloadTasks = null;
        this._waitDownloadTasks = null;
        this._freeLoaders = null;
    }
}