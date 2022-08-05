import { kit } from "../../../kit/kit";
import Main from "../../app";
import { BUNDLE_COMMON_RESOURCES, BUNDLE_COMPONENTS } from "../../config/config";
import { PLAY_BACKGROUND_MUSIC, STOP_BACKGROUND_MUSIC } from "../../config/event";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BackGroundMusicState implements kit.fsm.State<Main> {
    public entity: Main;
    private bgPath = `${BUNDLE_COMMON_RESOURCES}/sound/backgroundmusic2`;
    private isPlaying = false;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }

    public enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            kit.manager.Event.on(STOP_BACKGROUND_MUSIC, this.stopBg, this);
            kit.manager.Event.on(PLAY_BACKGROUND_MUSIC, this.playBg, this);
            res();
        })
    }
    public execute(data?: any): void {

    }

    public exit(data?: any): void {
        this.stopBg();
        kit.manager.Event.off(STOP_BACKGROUND_MUSIC, this.stopBg, this);
        kit.manager.Event.off(PLAY_BACKGROUND_MUSIC, this.playBg, this);
    }

    public playBg() {
        if (this.isPlaying) {
            return;
        }
        let bundle = cc.assetManager.getBundle(BUNDLE_COMPONENTS);
        if (!bundle) {

        }
        kit.manager.Audio.playMusic(BUNDLE_COMPONENTS, this.bgPath);
        this.isPlaying = true;
    }

    public stopBg() {
        this.isPlaying = false;
        kit.manager.Audio.stopMusic();
    }
}
