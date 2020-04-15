const config = require('./config');
const d = require('./debug');

module.exports = {
    makeRequestOptions: function (request) {
        let host = request.headers.host;
        let svHost;
        if (config.SV_PORT == 80) {
            svHost = host.replace(':' + config.PORT, '');
        } else {
            if (host.indexOf(':' + config.PORT) >= 0) {
                svHost = host.replace(':' + config.PORT, ':' + config.SV_PORT);
            } else {
                svHost = host + ':' + config.SV_PORT;
            }
        }
        var options = {
            host: svHost,
            port: config.SV_PORT,
            path: request.url,
            method: request.method,
            headers: request.headers
        };
        options.headers['host'] = options.host;
        return options;
    },
    parseResponse: function (request, response, serverResponse) {
        serverResponse.pause();
        switch (serverResponse.statusCode) {
            // pass through.  we're not too smart here...
            case 200: case 201: case 202: case 203: case 204: case 205: case 206:
            case 304:
            case 400: case 401: case 402: case 403: case 404: case 405:
            case 406: case 407: case 408: case 409: case 410: case 411:
            case 412: case 413: case 414: case 415: case 416: case 417: case 418:
                response.writeHead(serverResponse.statusCode, serverResponse.headers);
                serverResponse.pipe(response, {end:true});
                serverResponse.resume();
                break;

            // fix host and pass through.
            case 301:
            case 302:
            case 303:
                serverResponse.statusCode = 303;
                // d(serverResponse.headers['location']);
                response.writeHead(serverResponse.statusCode, serverResponse.headers);
                serverResponse.pipe(response, {end:true});
                serverResponse.resume();
                break;

            // error everything else
            default:
                var stringifiedHeaders = JSON.stringify(serverResponse.headers, null, 4);
                serverResponse.resume();
                response.writeHead(500, {
                    'content-type': 'text/plain'
                });
                response.end(process.argv.join(' ') + ':\n\nError ' + serverResponse.statusCode + '\n' + stringifiedHeaders);
                break;
        }
    }
}