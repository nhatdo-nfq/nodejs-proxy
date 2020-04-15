const http = require('http');
const https = require('https');

module.exports = function(request) {
    if (request.port === 443) {
        return https;
    }
    return http;
}