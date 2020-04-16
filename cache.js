const md5 = require('md5');
const fs = require('fs');
const helper = require('./helper');

module.exports = {
    fetch: async function (request) {
        let name = this.getCachedFileFromRequest(request);
        if (fs.existsSync(name)) {
            return fs.readFileSync(name);
        }
        return null;
    },
    set: async function (request, response) {
        if (!helper.shouldCacheResponse(response)) {
            return;
        }
        let name = this.getCachedFileFromRequest(request);
        let content = await this.getStaticContent(response);
        if (content != undefined && content != null && content != '') {
            fs.writeFileSync(name, content);
        }
    },
    getStaticContent: async function(response) {
        let body = await helper.getContentFromResponse(response);
        return body;
    },
    getCachedFileFromRequest: function (request) {
        return '/tmp/proxy_cached_' + md5(request.headers.host + ' ' + request.path);
    }
}