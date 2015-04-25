var _ = require('lodash'),
    async = require('async'),
    i2c = require('i2c');

// settings
var addressAccelerometer = 0x1C;
var addressCompass = 0x0E;
var gPerCount = 2.0 / 128; // Number of G represented by the LSB of the accelerometer at the current sensitivity
var busNumber = 1; // Check here for Rev 1 vs Rev 2 and select the correct bus

var accelerometer = new i2c(addressAccelerometer, {device: '/dev/i2c-1'}); // to determine device adress do: sudo i2cdetect -y 1 OR sudo i2cdetect -y 0 , and see which one works


function init(callback){
    console.log('Loading XLoBorg on bus ', busNumber);

    // bus = smbus.SMBus(busNumber)  // open the bus

    async.series([
        function(callback){
            // Check for accelerometer
            accelerometer.readByte(function(err, res) {
                if (err){
                    console.log('Missing accelerometer at ', addressAccelerometer);
                    callback(err);
                }
                else {
                    console.log('Found accelerometer at ', addressAccelerometer);
                    initAccelometer(callback);
                }
            });
        },
        function(callback){
            // todo: Check for compass
            callback();
        }
    ], function(err){
        callback(err);
    });
}
function initAccelometer(callback){

    //  Initialises the accelerometer on bus to default states

    // Setup mode configuration
    var register = 0x2A,           // CTRL_REG1
        data =  (0 << 6);          // Sleep rate 50 Hz
        data |= (0 << 4);          // Data rate 800 Hz
        data |= (0 << 2);          // No reduced noise mode
        data |= (1 << 1);          // Normal read mode
        data |= (1 << 0);          // Active
    async.series([
        function(callback){
            accelerometer.writeBytes(register, data, function(err) {
                if (err){
                    console.log('Failed sending CTRL_REG1!');
                    callback(err);
                }
                else {
                    console.log('ok sending CTRL_REG1');
                    callback();
                }
            });
        },
        function(callback){
            // Setup range
            register = 0x0E;             // XYZ_DATA_CFG
            data = 0x00;                 // Range 2G, no high pass filtering
            accelerometer.writeBytes(register, data, function(err) {
                if (err){
                    console.log('Failed sending XYZ_DATA_CFG!');
                    callback(err);
                }
                else {
                    console.log('ok sending XYZ_DATA_CFG');
                    callback();
                }
            });
        },
        function(callback){
            //System state
            register = 0x0B;             // SYSMOD
            data = 0x01;                 // Awake mode

            accelerometer.writeBytes(register, data, function(err) {
                if (err){
                    console.log('Failed sending SYSMOD!');
                    callback(err);
                }
                else {
                    console.log('Ok sending SYSMOD!');
                    callback();
                }
            });
        },
        function(callback){
            //Reset ready for reading
            register = 0x00;

            accelerometer.writeByte(register, function(err) {
                if (err){
                    console.log('Failed sending final write');
                    callback(err);
                }
                else {
                    console.log('Ok sending final write');
                    callback();
                }
            });
        }

    ], function(err){
        if (err){
            console.error( err);
            callback(err);
        }
        else{
            callback();
        }

    });


      // 2G over 128 counts
} // initAccellerometer

function readAccelerometer(callback){
    accelerometer.readBytes(0, 4, function(err, res) {

        // result contains a buffer of bytes
        // http://stackoverflow.com/questions/621290/what-is-the-difference-between-signed-and-unsigned-variables
        if (err){
            console.log(err);
            callback(err);
        }
        else {
            //console.log(res);
            // read as signed
            var buf = new Buffer(res);
            var arr = [buf.readInt8(1), buf.readInt8(2), buf.readInt8(3)];
            arr = _.map(arr, function(num){
                return num * gPerCount;
            });
            /*
            / read as unsigned
            var bufArray = _.toArray(new Uint8Array(res));
            bufArray = _.map(bufArray, function(num){
               return num * gPerCount;
            });
            */
            callback(null, arr);
        }
    });
}

//public

module.exports = {
    init: init,
    readAccelerometer: readAccelerometer,
    test: function(callback){
        async.series([
            function(callback){
                init(callback);
            },
            function(callback){
                async.forever(
                    function(next) {
                        readAccelerometer(function(err, arr){
                            console.log(arr);
                            setTimeout(function(){
                                next();
                            }, 300);
                        });
                    },
                    function(err) {
                        console.error(err);
                        // if next is called with a value in its first parameter, it will appear
                        // in here as 'err', and execution will stop.
                    }
                );
            }
        ]);
    }
};


