var _ = require('lodash');
var Q = require('q');
var Cloudant = require('@cloudant/cloudant');
const localConfig = require('../config/config.json');
var username = localConfig.cloudant_username || "nodejs";
var password = localConfig.cloudant_password;
var cloudant = Cloudant({ account: username, password: password });
const log4js = require('log4js');
const logger = log4js.getLogger("logger");

setInstanceDB('ticket');

function setInstanceDB(dbName) {
    cloudant.db.get(dbName).then(dataBase => {
        if (dataBase) { logger.info("Database " + dbName + " is working."); }
    }).catch(erro => {
        cloudant.db.create(dbName);
        logger.info("Database " + dbName + " was created!");
        setInstanceDB(dbName);
    });
}

var service = {};

service.getAll = getAll;
service.create = create;

module.exports = service;

function getAll(_id) {
     cloudant.use('ticket').list();
    var deferred = Q.defer();

    try {
        var db = cloudant.use('ticket');

        db.find({ selector: { id_user: _id, status: 'active'} }).then(function (tickets) {
            deferred.resolve(tickets.docs);
        }).catch(error => deferred.reject(error.name + ': ' + error.message));
    } catch (error) {
        deferred.reject(error.name + ': ' + error.message);
    }

    return deferred.promise;
}

function create(ticket) {
    var deferred = Q.defer();

    try {
        var db = cloudant.use('ticket');

        db.insert(ticket).then(function (result) {
            deferred.resolve(result);
        }).catch(error => deferred.reject(error.name + ': ' + error.message));
    } catch (error) {
        deferred.reject(error.name + ': ' + error.message);
    }

    return deferred.promise;
}