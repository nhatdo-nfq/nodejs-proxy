let cache = require('./cache')
let helper = require('./helper');
let http = require('http')

module.exports = {
    requestHandler: async function (request, response) {
        if (request.method !== 'GET') {
            // POST, PUT, DELETE....
        }
        request.pause();

        let serverRequest = helper.makeRequestOptions(request);

        let cachedResponse =  await cache.fetch(serverRequest);

        if (cachedResponse) {
            helper.parseResponse(request, response, cachedResponse)
            let needToRefresh = await this.needToRefresh(serverRequest);
            if (needToRefresh) {
                let res = await this.processRequest(serverRequest);
                cache.refresh(serverRequest, res);
            }
        } else {
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
            http.get(request, res => {
                resolve(res);
            })
        })
    },
}