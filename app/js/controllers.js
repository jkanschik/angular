'use strict';

/* Controllers */

var controllers = {
  CustomerController: function($scope, Customer) {
    $scope.customer = Customer.new();

    $scope.save = function(customer) {
      Customer.save($scope.customer);
    };
   
    $scope.reset = function() {
      $scope.customer = Customer.get();
    };
   
  },

  PropertyController: function($scope) {
    $scope.master= {};
   
    $scope.update = function(customer) {
      $scope.master= angular.copy(customer);
    };
   
    $scope.reset = function() {
      $scope.customer = angular.copy($scope.master);
    };
   
    $scope.reset();
  },

  LevelController: function($scope, LevelList) {
    $scope.levelList = LevelList.new();

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
  .controller('Customer', ['$scope', 'Customer', controllers.CustomerController])
  .controller('Property', ['$scope', controllers.PropertyController])
  .controller('Level', ['$scope', 'LevelList', controllers.LevelController])
  ;


function MainCntl($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
}
