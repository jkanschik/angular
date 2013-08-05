'use strict';


// Declare app level module which depends on filters, and services
var app = angular
  .module('myApp', ['ui.sortable', 'ui.utils', 'ui.bootstrap', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/welcome.html', controller: 'Welcome'});
    $routeProvider.when('/meteringConcepts/:_id', {templateUrl: 'partials/general.html', controller: 'MeteringConcept'});
    $routeProvider.when('/meteringConcepts/:_id/customer', {templateUrl: 'partials/customer.html', controller: 'Customer'});
    $routeProvider.when('/meteringConcepts/:_id/property', {templateUrl: 'partials/property.html', controller: 'Property'});
    $routeProvider.when('/meteringConcepts/:_id/locations', {templateUrl: 'partials/locations.html', controller: 'Locations'});
    $routeProvider.when('/meteringConcepts/:_id/levels', {templateUrl: 'partials/levels.html', controller: 'Level'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);

app.run(
	function($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $rootScope.getDirtyDocuments = function() {
      var dirtyDocuments = [];
      for (var key in localStorage) {
        var entity = localStorage.getItem(key);
        entity = JSON.parse(entity);
        if (entity.notSynchronized)
          dirtyDocuments.push(entity);
      }
      return dirtyDocuments;
    };

    $rootScope.pushDirtyDocuments = function() {

    };

    $rootScope.toogleOnlineModus = function() {
      $rootScope.online = !$rootScope.online;
    };

    $window.addEventListener("offline", function () {
      $rootScope.$apply(function() {
        $rootScope.online = false;
      });
    }, false);

    $window.addEventListener("online", function () {
      $rootScope.$apply(function() {
        $rootScope.online = true;
      });
    }, false);

    $rootScope.$watch('online', function(newValue, oldValue) {
      console.log("Watched online, old value: ", oldValue, " and new value ", newValue);
      if (!oldValue && newValue) {
        $rootScope.dirtyDocuments = $rootScope.getDirtyDocuments();
        jQuery("#myModal").modal();
      }
    })
});
