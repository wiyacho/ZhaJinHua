
import { kit } from "../../../../kit/kit";
import { BUNDLE_COMPONENTS } from "../../../../Script/config/config";
import { HIDE_COMMON_HAND_GUILD, SHOW_COMMON_HAND_GUILD } from "../../../../Script/config/event";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildHand extends cc.Component {

    @property(sp.Skeleton)
    public handSpine: sp.Skeleton = null;

    public guildSoundTimer;
    public onLoad() {
        kit.manager.Event.on(SHOW_COMMON_HAND_GUILD, this.showHandSpine, this);
        kit.manager.Event.on(HIDE_COMMON_HAND_GUILD, this.hideHandSpine, this);
    }

    public onDestroy() {
        kit.manager.Event.off(SHOW_COMMON_HAND_GUILD, this.showHandSpine, this);
        kit.manager.Event.off(HIDE_COMMON_HAND_GUILD, this.hideHandSpine, this);
    }

    public showHandSpine(params: any) {
        let localPos = this.node.parent.convertToNodeSpaceAR(params.data);
        this.node.position = cc.v3(localPos);
        this.restartHandSpine()
    }

    public hideHandSpine() {
        this.node.active = false;
        this.clearGuidHand()
        kit.manager.Audio.stopEffect();
    }

    public restartHandSpine() {
        this.node.active = true;
        this.addGuildSoundTimer();
    }

    private addGuildSoundTimer() {
        if (this.guildSoundTimer) {
            this.clearGuidHand();
        }
        // sound
        kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, "guildHand/audio/dianyidian_1");

        let t = 4;
        this.guildSoundTimer = kit.system.timer.doLoop(t * 1000, () => {
            if (!cc.isValid(this.node)) { return; }
            // sound
            kit.manager.Audio.playEffect(BUNDLE_COMPONENTS, "guildHand/audio/dianyidian_1");
        }, this);
    }

    private clearGuidHand() {
        kit.system.timer.clearTimer(this.guildSoundTimer);
        this.guildSoundTimer = null;
    }

}
