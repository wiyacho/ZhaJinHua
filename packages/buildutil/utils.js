/* eslint-disable */
const fs = require('fs-extra');
const { execSync } = require('child_process');
const zipFolder = require("zip-folder");
const md5File = require("md5-file");
const walkSync = require('walk-sync');
const path = require('path');

function handleFileTime(targetPath) {
    const date = new Date('Thu Aug 20 2019 11:11:11 GMT+0800 (CST)');
    const paths = walkSync(targetPath)

    for (let i = 0; i < paths.length; i++) {
        const element = path.join(targetPath, paths[i]);
        fs.utimesSync(element, date, date);
    }
}

function asyncZipFolder(targetPath, targetZipPath) {
    return new Promise((resolve, reject) => {
        zipFolder(targetPath, targetZipPath, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * @description 将指定目录压缩为zip格式压缩包，并添加md5后缀
 */
async function zipBunlde(bundlePath, targetPath, noZipMd5) {
    if (!fs.existsSync(bundlePath)) throw new Error("指定目录不存在");
    const os = require('os');
    const bundleZipPath = `${targetPath}.zip`;

    handleFileTime(bundlePath);
    await asyncZipFolder(bundlePath, bundleZipPath);
    // if (os.type() == 'Darwin') {
    //     execSync(`cd ${bundlePath}; zip -rX ${bundleZipPath} *`);
    // } else {
    //     await asyncZipFolder(bundlePath, bundleZipPath);
    // }

    if (!noZipMd5) {
        const hash = md5File.sync(bundleZipPath);
        fs.renameSync(bundleZipPath, bundleZipPath.replace('.zip', `_${hash}.zip`));
        fs.removeSync(bundlePath);
    }
}

module.exports = {
    zipBunlde
};