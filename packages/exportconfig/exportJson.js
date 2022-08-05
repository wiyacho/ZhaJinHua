const xlsx = require('./xlsx2json-master/lib/xlsx-to-json.js');
const config = require('./config.json');
const glob = require('glob');
const path = require('path');

// glob(config.xlsx.src, function (err, files) {
module.exports = {
    exportJson() {
        glob('./xlsx2json-master/excel/**/[^~$]*.xlsx', function (err, files) {
            if (err) {
                console.error("exportJson error:", err);
                throw err;
            }

            console.log('files: ', files)
            files.forEach(item => {
                xlsx.toJson(path.join(__dirname, item), path.join(__dirname, config.xlsx.dest));
            });

        });
    }
}