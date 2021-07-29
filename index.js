const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const FTP = require("jsftp");
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

const ftp = new FTP({
    host: "ftps.coomeva.com.co",
    port: 990,
    user: "smartroad",
    pass: "*.Sm4rtR04d.2021"
})

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

app.post('/upload', upload.single('file'), function (req, res, next) {
    const lineWords = req.headers["taylor-line"];
    const bodyWords = req.headers["taylor-body"].split(';');

    const filenamePDF = bodyWords[bodyWords.length - 1];
    const filenameTXT = filenamePDF.replace('PDF', 'TXT');
    const newPathPDF = req.file.destination + filenamePDF;
    const newPathTXT = req.file.destination + filenameTXT;

    fs.rename(req.file.path, newPathPDF, error => {
        if (error) {
            console.log(error)
        } else {
            sendFTPAndRemove(path.resolve(newPathPDF), filenamePDF);
        }
    })

    fs.writeFile(newPathTXT, lineWords, error => {
        if (error) {
            console.log(error)
        } else {
            sendFTPAndRemove(path.resolve(newPathTXT), filenameTXT);
        }
    })

    res.send("1");
})

function sendFTPAndRemove(path, destinationPath) {
    ftp.put(path, destinationPath, error => {
        if (error) {
            console.log(error);
        } else {
            // Remove the file of file system.
            fs.unlink(path, err => {
                console.log("ERROR: Not is possible delete the file: " + path);
            })
        }
    })
}

const port = 8080;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
