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

  var tilesDict = {
    openstreetmap: {
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    },
    opencyclemap: {
      url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
      options: {
        attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
      }
    }
  };

  angular.extend($scope, {
    center: {
      lat: 52.4311702,
      lng: 5.7474867,
      zoom: 13
    },
    tiles: tilesDict.opencyclemap,
    defaults: {
      scrollWheelZoom: false,
      tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true,
      }
    }
  });
  Location.find({where: {userId: $scope.currentUser.id}, limit: 10}, function(locations) {
    var username = $scope.currentUser.name;
    var scope = $scope;
    var paths = [];
    var count = 0;
    var marker = {};
    locations.forEach(function(c) {
      if(count === 0) {
        marker = {
          lat: c.x,
          lng: c.y,
          message: username,
          focus: false,
          draggable: false
        };
      }

      paths.push({
        lat: c.x, lng: c.y
      });
      count++;
    });
    var data = {
      paths: {
        p1: {
          color: '#ccc',
          weight: 5,
          latlngs: paths
        }
      },
      markers: {
        userMarker: marker
      }
    };
    angular.extend(scope, data);
  });
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
  }
  $scope.register = function() {
    $scope.user = User.save($scope.registration,
      function() {
        // success
      },
      function(res) {
        $scope.registerError = res.data.error;
      }
    );
  }
});
