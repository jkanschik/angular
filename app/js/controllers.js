'use strict';

/* Controllers */

var controllers = {
  WelcomeController: function($scope, $location, MeteringConcept, Customer) {
    $scope.meteringConcepts = MeteringConcept.all();

    $scope.new = function() {
      MeteringConcept.save({createdAt: new Date(), updatedAt: new Date()}, function(doc) {
        console.log("Created concept", doc);
        Customer.create(doc._id);
        $location.path('/meteringConcepts/' + doc._id);
      })
    };

    $scope.details = function(id) {
      $location.path('/meteringConcepts/' + id);
    };

    $scope.delete = function(id) {
      var ix;
      for (var i in $scope.meteringConcepts) {
        if ($scope.meteringConcepts[i]._id == id) {
          ix = i;
        }
      }
      MeteringConcept.delete(id, function() {
        $scope.meteringConcepts.splice(ix, 1);
      });

    }
  },

  MeteringConceptController: function($scope, $routeParams, MeteringConcept) {
    $scope.meteringConcept = MeteringConcept.get($routeParams._id);
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.save = function(meteringConcept) {
      MeteringConcept.save($scope.meteringConcept);
    };
   
    $scope.reset = function() {
      $scope.meteringConcept = MeteringConcept.get($routeParams._id);
    };

  },

  CustomerController: function($scope, $routeParams, Customer) {
    $scope.customer = Customer.findByMeteringConcept($routeParams._id);
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.save = function() {
      Customer.save($scope.customer[0]);
    };
   
    $scope.reset = function() {
      $scope.customer = Customer.findByMeteringConcept($routeParams._id);
    };
   
  },

  PropertyController: function($scope, $routeParams) {
    $scope.master= {};
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;
   
    $scope.update = function(customer) {
      $scope.master= angular.copy(customer);
    };
   
    $scope.reset = function() {
      $scope.customer = angular.copy($scope.master);
    };
   
    $scope.reset();
  },


  /*

  Attribute:
  - parents: die vom Benutzer eingegebene Liste der Nummern.
    Diese Liste muss 1:1 gespeichert werden, da die Referenzen später aufgelöst werden könnten.
    Eine Auflösung in UUIDs hilft hier nicht.
  - missingParents: der Teil der parents, der nicht aufgelöst werden kann und als Fehler angezeigt wird.

  1. Eingabe der Parents durch den Benutzer
  2. Umbenennung einer Messstellennummer (Eindeutigkeit bleibt erhalten)
    a) die neue Nummer ist bei einer anderen Messstelle "missing"
    b) die neue Nummer ist bei einer anderen Messstelle "parent", aber nicht "missing"
    c) die alte Nummer ist bei einer anderen Messstelle "missing"
    d) die alte Nummer ist bei einer anderen Messstelle "parent", aber nicht "missing"
  3. Umbenennung einer Messstellennummer (Nummer ist bereits vergeben)

  Zu 1)
    Validierung starten.
    location.$errors.missingParents = "Die folgenden Messstellennummern fehlen: " + Liste
  Zu 2a)
    Validierung neu starten, dadurch wird missingParents neu aufgebaut. Alternativ: neue Nummer aus missing entfernen.
    In der neuen Liste der missingParents fehlt die neue Nummer.
    Fehlermeldung wie 1)
  Zu 2b)
    Kann nicht sein, da dann die Nummer bereits vergeben sein muss.
  Zu 2c)
    Kann nicht sein, sonst wäre "missing" falsch gesetzt.
  Zu 2d)
    Die alte Nummer muss in parents durch den neuen Wert ersetzt werden.
    Eine Neuvalidierung ist nicht nötig, da sich missingNumbers nicht ändert.
  Zu 3)
    Existenz der neuen Nummer prüfen + Validierungsmeldung.
    location.$errors.number = "Die Messstellennummer ist bereits vergeben!"
  */
  LocationsController: function($scope, $routeParams) {
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    /* Validate the parents of the location and set missingParents
     * to the list of parents which don't refer to an existing location.
     */
    $scope.validateParentLocations = function(location) {
      console.log("Validating parents ", location.parents, " of location ", location.number);

      location.missingParents = angular.copy(location.parents);

      angular.forEach($scope.locations, function(value) {
        var ix = location.missingParents.indexOf(value.number);
        if (ix > -1)
          location.missingParents.splice(ix, 1);
        console.log(location.missingParents);
      });
    };

    $scope.watchLocationNumber = function(location) {
      $scope.$watch('locations.' + location.id + '.number', function(newValue, oldValue) {
        if (oldValue == newValue)
          return;
        console.log("Location number has been changed from ", oldValue, " to ", newValue);
        angular.forEach($scope.locations, function(value) {
          // Fall 2a)
          var ix = value.missingParents.indexOf(newValue);
          if (ix > -1)
            value.missingParents.splice(ix, 1);
          // Fall 2d)
          var ix = value.parents.indexOf(oldValue);
          if (ix > -1) {
            // Setting 'value.parents[ix] = newValue;' doesn't work; it doesn't update the input field
            var newParents = angular.copy(value.parents);
            newParents[ix] = newValue;
            value.parents = newParents; // this is picked up by angular because the object itself is changed ;-)
          }
        });
      });
    };

$scope.locations = {
  "id1": {id: "id1", number: "1.00", type: "MEZ", parents: []},
  "id2": {id: "id2", number: "1.01", type: "MEZ", parents: ["1.00"]},
  "id3": {id: "id3", number: "1.02", type: "MEZ", parents: ["1.01", "1.02"]}
};

angular.forEach($scope.locations, function(location) {
  $scope.validateParentLocations(location);
  $scope.watchLocationNumber(location);
});



  },


  LevelController: function($scope, $routeParams, LevelList) {
    $scope.levelList = LevelList.new();
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

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
  .controller('Welcome', ['$scope', '$location', 'MeteringConcept', 'Customer', controllers.WelcomeController])
  .controller('MeteringConcept', ['$scope', '$routeParams', 'MeteringConcept', controllers.MeteringConceptController])
  .controller('Customer', ['$scope', '$routeParams','Customer', controllers.CustomerController])
  .controller('Property', ['$scope', '$routeParams', controllers.PropertyController])
  .controller('Locations', ['$scope', '$routeParams', controllers.LocationsController])
  .controller('Level', ['$scope', '$routeParams', 'LevelList', controllers.LevelController])
  ;


function MainCntl($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
}
