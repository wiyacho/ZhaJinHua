/**
 * 缓存池
 * @version 1.0
 */

import LogSystem from "../system/log/LogSystem";

export class PoolUtils {
  /**
   * 缓存池数组
   */
  private static poolArray: any = {};
  /**
   * 类缓存数组
   */
  private static classArray: Array<any> = [];

  /**
   * 初始化缓存池
   * @param type 类型
   * @param className 类名
   * @param num 初始化数量
   */
  public static initPool(type: string, className: any, num: number): void {
    if (this.poolArray[type] == null) {
      this.poolArray[type] = new Array();
    }
    this.classArray[type] = className;
    for (let i = 0; i < num; i++) {
      let object = new className();
      this.poolArray[type].push(object);
    }
    LogSystem.log("初始化" + type + "数量：" + this.poolArray[type].length);
  }
  /**
   * 获取缓存池对象
   * @param type 类型
   */
  public static getPool(type: string): any {
    if (this.poolArray[type].length > 0) {
      let object = this.poolArray[type].shift();
      // LogSystem.ins.log("获取" + type + "缓存池对象，剩余数量：" + this.poolArray[type].length);
      return object;
    } else {
      // LogSystem.ins.log(type + "缓存池对象剩余不足，剩余数量：" + this.poolArray[type].length);
      return new this.classArray[type]();
    }
  }
  /**
   * 放入缓存池对象
   * @param type 类型
   * @param object 需要缓存的对象
   */
  public static putPool(type: string, object: any): void {
    if (object) {
      // object.reset();
      this.poolArray[type].push(object);
      // LogSystem.ins.log("放入" + type + "缓存池对象，剩余数量：" + this.poolArray[type].length);
    }
  }

  /**
   * 清理单类型
   * @param type 类型
   */
  public static clear(type: string): void {
    while (this.poolArray[type] && this.poolArray[type].length > 0) {
      let object = this.poolArray[type].shift();
      object.parent = null;
      // object.destroy();
    }
    // LogSystem.ins.log("清理后" + type + "数量：" + this.poolArray[type].length);
  }

  /**
   * 清理所有
   */
  public static clearAll(): void {
    if (this.poolArray) {
      for (const key in this.poolArray) {
        if (this.poolArray.hasOwnProperty(key)) {
          let pool = this.poolArray[key];
          while (pool && pool.length > 0) {
            let object = pool.shift();
            object.parent = null;
            // object.destroy();
          }
        }
      }
    }
    this.poolArray = {};
    this.classArray = [];
  }
}
