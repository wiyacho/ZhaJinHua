import AudioUtil from "../../utils/audioUtil";

/**
 * 音频播放类
 */
export default class AudioManager {

    /** 音乐音效状态缓存tag */
    public static EFFECT_TAG = "ChineseAi_EFFECT_TAG";
    public static MUSIC_TAG = "ChineseAi_MUSIC_TAG";

    /** 是否播放音效和音乐标志位 */
    private static _effectFlag: boolean = true;
    private static _musicFlag: boolean = true;

    private static _curMusic: string = "";
    private static _curBundle: string | cc.AssetManager.Bundle;

    public static init(): void {
        let effectSwitch = cc.sys.localStorage.getItem(AudioManager.EFFECT_TAG) === "false";
        let musicSwitch = cc.sys.localStorage.getItem(AudioManager.MUSIC_TAG) === "false";
        AudioManager._effectFlag = !effectSwitch;
        AudioManager._musicFlag = !musicSwitch;
        this.setEffectStatus(AudioManager._effectFlag);
        this.setMusicStatus(AudioManager._musicFlag);
    }

    /**
     * 播放音效
     * @param {string | cc.AssetManager.Bundle} bundleName
     * @param {string} name 音效资源
     * @param {function} finishCb
     */
    public static playEffect(bundleName: string | cc.AssetManager.Bundle, name: string, finishCb?: () => void): void {
        if (!bundleName || bundleName === '') {
            return;
        }
        if (AudioManager._effectFlag) {
            AudioUtil.playEffect(bundleName, name, finishCb);
        }
    }

    /**
     * 播放音效(async await)
     * @param bundleName 
     * @param name 
     * @param isSingle 
     * @param isLoop 
     * @returns 
     */
    public static async playEffectByName(bundleName: string | cc.AssetManager.Bundle, name: string, isSingle: boolean = true, isLoop: boolean = false) {
        if (!bundleName || bundleName === '') {
            return
        }
        if (AudioManager._effectFlag) {
            await AudioUtil.playEffectByName(bundleName, name, isSingle, isLoop)
        }
    }

    /** 暂停音效 */
    public static stopEffect(): void {
        AudioUtil.stopEffect();
    }

    static stopEffectByName(name: string) {
        AudioUtil.stopEffectByName(name)
    }

    static destroyAudio(bundleName: string, name: string) {
        AudioUtil.destroyAudio(bundleName, name)
    }

    /** 播放循环音效 */
    public static playLoopEffect(bundleName: string | cc.AssetManager.Bundle, name: string): void {
        if (AudioManager._effectFlag) {
            AudioUtil.playLoopEffect(bundleName, name);
        }
    }

    /** 暂停循环音效 */
    public static stopLoopEffect(bundleName, name: string): void {
        AudioUtil.stopLoopEffect(bundleName, name);
    }

    /** 暂停所有循环音效 */
    public static pauseLoopEffects(): void {
        AudioUtil.pauseLoopEffects();
    }

    /** 恢复所有循环音效 */
    public static resumeLoopEffects(): void {
        if (AudioManager._effectFlag) {
            AudioUtil.resumeLoopEffects();
        }
    }

    /**
     * 播放背景音乐
     * @param {string} name 播放背景音乐
     */
    public static playMusic(bundleName: string | cc.AssetManager.Bundle, name: string): void {
        if (!bundleName || bundleName === '') {
            return;
        }
        AudioManager._curMusic = name;
        AudioManager._curBundle = bundleName;
        if (AudioManager._musicFlag) {
            AudioUtil.playMusic(bundleName, name);
        }
    }

    /** 暂停背景音乐 */
    public static stopMusic(): void {
        AudioUtil.stopMusic();
    }

    public static passMusic() {
        AudioUtil.passMusic();
    }

    public static resumeMusic() {
        AudioUtil.resumeMusic();
    }

    /** 设置背景音乐播放状态 */
    public static setMusicStatus(flag: boolean): void {
        AudioManager._musicFlag = flag;
        cc.sys.localStorage.setItem(AudioManager.MUSIC_TAG, flag);
        if (flag) {
            AudioManager.playMusic(AudioManager._curBundle, AudioManager._curMusic);
        } else {
            AudioManager.stopMusic();
        }
    }

    /** 设置音效播放状态 */
    public static setEffectStatus(flag: boolean): void {
        AudioManager._effectFlag = flag;
        cc.sys.localStorage.setItem(AudioManager.EFFECT_TAG, flag);
        cc.log("AudioManager.setEffectStatus.flag" + flag);
        if (flag) {
            this.resumeLoopEffects();
        } else {
            this.pauseLoopEffects();
        }
    }

    public static get effectFlag(): boolean {
        return AudioManager._effectFlag;
    }

    public static get musicFlag(): boolean {
        return AudioManager._musicFlag;
    }
}
