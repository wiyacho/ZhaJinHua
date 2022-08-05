
import IPlatform from "./IPlatform";

export default class AndroidAdapter implements IPlatform {
    public packageName: string = "org/cocos2dx/javascript/";
    public isPrintLog: boolean = true;
    public onGameExit(): void {
        // console.log(`Android adapter:onGameExit`)
        // this.callNative("onGameExit", "()V")
    }
    public onGameReady(): void {
        // console.log(`Android adapter:onGameReeady`)
        // GameInfo.instance.hasCalledOnGameReady = true;
        // this.callNative("onGameReady", "()V")
        this.callFunction("hideSplash", "", "NativeInterface");
        cc.log(`getWritablePath():${jsb.fileUtils.getWritablePath()}`)
    }

    public toast(message: string): void {
        // jsb.reflection.callStaticMethod(this.packageName, "toast", "(Ljava/lang/String;)V", message);

        this.callFunction("toast", message, "NativeInterface");
    }

    public callFunction(funcName: string, parm: string, moduleName: string): void {
        let packagePath = this.packageName;
        if (moduleName && moduleName != '') {
            packagePath += moduleName;
        }
        jsb.reflection.callStaticMethod(packagePath, funcName, "(Ljava/lang/String;)V", parm);
    }

    callFunctionResult(funcName: string, parm: string, moduleName: string) {
        let packagePath = this.packageName;
        if (moduleName && moduleName != '') {
            packagePath += moduleName;
        }
        let result = jsb.reflection.callStaticMethod(packagePath, funcName, "(Ljava/lang/String;)Ljava/lang/String;", parm);
        return result;
    }
}