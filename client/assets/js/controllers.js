angular.module('defqon.controllers', ['defqon.services'])

.controller('AppCtrl', function($scope, User, Location, $location, AppAuth) {
  AppAuth.ensureHasCurrentUser(User);
  $scope.currentUser = AppAuth.currentUser;

  $scope.options = [
    {text: 'Logout', action: function() {
      User.logout(function() {
        $scope.currentUser =
        AppAuth.currentUser = null;
        $location.path('/');
      });
    }}
  ];

  $scope.toggleLeft = function() {
    $scope.sideMenuController.toggleLeft();
  };

  $scope.markers = {};
  $scope.markers['user'] = {
    lat: 0,
    lng: 0,
    message: 'Name',
    focus: false,
    draggable: false
  };
  $scope.paths = {};
  $scope.paths['p1'] = {
    color: '#937b58',
    weight: 8,
    latlngs: [{lat: 0, lng: 0}]
  };
  Location.find({where: {userId: $scope.currentUser.id}, limit: 10}, function(locations) {
    $scope.tPaths = [];
    $scope.count = 0;
    locations.forEach(function(c) {
      if($scope.count === 0) {
        $scope.markers['user'].lat = parseFloat(c.x);
        $scope.markers['user'].lng = parseFloat(c.y);
        $scope.markers['user'].message = $scope.currentUser.name;
      }

      $scope.tPaths.push({
        lat: c.x, lng: c.y
      });
      $scope.count++;
    });
    $scope.paths['p1'].latlngs = $scope.tPaths;

    $scope.currentUser.locations = locations;
  });

  angular.extend($scope, {
    center: {
      lat: 52.4361702,
      lng: 5.7484867,
      zoom: 15
    },
    defaults: {
      scrollWheelZoom: false,
      tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true,
      }
    },
    markers: $scope.markers,
    paths: $scope.paths
  });

  $scope.sendLocation = function(position) {
    Location.create({
      userId: $scope.currentUser.id,
      x: position.coords.latitude,
      y: position.coords.longitude,
      created: new Date(),
      updated: new Date()
    }, function (err, result) {
      console.log('Location record is created: ', result);
    })
  };

  var watchID = null;
  document.addEventListener("deviceready", onDeviceReady, false);
  //
  // Cordova is ready
  //
  function onDeviceReady() {
    if (navigator.geolocation) {
      var watchID = navigator.geolocation.watchPosition(function watchPosition(position) {
        $scope.sendLocation(position);
      }, function watchError(error) {
        console.log(error);
      }, { timeout: 60000, enableHighAccuracy: true });
    }
  }

  if (navigator.geolocation) {
    var watchID = navigator.geolocation.watchPosition(function watchPosition(position) {
      $scope.sendLocation(position);
    }, function watchError(error) {
      console.log(error);
    }, { timeout: 60000, enableHighAccuracy: true });
  }
})

.controller('LoginCtrl', function($scope, $routeParams, User, $location, AppAuth) {
  $scope.registration = {};
  $scope.credentials = {
    email: 'foo@bar.com',
    password: '123456'
  };

  $scope.login = function() {
    $scope.loginResult = User.login({include: 'user', rememberMe: true}, $scope.credentials,
      function() {
        var next = $location.nextAfterLogin || '/';
        $location.nextAfterLogin = null;
        AppAuth.currentUser = $scope.loginResult.user;
        $location.path(next);
      },
      function(res) {
        $scope.loginError = res.data.error;
      }
    );
  };
  $scope.register = function() {
    $scope.user = User.save($scope.registration,
      function() {
        // success
      },
      function(res) {
        $scope.registerError = res.data.error;
      }
    );
  };
});
