export default class UrlUtils {
    /**
     * 获取当前url页面后面的参数
     * @param key:要获取参数键值
     * @return 返回获取对应键的值，如果没有获取到键就返回一个''空字符串
     */
    static getQueryString(key: string): string {
        let reg = new RegExp(key + '=([^&]*)(?:&)?');
        let rs = window.location.search.substr(1).match(reg);
        if (rs != null) return rs[1];
        return null;
    }

    /**
     * 获取json中的url
     * @param {*} jsonObj
     * @param {string[]} type
     * @returns {string[]}
     * @memberof UrlUtils
     */
    static getUrlArrayByFileType(jsonObj, type: string): string[] {
        console.log(`getUrlArrayByFileType`)
        if (!jsonObj) {
            console.log('jsonObj is null , please check your json!!!')
            return
        }
        let urls: string[] = []
        let len = type.length
        function traverseJson(obj) {
            for (let o in obj) {
                if (typeof (obj[o]) === 'object') {
                    traverseJson(obj[o])
                } else if (typeof (obj[o]) === 'string') {
                    if (obj[o].slice(-len, obj[o].length) === type) {
                        urls.push(obj[o])
                    }
                }
            }
        }
        traverseJson(jsonObj)
        if (urls.length > 1) {/** 去重 */
            let list = [urls[0]]
            urls.sort()
            for (let i = 0; i < urls.length; i++) {
                if (urls[i] !== list[list.length - 1]) {
                    list.push(urls[i])
                }
            }
            return list
        }
        return urls
    }

    static parseUrl(url: string): any {
        let m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
            r = {
                hash: m[10] || "",                   // #asd
                host: m[3] || "",                    // localhost:257
                hostname: m[6] || "",                // localhost
                href: m[0] || "",                    // http://username:password@localhost:257/deploy/?asd=asd#asd
                origin: m[1] || "",                  // http://username:password@localhost:257
                pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
                port: m[7] || "",                    // 257
                protocol: m[2] || "",                // http:
                search: m[9] || "",                  // ?asd=asd
                username: m[4] || "",                // username
                password: m[5] || ""                 // password
            };
        if (r.protocol.length == 2) {
            r.protocol = "file:///" + r.protocol.toUpperCase();
            r.origin = r.protocol + "//" + r.host;
        }
        r.href = r.origin + r.pathname + r.search + r.hash;
        return m && r;
    }
    // parseUrl("http://username:password@localhost:257/deploy/?asd=asd#asd");

    static getUrlPathName(url: string): string {
        let ret: any = this.parseUrl(url);
        if (ret && ret.pathname) {
            return ret.pathname;
        }
        return ""
    }

}