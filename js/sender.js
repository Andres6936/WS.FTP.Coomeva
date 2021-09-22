const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

async function sendFiles() {
    let files = fs.readdirSync('uploads/');
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        /**
         * The connection to the FTP server is made, one of the characteristics
         * of this connection is its constant communication with the server.
         * connection will be turned off once the service is turned off.
         */
        await client.access({
            host: process.env.FTPS_HOST,
            port: process.env.FTPS_PORT,
            user: process.env.FTPS_USER,
            password: process.env.FTPS_PASS,
            secure: true
        })
        let destinationPath = process.env.FTPS_DIR;
        if (!destinationPath.endsWith('/')) {
            destinationPath += '/'
        }

        for (let file of files) {
            const pathFile = path.resolve('uploads/' + file);
            await client.uploadFrom(pathFile, destinationPath + file).then(r => {
                console.log('Response: ' + r);
                console.log("File send using FTP: ", file, destinationPath);
                // Remove the file of file system.
                fs.unlink(file, err => {
                    if (err) {
                        console.error("ERROR: Not is possible delete the file: " + file);
                        console.error("ERROR: Message - " + err);
                    } else {
                        console.log("Deleting the file: ", file);
                    }
                })
            });
        }
    } catch (err) {
        console.error(err);
    }
    await client.close()
}

module.exports = {sendFiles}