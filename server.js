var PORT = 3000;
var HOST = '192.168.0.17';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var rpio = require('rpio');
rpio.setMode('gpio');
rpio.setOutput(17);

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":");
});

server.on('message', function (message, remote) {
    rpio.write(17, rpio.HIGH);
});

server.bind(PORT, HOST);