const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'temp/'});
const cors = require('cors');
const fs = require('fs');
const app = express();
const sender = require('./js/sender')

require('dotenv').config();

(async () => {
    // We verify the uploads/ folder, generally this folder must be created
    // in the system files of the server before being able to continue with
    // the execution of the service, but in servers where a new deployment
    // is made this folder in which case there is a forgetting to create it
    // will be created automatically to avoid an exception when not finding it.
    await sender.verifyDirectory('uploads/')
    // We verify the exposed precondition, what happens if the service ends
    // unexpectedly and the lock on the FTP sending directory is maintained,
    // because the service will not send any file until this lock has been
    // removed, with this approach what we will do is to unlock the directory
    // in case it has been blocked by an unexpected exit of the service.
    // This function will be executed only once when the service is started,
    // or reset.
    await sender.removeLockFileFrom('uploads/')
})();

// Each 90 seg. this functions is executed. The objective is to allow sending
// files that have been stuck in the folder due to a failure in the
// communication with the FTP service. If a failure occurs, it is guaranteed
// that every 90 seconds this function will be executed until no file is left
// in the directory.
setInterval(async () => {
    await sender.sendFiles();
}, 90_000);

app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept, Cache-Control",
    preflightContinue: true,
    optionsSuccessStatus: 204,
}));

// Enable pre-flight across-the-board
app.options('*', cors(), ((req, res, next) => {
    console.log(req, res, next);
    res.send('CORS Allow');
}));

// respond with "1" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('1');
})

app.post('/service/ftp/ext/digital', upload.single('file'), function (req, res, next) {
    console.log("Getting POST request from: ", req.ip, new Date().toISOString())

    // Verify the pre-condition, the params Taylor-Param1 and
    // Taylor-Param2 must be exist in the header of HTTP
    if (req.headers["taylor-param1"] === undefined) {
        // 500 Internal Server Error
        return res.status(500).send("The Taylor-Param1 not send in the header of HTTP");
    }

    if (req.headers["taylor-param2"] === undefined) {
        // 500 Internal Server Error
        return res.status(500).send("The Taylor-Param2 not send in the header of HTTP");
    }

    const lineWords = req.headers["taylor-param1"] + '\n' + req.headers["taylor-param2"];
    // @type List[String] List of words in the body.
    const bodyWords = req.headers["taylor-param2"].split(';');

    // @type String The final name of PDF.
    const filenamePDF = bodyWords[bodyWords.length - 1];
    // @type String The final name of TXT.
    const filenameTXT = filenamePDF.replace('PDF', 'TXT');
    // @type String the final directory where the PDF will be stored.
    // We need to extract the file name but without the extension,
    // as a reference I got this answer: https://stackoverflow.com/a/4250408
    const directoryPDF = filenamePDF.replace(/\.[^/.]+$/, "/");
    const newPathPDF = 'uploads/' + directoryPDF + filenamePDF;
    const newPathTXT = 'uploads/' + filenameTXT;

    // Ensure that directory exist for move the PDF it this place.
    // We make sure that the directory exists before continuing with the
    // response to the request, with this we avoid getting an exception
    // when moving a file from and to a directory where it does not exist.
    // This operation is synchronous, that means that the execution thread
    // will be blocked until the operation is completed, the operation to
    // be performed is expected to be fast (and usually is).
    fs.mkdirSync('uploads/' + directoryPDF);

    // The purpose of this function is to write the files to the folder
    // intended for FTP sending, at the moment that folder is 'uploads/'.
    // An undesired consequence that can happen with folders where several
    // functions are executed in parallel is the fact that there may be files
    // deleted or moved when they should not be, as an explanation, the folder
    // is populated by a number of files that have arrived as a request from
    // various points, if a request arrives at the very moment when files are
    // being deleted or moved this file that arrived as a result of a request
    // will be deleted without having been processed or registered causing the
    // deletion or loss of information.
    // To prevent this type of problems we resort to a famous technique which
    // is to use a dummy file (we use a .lock) that will be used to determine
    // when a function that must act only on the directory (for example a
    // function that must delete all the files in the directory or move the
    // files from one directory to another) is working, if this file is
    // present, we will wait until the directory is released (that is to say,
    // the dummy file has disappeared or deleted).
    const directoryFlag = setInterval(() => {
        // We wait for the directory to be freed to proceed to write the files,
        // otherwise if the directory is not being freed it will retry every
        // 100 ms.
        if (!fs.existsSync('uploads/.lock')) {
            // Once the directory has been freed it will not be necessary to
            // continue executing this function every 100 ms, so we eliminate
            // the execution interval
            clearInterval(directoryFlag);
            writeFiles(req.file.path, newPathPDF, newPathTXT, lineWords);
        }
    }, 100);

    res.send("1");
})

function writeFiles(pathFile, pathPDF, pathTXT, linesTXT) {
    try {
        fs.renameSync(pathFile, pathPDF);
        fs.writeFileSync(pathTXT, linesTXT)
    } catch (error) {
        console.log(error);
    }
}

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
