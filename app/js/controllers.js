'use strict';

/* Controllers */

var controllers = {
  WelcomeController: function($scope, $location, MeteringConcept, Customer) {
    $scope.meteringConcepts = MeteringConcept.all();

    $scope.new = function() {
      MeteringConcept.save({createdAt: new Date(), updatedAt: new Date()}, function(doc) {
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
  .module('myApp.controllers', [])
  .controller('Welcome', ['$scope', '$location', 'MeteringConcept', 'Customer', controllers.WelcomeController])
  .controller('MeteringConcept', ['$scope', '$routeParams', 'MeteringConcept', controllers.MeteringConceptController])
  .controller('Customer', ['$scope', '$routeParams','Customer', controllers.CustomerController])
  .controller('Property', ['$scope', '$routeParams', controllers.PropertyController])
  .controller('Level', ['$scope', '$routeParams', 'LevelList', controllers.LevelController])
  ;


function MainCntl($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
}
