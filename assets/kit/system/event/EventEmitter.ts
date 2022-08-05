/**
 * @private
 * 用于管理事件的类
 * 可以扩展以在其他类中提供事件功能,参考NODEJS的EventEmitter模块实现,注释为机翻
 *
 * @class 事件管理器管理事件注册和发布
 * @see https://github.com/Olical/EventEmitter
 * @version 1.0
 */
export class EventEmitter {
  private _events: any;
  private _onceReturnValue: any;

  /**
   * 返回指定事件的侦听器数组。
   * 如果需要，将初始化事件对象和侦听器数组。
   * 如果使用正则表达式搜索，将返回一个对象。对象包含每个匹配事件的键。
   * @example  /ba[rz]/ 则 返回一个对象包含 bar 和 baz.
   * 但是，如果您已经用定义事件定义了它们，或者添加了一些侦听器
   * 对象响应中的每个属性都是监听器函数的数组。
   *
   * @param {string|RegExp} 事件名称
   * @return {Function[|Object]} 事件的所有侦听器函数.
   */
  public getListeners(event: string | RegExp): Function[] {
    var events = this._getEvents();
    var response: any;
    var key: any;

    // Return a concatenated array of all matching events if
    // the selector is a regular expression.
    if (event instanceof RegExp) {
      response = {};
      for (key in events) {
        if (events.hasOwnProperty(key) && event.test(key)) {
          response[key] = events[key];
        }
      }
    } else {
      response = events[event] || (events[event] = []);
    }

    return response;
  }

  /**
   * 将侦听器函数添加到指定的事件。
   * 重复添加将会被忽略
   * 如果侦听器返回true，那么它将被调用后被删除
   * 如果将正则表达式作为事件名传递，则监听器将被添加到匹配它的所有事件。
   *
   * @param {string|RegExp} event 事件名称
   * @param {Function} listener 发出事件时调用的方法。
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public addListener(event: string | RegExp, listener: Function | object, target: any = null): EventEmitter {
    if (!this.isValidListener(listener)) {
      throw new TypeError("listener must be a function");
    }

    var listeners = this.getListenersAsObject(<string>event);
    var listenerIsWrapped = typeof listener === "object";
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key) && this.indexOfListener(listeners[key], listener, target) === -1) {
        (<any>listeners[key]).push(
          listenerIsWrapped
            ? listener
            : {
              listener: listener,
              once: false,
              target: target
            }
        );
      }
    }

    return this;
  }

  /**
   * addListener方法的别名
   * @param {string | RegExp} event
   * @param {Function} listener
   * @returns {EventEmitter}
   */
  public on(event: string | RegExp, listener: Function | object, target?: any): EventEmitter {
    return this.addListener(event, listener, target);
  }

  /**
   * 取一组听众对象和把它变成一个侦听器函数列表。
   *
   * @param {Object[]} 侦听原始监听器对象。
   * @return {Function[]} 侦听器的功能。
   */
  public flattenListeners(listeners: { listener: Function }[]): Function[] {
    var flatListeners = [];
    var i;

    for (i = 0; i < listeners.length; i += 1) {
      flatListeners.push(listeners[i].listener);
    }

    return flatListeners;
  }

  /**
   * Fetches the requested listeners via getListeners but will always return the results inside an object.
   * This is mainly for internal use but others may find it useful.
   *
   * @param event {string|RegExp} Name of the event to return the listeners from.
   * @return {Object} All listener functions for an event in object
   */
  public getListenersAsObject(event: string): { [event: string]: Function } {
    var listeners = this.getListeners(event);
    var response: any; //Array<string | RegExp>;

    if (listeners instanceof Array) {
      response = {};
      response[event] = listeners;
    }

    return response || listeners;
  }

  /**
   * Semi-alias of addListener. It will add a listener that will be
   * automatically removed after it's first execution.
   *
   * @param event {string|RegExp} Name of the event to attach the listener to.
   * @param listener {Function} Method to be called when the event is emitted.
   * If the function returns true then it will be removed after calling.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public addOnceListener(event: string | RegExp, listener: Function): EventEmitter {
    return this.addListener(event, <Object>{ listener: listener, once: true });
  }

  /**
   * addOnceListener的别名
   * @param {string | RegExp} event
   * @param {Function} listener
   * @returns {EventEmitter}
   */
  public once(event: string | RegExp, listener: Function): EventEmitter {
    return this.addOnceListener(event, listener);
  }

