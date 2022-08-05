// panel/index.js, this filename needs to match the one registered in package.json
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <div>版本: <span id="label"></span> <ui-input placeholder="版本号..." id="input"></ui-input></div>
    
    <hr />
    <ui-button id="btn">生成更新</ui-button>  <ui-button id="btn2">部署manifest</ui-button>  <ui-button id="btn3">打开目录</ui-button>
    
  `,

  // element and variable binding
  $: {
    btn: '#btn',
    btn2: '#btn2',
    btn3: '#btn3',
    label: '#label',
    input: '#input',
  },



  /**
   * 生成新的manifest
   */
  generate() {
    Editor.log('生成更新');
    //保存配置文件
    this.data.version = this.$input.value;
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

    let cmd = script + ' ' + js + ' ' + version + ' ' + buildPath + ' ' + remotePath;
    Editor.log('cmd:' + cmd);

    let funcExtractDiff = () => {
      // this.extractDiff(cdnPath, remotePath);
      let jarPath = Editor.Project.path + '/packages/hotfix/util.jar';
      let exportCmd = Editor.Project.path + '/packages/hotfix/extractdiff.sh ' + jarPath + ' ' + cdnPath + ' ' + buildPath + ' ' + remotePath;
      cp.exec(exportCmd, (error, stdout, stderr) => {
        if (error) {
          Editor.error(`${error}`);
          return;
        }
        Editor.log(stdout);
        Editor.log(`${stderr}`);
        Editor.success('版本生成完毕! 请将' + remotePath + '同步至CDN.');
      });
    };

    cp.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        Editor.error(`${error}`);
        return;
      }
      Editor.log(`${stdout}`);
      Editor.log(`${stderr}`);
      Editor.success('manifest生成完毕');
      Editor.success('提取差异文件');
      funcExtractDiff();
    });


  },

  mkdirs(parentPath, destFilePath) {
    let segs = destFilePath.split(path.sep);
    let currPath = parentPath;
    for (let i = 0; i < segs.length - 1; i++) {
      const element = segs[i];
      if (!currPath.endsWith(path.sep)) {
        currPath += path.sep;
      }
      currPath += element;
      // Editor.log('mk path:' + currPath);
      if (!fs.existsSync(currPath)) {
        fs.mkdirSync(currPath);
      }
    }
  },

  /**
   * 生成增量文件结构，以更新CDN
   * @param {*} cdnPath 存储线上版本的manifest的目录
   * @param {*} remotePath 本次生成的manifest及增量文件的目录
   */
  extractDiff(cdnPath, remotePath) {
    let assetsSrc;
    if (fs.existsSync(cdnPath + 'project.manifest')) {
      let buff = fs.readFileSync(cdnPath + 'project.manifest').toString();
      let srcObj = JSON.parse(buff);
      assetsSrc = srcObj.assets;
    } else {
      assetsSrc = {};
    }

    buff = fs.readFileSync(remotePath + 'project.manifest').toString();
    let destObj = JSON.parse(buff);
    let assetsDest = destObj.assets;

    let names = new Array();

    for (const name in assetsDest) {
      if (assetsSrc.hasOwnProperty(name)) {
        let assetS = assetsSrc[name];
        let assetD = assetsDest[name];
        if (assetS.md5 != assetD.md5) {
          names.push(name);
        }
      } else {
        names.push(name);
      }
    }

    //copy to remotePath
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let srcFilePath = this.buildPath + name;
      let destFilePath = remotePath + name;
      this.mkdirs(remotePath, name);
      cp.execSync('cp -apf ' + srcFilePath + ' ' + destFilePath);
      // fs.writeFileSync(destFilePath, fs.readFileSync(srcFilePath));
      // Editor.log('copy to:' + destFilePath);
    }


  },

  /**
   * 打开remote-assets目录
   */
  openDir() {
    let cmd = 'open ' + this.remotePath;
    Editor.log('cmd:' + cmd);

    cp.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        Editor.error(`${error}`);
        return;
      }
      Editor.log(`${stdout}`);
      Editor.log(`${stderr}`);
    })
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

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.$btn.addEventListener('confirm', () => {
      // Editor.Ipc.sendToMain('hotfix:clicked')
      this.generate();
    });

    this.$btn2.addEventListener('confirm', () => {
      // Editor.Ipc.sendToMain('hotfix:clicked')
      this.deployManifest();
    });

    this.$btn3.addEventListener('confirm', () => {
      // Editor.Ipc.sendToMain('hotfix:clicked')
      this.openDir();
    });

    // let versionFile = Editor.Project.path + '/version.json';
    let script = Editor.Project.path + '/packages/hotfix/hotfix.sh';
    let js = Editor.Project.path + '/packages/hotfix/version_generator.js';
    let buildPath = Editor.Project.path + '/../../chinese-ai-native/jsb-default/';
    let remotePath = Editor.Project.path + '/remote-assets/';
    let cdnPath = Editor.Project.path + '/cdn-manifest/';
    let versionFile = cdnPath + '/version.manifest';

    this.script = script;
    this.js = js;
    this.buildPath = buildPath;
    this.remotePath = remotePath;
    this.versionFile = versionFile;
    this.cdnPath = cdnPath;

    //加载上次的版本号
    if (fs.existsSync(this.versionFile)) {
      let buff = fs.readFileSync(this.versionFile).toString();
      this.data = JSON.parse(buff);
    } else {
      this.data = { version: '1.0.0' };
    }

    // focused
    this.$input.value = this.data.version;
    this.$input.focused = true;
    // Editor.log('hotfix loaded3')
    Editor.log('saved version:' + this.data.version);
  },

  // register your ipc messages here
  messages: {
    'hotfix:hello'(event) {
    }
  }
});