const localTunnel = require('localtunnel')
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const cors = require('cors');
const app = express();

app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept",
    preflightContinue: true,
    optionsSuccessStatus: 204,
}));

// Enable pre-flight across-the-board
app.options('*', cors());

app.post('/upload', upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file, req.body)
    res.send("Successful Upload BLOB");
})

app.listen(8000, () => {
    console.log('Running port 8000');
});

localTunnel({port: 8000}).then((tunnel => {
    console.log(tunnel.url);
}))
