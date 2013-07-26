'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular
  .module('myApp.services', [])
  .factory('Level', function() {
    return {
      new: function() {
        return {$id: 'asdasd'};
      },
      all: function() {
        return JSON.parse(localStorage.getItem("levels"));
      },
      push: function(level) {
        var allLevels = this.all();
        allLevels.push(level);
        localStorage.setItem("levels", JSON.stringify(allLevels));
      },
      save: function(levels) {
        localStorage.setItem("levels", JSON.stringify(levels));
      },
      setDefaults: function() {
        this.save([
          {$id: 'level1', label: '1UG'},
          {$id: 'level2', label: 'EG'},
          {$id: 'level3', label: '1OG'},
          {$id: 'level4', label: '2OG'}
        ]);
      }
    }
  })
  .value('version', '0.1');
