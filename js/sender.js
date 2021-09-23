const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

async function removeAllFiles(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

/**
 * This function is executed only if two conditions are true, the first
 * condition is that there is at least one file in the directory and the
 * second condition is that no other process is blocking the directory.
 *
 * A problem that can occur with this function is that it produces a
 * deadlock, since the existence of a dummy file (in this case a .lock
 * that is used to determine the lock of the directory) can cause the
 * function to stop executing, blocking the other processes that need
 * to access this directory, to avoid this type of problem two conditions
 * must be met:
 *
 * The first condition is that only one function must be in charge of
 * creating the dummy file (in this case the .lock), the second condition
 * is that the function that is in charge of creating the dummy file must
 * be the same function that must also be in charge of deleting it once
 * the directory has been released.
 *
 * @returns {Promise<void>} None
 */
async function sendFiles() {
    // Only execute function if exist almost an file in the directory
    if (fs.readdirSync('uploads/').length === 0) return;
    if (fs.existsSync('uploads/.lock') === true) return;

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

        await fs.promises.writeFile('uploads/.lock', new Date().toISOString())
        await client.cd(destinationPath);
        await client.uploadFromDir('uploads/');
        await removeAllFiles('uploads/');
    } catch (err) {
        console.error(err);
    }
    await client.close()
}

module.exports = {sendFiles}