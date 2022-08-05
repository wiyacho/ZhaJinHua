export class ParseTemplateUtils{
    public static parseSrt(srtText: string) {
        let data: any[] =[]
        function ToSeconds(t) {
            var s = 0.0;
            if (t) {
              var p = t.split(":");
              for (let i = 0; i < p.length; i++) {
                s = s * 60 + parseFloat(p[i].replace(",", "."));
              }
            }
            return s;
        }
        let json = srtText
        json.split(/\n\s\n/)
        .filter(item => item != "")
        .map((item, index) => {
        let textItem = item.split(/\n/);
        data.push({
            index: index,
            sort: textItem[0],
            text: textItem[2],
            translate: textItem[3],
            startTime: ToSeconds(textItem[1].split(" --> ")[0]),
            endTime:  ToSeconds(textItem[1].split(" --> ")[1]),
            timeLine: textItem[1],
            isShow: false,
          })
        });
        return data
    }
}