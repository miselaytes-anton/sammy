var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var Sammy = require('./sammy');

var PORT = 3000;
var HOST = '192.168.0.17';
var sammy = new Sammy();

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":");
});
server.on('message', sammy.listen);
server.bind(PORT, HOST);

