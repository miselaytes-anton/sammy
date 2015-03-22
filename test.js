var Sammy = require('./sammy');
sammy = new Sammy();

var degree = parseInt(process.argv[2]) ||0;

console.log(degree);
sammy.commands.turn(degree);
