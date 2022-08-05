'use strict';
const { readFileSync } = require('fs');
let os = require('os')
module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'logSpineData' () {
      this.showSkeletonData();
      // send ipc message to panel
      Editor.Ipc.sendToPanel('spine-tool', 'spine-tool:hello');
    }
  },

  showSkeletonData(){
    //获取当前选中的内容
    let activeInfo = Editor.Selection.curGlobalActivate("asset")
	Editor.log(activeInfo);
    if(activeInfo.type == "asset"){
      	// Editor.log('activeInfo:'+JSON.stringify(activeInfo));
       	let url = Editor.assetdb.uuidToUrl(activeInfo.id);
        url = Editor.url(url);
        let json = readFileSync(url, 'utf8');
		let info = this.parseSkeletonData(json);
		Editor.log(url);
		Editor.log(JSON.stringify(info));
        // let d = parse_skeleton_json(json);
        Editor.info("skins ==> ", info.skins);
        Editor.info("animas ==> ", info.animations);
    }else{
      Editor.log('请选择spine文件');
    }
  },

  parseSkeletonData(skData){
	skData = JSON.parse(skData);
	let skins = skData.skins
	let anis = skData.animations
	
	let data = {
		skins:[],
		animations:{}
	}

	//skin
	for (const key in skins) {
		const element = skins[key];
		let skinName = 	element['name'];
		data.skins.push(skinName);
	}

	//animations
	for (const aniName in anis) {
		if (Object.hasOwnProperty.call(anis, aniName)) {
			const element = anis[aniName];
			// Editor.log('===>>>element: ', element);
			let time = this.getBoneMaxTime(element);
			// Editor.log(`===>>>aniName:${aniName} ===>>>time: ${time}`);
			let info = {}
			info['time'] = time;
			info['time30'] = Math.round(time*30);
			info['time60'] = Math.round(time*60);
			data.animations[aniName] = info;
		}
	}
	return data;

  },
  getBoneMaxTime(boneDatas){
	let time = 0;
	for (const boneName in boneDatas) {
		if (Object.hasOwnProperty.call(boneDatas, boneName)) {
			const element = boneDatas[boneName];
			let t = this.getBonePlayTime(element)
  			// Editor.log('===>>>boneName: ', boneName);
  			// Editor.log('===>>>t: ', t);
			if (t > time) {
				time = t;
			}
		}
	}

	return time;
  },
  getBonePlayTime(boneData){
	let t = 0;
	for (const key in boneData) {
		const element = boneData[key];
		if(typeof element == "object"){
			t = this.getBonePlayTime(element)
		}else{

			if(key == "time" && element > t){
				(t = element);
			}
		}
	}
	return t;
  }

  
};