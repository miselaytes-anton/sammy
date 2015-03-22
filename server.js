var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var Sammy = require('./sammy');
var config = require('./config');

var PORT = config.port;
var HOST = config.host;
var sammy = new Sammy();

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":");
});
server.on('message', sammy.listen);
server.bind(PORT, HOST);

