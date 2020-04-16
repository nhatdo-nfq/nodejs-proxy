const http = require('http');
const https = require('https');
const config = require('./config');

module.exports = function() {
    if (config.SV_PORT == 443) {
        return https;
    }
    return http;
}