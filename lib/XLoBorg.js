var _ = require('lodash'),
    async = require('async'),
    i2c = require('i2c');

// settings
var addressAccelerometer = 0x1C;
var addressCompass = 0x0E;
var gPerCount = 2.0 / 128; // Number of G represented by the LSB of the accelerometer at the current sensitivity
var busNumber = 1; // Check here for Rev 1 vs Rev 2 and select the correct bus

var accelerometer = new i2c(addressAccelerometer, {device: '/dev/i2c-1'}); // to determine device adress do: sudo i2cdetect -y 1 OR sudo i2cdetect -y 0 , and see which one works
var compass = new i2c(addressCompass, {device: '/dev/i2c-1'}); // to determine device adress do: sudo i2cdetect -y 1 OR sudo i2cdetect -y 0 , and see which one works


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
            // Check for compass
            compass.readByte(function(err, res) {
                if (err){
                    console.log('Missing compass at ', addressAccelerometer);
                    callback(err);
                }
                else {
                    console.log('Found compass at ', addressAccelerometer);
                    initCompass(callback);
                }
            });
            callback();
        }
    ], function(err){
        callback(err);
    });
}

/*
    Initialises the accelerometer on bus to default states
 */
function initAccelometer(callback){
    var register, data;

    async.series([
        function(callback){
            // Setup mode configuration
            register = 0x2A;           // CTRL_REG1
            data =  (0 << 6);          // Sleep rate 50 Hz
            data |= (0 << 4);          // Data rate 800 Hz
            data |= (0 << 2);          // No reduced noise mode
            data |= (1 << 1);          // Normal read mode
            data |= (1 << 0);          // Active

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
} // initAccellerometer

function initCompass(callback){
    //Initialises the compass on bus to default states
    var register, data;
    async.series([
        function(callback){
            // 1.Acquisition mode
            register = 0x11;           // CTRL_REG2
            data  = (1 << 7);          // Reset before each acquisition
            data |= (1 << 5);          // Raw mode, do not apply user offsets
            data |= (0 << 5);         // Disable reset cycle
            compass.writeBytes(register, data, function(err) {
                if (err){
                    console.error('Failed sending CTRL_REG2!');
                    callback(err);
                }
                else {
                    console.log('ok sending CTRL_REG2');
                    callback();
                }
            });
        },
        function(callback){
            // 2. System operation
            register = 0x10;             // CTRL_REG1
            data  = (0 << 5);            // Output data rate (10 Hz when paired with 128 oversample)
            data |= (3 << 3);            // Oversample of 128
            data |= (0 << 2);            // Disable fast read
            data |= (0 << 1);            // Continuous measurement
            data |= (1 << 0);            // Active mode
            compass.writeBytes(register, data, function(err) {
                if (err){
                    console.error('Failed sending CTRL_REG1!');
                    callback(err);
                }
                else {
                    console.log('ok sending CTRL_REG1');
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
}

/*
    Reads the X, Y and Z axis raw magnetometer readings
 */
function readCompass(callback){
    // Read the data from the compass chip
    async.series([
        function(callback){
            compass.writeByte(0x00, callback);
        },
        function(){
            compass.readBytes(0, 18, function(err, res) {

                if (err){
                    console.log(err);
                    callback(err);
                }
                else {
                    //console.log(res);
                    // read as signed
                    var buf = new Buffer(res);
                    var arr = [];
                    for (var i=1; i<=6; i++){
                        arr.push(buf.readInt8(i))
                    }
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
    ]);
    /*


     try:
     bus.write_byte(addressCompass, 0x00)
     [status, xh, xl, yh, yl, zh, zl, who, sm, oxh, oxl, oyh, oyl, ozh, ozl, temp, c1, c2] = bus.read_i2c_block_data(addressCompass, 0, 18)
     except:
     Print('Failed reading registers!')
     status = 0
     xh = 0
     xl = 0
     yh = 0
     yl = 0
     zh = 0
     zl = 0

     # Convert from unsigned to correctly signed values
     bytes = struct.pack('BBBBBB', xl, xh, yl, yh, zl, zh)
     x, y, z = struct.unpack('hhh', bytes)

     return x, y, z
     */

}


function readAccelerometer(callback){
    //Reads the X, Y and Z axis force, in terms of Gs

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
    readCompass: readCompass,
    test: function(callback){
        async.series([
            function(callback){
                init(callback);
            },
            function(callback){
                async.forever(
                    function(next) {
                        var result = {};
                        async.series([
                            function(cb){
                                readAccelerometer(function(err, arr){
                                    if (err){
                                        return cb(err);
                                    }
                                    result.accelerometer = arr;
                                    cb();
                                });
                            },
                            function(cb){
                                readCompass(function(err, arr){
                                    if (err){
                                        return cb(err);
                                    }
                                    result.compass = arr;
                                    cb();

                                });
                            }
                        ], function(err){
                            if (err){
                                return next(err);
                            }
                            console.log(result);
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


