const fs = require('fs');
const path = require('path');
const Client = require('ftp');


function sendFiles() {
    fs.readdir('uploads/', ((err, files) => {
        if (files.length === 0) return;

        const ftp = new Client();

        /**
         * The connection to the FTP server is made, one of the characteristics
         * of this connection is its constant communication with the server.
         * connection will be turned off once the service is turned off.
         */
        ftp.connect({
            host: process.env.FTPS_HOST,
            port: process.env.FTPS_PORT,
            user: process.env.FTPS_USER,
            password: process.env.FTPS_PASS,
            secure: true,
            pasvTimeout: 20000,
            keepalive: 20000,
            secureOptions: {rejectUnauthorized: false}
        })

        files.forEach(file => {
            const pathFile = path.resolve(file);
            let destinationPath = process.env.FTPS_DIR;
            if (!destinationPath.endsWith('/')) {
                destinationPath += '/'
            }

            ftp.put(pathFile, destinationPath + file, false, error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("File send using FTP: ", pathFile, destinationPath);
                    // Remove the file of file system.
                    fs.unlink(pathFile, err => {
                        if (err) {
                            console.error("ERROR: Not is possible delete the file: " + pathFile);
                            console.error("ERROR: Message - " + err);
                        } else {
                            console.log("Deleting the file: ", pathFile);
                        }
                    })
                }
            })

        })
    }))
}

module.exports = {sendFiles}