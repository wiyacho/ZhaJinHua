import ResLoader from "../framework/load/ResLoader";
import { kit } from "../kit";
import LogSystem from "../system/log/LogSystem";

/** 音频类型枚举 */
export enum MusicType {
    SOUND,  // 音效
    MUSIC,  // 音乐
    LOOP_SOUND     // 循环音效
}

/** 音频工具类 */
export default class AudioUtil {
    /** 背景音乐缓存池 */
    private static _musicPool: Map<string, __AudioSource> = new Map<string, __AudioSource>();
    /** 音效缓存池 */
    private static _soundPool: Map<string, __AudioSource[]> = new Map<string, __AudioSource[]>();
    /** 循环音效 */
    private static _loopSoundPool: Map<string, __AudioSource> = new Map<string, __AudioSource>();
    /** 当前背景音乐 */
    private static _curMusic: __AudioSource;
    /** 当前音效 */
    private static _curSound: string = "";
    /** 上次播放音效时间 */
    private static _lastSoundTime: number = 0;
    /** 是否暂停所有音效 */
    private static _pauseFlag: boolean = false;
    /** 当前音频状态级别，数字越大越高 配合_pauseFlag判断 */
    private static _level: number = 0;

    private static getFixedPath(bundleName: string | cc.AssetManager.Bundle, path: string) {
        let cachePath = '';
        if (bundleName instanceof cc.AssetManager.Bundle) {
            cachePath = bundleName.name
        } else {
            cachePath = bundleName
        }
        return `${cachePath}/${path}`
    }
    /**
     * 播放音效
     * @param {string} path 音效资源
     */
    public static playEffect(bundleName: string | cc.AssetManager.Bundle, path: string, finishCb?: () => void): void {
        if (AudioUtil._pauseFlag) { return; }
        let curTime = new Date().getTime();
        if (path === AudioUtil._curSound) {
            let tempTime = curTime - AudioUtil._lastSoundTime;
            if (tempTime < 50) {
                return;
            }
        }
        AudioUtil._curSound = path;
        AudioUtil._lastSoundTime = curTime;
        let fixedPath = AudioUtil.getFixedPath(bundleName, path);
        let source = AudioUtil.getEffectFromPool(fixedPath);
        if (source) {
            source.play(false, finishCb);
        } else {
            source = new __AudioSource(bundleName, path, MusicType.SOUND);
            AudioUtil.addEffectToPool(fixedPath, source);
            source.play(false, finishCb);
        }
    }

    /** 暂停音效 */
    public static stopEffect(): void {
        AudioUtil._soundPool.forEach((value: __AudioSource[], key: string, map) => {
            if (value) {
                for (let source of value) {
                    source.stop();
                }
            }
        });
    }

    /** 播放循环音效 */
    public static playLoopEffect(bundleName: string | cc.AssetManager.Bundle, path: string): void {
        if (AudioUtil._pauseFlag) { return; }
        let fixedPath = AudioUtil.getFixedPath(bundleName, path); 
        let source = AudioUtil._loopSoundPool.get(fixedPath);
        if (!source) {
            source = new __AudioSource(bundleName, path, MusicType.LOOP_SOUND);
            AudioUtil._loopSoundPool.set(fixedPath, source);
        }
        source.play(true);
    }

    /** 暂停循环音效 */
    public static stopLoopEffect(bundleName: string | cc.AssetManager.Bundle, path: string): void {
        let fixedPath = AudioUtil.getFixedPath(bundleName, path); 
        let source = AudioUtil._loopSoundPool.get(fixedPath);
        if (source) {
            source.stop()
        }
    }

    /**
     * 播放音效
     * @param {string} path 播放背景音乐
     */
    public static playMusic(bundleName: string | cc.AssetManager.Bundle, path: string): void {
        if (AudioUtil._pauseFlag) { return; }
        if (AudioUtil._curMusic) {
            AudioUtil._curMusic.stop();
        }
        let fixedPath = AudioUtil.getFixedPath(bundleName, path);
        let source = AudioUtil._musicPool.get(fixedPath);
        if (source) {
            source.play(true);
        } else {
            source = new __AudioSource(bundleName, path, MusicType.MUSIC);
            AudioUtil._musicPool.set(fixedPath, source);
            source.play(true);
        }
        AudioUtil._curMusic = source;
    }

