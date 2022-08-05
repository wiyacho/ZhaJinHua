/**
 * 数值计算工具
 * @version 1.0
 */
export class NumberUtils {
  /**
   * random 适用于整数
   * @param {Number} lower
   * @param {Number} upper
   * @return {number}
   */
  public static random(lower: number, upper: number): number {
    var range: number = upper - lower + 1;
    return Math.floor(Math.random() * range) + lower;
  }

  /**
   * randomf 适用于浮点数
   * @param {Number} lower
   * @param {Number} upper
   * @return {number}
   */
  public static randomf(lower: number, upper: number): number {
    return Math.random() * (upper - lower) + lower;
  }
  /**
   * 减法
   * @param {number} arg1
   * @param {number} arg2
   * @returns {number}
   */
  public static floatSub(arg1: number, arg2: number): number {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    //动态控制精度长度
    n = r1 >= r2 ? r1 : r2;
    var result = (arg1 * m - arg2 * m) / m;
    var tmp = result.toFixed(n);
    return parseFloat(tmp);
  }

  /**
   * 乘法
   * @param {number} arg1
   * @param {number} arg2
   * @returns {number}
   */
  public static floatMul(arg1: number, arg2: number): number {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    } catch (e) {}
    try {
      m += s2.split(".")[1].length;
    } catch (e) {}
    return (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) / Math.pow(10, m);
  }

  /**
   * 除法
   * @param {number} arg1
   * @param {number} arg2
   * @returns {number}
   */
  public static floatDiv(arg1: number, arg2: number): number {
    var t1 = 0,
      t2 = 0,
      r1,
      r2;
    try {
      t1 = arg1.toString().split(".")[1].length;
    } catch (e) {}
    try {
      t2 = arg2.toString().split(".")[1].length;
    } catch (e) {}
    r1 = Number(arg1.toString().replace(".", ""));

    r2 = Number(arg2.toString().replace(".", ""));
    return (r1 / r2) * Math.pow(10, t2 - t1);
  }

  /**
   * 大于1000转成1k，精确到小数点后一位
   * @param {number} arg1
   * @returns {string}
   */
  public static floatTok(arg1: number): string {
    if (arg1 < 1000) {
      return arg1.toString();
    } else {
      // 整数位 向下取整
      var t1 = Math.floor(arg1 / 1000);
      // 小数位 向下取整
      var t2 = Math.floor((arg1 % 1000) / 100);
      if (t2 > 0) {
        return t1 + "." + t2 + "k";
      }
      return t1 + "k";
    }
  }

  /**
   * 两点间向量长度与最大向量长度百分比系数
   * @param arg1 两点间x轴长度
   * @param arg2 两点间y轴长度
   * @param arg3 最小系数
   * @param arg4 最大向量长度
   */
  public static floatSqrt(arg1: number, arg2: number, arg3: number, arg4: number): number {
    var len: number = Math.sqrt(arg1 * arg1 + arg2 * arg2);
    var mul: number = arg3 + arg4 / len;
    return mul;
  }
}
