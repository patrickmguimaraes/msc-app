const appName = require('./../package').name;
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const config = require('./config/config.json');
const path = require('path');
var cors = require('cors');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/error-handler');
var pathArquivos = __dirname.replace("\server", "") + 'public';
const app = express();

//Logger

//firts time
//log4js.configure({
//	appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
//	categories: { default: { appenders: ['cheese'], level: 'error' } }
  //});

const logger = log4js.getLogger("logger");
logger.level = process.env.LOG_LEVEL || 'info';
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
const serviceManager = require('./services/service-manager');
require('./services/index')(app);
require('./routes/index')(app, server);

//Controllers
//app.use('/users', require('./routes/user.controller'));

// global error handler
app.use(errorHandler);

const port = process.env.PORT || config.port;
server.listen(port, function(){
  logger.info("IBM-MSC-PATRICK listening on " + config.apiUrl);
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