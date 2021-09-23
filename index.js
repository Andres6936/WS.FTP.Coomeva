const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'temp/'});
const cors = require('cors');
const fs = require('fs');
const app = express();
const sender = require('./js/sender')

require('dotenv').config();


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
    const newPathPDF = 'uploads/' + filenamePDF;
    const newPathTXT = 'uploads/' + filenameTXT;

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
        if (!fs.existsSync('uploads/.lock')) {
            console.log("Writing files to directory uploads");
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

// Each 90 seg. this functions is executed.
setInterval(async () => {
    await sender.sendFiles();
}, 90_000);