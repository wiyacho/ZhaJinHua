/**
 * 字符串工具
 * @version 1.0
 */
export class StringUtils {
  public static format(sourceStr: string, ...args): string {
    if (args.length === 0) {
      return sourceStr;
    }
    let str = sourceStr;
    for (let i = 0; i < args.length; i++) {
      str = str.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
    }
    return str;
  }
  /**
   * 替换字符
   * @param fromIndex 开始替换的索引，以0开始
   * @param len 替换的长度
   * @param sourceStr 源字符串
   * @param replaceCode 替换成字符串码
   * @returns string
   */
  public static replaceStr(
    fromIndex: number,
    len: number,
    sourceStr: string,
    replaceCode: string = "*"
  ): string {
    var tempStr = "";
    var tempLen = sourceStr.length;
    for (var index = 0; index < tempLen; ++index) {
      if (index >= fromIndex && index < fromIndex + len) {
        tempStr += replaceCode;
      } else {
        tempStr += sourceStr.charAt(index);
      }
    }
    return tempStr;
  }

  /**
   * 字符串长度
   * @param str 字符串
   * @returns number
   */
  public static strLength(str: string): number {
    if (str === void 0) {
      return 0;
    }
    var len = 0;
    for (var i = 0; i < str.length; i++) {
      if ((str.charCodeAt(i) & 0xff00) != 0) {
        len++;
      }
      len++;
    }
    return len;
  }

  /**
   * 判断空串
   */
  public static isEmpty(obj: any): boolean {
    if (typeof obj == "undefined" || obj == null || obj == "") {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 超出部分显示省略号
   * @param {string} text 原始文本
   * @param {number} max 最大长度
   * @param {string} [moreText="..."] 省略号或指定字符
   */
  public static moreText(text: string, max: number, moreText: string = "..."): string {
    if (text.length > max) {
      return text.substring(0, max - 2) + "...";
    } else {
      return text;
    }
  }

  /* webView解析与H5交互的url */
  public static analysisWebViewByH5Url(url: string): Map<string, string> {
    let arr1 = url.split("//")[1];
    let arr2 = arr1.split("&");
    let map: Map<string, string> = new Map();
    for (let i = 0; i < arr2.length; i++) {
      map.set(arr2[i].split('=')[0], arr2[i].split('=')[1]);
    }
    return map
  }
}
