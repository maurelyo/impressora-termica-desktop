var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello Node.JS!');
}).listen(8008);
console.log('Server running at http://localhost:8008/');


'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var http = require('http');
var https = require('https');
var sslConfig = require('./ssl-config');

var app = module.exports = loopback();

app.start = function (httpOnly) {
    console.log("ambiente: " + process.env.NODE_ENV);
    if (httpOnly === undefined) {
        httpOnly = process.env.HTTP;
    }
    var server = null;

    httpOnly = false;
    if (process.env.NODE_ENV == 'local') {
        httpOnly = true;
    }

    if (!httpOnly) {
        var options = {
            key: sslConfig.privateKey,
            cert: sslConfig.certificate,
            rejectUnauthorized: false,
            secure: false
        };
        if (process.env.NODE_ENV == 'production') {
            options.ca = sslConfig.ca;
            options.rejectUnauthorized = true;
            options.secure = true;
        }
        server = https.createServer(options, app);
    } else {
        server = http.createServer(app);
    }
    // start the web server
    server.listen(app.get('port'), function () {
        app.emit('started');
        var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
    return server;
};

/**
 * Fica revalidando se a conexao do usuario esta ativa
 */
var interval = null;
var connectTestToken = function (data, socket) {
    var time = 10000;
    if (interval != null) {
        clearInterval(interval);
    }

    interval = setInterval(function () {
        var usuario = app.models.Usuario;
        var date = new Date;
        if (!data.token) {
            socket.emit("withoutToken");
            desconectarSocket(socket, interval);
            return;
        }

        usuario.findByToken(data.token, data.idUsuario).then(
            function (user) {
                return;
            },
            function (err) {
                console.log(err);
                socket.emit("withoutToken");
                desconectarSocket(socket, interval);
            }
        );
    }, time);
};

var desconectarSocket = function (socket, interval) {
    clearInterval(interval);
    socket.disconnect();

};

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

            socket.on("tokenTest", function (data) {
                connectTestToken(data, socket);
            });

            socket.on("authenticate", function (data) {
                if (!data.token) {
                    return;
                }
                var usuario = app.models.Usuario;
                usuario.findByToken(data.token, data.idUsuario).then(
                    function (user) {
                        if (!user.id_usuario) {
                            console.error("Falha ao autenticar usuário");
                            return;
                        }
                        socket.user = user;
                    },
                    function (err) {
                        socket.emit("withoutToken");
                        socket.disconnect();
                    }
                );
            });
        });
    }
});
