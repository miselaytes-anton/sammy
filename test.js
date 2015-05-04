'use strict';

var _ = require('lodash'),
    //xloborg = require('./lib/xloborg'),
    player = require('./lib/player').player,
    sequence = require('./lib/player').sequence,
    chords = require('./lib/player').chords;


registerExit();
//console.log(chords(2));
player.play(chords(3));


setInterval(function(){
    //player.stop();
    player.play(chords(3));
},1000);









function registerExit(){
    process.on('SIGINT', function() {
        //console.log('Nice SIGINT-handler');
        var listeners = process.listeners('SIGINT');
        for (var i = 0; i < listeners.length; i++) {
            console.log(listeners[i].toString());
        }

        process.exit();
    });
}