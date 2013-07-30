'use strict';

/* Controllers */

var controllers = {
  WelcomeController: function($scope, $location, MeteringConcept, Customer) {
    $scope.meteringConcepts = MeteringConcept.all();

    $scope.new = function() {
      MeteringConcept.save({createdAt: new Date(), updatedAt: new Date()}, function(doc) {
        console.log("Created concept", doc);
        Customer.create(doc._id);
        $location.path('/meteringConcepts/' + doc._id);
      })
    };

    $scope.details = function(id) {
      $location.path('/meteringConcepts/' + id);
    };

    $scope.delete = function(id) {
      var ix;
      for (var i in $scope.meteringConcepts) {
        if ($scope.meteringConcepts[i]._id == id) {
          ix = i;
        }
      }
      MeteringConcept.delete(id, function() {
        $scope.meteringConcepts.splice(ix, 1);
      });

    }
  },

  MeteringConceptController: function($scope, $routeParams, MeteringConcept) {
    $scope.meteringConcept = MeteringConcept.get($routeParams._id);
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.save = function(meteringConcept) {
      MeteringConcept.save($scope.meteringConcept);
    };
   
    $scope.reset = function() {
      $scope.meteringConcept = MeteringConcept.get($routeParams._id);
    };

  },

  CustomerController: function($scope, $routeParams, Customer) {
    $scope.customer = Customer.findByMeteringConcept($routeParams._id);
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.save = function() {
      Customer.save($scope.customer[0]);
    };
   
    $scope.reset = function() {
      $scope.customer = Customer.findByMeteringConcept($routeParams._id);
    };
   
  },

  PropertyController: function($scope, $routeParams) {
    $scope.master= {};
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;
   
    $scope.update = function(customer) {
      $scope.master= angular.copy(customer);
    };
   
    $scope.reset = function() {
      $scope.customer = angular.copy($scope.master);
    };
   
    $scope.reset();
  },

  LocationsController: function($scope, $routeParams) {
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.resetLocationIdsByNumber = function() {
      $scope.locationIdsByNumber = {};
      angular.forEach($scope.locations, function(location) {
        $scope.locationIdsByNumber[location.number] = location.id;
      });
    }

    /* Validate the parents of the location and set missingParents
     * to the list of parents which don't refer to an existing location.
     */
    $scope.validateParentLocations = function(location) {
      console.log("Validating parents ", location.parentNumbers, " of location ", location.number);

      location.parents = [];
      location.missingParents = [];

      angular.forEach(location.parentNumbers, function(value) {
        var parentId = $scope.locationIdsByNumber[value];
        console.log("ParentId: ", parentId);
        if (parentId)
          location.parents.push(parentId);
        else
          location.missingParents.push(value);
        console.log(location.missingParents);
      });
      // the result are the missing parents
    };

    $scope.resetParentNumbers = function(location) {
      location.parentNumbers = [];
      angular.forEach(location.parents, function(parentId) {
        var parentNumber = $scope.locations[parentId].number;
        location.parentNumbers.push(parentNumber);
      });
    };

    $scope.updateLocationNumber = function(location) {
      $scope.resetLocationIdsByNumber();
      angular.forEach($scope.locations, function(value) {
//        $scope.resetParentNumbers(value);
        $scope.validateParentLocations(value);
      });
    };

$scope.locations = {
  "id1": {id: "id1", number: "1.00", type: "MEZ", parents: []},
  "id2": {id: "id2", number: "1.01", type: "MEZ", parents: ["id1"]},
  "id3": {id: "id3", number: "1.02", type: "MEZ", parents: ["id1", "id2"]}
};

$scope.resetLocationIdsByNumber();
angular.forEach($scope.locations, function(location) {
  $scope.resetParentNumbers(location);
});


  },


  LevelController: function($scope, $routeParams, LevelList) {
    $scope.levelList = LevelList.new();
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.setDefaults = function() {
      $scope.levelList.levels = LevelList.defaults();
    }

    $scope.new = function() {
      $scope.newLevel = {};
    };

    $scope.add = function() {
      var level = angular.copy($scope.newLevel);
      $scope.levelList.levels.push(level);
      $scope.newLevel = {};
    };

    $scope.save = function() {
      LevelList.save($scope.levelList);
    };
  }

}

angular
  .module('myApp.controllers', ['ui.validate'])
  .controller('Welcome', ['$scope', '$location', 'MeteringConcept', 'Customer', controllers.WelcomeController])
  .controller('MeteringConcept', ['$scope', '$routeParams', 'MeteringConcept', controllers.MeteringConceptController])
  .controller('Customer', ['$scope', '$routeParams','Customer', controllers.CustomerController])
  .controller('Property', ['$scope', '$routeParams', controllers.PropertyController])
  .controller('Locations', ['$scope', '$routeParams', controllers.LocationsController])
  .controller('Level', ['$scope', '$routeParams', 'LevelList', controllers.LevelController])
  ;


function MainCntl($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
}
