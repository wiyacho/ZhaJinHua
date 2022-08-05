const { ccclass, property } = cc._decorator;
@ccclass
export default class webViewCmpt extends cc.Component {

    @property({ tooltip: "H5地址" })
    url: string = "";

    @property({ tooltip: "与H5交互约定的Key" })
    scheme: string = "chineseai";

    @property({ type: cc.Component.EventHandler, tooltip: "绑定事件" })
    JsCallback: cc.Component.EventHandler = null;

    public webView: cc.WebView = null

    onLoad() {
        if (!this.node.getComponent(cc.WebView)) {
            this.node.addComponent(cc.WebView)
        }
        this.webView = this.node.getComponent(cc.WebView)
    }

    start() {
        this.regisEvent()
        this.webView.setJavascriptInterfaceScheme(this.scheme);

        if (this.url != "") {
            this.webView.url = this.url + "?ignore=" + Date.now()  //规避缓存
        }

        if (this.JsCallback) {
            let targeNode = this.JsCallback.target;
            let tempComponent = targeNode.getComponent(this.JsCallback["_componentName"]);
            this.webView.setOnJSCallback(tempComponent[this.JsCallback.handler]);
        }
    }

    public regisEvent() {
        let webviewEventHandler = new cc.Component.EventHandler();
        webviewEventHandler.target = this.node; 
        webviewEventHandler.component = "webViewCmpt";
        webviewEventHandler.handler = "onWebFinishLoad";
        webviewEventHandler.customEventData = "";
        //@ts-ignore
        this.webView.webviewEvents.push(webviewEventHandler);
    }

    public onWebFinishLoad(sender, event, customEventData) {
        console.log("WebView event====>", event)
        if (event === cc.WebView.EventType.LOADED) {
            console.log("----webView---loaded---finish!!----")
        } else if (event === cc.WebView.EventType.LOADING) {
            console.log("----webView---loading----")
        } else if (event === cc.WebView.EventType.ERROR) {
            console.log("----webView---loaded---error!!----")
        }
    }

    /**
    * 绑定与内部页面交互的回调事件
    * @param {jsCallback () => void} handler 事件名称 | 事件回调函数 
    * @param {any} param 参数 
    */
     public setWebViewParams(jsCallback: () => void, param: { url: string, scheme?: string },) {
        if(!param) return
        this.webView.url = param.url + "?ignore=" + Date.now()  //规避缓存
        if(param.scheme){
            this.webView.setJavascriptInterfaceScheme(param.scheme);
        }
        this.webView.setOnJSCallback(jsCallback);
    }
}
