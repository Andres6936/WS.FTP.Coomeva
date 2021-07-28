const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const FTP = require("jsftp");
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

const ftp = new FTP({
    host: "test.rebex.net",
    port: 21,
    user: "demo",
    pass: "password"
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
        }
    })

    fs.writeFile(filenameTXT, lineWords, error => {
        if (error) {
            console.log(error)
        }
    })

    const absolutePathPDF = path.resolve(newPathPDF);
    const absolutePathTXT = path.resolve(newPathTXT);
    console.log('Absolute: ' + absolutePathPDF);
    console.log('Absolute: ' + absolutePathTXT);

    ftp.put(newPathPDF, filenamePDF, error => {
        if (error) {
            console.log(error);
        }
    })

    ftp.put(newPathTXT, filenameTXT, error => {
        if (error) {
            console.log(error);
        }
    })

    res.send("1");
})

const hostname = '0.0.0.0';
const port = 80;

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
