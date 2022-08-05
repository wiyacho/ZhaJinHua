import AudioManager from "../../../../kit/system/audio/AudioManager";

const {ccclass} = cc._decorator;

@ccclass
export default class PaokuGameAudio {
    private static _instance: PaokuGameAudio = null;
    public static get instance(): PaokuGameAudio {
        if (!PaokuGameAudio._instance) {
            PaokuGameAudio._instance = new PaokuGameAudio();
        }
        return PaokuGameAudio._instance;
    }


    private bundleName = '';
    public  setBundleName(value) {
        this.bundleName = value;
    }

    public bgm () {
        cc.log(this.bundleName);
        AudioManager.playMusic(this.bundleName, "audios/bgm");
    }

    public ready_go () {
        AudioManager.playEffect(this.bundleName, "audios/ready_go");
    }

    public run () {
        AudioManager.playLoopEffect(this.bundleName, "audios/run");
    }

    public stopRun () {
        AudioManager.stopLoopEffect(this.bundleName, "audios/run");
    }

    public jump() {
        AudioManager.playEffect(this.bundleName, "audios/jump");
    }

    public playBoom () {
        AudioManager.playEffect(this.bundleName, "audios/SE_kaijiaguaishou_04_ytz");
    }

    public playFollowAudio (score) {
        this[`play${score}StartAudio`]();
    }

    public play0StartAudio () {
        let random = Math.floor(Math.random() * 3);
        let audioName = "its_okay_ytz";
        if (random == 1) {
            audioName = "One more time_ytz";
        } else if (random == 2) {
            audioName = "Oopsy_ytz";
        }
        AudioManager.playEffect(this.bundleName, "audio/" + audioName);
    }

    public play1StartAudio () {
        let random = Math.floor(Math.random() * 2);
        let audioName = "bingo_ytz";
        if (random == 1) {
            audioName = "nice_work_ytz";
        }
        AudioManager.playEffect(this.bundleName, "audio/" + audioName);
    }

    public play2StartAudio () {
        cc.log("1111");
        let random = Math.floor(Math.random() * 3);
        let audioName = "well_done_ytz";
        if (random == 1) {
            audioName = "great_ytz";
        } else if (random == 2) {
            audioName = "super_ytz";
        }
        AudioManager.playEffect(this.bundleName, "audio/" + audioName);
    }

    public play3StartAudio () {
        let random = Math.floor(Math.random() * 4);
        let audioName = "amazing_ytz";
        if (random == 1) {
            audioName = "excellent_ytz";
        } else if (random == 2) {
            audioName = "fantastic_ytz";
        } else if (random == 3) {
            audioName = "bravo_ytz";
        }
        AudioManager.playEffect(this.bundleName, "audio/" + audioName);
    }

    // 吃道具
    public playProp () {
        AudioManager.playEffect(this.bundleName, "audios/SE_paokugendu01");
    }

    // 变大
    public playBig () {
        AudioManager.playEffect(this.bundleName, "audios/SE_paokugendu02");
    }
    // 变xiao
    public playSmall () {
        AudioManager.playEffect(this.bundleName, "audios/SE_paokugendu03");
    }

    public playTaitou () {
        AudioManager.playEffect(this.bundleName, "audios/SE_paokugendu04");
    }

    public playHappy () {
        AudioManager.playEffect(this.bundleName, "audios/SE_paokugendu05");
    }

    public playHanhua () {
        AudioManager.playEffect(this.bundleName, "audios/SE_paokugendu06");
    }
    
}
