'use strict';

let loopback = require('loopback');
let boot = require('loopback-boot');

let http = require("http");
let app = module.exports = loopback();

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

app.start = function () {
    let server = http.createServer(app);

    // start the web server
    server.listen(app.get('port'), function () {
        app.emit('started');
        // let baseUrl = 'http://' + app.get('host') + ':' + app.get('port');
        let baseUrl = 'http://' + '192.168.86.29' + ':' + app.get('port');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            let explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
    return server;
};

app.get('/', function(req, res){


    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: '\\\\.\\LPT2'
    });

    printer.alignCenter();
    printer.println("Hello world");
    // await printer.printImage('./assets/olaii-logo-black.png')
    printer.cut();

    try {
        let execute = printer.execute()
        console.error("Print done!");
    } catch (error) {
        console.log("Print failed:", error);
    }
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module) {
        //app.start();
        console.log('---------- subindo socket io');
        app.io = require("socket.io")(app.start());
        console.log('---------- subindo socket io');


        app.io.on("connection", function (socket) {

            console.log('an user connected');
        });
    }
});
