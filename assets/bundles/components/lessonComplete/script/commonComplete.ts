import { kit } from "../../../../kit/kit";
import IComponent from "../../IComponent";
import { lessonCompleteData, MESSAGE_COMPLETE } from "./lessonCompleteData";
const { ccclass, property } = cc._decorator;
@ccclass
export default class LessonComplete extends cc.Component implements IComponent {

    @property({
        type: [cc.AudioClip],
    })
    public audio: cc.AudioClip[] = []

    @property(sp.Skeleton)
    public completeAnimation: sp.Skeleton = null;

    public completeBack: Function = null
    public completeType: number = 1
    public noCompleteType: number = 0
    public completeAni: string = "caizhi"
    public noCompleteAni: string = "caizhi"
    public rewardData: any = null

    public onLoad() {
        this.showSpine()
    }

    public init(){

    }

    public start() {
        this.completeAnimation.setCompleteListener(this.completeEndBack.bind(this))
    }

    public showSpine() {
        let ani_name = this.noCompleteAni
        this.playSkeMation(ani_name)
        cc.audioEngine.play(this.audio[1], false, 1)
    }

    public playSkeMation(ani_name) {
        this.completeAnimation.clearTracks()
        this.completeAnimation.setToSetupPose()
        this.completeAnimation.setAnimation(0, ani_name, false)
    }

    public completeEndBack() {
        this.scheduleOnce(() => {
            kit.manager.Event.emit(MESSAGE_COMPLETE)
        } , 0.3)
    }

    public onEnable(): void {
        
    }

    public onDisable(): void {

    }

}