    /** 暂停音效 */
    public static stopMusic(): void {
        if (AudioUtil._curMusic) {
            AudioUtil._curMusic.stop();
        }
    }

    public static passMusic(): void {
        if (AudioUtil._curMusic) {
            AudioUtil._curMusic.pause();
        }
    }

    public static resumeMusic(): void {
        if (AudioUtil._curMusic) {
            AudioUtil._curMusic.resume();
        }
    }

    /** 从音效对象池获取对象 */
    public static getEffectFromPool(path: string): __AudioSource {
        let list = AudioUtil._soundPool.get(path);
        if (list) {
            for (let source of list) {
                if (!source.isPlaying()) {
                    return source;
                }
            }
        }
        return null;
    }

    /** 像音效对象池添加对象 */
    public static addEffectToPool(path: string, source: __AudioSource): void {
        let list = AudioUtil._soundPool.get(path);
        if (list) {
            list.push(source);
        } else {
            list = [];
            list.push(source);
            AudioUtil._soundPool.set(path, list);
        }
    }

    /**
     * 设置暂停所有音效标志
     * @param {boolean} flag 标志 true-暂停  false-恢复
     * @param {number} level 设置状态级别，数字越大级别越高，高级别逻辑覆盖低级别，低级别不能覆盖高级别。
     */
    public static setPauseFlag(flag: boolean, level: number = 0): void {
        AudioUtil._level = level;
        AudioUtil._pauseFlag = flag;
        if (flag) {
            if (AudioUtil._curMusic) { AudioUtil._curMusic.pause(); }
            AudioUtil.pauseLoopEffects();
        } else {
            if (AudioUtil._curMusic) { AudioUtil._curMusic.resume(); }
            AudioUtil.resumeLoopEffects();
        }
    }

    /** 暂停所有循环音效 */
    public static pauseLoopEffects(): void {
        AudioUtil._loopSoundPool.forEach((v: __AudioSource, key: string) => {
            v.pause();
        });
    }

    /** 恢复所有循环音效 */
    public static resumeLoopEffects(): void {
        AudioUtil._loopSoundPool.forEach((v: __AudioSource, key: string) => {
            v.resume();
        });
    }

    public static stopEffectByName(path: string) {
        let list = AudioUtil._soundPool.get(path)
        if (list) {
            list.forEach((value) => {
                value.stop()
            })
        }
    }

    /**
     * 新版播放音效
     * @param bundleName 
     * @param path 
     * @param isSingle 是否唯一
     * @param isLoop 是否循环
     * @returns 
     */
    static async playEffectByName(bundleName: string | cc.AssetManager.Bundle, path: string, isSingle: boolean = true, isLoop: boolean = false) {
        return new Promise<void>(resolve => {
            if (AudioUtil._pauseFlag) {
                resolve()
                return
            }

            let curTime = new Date().getTime()
            if (path === AudioUtil._curSound) {
                let tempTime = curTime - AudioUtil._lastSoundTime
                if (tempTime < 50) {
                    resolve()
                    return
                }
            }

            let fixedPath = AudioUtil.getFixedPath(bundleName, path)

            if (isSingle) {
                AudioUtil.stopEffectByName(fixedPath)
            }

            AudioUtil._curSound = path;
            AudioUtil._lastSoundTime = curTime;
            
            let source = null
            if (isLoop) {
                source = AudioUtil._loopSoundPool.get(fixedPath)
            } else {
                source = AudioUtil.getEffectFromPool(fixedPath)
            }

            if (source) {
                source.play(isLoop, () => {
                    resolve()
                })
            } else {
                source = new __AudioSource(bundleName, path, MusicType.SOUND)
                if (isLoop) {
                    AudioUtil._loopSoundPool.set(fixedPath, source)
                } else {
                    AudioUtil.addEffectToPool(fixedPath, source)
                }
                source.play(isLoop, () => {
                    resolve()
                })
            }
        })
    }

