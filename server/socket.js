// Initiate
var loopback  = require('loopback');
var app       = module.exports = loopback();
app.boot(__dirname);

// Socket stuff
var Primus  = require('primus');
var Emitter = require('primus-emitter');
var Res     = require('primus-resource');
var http    = require('http');

// Resources
var DataSource  = require('loopback-datasource-juggler').DataSource;
var ds          = new DataSource('mysql');
var Location    = ds.define('Location', LocationDefinition);

// Start up
var server = http.createServer().listen(app.get('socket.port')),
    primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });

// Set up primus defaults
primus.use('emitter', Emitter).use('multiplex', 'primus-multiplex').use('resource', Res);

// Listen for connections
console.log('Socket listening on %s', app.get('socket.port'));
primus.on('connection', function (spark) {
  console.log('Detected connection');

  // receive incoming location updates
  spark.on('location', function (data) {
    console.log('location', data); // => ping-pong
    console.log('Creating location');

    // Create the entries
    Location.create(data, function (result) {
      console.log('Location updated: ', result);
    });

    // Send the update to interested parties (auto-updating their map)
    spark.send('map', 'Data received');
  });
});