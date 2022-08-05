/**
 * 本地存储
 * @version 1.0
 */
export class LocalStorageUtils {
  /**
   * 移除本地存储
   * @param {string} key - 要移除的item的索引
   */
  public static removeItem(key: string) {
    localStorage.removeItem(key);
  }

  /**
   * 存储Object数据
   * @param {string} key - 索引
   * @param {object} value - 内容
   */
  public static setObject(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * 获取Object数据
   * @param {string} key - 索引
   * @returns {object} - 内容
   */
  public static getObject(key: string): any {
    let obj = localStorage.getItem(key);
    if (obj == "") {
      return null;
    }
    return JSON.parse(obj);
  }

  /**
   * 存储Bool数据
   * @param {string} key - 索引
   * @param {boolean} value - 内容
   */
  public static setBool(key: string, value: boolean) {
    localStorage.setItem(key, value.toString());
  }

  /**
   * 获取Bool数据
   * @param {string} key - 索引
   * @returns {boolean} - 内容
   */
  public static getBool(key: string): boolean {
    return localStorage.getItem(key) == "true" ? true : false;
  }

  /**
   * 存储Int数据
   * @param {string} key - 索引
   * @param {number} value - 内容
   */
  public static setInt(key: string, value: number) {
    localStorage.setItem(key, value.toString());
  }

  /**
   * 获取Int数据
   * @param {string} key - 索引
   * @returns {number} - 内容
   */
  public static getInt(key: string): number {
    return Number(localStorage.getItem(key));
  }

  /**
   * 存储String数据
   * @param {string} key - 索引
   * @param {string} value - 内容
   */
  public static setString(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  /**
   * 获取String数据
   * @param {string} key - 索引
   * @returns {string} - 内容
   */
  public static getString(key: string): string {
    return localStorage.getItem(key);
  }
}
