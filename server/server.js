'use strict';

let loopback = require('loopback');
let boot = require('loopback-boot');
let http = require("http");
let app = module.exports = loopback();
let EventLogger = require('node-windows').EventLogger;

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

// Configuracao da impressora
let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,       // FABRICANTE DA IMPRESSORA
    interface: '\\\\.\\LPT2',       // PORTA VIRTUAL LOCAL
    removeSpecialCharacters: true
});
// Log do Windows
let log = new EventLogger('LienceSoft - Impressora');

app.start = function () {
    // start the web server
    let server = http.createServer(app);
    return server.listen(app.get('port'), function() {
        app.emit('started');
        let baseUrl = app.get('protocol') + app.get('host').replace(/\/$/, '') + ':' + app.get('port');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            let explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

app.post("/", function(req, res) {
    let params = req.body;

    try {
        printer.alignCenter();
        printer.print(params.conteudo);
        printer.cut();

        printer.execute().then(() => {
            res.end();
        });
        printer.clear();
    } catch (error) {
        log.error('Falha ao imprimir: ', error);
        res.end();
    }
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.io = require("socket.io")(app.start());
    if (err) throw err;
});
