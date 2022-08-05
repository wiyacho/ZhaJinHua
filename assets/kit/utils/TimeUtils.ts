import { NumberUtils } from "./NumberUtils";

/**
 * 时间工具
 * @version 1.0
 */
export class TimeUtils {
  /**
   * 根据指定格式格式化时间
   * dateToFormate(new Date(), "yyyy-MM-dd hh:mm:ss");
   * @param Date data对象
   * @param fmt 时间格式，如 yyyy-MM-dd hh:mm:ss
   * @returns {string}
   */
  public static dateToFormate(date: Date, fmt: string): string {
    let o: any = {
      "M+": date.getMonth() + 1, // 月份
      "d+": date.getDate(), // 日
      "h+": date.getHours(), // 小时
      "m+": date.getMinutes(), // 分
      "s+": date.getSeconds(), // 秒
      "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  }

  /**
   * 将一个秒数转换为：小时:分钟:秒,譬如：12：23：45
   * @param number time 时间戳
   * @returns {string}
   */
  public static toDate(time: number): string {
    let result: string = "";
    if (time <= 0) { return "00:00:00"; }
    let hour = 0;
    if (time >= 3600) {
      hour = Math.floor(NumberUtils.floatDiv(time, 3600));
      time %= 3600;
    }
    let minute = 0;
    if (time >= 60) {
      minute = Math.floor(NumberUtils.floatDiv(time, 60));
      time %= 60;
    }
    let second = Math.floor(time);
    if (hour < 10) { result += "0" + hour; }
    else { result += hour.toFixed(); }
    result += ":";
    if (minute < 10) { result += "0" + minute; }
    else { result += minute.toFixed(); }
    result += ":";
    if (second < 10) { result += "0" + second; }
    else { result += second.toFixed(); }
    return result;
  }

}
