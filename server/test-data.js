var app = require('./app');
var dataSource = app.dataSources.db;

var User = app.models.user;
var users = [
    { email: "foo@bar.com",
      emailVerified: true,
      name: "foo",
      username: "Foo",
      password: "foo",
      created: new Date(),
      modified: new Date()
    }];
var count = users.length;
dataSource.automigrate('user', function (err) {
  users.forEach(function(usr) {
    User.create(usr, function(err, result) {
      if(!err) {
        console.log('Record created:', result);
        count--;
        if(count === 0) {
          console.log('done');
          dataSource.disconnect();
        }
      }
    });
  });
});

/*var Location = app.models.location;
var locations = [
    { x: 0,
      y: 0,
      userId: 1,
      created: new Date(),
      modified: new Date()
    }, {
      x: 0,
      y: 0,
      userId: 1,
      created: new Date(),
      modified: new Date()
    }];
var count = locations.length;
dataSource.automigrate('location', function (err) {
  locations.forEach(function(loc) {
    Location.create(loc, function(err, result) {
      if(!err) {
        console.log('Record created:', result);
        count--;
        if(count === 0) {
          console.log('done');
          dataSource.disconnect();
        }
      }
    });
  });
});*/