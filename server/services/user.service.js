var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var Cloudant = require('@cloudant/cloudant');
const localConfig = require('../config/config.json');
var username = localConfig.cloudant_username || "nodejs";
var password = localConfig.cloudant_password;
var cloudant = Cloudant({ account: username, password: password });
const log4js = require('log4js');
const logger = log4js.getLogger("logger");

setInstanceDB('user');

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

service.authenticate = authenticate;
service.create = create;

module.exports = service;

function authenticate(email, password) {
    var db = cloudant.use('user');
    var deferred = Q.defer();

    db.find({ selector: { email: email, status: 'active' } }).then(function (result) {
        if (result.docs.length > 0) {
            var user = result.docs[0];
            
            if (bcrypt.compareSync(password, user.password)) {
                //Successful auth
                authUser(user);
            }
            else {
                // authentication failed
                deferred.resolve();
            }
        }
        else {
            deferred.resolve();
        }

    }).catch(error => deferred.reject(error.name + ': ' + error.message));

    function authUser(user) {
        user.password = "";

        deferred.resolve({
            _id: user.id,
            user: user,
            token: jwt.sign({ sub: user.id }, localConfig.secret)
        });
    }

    return deferred.promise;
}

function create(user) {
    var deferred = Q.defer();

    try {
        var db = cloudant.use('user');

        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));

        db.find({ selector: { email: user.email, status: 'active' } }).then(function (result) {
            if (result.docs.length == 0) {
                db.insert(user).then(function (result) {
                    deferred.resolve(result);
                }).catch(error => deferred.reject(error.name + ': ' + error.message));
            }
            else {
                //Email already exits
                deferred.resolve();
            }
        }).catch(error => deferred.reject(error.name + ': ' + error.message));
    } catch (error) {
        deferred.reject(error.name + ': ' + error.message);
    }

    return deferred.promise;
}