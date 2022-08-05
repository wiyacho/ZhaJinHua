import IPlatform from "./IPlatform";

export default class IosAdapter implements IPlatform {
    public packageName: string = "CocosHelper";
    public isPrintLog: boolean = true;
    public onGameExit(): void {
        // console.log(`IosAdapter:onGameExit`)
        // if (!ifGameExited()) {
        //     this.callNative("InteractCourseResponder", "onGameExit")
        //     setGameExited(true);
        // }
    }
    public onGameReady(): void {
        // GameInfo.instance.hasCalledOnGameReady = true;
        // this.callNative("InteractCourseResponder", "onGameReady")
        cc.log(`getWritablePath():${jsb.fileUtils.getWritablePath()}`)
    }

    public toast(message: string): void {
        // jsb.reflection.callStaticMethod("CocosHelper", "test2WithParm1:andParm2:", parm1, parm2);
       jsb.reflection.callStaticMethod(this.packageName, `toast:`, message);
    }

    callFunction(funcName: string, parm: string, moduleName: string): void {
        let packagePath = this.packageName;
        if (moduleName && moduleName != '') {
            packagePath = moduleName;
        }
        jsb.reflection.callStaticMethod(packagePath, `${funcName}:`, parm);
    }

    callFunctionResult(funcName: string, parm: string, moduleName: string): any {
        let packagePath = this.packageName;
        if (moduleName && moduleName != '') {
            packagePath = moduleName;
        }
        let result = jsb.reflection.callStaticMethod(packagePath, `${funcName}:`, parm);
        return result;
    }
}
