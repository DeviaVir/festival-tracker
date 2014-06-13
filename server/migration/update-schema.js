var app = require('./app');
var ds = app.dataSource.mysql;

var Location = app.models.Location;
var User = app.models.User;
var Crew = app.models.Crew;
var AccessToken = app.models.AccessToken;

ds.autoupdate('location', function (err, result) {
    ds.discoverModelProperties(Location, function (err, props) {
        console.log(props);
    });
});

ds.autoupdate('user', function (err, result) {
    ds.discoverModelProperties(User, function (err, props) {
        console.log(props);
    });
});

ds.autoupdate('crew', function (err, result) {
    ds.discoverModelProperties(Crew, function (err, props) {
        console.log(props);
    });
});

ds.autoupdate('accessToken', function (err, result) {
    ds.discoverModelProperties(AccessToken, function (err, props) {
        console.log(props);
    });
});