'use strict';
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

function readDir(dir, obj) {
  var stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    return;
  }
  var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
  for (var i = 0; i < subpaths.length; ++i) {
    if (subpaths[i][0] === '.') {
      continue;
    }
    subpath = path.join(dir, subpaths[i]);
    stat = fs.statSync(subpath);
    if (stat.isDirectory()) {
      readDir(subpath, obj);
    }
    else if (stat.isFile()) {
      let fn = path.basename(subpath)
      if (fn != 'project.manifest' && fn != 'version.manifest') {
        obj.count++;
      }
    }
  }
}

function sortConfigJson(dir) {
  var stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    return;
  }
  var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
  for (var i = 0; i < subpaths.length; ++i) {
    if (subpaths[i][0] === '.') {
      continue;
    }
    subpath = path.join(dir, subpaths[i]);
    stat = fs.statSync(subpath);
    if (stat.isDirectory()) {
      let fn = path.basename(subpath)
      if (fn != 'upload' && fn != 'frameworks' && fn != 'jsb-adapter' && fn != 'simulator') {
        sortConfigJson(subpath);
      }
    }
    else if (stat.isFile()) {
      let fn = path.basename(subpath)
      if (fn == 'config.json') {
        let manifestPath = subpath
        if (fs.existsSync(manifestPath)) {
          let buff = fs.readFileSync(manifestPath).toString();
          let parseFile = JSON.parse(buff);

          //将uuids数组排序
          if (parseFile.uuids) {
            parseFile.uuids = parseFile.uuids.sort((a, b) => {
              if (a < b) {
                return -1
              } else if (a == b) {
                return 0
              } else {
                return 1
              }
            })
            fs.writeFileSync(manifestPath, JSON.stringify(parseFile))
            // Editor.success('为 >>> ' + manifestPath + '排序')
          }
          if (parseFile.redirect) {
            let tmpArr = []
            for (let i = 0; i < parseFile.redirect.length - 1; i += 2) {
              const name = parseFile.redirect[i];
              const value = parseFile.redirect[i + 1];
              tmpArr.push({ name: name, value: value })
            }
            tmpArr = tmpArr.sort((a, b) => {
              if (a.name < b.name) {
                return -1
              } else if (a == b) {
                return 0
              } else {
                return 1
              }
            })
            let newArr = []
            for (let i = 0; i < tmpArr.length; i++) {
              const element = tmpArr[i];
              newArr.push(element.name)
              newArr.push(element.value)
            }
            parseFile.redirect = newArr
            fs.writeFileSync(manifestPath, JSON.stringify(parseFile))
            // Editor.success('为 >>> ' + manifestPath + '排序')
          }
        }
      }
    }
  }
}

