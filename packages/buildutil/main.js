// let zipfile = require("./zipfile");
const path = require('path');
module.exports = {
    messages: {
        'buildutil:noetc2' ( event ) { 
            this.changeETC2(event);
        },
    },
    load () {
        Editor.Builder.on('build-start', this.buildStart);
        Editor.Builder.on('before-change-files', this.onBeforeBuildFinish);
        Editor.Builder.on('build-finished', this.buildFinish);
    },

    unload () {
        Editor.Builder.removeListener('build-start', this.buildStart);
        Editor.Builder.removeListener('before-change-files', this.onBeforeBuildFinish);
        Editor.Builder.removeListener('build-finished', this.buildFinish);
    },

    async buildStart(options, callback) {
        callback(); 
    },

    onBeforeBuildFinish(options, callback) {
        Editor.log("onBeforeBuildFinish");
        callback();
    },

    buildFinish(options, callback) {
        Editor.log("buildFinish");
        // zipfile.dealFile();
        callback();
    },

    assetsCreated(event){
    },
};