    static destroyAudio(bundleName: string, path: string) {
        let fixedPath = AudioUtil.getFixedPath(bundleName, path)
        if (AudioUtil._soundPool.has(fixedPath)) {
            AudioUtil.stopEffectByName(fixedPath)
            let list = AudioUtil._soundPool.get(fixedPath)
            list.forEach((element) => {
                element.destroy()
            })
            AudioUtil._soundPool.delete(fixedPath)
        }
        if (AudioUtil._musicPool.has(fixedPath)) {
            AudioUtil.stopMusic()
            let clip = AudioUtil._musicPool.get(fixedPath)
            clip.destroy()
            AudioUtil._musicPool.delete(fixedPath)
        }
        if (AudioUtil._loopSoundPool.has(fixedPath)) {
            AudioUtil.stopLoopEffect(bundleName, path)
            let clip = AudioUtil._loopSoundPool.get(fixedPath)
            clip.destroy()
            AudioUtil._loopSoundPool.delete(fixedPath)
        }
    }
}

class __AudioSource {
    // 是否加载完成
    private _loaded: boolean = false;
    // 音频资源
    private _audioSource: cc.AudioClip = null;
    // bundle名称
    private _bundleName: string | cc.AssetManager.Bundle;
    // 音频路径
    private _path: string = "";
    // 音频类型
    private _musicType: MusicType;
    // 是否已被暂停
    private _isStop: boolean;

    private state = {} as any

    public constructor(bundleName: string | cc.AssetManager.Bundle, path: string, type: MusicType) {
        this._bundleName = bundleName;
        this._path = path;
        this._musicType = type;
    }

    /**
     * 音频加载接口
     * @param {() => void} cb 加载完成回调
     */
    private loadRes(cb: () => void): void {
        if (!this._loaded) {
            ResLoader.loadRes(this._path, cc.AudioClip, (err: any, res: cc.AudioClip) => {
                if (err) {
                    LogSystem.warn(`音频资源加载出错:${this._path}`);
                } else {
                    this._audioSource = res;
                    this._loaded = true;
                    if (cb) { cb(); }
                }
            }, this._bundleName);
        }
    }

    public play(isLoop?: boolean, cb?: () => void): void {
        this._isStop = false;
        if (this._loaded) {
            this.stop();
            // this._audioSource.loop = isLoop;
            // this._audioSource.play();
            if (!isLoop) {
                isLoop = false
            }
            this.state.isLoop = isLoop;
            this.state.isPlaying = true;
            if (this._musicType == MusicType.MUSIC) {
                this.state.id = cc.audioEngine.playMusic(this._audioSource, isLoop);
            } else {
                this.state.id = cc.audioEngine.playEffect(this._audioSource, isLoop);
            }
            if (cb) {
                let duration = this._audioSource.duration;
                kit.system.timer.doOnce(duration * 1000, () => {
                    cb();
                }, this, null, false)
            }
        } else {
            this.loadRes(() => {
                if (!this._isStop) {
                    this.play(isLoop, cb);
                }
            });
        }
    }

    async playEffect(isLoop?: boolean) {
        return new Promise<void>(resolve => {
            this.play(isLoop, () => {
                resolve()
            })
        })
    }

    public isPlaying(): boolean {
        return this.state.isPlaying;
    }

    public stop(): void {
        this._isStop = true;
        if (this._loaded) {
            // this._audioSource.stop();
            if (this.state.id != null && this.state.id != undefined) {
                if (this._musicType == MusicType.MUSIC) {
                    cc.audioEngine.stopMusic();
                } else {
                    cc.audioEngine.stopEffect(this.state.id);
                }
            }
        }
    }

    public pause(): void {
        if (this._loaded) {
            // this._audioSource.pause();
            if (this.state.id) {
                if (this._musicType == MusicType.MUSIC) {
                    cc.audioEngine.pauseMusic();
                } else {
                    cc.audioEngine.pauseEffect(this.state.id);
                }
            }
        }
    }

    public resume(): void {
        if (this._loaded) {
            // this._audioSource.resume();
            if (this.state.id) {
                if (this._musicType == MusicType.MUSIC) {
                    cc.audioEngine.resumeMusic();
                } else {
                    cc.audioEngine.resumeEffect(this.state.id);
                }
            }
        }
    }

    public destroy(): void {
        this.stop();
        if (this._audioSource) {
            // console.log('release audio:' + this._audioSource.name)
            cc.assetManager.releaseAsset(this._audioSource)
            this._audioSource.destroy()
            this._audioSource = null;
        }
    }
}