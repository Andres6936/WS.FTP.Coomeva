const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
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
    const newPathPDF = req.file.destination + filenamePDF;
    const newPathTXT = req.file.destination + filenameTXT;

    fs.rename(req.file.path, newPathPDF, error => {
        if (error) {
            console.log(error)
        }
    })

    fs.writeFile(newPathTXT, lineWords, error => {
        if (error) {
            console.log(error)
        }
    })

    res.send("1");
})

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Each 90 seg. this functions is executed.
setInterval(async () => {
    await sender.sendFiles();
}, 90_000);