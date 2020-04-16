const http = require('http');
const config = require('./config');
const proxy = require('./proxy');
const port = config.PORT;

const server = http.createServer(((req, res) => {
    try {
        proxy.requestHandler(req, res)
    } catch (e) {
        res.writeHead(500, {})
    }
}))

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening http on ${port}`)
})

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});