module.exports = {
  load() {
    // execute when package loaded
    Editor.Builder.on('build-finished', this.buildFinish.bind(this));
  },

  unload() {
    // execute when package unloaded
    Editor.Builder.removeListener('build-finished', this.buildFinish.bind(this));
  },

  /**
   * 生成新的manifest
   */
  generate() {
    Editor.success('生成更新');
    //保存配置文件
    // this.data.version = this.$input.value;
    //生成version.manifest和project.manifest
    let script = this.script;
    let js = this.js;
    let version = this.data.version;
    let buildPath = this.buildPath;
    let remotePath = this.remotePath;
    let cdnPath = this.cdnPath;

    //clear
    // fs.rmdirSync(this.remotePath)
    cp.execSync('rm -fvr ' + this.remotePath);
    fs.mkdirSync(this.remotePath);

    //给config.json中的uuids排序防止因顺序而造成的字节改变,而引起更新
    sortConfigJson(buildPath)

    let cmd = script + ' ' + js + ' ' + version + ' ' + buildPath + ' ' + remotePath;
    Editor.success('cmd:' + cmd);
    let out = cp.execSync(cmd)
    Editor.success(`${out}`)



    //----------------\\\
    let jarPath = Editor.Project.path + '/packages/hotfix/util.jar';
    let exportCmd = Editor.Project.path + '/packages/hotfix/extractdiff.sh ' + jarPath + ' ' + cdnPath + ' ' + buildPath + ' ' + remotePath;
    Editor.success('生成diff>>>>>>>>>>>>>>>>')
    let out2 = cp.execSync(exportCmd);
    Editor.success(`${out2}`)
    let obj = { count: 0 };
    readDir(remotePath, obj);
    if (obj.count > 0) {
      let manifestPath = remotePath + 'project.manifest'
      let versionStr = ''
      if (fs.existsSync(manifestPath)) {
        //不需要增加版本号
        let buff = fs.readFileSync(manifestPath).toString();
        let parseFile = JSON.parse(buff);

        //恢复版本号
        let version = parseFile.version
        let segs = version.split('.')
        let num = parseInt(segs[2])
        num++
        segs[2] = '' + num
        parseFile.version = segs[0] + '.' + segs[1] + '.' + segs[2]
        versionStr = parseFile.version
        if (this.forceVersion) {
          parseFile.version = this.data.version
        } else {
          this.data.version = versionStr
        }
        fs.writeFileSync(manifestPath, JSON.stringify(parseFile))
        Editor.success('有更新文件，project.manifest版本号为' + parseFile.version)
      }

      manifestPath = remotePath + 'version.manifest'
      if (fs.existsSync(manifestPath)) {
        //不需要增加版本号
        let buff = fs.readFileSync(manifestPath).toString();
        let parseFile = JSON.parse(buff);
        parseFile.version = versionStr

        if (this.forceVersion) {
          parseFile.version = this.data.version
        }

        fs.writeFileSync(manifestPath, JSON.stringify(parseFile))
        Editor.success('有更新文件，version.manifest版本号增加为' + parseFile.version)
      }
    } else {
      let manifestPath = this.buildPath + 'project.manifest'
      if (fs.existsSync(manifestPath)) {
        //不需要增加版本号
        let buff = fs.readFileSync(manifestPath).toString();
        let parseFile = JSON.parse(buff);
        if (this.forceVersion) {
          parseFile.version = this.data.version
        }
        Editor.success(`没有更新文件，版本号不变:${parseFile.version}`)
      }
    }
    //-----------------\\\

    this.deployManifest()
    this.zipAssets()
    // cp.exec(cmd, (error, stdout, stderr) => {
    //   if (error) {
    //     Editor.error(`${error}`);
    //     return;
    //   }
    //   Editor.success(`${stdout}`);
    //   Editor.success(`${stderr}`);
    //   Editor.success('manifest生成完毕');
    //   //拷贝到chinese-ai-native/jsb-default,和chinese-ai-app/cocos/cdn-manifest下存档
    //   this.deployManifest()
    //   Editor.success('+++++++++++++ 拷贝manifest到安装目录. +++++++++++++')
    // });
    cp.execSync('rm -rf ' + this.force_version);

  },


  /**
   * 部署manifest,拷贝remote-assets目录下的manifest到build/jsb-default和cdn-manifest目录下
   * 将remote-assets目录同步到CDN时才能执行此操作，若误操作请在git上恢复cdn-manifest目录
   */
  deployManifest() {
    // execSync('cp -apf ' + this.remotePath + 'version.manifest' + ' ' + this.buildPath + 'version.manifest');
    cp.execSync('cp -apf ' + this.remotePath + 'project.manifest' + ' ' + this.buildPath + 'project.manifest');
    cp.execSync('cp -apf ' + this.remotePath + 'version.manifest' + ' ' + this.cdnPath + 'version.manifest');
    cp.execSync('cp -apf ' + this.remotePath + 'project.manifest' + ' ' + this.cdnPath + 'project.manifest');
    Editor.success('manifest已经部署到客户端和cdn-manifest目录');
  },

  zipAssets() {
    if (fs.existsSync(this.buildPath + 'upload')) {
      cp.execSync('rm  -rf ' + this.buildPath + 'upload');
    }
    if (fs.existsSync(this.buildPath + 'upload.zip')) {
      cp.execSync('rm  -rf ' + this.buildPath + 'upload.zip');
    }
    cp.execSync('mkdir ' + this.buildPath + 'upload');
    cp.execSync('cp -apf ' + this.buildPath + 'project.manifest' + ' ' + this.buildPath + 'upload/project.manifest');
    cp.execSync('cp -apf ' + this.buildPath + 'assets' + ' ' + this.buildPath + 'upload');
    cp.execSync('cp -apf ' + this.buildPath + 'src' + ' ' + this.buildPath + 'upload');
    cp.execSync('cd ' + this.buildPath + 'upload && zip -q -r ' + 'upload_' + this.data.version + '.zip *');
    Editor.success('生成热更zip文件 -> ' + this.buildPath + 'upload/upload.zip');
    // cp.execSync('open ' + this.buildPath + 'upload');
  },

  buildFinish(options, callback) {
    Editor.success('+++++++++++++ build cocos finished. +++++++++++++')
    // Editor.success('options:++++++++++++++++++++++++++++++++++++++++++++++++++++begin')
    // Editor.success('options:' + JSON.stringify(options))
    // Editor.success('options:++++++++++++++++++++++++++++++++++++++++++++++++++++end')

    let script = Editor.Project.path + '/packages/hotfix/hotfix.sh';
    let js = Editor.Project.path + '/packages/hotfix/version_generator.js';
    let buildPath = Editor.Project.path + '/../../chinese-ai-native/jsb-default/';
    let remotePath = Editor.Project.path + '/remote-assets/';
    let cdnPath = Editor.Project.path + '/cdn-manifest/';
    let versionFile = cdnPath + '/version.manifest';
    let force_version = cdnPath + 'force_version.txt';

    this.script = script;
    this.js = js;
    this.buildPath = buildPath;
    this.remotePath = remotePath;
    this.versionFile = versionFile;
    this.cdnPath = cdnPath;
    this.force_version = force_version

    //加载上次的版本号
    if (fs.existsSync(this.versionFile)) {
      let buff = fs.readFileSync(this.versionFile).toString();
      this.data = JSON.parse(buff);
    } else {
      this.data = { version: '1.0.0' };
    }

    if (fs.existsSync(force_version)) {
      let version = fs.readFileSync(force_version).toString().trim()
      Editor.success('强制指定版本号:' + version)
      this.data.version = version
      this.forceVersion = true
    } else {
      this.forceVersion = false
    }
    //版本号自增
    // let version = this.data.version
    // let segs = version.split('.')
    // let num = parseInt(segs[2])
    // num++
    // segs[2] = '' + num
    // this.data.version = segs[0] + '.' + segs[1] + '.' + segs[2]

    Editor.success('当前版本号version:' + this.data.version)

    //生产.manifest
    this.generate()

    if (callback) {
      callback()
    }
  },

  // register your ipc messages here
  messages: {
    'open'() {
      // open entry panel registered in package.json
      Editor.Panel.open('hotfix');
    },
    // 'export'() {
    // },
    'clicked'() {
      Editor.success('Button clicked!');
      //node version_generator.js -v 1.0.0 -u http://localhost:8080/remote-assets/ -s build/jsb-default/ -d assets/
    },
    // 'editor:build-finished': function (event, target) {
    //   // var root = Path.normalize(target.dest);
    //   // var url = Path.join(root, "main.js");

    // },
  },
};