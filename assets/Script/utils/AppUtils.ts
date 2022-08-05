import ModelManager from "../../kit/model/ModelManager";

export default class AppUtils {
    /**
     * 获取读写路径
     * @param bundleName
     * @returns
     */
    public static getAppWritablePath(): string {
        let path = jsb.fileUtils.getWritablePath() + "ChineseAi/"

        return path;
    }

    /**
     * @param ver 需要检查版本
     */
    public static checkAppVersion(checkVer:string){
        let phoneInfo = JSON.parse(ModelManager.instance.phoneInfo);
        let curVer = phoneInfo.app_ver;
        // curVer = '1.1.1'
        // checkVer = '1.0.2'
        // console.log(" curVer: ", curVer, " checkVer: ", checkVer);
        
        if (!checkVer || !curVer) {
            return false;
        }
        
        if (AppUtils.getMaxVersion(curVer, checkVer) == curVer) {
            return true
        }

        return false;
    }

    private static getMaxVersion(curVer, checkVer){
        if (curVer == checkVer) {
            return curVer;
        }

        let curArr = curVer.split('.');
        let checkArr = checkVer.split('.');
        let maxLen = (curArr.length > checkArr.length) ? curArr.length : checkArr.length;

        for (let index = 0; index < maxLen; index++) {
            if (!checkArr[index]) {
                return curVer;
            } else if (!curArr[index]) {
                return checkVer;
            }else {
                if (checkArr[index] != curArr[index]) {
                    let curVal = parseInt(curArr[index])
                    let checkVal = parseInt(checkArr[index])
                    return curVal > checkVal ? curVer : checkArr;
                }
            }
            
        }
        return curVer;
    }
}
