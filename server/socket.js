var loopback = require('loopback');
var Primus = require('primus');
var Emitter = require('primus-emitter');
var Res = require('primus-resource');
var http = require('http');
var Location = loopback.getModel('Location');

var server = http.createServer().listen(app.get('socket.port')),
    primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });
    
primus.use('emitter', Emitter).use('multiplex', 'primus-multiplex').use('resource', Res);

console.log('Socket listening on %s%s', baseUrl.replace(app.get('port'), ''), app.get('socket.port'));
primus.on('connection', function (spark) {
  console.log('Detected connection');

  // receive incoming sport messages
  spark.on('location', function (data) {
    console.log('location', data); // => ping-pong
    console.log('Creating location');

    Location.create(data, function (result) {
      console.log('Location updated: ', result);
    });

    spark.send('map', 'Data received');
  });
});