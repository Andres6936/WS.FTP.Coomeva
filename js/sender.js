const ftp = require('basic-ftp');

async function sendFiles() {
    const client = new ftp.Client();
    // Only for debug session
    client.ftp.verbose = (process.env.DEBUG === 'true');
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

        // Log progress for any transfer from now on.
        client.trackProgress(info => {
            if (process.env.DEBUG === 'true') {
                console.log("File", info.name)
                console.log("Type", info.type)
                console.log("Transferred", info.bytes)
                console.log("Transferred Overall", info.bytesOverall)
            }
        })

        let destinationPath = process.env.FTPS_DIR;
        if (!destinationPath.endsWith('/')) {
            destinationPath += '/'
        }

        await client.cd(destinationPath);
        await client.uploadFromDir('uploads/');
    } catch (err) {
        console.error(err);
    }
    await client.close()
}

module.exports = {sendFiles}