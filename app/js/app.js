'use strict';


// Declare app level module which depends on filters, and services
angular
  .module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/customer', {templateUrl: 'partials/customer.html', controller: 'Customer'});
    $routeProvider.when('/property', {templateUrl: 'partials/property.html', controller: 'Property'});
    $routeProvider.when('/levels', {templateUrl: 'partials/levels.html', controller: 'Level'});
    $routeProvider.otherwise({redirectTo: '/customer'});
  }]);
