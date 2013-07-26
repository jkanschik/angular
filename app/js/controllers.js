'use strict';

/* Controllers */

var controllers = {
  CustomerController: function($scope) {
    $scope.master= {};
   
    $scope.update = function(customer) {
      $scope.master= angular.copy(customer);
    };
   
    $scope.reset = function() {
      $scope.customer = angular.copy($scope.master);
    };
   
    $scope.reset();
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

  LevelController: function($scope, Level) {
    $scope.levels = Level.all();

    $scope.setDefaults = function() {
      Level.setDefaults();
      $scope.levels = Level.all();
    }

    $scope.new = function() {
      $scope.newLevel = Level.new();
    };

    $scope.push = function(level) {
      $scope.levels.push(level);
      Level.save($scope.levels);
    };

    $scope.update = function() {
      Level.save($scope.levels);
    };

    $scope.delete = function(level) {

    };
  }

}

angular
  .module('myApp.controllers', [])
  .controller('Customer', ['$scope', controllers.CustomerController])
  .controller('Property', ['$scope', controllers.PropertyController])
  .controller('Level', ['$scope', 'Level', controllers.LevelController])
  ;


function MainCntl($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
}
