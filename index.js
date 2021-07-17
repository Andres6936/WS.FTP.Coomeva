const localTunnel = require('localtunnel')
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const cors = require('cors');
const app = express();

app.use(cors({
    origin: false,
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST"
}));

app.post('/upload', upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file, req.body)
    res.send("Successful Upload BLOB");
    res.sendStatus(200);
})

app.listen(8000, () => {
    console.log('Running port 8000');
});

localTunnel({port: 8000}).then((tunnel => {
    console.log(tunnel.url);
}))
