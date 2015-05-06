var baudio = require('baudio');
/*
var Speaker = require('speaker');
 var speaker = new Speaker({
 channels: 2,          // 2 channels
 bitDepth: 16,         // 16-bit samples
 sampleRate: 44100     // 44,100 Hz sample rate
 });
 */
var spawn = require('child_process').spawn;
var aplay = spawn('aplay', [ '-r', '44k', '-c', '2', '-f', 'S16_LE' ]);

var bucket = 0;

var step = 0;
var zero = false;

var b =baudio(function (t) {
    var n = t;
    var f = 350;
    var x = Math.sin(n * f);
    var volume = (Math.sin(t) + 1) / 2;

    bucket ++;
    zero = bucket < 1 / volume;
    if (!zero) bucket = 0;

    return !zero * x;
});
b.play();
