'use strict';

/* Services */

var Wrapper = function(resource, rootScope) {this.rootScope = rootScope; this.resource = resource};
Wrapper.prototype.get = function(id, callback) {
      if (this.rootScope.online) {
        console.log("Wrapper 'get', online API access, id: ", id);
        return this.resource.get({'_id': id}, function(doc) {
          localStorage.setItem(id, JSON.stringify(doc));
          callback(doc);
        });
      } else {
        console.log("Wrapper 'get', offline access to local storage, id: ", id);
        var localData = localStorage.getItem(id);
        localData = JSON.parse(localData);
        return localData;
      }
    };
Wrapper.prototype.save = 
    function(data, callback) {
      data.updatedAt = new Date();
      console.log("Wrapper 'save': storing data in local storage: ", data);
      localStorage.setItem(data['_id'], JSON.stringify(data));
      if (this.rootScope.online) {
        console.log("Wrapper 'save', online API access, data: ", data);
        this.resource.save(data, callback || function() {});
      }
    };
Wrapper.prototype.delete = 
    function(id, callback) {
      console.log("Wrapper 'delete': removing from local storage with id ", id);
      localStorage.removeItem(id);
      if (this.rootScope.online) {
        console.log("Wrapper 'delete', online API access, id: ", id);
        this.resource.delete({_id: id}, callback || angular.noop);
      }
    };

angular
  .module('myApp.services', ['ngResource'])
  .factory('MeteringConcept', ['$resource', '$rootScope', 'Customer',
    function($resource, $rootScope, Customer) {
      var res = $resource('api/metering_concepts/:_id', {});
      var wrapper = new Wrapper(res, $rootScope);
      return {
        new: function() { return {}; },
        get: function(id) {
          var meteringConcept = wrapper.get(id, function(doc) { meteringConcept = doc; });
          return meteringConcept;
        },
        all: function() {
          return $rootScope.online ? res.query({}) : [];
        },
        save: function(data, callback) {
          wrapper.save(data, callback);
        },
        delete: function(id, callback) {
          Customer.findByMeteringConcept(id, function(docs) {
            angular.forEach(docs, function(doc) { console.log("Deleting ", doc); Customer.delete(doc._id); });
          });
          wrapper.delete(id, callback);
        }
      }
    }
  ])
  .factory('Customer', ['$resource', '$rootScope',
    function($resource, $rootScope) {
      var res = $resource('api/customers/:_id', {});
      var wrapper = new Wrapper(res, $rootScope);
      return {
        create: function(id) {
          wrapper.save({meteringConceptId: id, createdAt: new Date()});
        },
        findByMeteringConcept: function(id, callback) {
          var customer = res.query({meteringConceptId: id}, callback || function() {});
          return customer;
        },
        save: function(customer) {
          wrapper.save(customer);
        },
        delete: function(id) { wrapper.delete(id); }
      }
    }
  ])
  .factory('RemoteLevel', ['$resource', '$http', '$rootScope',
    function($resource, $http, $rootScope) {
      var actions = {
        'count': {method:'PUT', params:{_id: 'count'}},                           
        'distinct': {method:'PUT', params:{_id: 'distinct'}},
        'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
        'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
        'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true} ,  
        'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true}   
      }
      var res = $resource('api/levels/:_id', {}, actions);
      return new Wrapper(res, $rootScope);
    }
  ])
  .factory('LevelList', ['RemoteLevel',
    function(RemoteLevel) {

      return {
        new: function() {
          return {_id: "levels", levels: []};
        },
        get: function() {
          var levelList = RemoteLevel.get('levels', function(doc) { levelList.levels = doc.levels; });
          return levelList;
        },
        save: function(levelList) {
          RemoteLevel.save(levelList);
        },
        defaults: function() {
          return [
            {id: 'level1', label: '1UG'},
            {id: 'level2', label: 'EG'},
            {id: 'level3', label: '1OG'},
            {id: 'level4', label: '2OG'}
          ];
        }
      }
    }
  ])
  .value('version', '0.1');
