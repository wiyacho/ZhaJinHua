import IPlatform from "./IPlatform";

export default class WebAdapter implements IPlatform {
    public packageName: string = '';
    public isPrintLog: boolean = true;
    public onGameExit(): void {
        // console.log(`onGameExit`)
    }
    public onGameReady(): void {
        // console.log('onGameReady')
        // GameInfo.instance.hasCalledOnGameReady = true;
    }
    public toast(message: string): void {
        // console.error(message);
    }

    callFunction(funcName: string, parm: string): void {
        // throw new Error("Method not implemented.");
    }
    callFunctionResult(funcName: string, parm: string, moduleName: string) {
        return {};
    }
}
