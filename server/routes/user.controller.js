var express = require('express');
var router = express.Router();
var userService = require('../services/user.service');
const log4js = require('log4js');
const logger = log4js.getLogger("logger");

module.exports = function (app) {
    const router = express.Router();

    router.post('/authenticate', authenticate);
    router.post('/create', create);

    app.use('/user', router);
}

function authenticate(req, res) {
    if(req.body.email=="" || req.body.password=="" || req.body.email.search("@")<=0) {
        res.status(400).send('One or more filds are incorrect.');
    }
    else {
        userService.authenticate(req.body.email, req.body.password)
        .then(function (user) {
            if (user) {
                // authentication successful
                res.send(user);
            } else {
                // authentication failed
                res.status(400).send('E-mail or password is incorrect.');
            }
        })
        .catch(function (error) {
            logger.error(error);
            res.status(500).send(error.name + ': ' + error.message);
        });
    }
}

function create(req, res) {
    var user = req.body;

    if(user.email=="" || user.password=="" || user.email.search("@")<=0) {
        res.status(400).send('One or more filds are incorrect.');
    }
    else {
        userService.create(user).then(function (user) {
            if(user){
                res.send(user);
            }
            else {
                res.status(400).send('There is already an account with this e-mail.');
            }
        }).catch(function (error) {
            logger.error(error);
            res.status(500).send(error.name + ': ' + error.message);
        });
    }
}