'use strict';

var _ = require('lodash'),
    tone = require("tonegenerator"),
    Speaker = require('speaker'),
    Readable = require('stream').Readable,
    nextTick = typeof setImmediate !== 'undefined'? setImmediate : process.nextTick;

module.exports = {
    player: new Player(),
    chords: randomChords,
    sequence: createSequence
};

function Player (){
    var self = this;
    self.isPlaying=false;
    self.sound = null;
    self.count= 0;
    // Create the Speaker instance
    var speaker = new Speaker({
        channels: 2,          // 2 channels
        bitDepth: 16,         // 16-bit samples
        sampleRate: 44100     // 44,100 Hz sample rate
    });

    var rs = Readable({ objectMode: true });
    rs._read = function (bytes) {
       /*
       //alternative read
        var buf = new Buffer(16);
        var n;
        for (var i = 0; i < buf.length-1; i ++) {
        if (!self.sounds.length){
        rs.push( null );
        }
        n = self.sounds.shift();
        buf.writeInt16LE(clamp(signed(n)), i);
        }
        if ( ! self.sounds.length ) {

        rs.push( null );
        console.log('IMPOSSIBLE JUST HAPPENED');
        return;

        }

        nextTick(function () {  rs.push(buf); });
        */
        nextTick(function () {  rs.push(new Buffer(self.sound)); });

    };
    speaker.on('error', function(err){
        //throw new Error(err);
        console.error(err);
        self.stop();
        setTimeout(function(){
            self.play(self.sound)
        }, 2000)

    });
    self.play = function(sound){
        self.sound = sound;
        self.count++;
        if (!self.isPlaying){
            rs.pipe(speaker);
            self.isPlaying=true;
        }

    };
    self.stop = function(){
        rs.push(null);
        self.isPlaying =false;
    }
}

function createChord(t1, t2, t3){
    var duration = 0.5;
    console.log(t1, t2, t3);
    // http://www.phy.mtu.edu/~suits/notefreqs.html
    var tone1 = tone(t1, duration);
    var tone2 = tone(t2, duration);
    var tone3 = tone(t3, duration);
    var res = [];
    // By adding values of the tones for each sample,
    // we play them simultaneously, as a chord
    for(var i = 0; i < tone1.length; i++) {
        res.push(tone1[i] + tone2[i] + tone3[i]);
    }
    return res;
}
function createSequence(t1, t2, t3){
    //console.log(t1, t2, t3);
    // http://www.phy.mtu.edu/~suits/notefreqs.html
    var tone1 = tone(t1, 2);
    var tone2 = tone(t2, 2);
    var tone3 = tone(t3, 2);
    var res = tone1.concat(tone2).concat(tone3);
    return res;
}


function randomChords(n){

    var tones = [
        16.35,
        17.32,
        18.35,
        19.45,
        20.60,
        21.83,
        23.12,
        24.50,
        25.96,
        27.50,
        29.14,
        30.87,
        32.70,
        34.65,
        36.71,
        38.89,
        41.20,
        43.65,
        49.00,
        51.91,
        55.00,
        58.27,
        61.74,
        65.41,
        69.30,
        73.42,
        77.78,
        82.41,
        87.31,
        92.50,
        98.00,
        103.83,
        110.00,
        116.54,
        123.47,
        130.81,
        138.59,
        146.83,
        155.56,
        164.81,
        174.61,
        185.00,
        196.00,
        207.65,
        220.00,
        233.08,
        246.94,
        261.63,
        277.18,
        293.66,
        311.13,
        329.63,
        349.23,
        369.99,
        392.00,
        415.30,
        440.00,
        466.16,
        493.88,
        523.25,
        554.37,
        587.33,
        622.25,
        659.25,
        698.46,
        739.99,
        783.99,
        830.61,
        880.00,
        932.33,
        987.77
        /*,
         1046.50,
         1108.73,
         1174.66,
         1244.51,
         1318.51,
         1396.91,
         1479.98,
         1567.98,
         1661.22,
         1760.00,
         1864.66,
         1975.53,
         2093.00,
         2217.46,
         2349.32,
         2489.02,
         2637.02,
         2793.83,
         2959.96,
         3135.96,
         3322.44,
         3520.00,
         3729.31,
         3951.07,
         4186.01,
         4434.92,
         4698.63,
         4978.03,
         5274.04,
         5587.65,
         5919.91,
         6271.93,
         6644.88,
         7040.00,
         7458.62,
         7902.13
         */
    ];

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    var chords = [];
    for (var i =0;i<n;i++){
        chords = chords.concat( createChord( tones[getRandomInt(0, tones.length)], tones[getRandomInt(0, tones.length)], tones[getRandomInt(0, tones.length)] ));
    }

    return chords;
}
