'use strict';

var _ = require('lodash'),
    //xloborg = require('./lib/xloborg'),
    player = require('./lib/player').player,
    sequence = require('./lib/player').sequence,
    chords = require('./lib/player').chords;


registerExit();
//console.log(chords(2));
player.play(chords(20));


setInterval(function(){
    //player.stop();
    player.play(chords(20));
},3000);
//todo:
/*
- check if sox works on raspberry
try baudio on raspberry
think of hot the controls should work and how the audio should be generated
try with a different buffer length
transform streams
publish xloborg
in fact should just decide what needs to be done exactly and then adjust read function accordingly
try flocking
 */








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