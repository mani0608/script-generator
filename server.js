const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const winston = require('winston');
const os = require('os');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

const api = require('./server/routes/api');

var logFilePath = path.join(os.homedir(), 'logs');

if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(logFilePath);
}

winston.configure({
    transports: [
        new (winston.transports.File)({ filename: path.join(logFilePath, 'server.log') })
    ]
});

app.use(fileUpload());
app.use(cors());
app.options('*', cors());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/app', express.static(path.join(__dirname, 'dist')));
// app.use('/results', express.static(path.join(__dirname, 'dist')));
app.use('/api', api);

//Sending all request except those of apis to angular
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send('error');
});

module.exports = app;
