let connection = require('./connection');
let cache = require('./cache')
let helper = require('./helper');
let d = require('./debug');

module.exports = {
    requestHandler: async function (request, response) {
        d(request.method + ' ' + request.url);

        if (!helper.shouldCacheRequest(request)) {
            // POST, PUT, DELETE, Referer, js, css, image...
            this.forwardRequest(request, response);
            return;
        }

        let serverRequest = helper.makeRequestOptions(request);

        let cachedHtml =  await cache.fetch(serverRequest);

        if (cachedHtml) {
            d('response with cached');
            response.end(cachedHtml);
            let needToRefresh = await this.needToRefresh(serverRequest);
            if (needToRefresh) {
                let res = await this.processRequest(serverRequest);
                cache.set(serverRequest, res);
            }
        } else {
            d('response directly');
            let res = await this.processRequest(serverRequest)
            helper.parseResponse(request, response, res);
            cache.set(serverRequest, res);
        }
    },
    needToRefresh: async function (request) {
        return false;
    },
    processRequest: async function (request) {
        return new Promise((resolve) => {
            connection().get(request, res => {
                resolve(res);
            })
        })
    },
    forwardRequest: async function (request, response) {
        request.pause();
        let serverRequest = helper.makeRequestOptions(request);
        let connector = connection().request(serverRequest, function (serverResponse) {
            helper.parseResponse(request, response, serverResponse);
        })
        request.pipe(connector, {end:true});
        request.resume();
    },
}