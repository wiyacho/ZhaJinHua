
import IPlatform from "./IPlatform";

export default class DebuggerAdapter implements IPlatform {
    packageName: string;
    public isPrintLog: boolean = false;
    public onGameExit(): void {
        // console.log(`Android adapter:onGameExit`)
        // this.callNative("onGameExit", "()V")
    }
    public onGameReady(): void {
        // console.log(`Android adapter:onGameReeady`)
        // GameInfo.instance.hasCalledOnGameReady = true;
        // this.callNative("onGameReady", "()V")
    }

    public toast(message: string): void {
        // this.callNative("toast", "(Ljava/lang/String;)V", message)
    }

    callFunction(funcName: string): void {
        // throw new Error("Method not implemented.");
    }

    callFunctionResult(funcName: string, parm: string, moduleName: string) {
        throw new Error("Method not implemented.");
    }
}