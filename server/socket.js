var app = require('./app');
var Location = app.models.Location;

// Socket stuff
var Primus  = require('primus');
var Emitter = require('primus-emitter');
var Res     = require('primus-resource');
var http    = require('http');

// Start up
var server = http.createServer().listen(20002),
    primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });

// Set up primus defaults
primus.use('emitter', Emitter).use('multiplex', 'primus-multiplex').use('resource', Res);

// Listen for connections
console.log('Socket listening on %s', 20002);
primus.on('connection', function (spark) {
  console.log('Detected connection');

  spark.on('update', function(data) {
    console.log('Received update request');
    // Send all known data
    Location.find({'filter': {'limit': 100, 'order': 'created ASC'}}, function(result, data) {
      spark.send('map', data);
    });
  });

  // receive incoming location updates
  spark.on('location', function (data) {
    console.log('location', data); // => ping-pong
    console.log('Creating location');

    // Create the entries
    Location.create(data, function (result, data) {
      console.log('Location updated: ', result);

      // Send the update to interested parties (auto-updating their map)
      spark.send('map', data);
    });
  });
});