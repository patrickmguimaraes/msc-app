const expressJwt = require('express-jwt');
const config = require('../config/config.json');

module.exports = jwt;

function jwt() { 
    const { secret } = config;
    return expressJwt({ secret }).unless({
        path: [
            '/', //alow the main page
            /^\/public\/.*/, //allow all files on /public domain
            {url: '/user/authenticate', methods: ['POST']}, //alow the user to authenticate
            {url:  '/user/create', methods: ['POST']}, //allow someone to create an account
            //{url:  '/ticket/create', methods: ['POST']}, //allow someone to create a ticket
            {url:  '/ticket/:_id', methods: ['GET']}, //allow someone to get tickets
            //{url: '/user', methods: ['GET']}, //a get example
            //{url:  '/user/:_id', methods: ['GET']} //a get with id example
        ]
    });
}
