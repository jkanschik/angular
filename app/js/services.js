'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular
  .module('myApp.services', ['ngResource'])
  .factory('RemoteLevel', ['$resource', '$http',
    function($resource, $http) {
      var actions = {
        'count': {method:'PUT', params:{_id: 'count'}},                           
        'distinct': {method:'PUT', params:{_id: 'distinct'}},
        'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
        'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
        'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true} ,  
        'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true}   
      }
      var res = $resource('api/levels/:_id', {}, actions);
      return res;
    }
  ])
  .factory('LevelList', ['RemoteLevel',
    function(RemoteLevel) {

      var doc = RemoteLevel.get({_id: '51f3823db7f8dbfd07000002'}, function(doc) {
        doc['other'] = 'asdasdsd';
        console.log(doc);
        RemoteLevel.save(doc);
      });



      return {
        new: function() {
          return {levels: []};
        },
        get: function() {
          var levelList = RemoteLevel.get(
            {_id: 'levels'},
            function(doc) {
              console.log("Loaded from api.", doc);
              levelList.levels = doc.levels;
              localStorage.setItem('levels', JSON.stringify(doc));
            },
            function(err) {
              console.log("Access to api failed with error ", err);
              var localData = localStorage.getItem('levels');
              localData = JSON.parse(localData);
              console.log("Loaded from local storage.", localData);
              levelList.levels = localData.levels;
            });
          return levelList;
        },
        save: function(levelList) {
          console.log("Saving levels: ", levelList);
          localStorage.setItem('levels', JSON.stringify(levelList));
          RemoteLevel.save(levelList, function(doc) {
            console.log("Saved levels via api: ", doc);
          });
        },
        all: function() {
          var remoteData = RemoteLevel.get({_id: 'levels'}, function(doc) {
            remoteData = doc;
            console.log("Loaded levels: ", doc);
          });
          return remoteData;
//          return JSON.parse(localStorage.getItem("levels"));
        },
        push: function(level) {
          var allLevels = this.all();
          allLevels.push(level);
          this.save(allLevels);
//          localStorage.setItem("levels", JSON.stringify(allLevels));
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
