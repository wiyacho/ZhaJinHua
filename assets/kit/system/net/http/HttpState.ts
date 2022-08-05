/**
 * HTTP状态码辅助类
 * * 1**	信息，服务器收到请求，需要请求者继续执行操作
 * * 2**	成功，操作被成功接收并处理
 * * 3**	重定向，需要进一步的操作以完成请求
 * * 4**	客户端错误，请求包含语法错误或无法完成请求
 * * 5**	服务器错误，服务器在处理请求的过程中发生了错误
 */
export class HttpStateMap {
  private static _instance: HttpStateMap;

  public static readonly map =
    "100\tContinue\t继续。客户端应继续其请求\n" +
    "101\tSwitching Protocols\t切换协议。服务器根据客户端的请求切换协议。只能切换到更高级的协议，例如，切换到HTTP的新版本协议\n" +
    "0\terror\t详见：https://codeday.me/bug/20170705/34070.html\n" +
    "200\tOK\t请求成功。一般用于GET与POST请求\n" +
    "201\tCreated\t已创建。成功请求并创建了新的资源\n" +
    "202\tAccepted\t已接受。已经接受请求，但未处理完成\n" +
    "203\tNon-Authoritative Information\t非授权信息。请求成功。但返回的meta信息不在原始的服务器，而是一个副本\n" +
    "204\tNo Content\t无内容。服务器成功处理，但未返回内容。在未更新网页的情况下，可确保浏览器继续显示当前文档\n" +
    "205\tReset Content\t重置内容。服务器处理成功，用户终端（例如：浏览器）应重置文档视图。可通过此返回码清除浏览器的表单域\n" +
    "206\tPartial Content\t部分内容。服务器成功处理了部分GET请求\n" +
    "300\tMultiple Choices\t多种选择。请求的资源可包括多个位置，相应可返回一个资源特征与地址的列表用于用户终端（例如：浏览器）选择\n" +
    "301\tMoved Permanently\t永久移动。请求的资源已被永久的移动到新URI，返回信息会包括新的URI，浏览器会自动定向到新URI。今后任何新的请求都应使用新的URI代替\n" +
    "302\tFound\t临时移动。与301类似。但资源只是临时被移动。客户端应继续使用原有URI\n" +
    "303\tSee Other\t查看其它地址。与301类似。使用GET和POST请求查看\n" +
    "304\tNot Modified\t未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源。客户端通常会缓存访问过的资源，通过提供一个头信息指出客户端希望只返回在指定日期之后修改的资源\n" +
    "305\tUse Proxy\t使用代理。所请求的资源必须通过代理访问\n" +
    "306\tUnused\t已经被废弃的HTTP状态码\n" +
    "307\tTemporary Redirect\t临时重定向。与302类似。使用GET请求重定向\n" +
    "400\tBad Request\t客户端请求的语法错误，服务器无法理解\n" +
    "401\tUnauthorized\t请求要求用户的身份认证\n" +
    "402\tPayment Required\t保留，将来使用\n" +
    "403\tForbidden\t服务器理解请求客户端的请求，但是拒绝执行此请求\n" +
    '404\tNot Found\t服务器无法根据客户端的请求找到资源（网页）。通过此代码，网站设计人员可设置"您所请求的资源无法找到"的个性页面\n' +
    "405\tMethod Not Allowed\t客户端请求中的方法被禁止\n" +
    "406\tNot Acceptable\t服务器无法根据客户端请求的内容特性完成请求\n" +
    "407\tProxy Authentication Required\t请求要求代理的身份认证，与401类似，但请求者应当使用代理进行授权\n" +
    "408\tRequest Time-out\t服务器等待客户端发送的请求时间过长，超时\n" +
    "409\tConflict\t服务器完成客户端的PUT请求是可能返回此代码，服务器处理请求时发生了冲突\n" +
    "410\tGone\t客户端请求的资源已经不存在。410不同于404，如果资源以前有现在被永久删除了可使用410代码，网站设计人员可通过301代码指定资源的新位置\n" +
    "411\tLength Required\t服务器无法处理客户端发送的不带Content-Length的请求信息\n" +
    "412\tPrecondition Failed\t客户端请求信息的先决条件错误\n" +
    "413\tRequest Entity Too Large\t由于请求的实体过大，服务器无法处理，因此拒绝请求。为防止客户端的连续请求，服务器可能会关闭连接。如果只是服务器暂时无法处理，则会包含一个Retry-After的响应信息\n" +
    "414\tRequest-URI Too Large\t请求的URI过长（URI通常为网址），服务器无法处理\n" +
    "415\tUnsupported Media Type\t服务器无法处理请求附带的媒体格式\n" +
    "416\tRequested range not satisfiable\t客户端请求的范围无效\n" +
    "417\tExpectation Failed\t服务器无法满足Expect的请求头信息\n" +
    "500\tInternal Server Error\t服务器内部错误，无法完成请求\n" +
    "501\tNot Implemented\t服务器不支持请求的功能，无法完成请求\n" +
    "502\tBad Gateway\t充当网关或代理的服务器，从远端服务器接收到了一个无效的请求\n" +
    "503\tService Unavailable\t由于超载或系统维护，服务器暂时的无法处理客户端的请求。延时的长度可包含在服务器的Retry-After头信息中\n" +
    "504\tGateway Time-out\t充当网关或代理的服务器，未及时从远端服务器获取请求\n" +
    "505\tHTTP Version not supported\t服务器不支持请求的HTTP协议的版本，无法完成处理";

  private data: any;

  public static get instance(): HttpStateMap {
    if (HttpStateMap._instance == null) {
      HttpStateMap._instance = new HttpStateMap();
    }
    return HttpStateMap._instance;
  }

  constructor() {
    var line: Array<string> = HttpStateMap.map.split("\n");
    this.data = {};
    line.forEach(element => {
      // var vo:HttpInfoVo=new HttpInfoVo();
      var temp: Array<string> = element.split("\t");
      this.data[temp[0]] = temp[1] + "\t" + temp[2];
    });
  }

  /**
   * 通过http状态码，返回中英文信息
   * @param id
   */
  public getErrorInfoById(id: number): void {
    return this.data[id];
  }
}

// export class HttpInfoVo{
//     public id:number;
//     public en:string;
//     public cn:string;
// }