  /**
   * Defines an event name.
   * This is required if you want to use a regex to add a listener to multiple events at once.
   * If you don't do this then how do you expect it to know what event to add to?
   * Should it just add to every possible match for a regex? No. That is scary and bad.
   * You need to tell it what event names should be matched by a regex.
   *
   * @param {string} event Name of the event to create.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public defineEvent(event: string): EventEmitter {
    this.getListeners(event);
    return this;
  }

  /**
   * Defines an event name.
   * This is required if you want to use a regex to add a listener to multiple events at once.
   * If you don't do this then how do you expect it to know what event to add to?
   * Should it just add to every possible match for a regex? No. That is scary and bad.
   * You need to tell it what event names should be matched by a regex.
   *
   * @param {string[]} events Name of the event to create.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public defineEvents(events: string[]): EventEmitter {
    for (var i = 0; i < events.length; i += 1) {
      this.defineEvent(events[i]);
    }
    return this;
  }

  /**
   * 从指定的事件中移除侦听器函数。
   * 当将正则表达式传递为事件名称时，它将从与它匹配的所有事件中移除侦听器。
   *
   * @param {String|RegExp} event Name of the event to remove the listener from.
   * @param {Function} listener Method to remove from the event.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public removeListener(event: string | RegExp, listener: Function, target: any = null): EventEmitter {
    var listeners = this.getListenersAsObject(<string>event);
    var index;
    var key;

    for (key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        index = this.indexOfListener(listeners[key], listener, target);

        if (index !== -1) {
          (<any>listeners[key]).splice(index, 1);
        }
      }
    }

    return this;
  }

  /**
   * removeListener的别名
   * @param {string | RegExp} event
   * @param {Function} listener
   * @returns {EventEmitter}
   */
  public off(event: string | RegExp, listener: Function, target: any = null): EventEmitter {
    return this.removeListener(event, listener, target);
  }

  /**
   * Adds listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can add to multiple events at once.
   * The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be added.
   * You can also pass it a regular expression to add the array of listeners to all events that match it.
   * Yeah, this function does quite a bit. That's probably a bad thing.
   *
   * @param {String|Object|RegExp} event An event name if you will pass an array of listeners next.
   * An object if you wish to add to multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public addListeners(event: string | RegExp, listeners: Function[]): EventEmitter {
    return this.manipulateListeners(false, event, listeners);
  }

  /**
   * Removes listeners in bulk using the manipulateListeners method.
   * If you pass an object as the second argument you can remove from multiple events at once.
   * The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be removed.
   * You can also pass it a regular expression to remove the listeners from all events that match it.
   *
   * @param {String|Object|RegExp} event An event name if you will pass an array of listeners next.
   * An object if you wish to remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to remove.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public removeListeners(event: string | RegExp, listeners: Function[]): EventEmitter {
    return this.manipulateListeners(true, event, listeners);
  }

  /**
   * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job.
   * You should really use those instead, this is a little lower level.
   * The first argument will determine if the listeners are removed (true) or added (false).
   * If you pass an object as the second argument you can add/remove from multiple events at once.
   * The object should contain key value pairs of events and listeners or listener arrays.
   * You can also pass it an event name and an array of listeners to be added/removed.
   * You can also pass it a regular expression to manipulate the listeners of all events that match it.
   *
   * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
   * @param {String|Object|RegExp} event An event name if you will pass an array of listeners next.
   * An object if you wish to add/remove from multiple events at once.
   * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public manipulateListeners(
    remove: boolean,
    event: string | Object | RegExp,
    listeners: Function[]
  ): EventEmitter {
    var i;
    var value;
    var single = remove ? this.removeListener : this.addListener;
    var multiple = remove ? this.removeListeners : this.addListeners;

    // If event is an object then pass each of its properties to this method
    if (typeof event === "object" && !(event instanceof RegExp)) {
      for (i in event) {
        if ((<object>event).hasOwnProperty(i) && (value = event[i])) {
          // Pass the single listener straight through to the singular method
          if (typeof value === "function") {
            single.call(this, i, value);
          } else {
            // Otherwise pass back to the multiple function
            multiple.call(this, i, value);
          }
        }
      }
    } else {
      // So event must be a string
      // And listeners must be an array of listeners
      // Loop over it and pass each one to the multiple method
      i = listeners.length;
      while (i--) {
        single.call(this, event, listeners[i]);
      }
    }

    return this;
  }

  /**
   * Removes all listeners from a specified event.
   * If you do not specify an event then all listeners will be removed.
   * That means every event will be emptied.
   * You can also pass a regex to remove all events that match it.
   *
   * @param {String|RegExp} [event] Optional name of the event to remove all listeners for.
   * Will remove from every event if not passed.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public removeEvent(event?: string | RegExp): EventEmitter {
    var type = typeof event;
    var events = this._getEvents();
    var key;

    // Remove different things depending on the state of event
    if (type === "string") {
      // Remove all listeners for the specified event
      delete events[<string>event];
    } else if (event instanceof RegExp) {
      // Remove all events matching the regex.
      for (key in events) {
        if (events.hasOwnProperty(key) && event.test(key)) {
          delete events[key];
        }
      }
    } else {
      // Remove all listeners in all events
      delete this._events;
    }

    return this;
  }

  /**
   * Alias of removeEvent.
   *
   * Added to mirror the node API.
   */
  public removeAllListeners(event?: string | RegExp): EventEmitter {
    return this.removeEvent(event);
  }

