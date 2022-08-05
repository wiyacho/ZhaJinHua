import LogSystem from "../system/log/LogSystem";

/**
 * 性能监控工具
 * @version 1.0
 */
export class MonitorUtils {
  private static showData: any = {};
  private static elem: HTMLElement = null;

  public static init(): void {
    this.fps();
    this.elem = document.createElement("monitor");
    this.elem.setAttribute("width", "200");
    this.elem.setAttribute("height", "400");
    this.elem.style.fontSize = "10px";
    document.body.appendChild(this.elem);
    setInterval(() => {
      this.performance();
      this.elem.innerHTML = this.getInfo();
    }, 1000);
  }

  /** 当前页面FPS */
  private static fps(): void {
    const times = []; // 存储当前的时间数组
    let fps: number = 0;
    function refreshLoop() {
      window.requestAnimationFrame(() => {
        const now = (performance || Date).now();
        while (times.length > 0 && times[0] <= now - 1000) {
          times.shift(); // 去掉1秒外的时间
        }
        times.push(now);
        fps = times.length;
        refreshLoop();
        MonitorUtils.showData["FPS"] = fps;
      });
    }
    refreshLoop();
  }

  /**
   * performance 信息简单计算出网页性能数据
   */
  private static performance(): void {
    let performance =
      window["performance"] || window["msPerformance"] || window["webkitPerformance"];

    if (!performance) {
      // 当前浏览器不支持
      // LogSystem.ins.warn("你的浏览器不支持 performance 接口");
      return;
    }
    let m = performance.memory;
    this.showData["内存大小限制"] = (m.jsHeapSizeLimit / 1048576).toFixed(2) + "MB";
    this.showData["可使用内存"] = (m.totalJSHeapSize / 1048576).toFixed(2) + "MB";
    this.showData["占用内存"] = (m.usedJSHeapSize / 1048576).toFixed(2) + "MB";

    let t = performance.timing;
    this.showData["白屏耗时"] = t.responseStart - t.navigationStart + "ms";
    this.showData["DNS查询耗时"] = t.domainLookupEnd - t.domainLookupStart + "ms";
    this.showData["HTTP请求耗时"] = t.responseEnd - t.requestStart + "ms";
    this.showData["TCP链接耗时"] = t.connectEnd - t.connectStart + "ms";
    this.showData["load事件耗时"] = t.loadEventEnd - t.loadEventStart + "ms";
    this.showData["onload回调函数执行的时间"] = t.loadEventEnd - t.navigationStart + "ms";

    let dataStr: string = "";
    for (let key in this.showData) {
      dataStr += key + ": " + this.showData[key] + "\n";
    }
    // LogSystem.ins.info("Performance: \n" + dataStr);
  }

  private static getInfo(): string {
    let dataStr: string = "";
    for (let key in this.showData) {
      dataStr += key + ": " + this.showData[key] + "</br>";
    }
    return dataStr;
  }
}
