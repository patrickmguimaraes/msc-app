var express = require('express');
var router = express.Router();
var ticketService = require('../services/ticket.service');
const log4js = require('log4js');
const logger = log4js.getLogger("logger");

module.exports = function (app) {
    const router = express.Router();

    router.get('/:_id', getAll);
    router.post('/create', create);

    app.use('/ticket', router);
}

function getAll(req, res) {
    try {
        if (!req.params._id || req.params._id == "") {
            res.status(400).send('Please, enter a valid user id.');
        }
        else {
            ticketService.getAll(req.params._id).then(function (tickets) {
                res.send(tickets);
            }).catch(function (error) {
                logger.error(error);
                res.status(500).send(error.name + ': ' + error.message);
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.name + ': ' + error.message);
    }
}

function create(req, res) {
    try {
        var ticket = req.body;

        if (!ticket.description || ticket.description == "") {
            res.status(400).send('The ticket has to have a valid description.');
        }
        else if (!ticket.id_user || ticket.id_user == "") {
            res.status(400).send('The ticket has to have a user.');
        }
        else {
            ticketService.create(ticket).then(function (ticket) {
                res.send(ticket);
            }).catch(function (error) {
                logger.error(error);
                res.status(500).send(error.name + ': ' + error.message);
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).send(error.name + ': ' + error.message);
    }
}