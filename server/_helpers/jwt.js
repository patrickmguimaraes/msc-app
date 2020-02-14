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
        ]
    });
}
