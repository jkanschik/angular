'use strict';

/* Services */

var Wrapper = function(resource, rootScope) {

}

angular
  .module('myApp.services', ['ngResource'])
  .factory('Customer', ['$resource', '$rootScope',
    function($resource, $rootScope) {

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

      var wrapper = {
        get: function(id, callback) {
          if ($rootScope.online) {
            console.log("Wrapper 'get', online API access, id: ", id);
            return res.get({'_id': id}, function(doc) {
              localStorage.setItem(id, JSON.stringify(doc));
              callback(doc);
            });
          } else {
            console.log("Wrapper 'get', offline access to local storage, id: ", id);
            var localData = localStorage.getItem(id);
            localData = JSON.parse(localData);
            return localData;
          }
        },
        save: function(data) {
          console.log("Wrapper 'save': storing data in local storage: ", data);
          localStorage.setItem(data['_id'], JSON.stringify(data));
          if ($rootScope.online) {
            console.log("Wrapper 'save', online API access, data: ", data);
            res.save(data);
          }
        }
      };
      return wrapper;
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
