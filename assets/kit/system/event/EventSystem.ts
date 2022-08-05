/**
 * @class 事件管理器
 * @version 1.0
 */
import { EventEmitter } from "./EventEmitter";

export default class EventSystem {
  private static _emitter = new EventEmitter();

  /**
   * 绑定事件
   * @param {String} event
   * @param {Function} callback
   * @example Event.on(events, this.onEvents.bind(this));
   */
  public static on(event: string, callback: any, target?: any): void {
    this._emitter.on(event, callback, target);
  }

  /**
   * 绑定事件
   * @param {String} event
   * @param {Function} callback
   * @example Event.on(events, this.onEvents.bind(this));
   */
  public static once(event: string, callback: any, target?: any): void {
    this._emitter.once(event, callback);
  }

  /**
   * 销毁事件
   * @param {String} event
   * @param {Function} callback
   * @example Event.off(events, this.onEvents.bind(this));
   */
  public static off(event: string, callback: any, target: any): void {
    this._emitter.off(event, callback, target);
  }

  /**
   * 派发事件
   * @param {String} event
   * @param {any} data
   * @example Event.emit(event, data);
   */
  public static emit(event: string, eventData?: any): void {
    let params: any = {};
    params.event = event;
    params.data = eventData;
    this._emitter.emit(event, params);
  }

  /**
   * 释放所有监听器
   */
  public static release(): void {
    this._emitter.removeEvent();
  }
}
