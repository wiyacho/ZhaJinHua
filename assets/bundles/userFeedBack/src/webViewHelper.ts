import { kit } from "../../../kit/kit";
import ModelManager from "../../../kit/model/ModelManager";
import { STATE_TO_HALL } from "../../../Script/config/event";
import Spot from "../../../Script/config/spot";

const { ccclass, property } = cc._decorator;

@ccclass
export default class webViewHelper extends cc.Component {

    @property(cc.WebView)
    public webView: cc.WebView = null;

    public start() {
        // 这里是与内部页面约定的关键字，请不要使用大写字符，会导致 location 无法正确识别。
        let scheme = "chineseai";
        // 这里是移动端， 接收web传过来的消息
        function jsCallback(target, url) {
            cc.log("url ========>" + url)
            // 这里的返回值是内部页面的 URL 数值，需要自行解析自己需要的数据。
            let str = url.replace(scheme + '://submit=', ''); // str === 'a=1&b=2'
            // webview target
            cc.log("jsCallback-------str-------", str);
            // window.closeWebView(target, url);
            if (Number(str) == 0) {
                cc.log("用户反馈退出～～～～～" + str)
                kit.manager.Event.emit(STATE_TO_HALL)
            } else if (Number(str) == 1) {
                cc.log("用户反馈提交～～～～～" + str)
                kit.system.spot.send(Spot.AELC_PassFeedback, { FeedbackSuccess: 1 });
            }
        }
        this.webView.setJavascriptInterfaceScheme(scheme);
        this.webView.setOnJSCallback(jsCallback);

        // @ts-ignore
        window.closeWebView = this.closeWebView.bind(this);
        // this.scheduleOnce(()=> kit.manager.Event.emit(STATE_TO_HALL),5)
    }

    public closeWebView() {
        this.node.active = false
    }

    public onWebFinishLoad(sender, event) {
        if (event === cc.WebView.EventType.LOADED) {
            cc.log("----webView---loaded---finish!!----")
        } else if (event === cc.WebView.EventType.LOADING) {
            cc.log("----webView---loading----")
        } else if (event === cc.WebView.EventType.ERROR) {
            cc.log("----webView---loaded---error!!----")
        }
    }
}
