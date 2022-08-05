'use strict';
const path = require('path');
const fs = require('fs');
module.exports = {
    load () {
    },
    unload () {
    },
    messages: {
        async 'ImageExt:deal' () {
            let assetUUids = Editor.Selection.curSelection("asset");
            if (assetUUids.length == 0) {
                Editor.log('select image to deal');
                return
            }
            let assetUUid = assetUUids[0];
            let fsPath = Editor.assetdb.uuidToFspath(assetUUid);
            let fileType = await this.getSelectInfo(fsPath+'.meta');
            await this.dealImage(fsPath, fileType);
            let assetPath = Editor.assetdb.uuidToUrl(assetUUid);
            Editor.assetdb.refresh(assetPath);
            Editor.log('deal success');

        }
    },
    getSelectInfo(metaFile){
        return new Promise((resolve)=>{
            fs.readFile(metaFile, (err, data) => {
                if (err) {
                    Editor.log('err:', err);
                    return;
                }
                let obj = JSON.parse(data);
                let fileType = obj.importer;
                resolve(fileType);
            });
        });
    },
    dealImage(path, fileType){
        return new Promise((resolve)=>{
            let command 
            if (fileType == "folder") { //目录
                command = `python3 ${__dirname}/dilator.py dilate_dir ${path}`;
            }else if (fileType == "texture") { //纹理
                command = `python3 ${__dirname}/dilator.py dilate ${path} ${path}`;
            }
            const child_process = require('child_process'); 
            child_process.exec(command, function (error, stdout, stderr) {
                if (error) {
                    Editor.log('error:', error);
                }
                resolve();
            })
        });
    }
};