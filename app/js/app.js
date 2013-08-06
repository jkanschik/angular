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
