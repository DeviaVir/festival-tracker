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

  if(typeof $scope.currentUser.$promise == 'undefined') {
    window.location.reload();
  }
  else {
    $scope.currentUser.$promise.then(function() {
      // Get other users to show in sidebar
      $scope.users = [];
      User.find({filter: {limit: 30, order: 'created ASC'}}, function(users) {
        $scope.users = users;
      });

      // Function used to send current location on change
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

      // Create the map
      $scope.mapUserId = $scope.currentUser.id || 0;
      $scope.mapUserName = $scope.currentUser.name || '';

      if('userId' in $routeParams)
        $scope.mapUserId = $routeParams.userId;
      if('userName' in $routeParams)
        $scope.mapUserName = $routeParams.userName;

      $scope.mapUserId = parseInt($scope.mapUserId, 10);
      $scope.tPaths = [];
      $scope.getLocation = function() {
        console.log('Update the map');

        // receive incoming map msgs
        $scope.locations = [];
        primus.$on('map', function (data) {
          $scope.markers['user'].lat = parseFloat(data.x);
          $scope.markers['user'].lng = parseFloat(data.y);
          $scope.markers['user'].message = $scope.mapUserName;
          $scope.locations.push(data);
          
          $scope.locations.forEach(function(c) {
            $scope.tPaths.push({
              lat: parseFloat(c.x), lng: parseFloat(c.y)
            });
          });
          $scope.paths['p1'].latlngs = $scope.tPaths;
        });
      };
      $scope.getLocation();
    });
  }

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
})

.controller('InviteCtrl', function($scope, User, Location, $location, AppAuth, $routeParams, primus) {
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

  $scope.invite = function() {
    $scope.inviteResult = function() {
      // Send an e-mail via backend
      return true;
    };
  };
})

.controller('LoginCtrl', function($scope, $routeParams, User, $location, AppAuth) {
  $scope.registration = {};

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
        $scope.registerSuccess = true;
      },
      function(res) {
        $scope.registerError = res.data.error;
      }
    );
  };
});
