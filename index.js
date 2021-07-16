const localTunnel = require('localtunnel')
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const app = express();

// With this approximation avoid the problem: No 'Access-Control-Allow-Origin' [...]
app.use(((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', "false");

    // Pass to next layer of middleware
    next();
}))

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.post('/upload', upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file, req.body)
    res.send("Successful Upload BLOB");
})

app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
    console.log(req.file, req.body)
    res.send("Successful");
})

const cpUpload = upload.fields([{name: 'avatar', maxCount: 1}, {name: 'gallery', maxCount: 8}]);
app.post('/cool-profile', cpUpload, function (req, res, next) {
    // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
    //
    // e.g.
    //  req.files['avatar'][0] -> File
    //  req.files['gallery'] -> Array
    //
    // req.body will contain the text fields, if there were any
})

app.listen(8000, () => {
    console.log('Running port 8000');
});

localTunnel({port: 8000}).then((tunnel => {
    console.log(tunnel.url);
}))
