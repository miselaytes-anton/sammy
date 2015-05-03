var baudio = require('baudio');
var spawn = require('child_process').spawn;
var n = 0;
var y = 262;
var b = baudio(function (t) {
    var x = Math.sin(t * y + Math.sin(n));
    n += Math.sin(t);
    return x;
});
b.play();

setTimeout(function(){
    var baudio2 = require('baudio');
    var n = 0;
    var c = baudio2(function (t) {
        return Math.sin(t * 400 * Math.PI * 2) + Math.sin(t * 500) * (t % 2 > 1);
    });
    c.play();
}, 2000);



