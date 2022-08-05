import webViewCmpt from "../../../kit/component/webViewCmpt";
import { kit } from "../../../kit/kit";
import ModelManager from "../../../kit/model/ModelManager";
import { StringUtils } from "../../../kit/utils/StringUtils";
import { FEEDBACKURL } from "../../../Script/config/config";
import { STATE_TO_HALL } from "../../../Script/config/event";
import Spot from "../../../Script/config/spot";

const { ccclass, property } = cc._decorator;
@ccclass
export default class userFeedBack extends cc.Component {

    onLoad() {

    }

    start() {
        let webView = cc.find("webView", this.node)
        let Cmpt = webView.addComponent(webViewCmpt)
        Cmpt.setWebViewParams(this.jsCallback.bind(this), { url: FEEDBACKURL })
    }

    jsCallback(target, url) {
        cc.log("url ========>" + url)
        let map = StringUtils.analysisWebViewByH5Url(url)
        let submit = map.get("submit")
        if (submit == "0") {
            cc.log("用户反馈退出～～～～～" + submit)
            kit.manager.Event.emit(STATE_TO_HALL)
        } else if (submit == "1") {
            cc.log("用户反馈提交～～～～～" + submit)
            kit.system.spot.send(Spot.AELC_PassFeedback, { FeedbackSuccess: 1 });
        }
    }
}
