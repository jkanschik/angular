'use strict';

/* Services */

var generateUuid = function() {
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
      }
  );
  return uuid;
};

var matchParams = function(doc, params) {
  if (doc['meteringConceptId'] == params['meteringConceptId'])
    return true;
  return false;
};

var Wrapper = function(resource, rootScope) {this.rootScope = rootScope; this.resource = resource};
Wrapper.prototype.get = function(id, callback) {
  if (this.rootScope.online) {
    console.log("Wrapper 'get', online API access, id: ", id);
    return this.resource.get({'_id': id}, function(doc) {
      localStorage.setItem(id, JSON.stringify(doc));
      (callback || angular.noop)(doc);
    });
  } else {
    console.log("Wrapper 'get', offline access to local storage, id: ", id);
    var localData = localStorage.getItem(id);
    localData = JSON.parse(localData);
    return localData;
  }
};
Wrapper.prototype.save = function(data, success) {
  data.updatedAt = new Date();
  data._id = data._id || generateUuid();
  success = success || function() {};
  if (this.rootScope.online) {
    console.log("Wrapper 'save', offline storage and online API access, data: ", data);
    localStorage.setItem(data['_id'], JSON.stringify(data));
    this.resource.save(data, function(result) {
      success(data);
    });
  } else {
    console.log("Wrapper 'save': storing dirty data in local storage: ", data);
    data["notSynchronized"] = true;
    localStorage.setItem(data['_id'], JSON.stringify(data));
    success(data);
  }
};
Wrapper.prototype.delete = function(id, callback) {
  console.log("Wrapper 'delete': removing from local storage with id ", id);
  localStorage.removeItem(id);
  if (this.rootScope.online) {
    console.log("Wrapper 'delete', online API access, id: ", id);
    this.resource.delete({_id: id}, callback || angular.noop);
  }
};
Wrapper.prototype.query = function(params, success) {
  success = success || function() {};
  if (this.rootScope.online) {
    console.log("Wrapper.query: online access for query ", params);
    return this.resource.query(params, function(docs) {
      console.log("Wrapper.query got documents ", docs);
      angular.forEach(docs, function(doc) {
        console.log("Wrapper 'query': local storade saving entity with ", doc._id);
        localStorage.setItem(doc._id, JSON.stringify(doc));
      });
      success(docs);
    });
  } else {
    console.log("Wrapper.query: offline access for query ", params);
    var docs = [];
    for (var ix = 0; ix < localStorage.length; ix++) {
      var key = localStorage.key(ix);
      var entity = localStorage.getItem(key);
      entity = JSON.parse(entity);
      console.log(entity);
      if (matchParams(entity, params)) {
        docs.push(entity);
      }
    }
    console.log(docs);
    window.setTimeout(function() { success(docs); });
    return docs;
  }
};

angular
  .module('myApp.services', ['ngResource'])
  .factory('MeteringConcept', ['$resource', '$rootScope', 'Customer', 'Property', 'LocationList', 'LevelList',
    function($resource, $rootScope, Customer, Property, LocationList, LevelList) {
      var res = $resource('api/metering_concepts/:_id', {});
      var wrapper = new Wrapper(res, $rootScope);
      return {
        new: function() { return {}; },
        get: function(id, success) {
          var meteringConcept = wrapper.get(id, function(doc) { meteringConcept = doc; success(doc);});
          return meteringConcept;
        },
        all: function() {
          return $rootScope.online ? res.query({}) : [];
        },
        create: function(success) {
          this.save({createdAt: new Date(), updatedAt: new Date()}, function(doc) {
            console.log("Created concept", doc);
            Customer.create(doc._id);
            Property.create(doc._id);
            LocationList.create(doc._id);
            LevelList.create(doc._id);
            (success || angular.noop)(doc);
          });
        },
        save: function(data, callback) {
          wrapper.save(data, callback);
        },
        delete: function(id, callback) {
          Customer.findByMeteringConcept(id, function(doc) { Customer.delete(doc._id); });
          Property.findByMeteringConcept(id, function(doc) { Property.delete(doc._id); });
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
          wrapper.save({_id: id + "_customer", meteringConceptId: id, createdAt: new Date()});
        },
        findByMeteringConcept: function(id, success) {
          return wrapper.get(id + "_customer", success);
        },
        save: function(customer) {
          wrapper.save(customer);
        },
        delete: function(id) { wrapper.delete(id); }
      }
    }
  ])
  .factory('Property', ['$resource', '$rootScope',
    function($resource, $rootScope) {
      var res = $resource('api/properties/:_id', {});
      var wrapper = new Wrapper(res, $rootScope);
      return {
        create: function(id) {
          wrapper.save({
            _id: id + "_property",
            meteringConceptId: id,
            createdAt: new Date(),
            contactPartners: []
          });
        },
        findByMeteringConcept: function(id, success) {
          return wrapper.get(id + "_property", success);
        },
        save: function(property) {
          wrapper.save(property);
        },
        delete: function(id) { wrapper.delete(id); }
      }
    }
  ])
  .factory('LocationList', ['$resource', '$rootScope',
    function($resource, $rootScope) {
      var res = $resource('api/locationLists/:_id', {});
      var wrapper = new Wrapper(res, $rootScope);
      return {
        create: function(id) {
          wrapper.save({
            _id: id + "_locationList",
            meteringConceptId: id,
            createdAt: new Date(),
            locations: []
          });
        },
        findByMeteringConcept: function(id, success) {
          return wrapper.get(id + "_locationList", success);
        },
        save: function(locationList) {
          wrapper.save(locationList);
        },
        delete: function(id) { wrapper.delete(id); }
      }
    }
  ])
  .factory('LevelList', ['$resource', '$rootScope',
    function($resource, $rootScope) {
      var res = $resource('api/levelLists/:_id', {});
      var wrapper = new Wrapper(res, $rootScope);
      return {
        defaults: function() {
          return [
            {id: 'level1', label: '1UG'},
            {id: 'level2', label: 'EG'},
            {id: 'level3', label: '1OG'},
            {id: 'level4', label: '2OG'}
          ];
        },
        create: function(id) {
          wrapper.save({
            _id: id + "_levelList",
            meteringConceptId: id,
            createdAt: new Date(),
            levels: this.defaults()
          });
        },
        findByMeteringConcept: function(id, success) {
          return wrapper.get(id + "_levelList", success);
        },
        save: function(levelList) {
          wrapper.save(levelList);
        },
        delete: function(id) { wrapper.delete(id); }
      }
    }
  ])
  .value('version', '0.1');
