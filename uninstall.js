let Service = require('node-windows').Service;

// Criando um novo Servico windows
let svc = new Service({
    name:'LienceSoft - Impressora',
    description: 'Serviço Node.js para integrar aplicações web com impressora local.',
    script: require('path').join(__dirname, 'server/server.js')
});

// Listen for the "uninstall" event, which indicates the
// process is available as a service.
svc.on('uninstall',function(){
    console.log('Desinstalacao realizada com sucesso!')
});

svc.uninstall();