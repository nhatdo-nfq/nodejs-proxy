const md5 = require('md5');
const fs = require('fs');

module.exports = {
    fetch: async function (request) {
        let name = this.getCachedFileFromRequest(request);
        if (fs.existsSync(name)) {
            return fs.readFileSync(name);
        }
        return null;
    },
    set: async function (request, response) {
        if (response.statusCode != 200) {
            // only cache page with status code 200
            return;
        }
        let name = this.getCachedFileFromRequest(request);
        let content = await this.getStaticContent(request, response);
        fs.writeFileSync(name, content);
    },
    getContentFromResponse: function(request, response) {
        var body = '';
        return new Promise((resolve) => {
            response.on('data', function (chunk) {
                body += chunk;
            })

            response.on('end', function () {
                resolve(body);
            });
        });
    },
    getStaticContent: async function(request, response) {
        let body = await this.getContentFromResponse(request, response);
        return body;
    },
    getCachedFileFromRequest: function (request) {
        return '/tmp/proxy_cached_' + md5(request.headers.host + ' ' + request.path);
    }
}