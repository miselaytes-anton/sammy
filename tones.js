var xloborg = require('./lib/xloborg'),
    async = require('async'),
    player = require('./lib/player').player,
    chords = require('./lib/player').chords,
    sequence = require('./lib/player').sequence;

async.series([
    function (cb) {
        xloborg.init(cb);
    },
    function (cb) {
        async.forever(function (cb) {
            xloborg.readCompass(function (err, arr) {
                var soundsArr = prepare(arr);
                var sound = player.sequence(soundsArr[0], soundsArr[1], soundsArr[2]);
                if (err) {
                    cb(err);
                }
                else {
                    player.play(sound);
                    setTimeout(cb, 3000);
                }
            });
        }, function (err) {
            console.error(err);
        });
    }

]);


//var arr = prepare([-381, -354, 1068]);
function prepare(arr) {
    return arr.map(function (num) {
        return Math.floor(Math.abs(num) / 4);
    });
}