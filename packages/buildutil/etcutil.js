const { log } = require('console');
const fs = require('fs');
const path = require('path');
const _etcSettings = {
    "android": {
        "formats": [
          {
            "name": "etc2",
            "quality": "fast"
          }
        ]
      },
      "ios": {
        "formats": [
          {
            "name": "etc2",
            "quality": "fast"
          }
        ]
      }
};
let isCompress = 0;

module.exports = {
    async changePackMode2Etc2 (_isCompress, curUrl){
        return new Promise((resolve, reject)=>{
            isCompress = _isCompress
            if (!fs.existsSync(curUrl)) {
                console.log("existsSync  :",curUrl);
                return;
            }
            fs.readdir(curUrl, async (err, files) => {
                if (err) {
                    console.error(err);
                    return;
                }
                await Promise.all(files.map(async (file) => {
                    return await this.walkAllDir(file, curUrl);
                }));
                resolve();
            });

            
        })
    },

    walkAllDir(file, curUrl){
        return new Promise(async (resolve, reject)=>{
            let curPath = path.join(curUrl, file);
            let stat = fs.statSync(curPath);
            if (stat.isDirectory()) {
                await  this.changePackMode2Etc2(isCompress, curPath); // 遍历目录
            } else {
                await this.updatePackMode(file, curPath, isCompress);
            }
            resolve()
        });
    },

    updatePackMode(file, curPath, isCompress){
        return new Promise((resolve, reject)=>{
            if (file.indexOf('.meta') >= 0) {
                fs.readFile(curPath, (err, data) => {
                    if (err) {
                        console.error(err);
                        resolve();
                        return;
                    }
                    let obj = JSON.parse(data);
                    if (obj && obj.platformSettings) { //未开启预乘
                        if (exclude_files.indexOf(file) > -1 || obj.premultiplyAlpha) { //不需要修改
                            if (obj.platformSettings) {
                                obj.platformSettings = {}; 
                            }
                        }else{
                            obj.platformSettings = isCompress ? _etcSettings : {}; // 设置压缩纹理
                        }
                        let wrdata = JSON.stringify(obj, null, 2);
                        fs.writeFile(curPath, wrdata, (err) => {
                            if (err) {
                                console.error(err);
                                resolve(err);
                                return;
                            }
                            resolve();
                            return;
                        });
                    }else{
                        resolve();
                    }
                });
            }else{
                resolve();
            }
        });
    }
}

const exclude_files = [
    'singleColor.png.meta',
]