export default interface IPlatform {
    isPrintLog: boolean;
    packageName: string;
    /**
     * 退出游戏
     * @memberof IPlatformNew
     */
    onGameExit(): void;
    /**
     * 游戏就绪（隐藏加载场景）
     * @memberof IPlatformNew
     */
    onGameReady(): void;
    /**
     * 显示原生toast
     * @param {string} message
     */
    toast(message: string): void;
    /**
     * 调用原生借口
     * @param {string} funcName
     * @param {string} parm
     * @param {string} moduleName 模块名称
     */
    callFunction(funcName: string, parm: string, moduleName: string): void;

    callFunctionResult(funcName: string, parm: string, moduleName: string): any;
}