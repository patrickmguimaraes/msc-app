const http = require('http');
const express = require('express');
const config = require('./config/config.json');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const path = require('path');
var cors = require('cors');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/error-handler');
var pathArquivos = __dirname.replace("\server", "") + 'public';
const app = express();

//Logger
const logger = log4js.getLogger("logger");
logger.level = 'info';
app.use(log4js.connectLogger(logger, { level: logger.level }));

//Config public path for read files on the server side
app.use(express.static('public'));
app.use('/static', express.static(pathArquivos));

// req.body will be available for Content-Type=application/json
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// use JWT auth to secure the api
app.use(jwt());

//Controllers and services
const server = http.createServer(app);
require('./services/index')(app);
require('./routes/index')(app, server);
require('./ibm-watson-app')(app); //Call Watson App

// global error handler
app.use(errorHandler);

const port = config.PORT;
server.listen(port, function(){
  logger.info("MSC Server listening on " + config.API_URL);
});

app.use(function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public', '404.html'));
});

app.use(function (err, req, res, next) {
	res.sendFile(path.join(__dirname, '../public', '500.html'));
});

app.use(function (err, req, res, next) {
	res.sendFile(path.join(__dirname, '../public', '401.html'));
});

app.use(function (err, req, res, next) {
	res.sendFile(path.join(__dirname, '../public', '2020-activity_application-developer.pdf'));
});

module.exports = server;