  /**
   * 派发事件
   * > 当发出时，将执行附加到该事件的每个侦听器。
   * > 如果传递可选参数数组，那么这些参数将在执行后传递给每个侦听器。
   * > 因为它使用apple，所以你的参数数组会像你单独写出来一样通过。
   * > 还可以传递正则表达式，以将其发送给匹配它的所有事件。
   *
   * @param {String|RegExp} event 发出和执行侦听器的事件的名称。
   * @param {Array} [args] 要传递给每个侦听器的可选参数数组。
   * @return {EventEmitter} 当前示例
   */
  public emitEvent(event: string | RegExp, ...args: any[]): EventEmitter {
    var listenersMap = this.getListenersAsObject(<string>event);
    var listeners;
    var listener;
    var i;
    var key;
    var response;

    for (key in listenersMap) {
      if (listenersMap.hasOwnProperty(key)) {
        listeners = (<any>listenersMap[key]).slice(0);

        for (i = 0; i < listeners.length; i++) {
          // If the listener returns true then it shall be removed from the event
          // The function is executed either with a basic call or an apply if there is an args array
          listener = listeners[i];

          if (listener.once === true) {
            this.removeListener(event, listener.listener);
          }
          response = listener.listener.apply(listener.target || this, ...args || []);

          if (response === this.onceReturnValue) {
            this.removeListener(event, listener.listener);
          }
        }
      }
    }

    return this;
  }

  /**
   * emitEvent的别名
   * @param {string | RegExp} event
   * @param args
   * @returns {EventEmitter}
   */
  public trigger(event: string | RegExp, ...args: any[]): EventEmitter {
    return this.emitEvent(event, ...args);
  }

  /**
   * Subtly different from emitEvent in that it will pass its arguments on to the listeners,
   * as opposed to taking a single array of arguments to pass on.
   * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
   *
   * @param {String|RegExp} event Name of the event to emit and execute listeners for.
   * @param {... any[]} args Optional additional arguments to be passed to each listener.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public emit(event: string | RegExp, ...args: any[]): EventEmitter {
    // var args = Array.prototype.slice.call(arguments, 1);
    return this.emitEvent(event, args);
  }

  public get onceReturnValue() {
    if (this.hasOwnProperty("_onceReturnValue")) {
      return this._onceReturnValue;
    } else {
      return true;
    }
  }

  /**
   * Sets the current value to check against when executing listeners. If a
   * listeners return value matches the one set here then it will be removed
   * after execution. This value defaults to true.
   *
   * @param {any} value The new value to check for when executing listeners.
   * @return {EventEmitter} Current instance of EventEmitter for chaining.
   */
  public set onceReturnValue(value) {
    this._onceReturnValue = value;
    // return this;
  }

  private _getEvents() {
    return this._events || (this._events = {});
  }

  private isValidListener(listener: object | Function): boolean {
    if (typeof listener === "function" || listener instanceof RegExp) {
      return true;
    } else if (listener && typeof listener === "object") {
      return this.isValidListener(<any>listener);
    } else {
      return false;
    }
  }

  private indexOfListener(listeners: any, listener: any, target: any): number {
    var i = listeners.length;
    while (i--) {
      if ((listeners[i].listener === listener) && (target == listeners[i].target)) {
        return i;
      }
    }
    return -1;
  }
}
