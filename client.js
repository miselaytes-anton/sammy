var dgram = require('dgram');
var client = dgram.createSocket('udp4');
var keypress = require('keypress');
var config = require('./config');

var PORT = config.port;
var HOST = config.host;



// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
var message = null, command = 'stop';
// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
        client.close();
        process.exit();
    }
    switch(key.name){
        case 'left':
            command = 'left';
            break;
        case 'right':
            command = 'right';
            break;
        case 'up':
            command = 'straight';
            break;
        case 'down':
            command= 'stop';
            break;
    }
    message = new Buffer(command);
    client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) throw err;
        console.log(command);
    });
});
process.stdin.setRawMode(true);
process.stdin.resume();
