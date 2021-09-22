const fs = require('fs');
const path = require('path');

function sendFiles() {
    fs.readdir('uploads/', ((err, files) => {
        files.forEach(file => {
            console.log(path.resolve(file));
        })
    }))
}

module.exports = {sendFiles}