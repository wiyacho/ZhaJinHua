import { kit } from "../../../kit/kit";
import ModelManager from "../../../kit/model/ModelManager";
import { commonTipsOptions } from "../../../kit/structure/ClientModuleInterface";
import { STATE_TO_HALL } from "../../../Script/config/event";
import UserModel from "../../../Script/modle/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FirstPage extends cc.Component {

    @property(sp.Skeleton)
    public logoSp: sp.Skeleton = null;

    @property(cc.AudioSource)
    public bgm: cc.AudioSource = null;

    private timer = 0;

    private check = false;

    private tipsTime = 0;
    private showTips = true;

    public start() {
        kit.system.platform.adapter.onGameReady();
        //if (ModelManager.instance.UserToken == "" || ModelManager.instance.UserToken == "testToken") {
        //}
        this.logoSp.setCompleteListener((event: any) => {
            cc.tween(this.logoSp.node)
            .delay(1)
            .call(() => { this.onStartLearning(); })
            .start();
        })
    }

    public async onStartLearning() {
        this.check = false;
        this.timer = 0;
        await ModelManager.instance.getModel(UserModel).reqToken();

        if (ModelManager.instance.CountryName == "") {
            ModelManager.instance.getModel(UserModel).messageCountryInfo()
        }
        kit.manager.Popup.hide();
        cc.tween(this.logoSp.node)
            .to(0.6, { opacity: 0 })
            .call(() => { 
                kit.manager.Event.emit(STATE_TO_HALL);
            })
            .start();
    }

    public onLogin(): void {

    }

    update (dt) {
        if (!this.check) {
            return;
        }
        this.timer += dt;
        if (this.showTips) {
            this.tipsTime += dt;
        }
        if (this.tipsTime > 10) {
            this.showTips = false;
            this.tipsTime = 0;  

            let params: commonTipsOptions = {
                tipsType: kit.structure.Tips.Type.REQUEST_FAILED,
                confirmCallback: () => {
                    this.showTips = true;
                },
                cancelCallback: () => {
                    this.showTips = true;
                }
            }
            kit.manager.Event.emit(kit.consts.Event.SHOW_COMMON_TIPS_POP, params);
        }
        if (this.timer < 3) {
            return;
        }

        this.reqToken();
        this.timer = 0;
    }

    async reqToken () {
        try {
            if (ModelManager.instance.UserToken == "" || ModelManager.instance.UserToken == "testToken") {
                this.check = true;
                this.timer = 0;
                let token = await ModelManager.instance.getModel(UserModel).reqToken();
                if (token && typeof token == "string" && token.length > 5) {
                    this.onStartLearning();
                }
            } else {
                this.onStartLearning();
            }
        } catch (e) {

        } 
    }
}
