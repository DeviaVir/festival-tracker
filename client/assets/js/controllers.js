angular.module('defqon.controllers', ['defqon.services'])

.controller('AppCtrl', function($scope, User, Location, $location, AppAuth, $routeParams, primus) {
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

  // Get other users to show in sidebar
  $scope.users = []; $scope.userFilters = {limit: 30, order: 'created ASC'};
  User.find({filter: $scope.userFilters}, function(users) {
    $scope.users = users;
  });

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
    weight: 1,
    latlngs: [{lat: 0, lng: 0}]
  };

  $scope.currentUser.$promise.then(function() {
    $scope.sendLocation = function(position) {
      primus.send('location', {
        userId: $scope.currentUser.id,
        x: position.coords.latitude,
        y: position.coords.longitude,
        created: new Date(),
        updated: new Date()
      });
    };

    if($scope.watchID)
      navigator.geolocation.clearWatch($scope.watchID);
    $scope.watchID = null;
    if (navigator.geolocation) {
      $scope.watchID = navigator.geolocation.watchPosition(function watchPosition(position) {
        $scope.sendLocation(position);
      }, function watchError(error) {
        console.log(error);
      }, { timeout: 200000, enableHighAccuracy: true });
    }
    else {
      console.log('no navigator.geolocation');
    }

    $scope.mapUserId = $scope.currentUser.id || 0;
    $scope.mapUserName = $scope.currentUser.name || '';

    if('userId' in $routeParams)
      $scope.mapUserId = $routeParams.userId;
    if('userName' in $routeParams)
      $scope.mapUserName = $routeParams.userName;

    $scope.mapUserId = parseInt($scope.mapUserId, 10);
    $scope.locationFilters = {
      where: {
        userId: $scope.mapUserId
      },
      limit: 5,
      order: 'created DESC'
    };
    $scope.getLocation = function() {
      console.log('Update the map');

      // receive incoming map msgs
      primus.$on('map', function (data) {
        console.log(data);
      });

      // @todo: use a socket for this
      Location.find({filter: $scope.locationFilters}, function(locations) {
        $scope.tPaths = [];
        $scope.count = 0;
        locations.forEach(function(c) {
          if($scope.count === 0) {
            $scope.markers['user'].lat = parseFloat(c.x);
            $scope.markers['user'].lng = parseFloat(c.y);
            $scope.markers['user'].message = $scope.mapUserName;
          }

          $scope.tPaths.push({
            lat: parseFloat(c.x), lng: parseFloat(c.y)
          });
          $scope.count++;
        });
        $scope.paths['p1'].latlngs = $scope.tPaths;
      });
    };
    $scope.getLocation();
    //$scope.getLocationInterval = setInterval($scope.getLocation, 10000);
  });

  angular.extend($scope, {
    center: {
      lat: 52.4361702,
      lng: 5.7484867,
      zoom: 10 //15 // = perfect defqon
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
