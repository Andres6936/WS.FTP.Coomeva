const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const cors = require('cors');
const fs = require('fs');
const app = express();

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

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('1');
})

app.post('/upload', upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file)
    console.log("Path:" + req.file.path);

    const lineWords = req.headers["taylor-line"].split('|');
    const bodyWords = req.headers["taylor-body"].split(';');

    const filename = bodyWords[bodyWords.length - 1];

    fs.rename(req.file.path, req.file.destination + filename, error => {
        if (error) {
            console.log(error)
        }
    })

    console.log("Filename: " + filename);

    // console.log(req.headers["Taylor-Body"].split(';'));
    // const bodyValues = req.headers["Taylor-Body"].split(';');
    // console.log(bodyValues.item(bodyValues.length - 1));
    res.send("1");
})

const hostname = '0.0.0.0';
const port = 80;

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
