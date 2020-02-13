module.exports = errorHandler;
const config = require('../config/config.json');
const log4js = require('log4js');
const logger = log4js.getLogger("logger");

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error (it will handle page not found)
        logger.error(err); console("1");
        return res.status(404);
    }
    else if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        logger.error(err); console("2");
        return res.status(401);
    }
    else {
        // default to 500 server error
        logger.error(err); console("3");
        return res.status(500);
    }
}