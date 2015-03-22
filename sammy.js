var rpio = require('rpio');
var async = require('async');

function Sammy(options){
    var self = this;
    var m1 = 4; // left wheel
    var m4 = 7; // right wheel

    rpio.setMode('gpio');
    rpio.setOutput(m1);
    rpio.setOutput(m4);

    self.timeout = null;

    this.listen = function(message, remote){
        if (self.timeout){
            clearTimeout(self.timeout);
        }
        var command = message.toString();
        // if at least one motor is on -turn both off
        if ( command === 'stop' ){
            rpio.write(m1, rpio.LOW);
            rpio.write(m4, rpio.LOW);
        }
        // if message is left - turn motor 4 off, leave motor 1 on
        else if ( command === 'left' ) {
            rpio.write(m1, rpio.HIGH);
            rpio.write(m4, rpio.LOW);
            self.timeout = setTimeout(function(){
                straight();
            },400);
        }
        // if message is right - turn motor 1 off, leave motor 4 on
        else if ( command === 'right'  ) {
            rpio.write(m1, rpio.LOW);
            rpio.write(m4, rpio.HIGH);
            self.timeout = setTimeout(function(){
                straight();
            },400);
        }
        // otherwise- both on
        else if ( command === 'straight'  ){
            straight();
        }
    };

    function straight(){
        rpio.write(m1, rpio.HIGH);
        rpio.write(m4, rpio.HIGH);
    }

    function turn(deg){
        if (!deg){
            return;
        }
        // + -> right
        if (deg > 0){
            rpio.write(m1, rpio.HIGH);
            rpio.write(m4, rpio.LOW);
        }
        // - -> left
        else{
            rpio.write(m1, rpio.LOW);
            rpio.write(m4, rpio.HIGH);
        }
        // assume 30 deg is 100 ms
        //var delay = 100 *(Math.floor(Math.abs(deg)/30));
        var delay = 100;
        var numTimes = (Math.floor(Math.abs(deg)/30));

        async.timesSeries(numTimes, function(n, next){
            self.timeout = setTimeout(function(){
                console.log('n');
                stop();
                next();
            }, delay);
        }, function(err, users) {
            console.log('finished');
        });

    }
    function stop(){
        rpio.write(m1, rpio.LOW);
        rpio.write(m4, rpio.LOW);
    }
    self.commands = {
        turn: turn,
        stop: stop,
        straight: straight
    };
}



module.exports = Sammy;
