'use strict';


var isDeepEmpty = function(object) {
  var isEmpty = true;
  angular.forEach(object, function(value) {
    if (value && value != "")
      isEmpty = false;
  });
  return isEmpty;
}



var controllers = {
  WelcomeController: function($scope, $location, $timeout, MeteringConcept, Customer) {
    $scope.meteringConcepts = MeteringConcept.all();

    $scope.new = function() {
      MeteringConcept.create(function(doc) {$location.path('/meteringConcepts/' + doc._id)});
    };

    $scope.details = function(id) {
      $location.path('/meteringConcepts/' + id);
    };

    $scope.delete = function(index) {
      var concept = $scope.meteringConcepts[index];
      MeteringConcept.delete(concept._id, function() {
        $scope.meteringConcepts.splice(index, 1);
      });

    }
  },

  MeteringConceptController: function($scope, $routeParams, $timeout, MeteringConcept) {
    $scope.master = MeteringConcept.get($routeParams._id, function(doc) {$scope.reset();});
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.initFocus = function() {
      $timeout(function() {jQuery("form input").first().focus();});
    };

    $scope.save = function(meteringConcept) {
      $scope.master = angular.copy($scope.meteringConcept);
      MeteringConcept.save($scope.master);
    };
   
    $scope.reset = function() {
      $scope.meteringConcept = angular.copy($scope.master);
      $scope.initFocus();
    };

    $scope.reset();
  },

  CustomerController: function($scope, $routeParams, $timeout, Customer) {
    $scope.master = Customer.findByMeteringConcept($routeParams._id, function(doc) {$scope.reset();});
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.initFocus = function() {
      $timeout(function() {jQuery("form input").first().focus();});
    };

    $scope.update = function(customer) {
      $scope.master = angular.copy($scope.customer);
      Customer.save($scope.master);
    };

    $scope.reset = function() {
      $scope.customer = angular.copy($scope.master);
      $scope.initFocus();
    };
    
    $scope.reset();
  },

  PropertyController: function($scope, $routeParams, $timeout, Property) {
    $scope.master = Property.findByMeteringConcept($routeParams._id, function(doc) {$scope.reset();});
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;
   
    $scope.initFocus = function() {
      $timeout(function() {jQuery("form input").first().focus();});
    };

    $scope.update = function(property) {
      $scope.master= angular.copy(property);
      Property.save($scope.master);
    };
   
    $scope.reset = function() {
      $scope.property = angular.copy($scope.master);
      $scope.initFocus();
    };

    $scope.deleteContactPartner = function(index) {
      $scope.property.contactPartners.splice(index, 1);
    };

    $scope.createContactPartner = function() {
      $scope.property.contactPartners.push({});
    };
   
    $scope.createContactPartnerWithTab = function($event, partner) {
      if ($event.keyCode == 9 && !$event.shiftKey && !angular.equals(partner, {}))
        $scope.createContactPartner();
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
    location.missingParents = "Die folgenden Messstellennummern fehlen: " + Liste
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
    location.$errors.number.uniqueness = "Die Messstellennummer ist bereits vergeben!"
    Validierung aller Parents durchführen
  */
  LocationsController: function($scope, $routeParams, $timeout, LocationList) {
    $scope.master = LocationList.findByMeteringConcept($routeParams._id, function(doc) {$scope.reset();});
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.initFocus = function() {
      $timeout(function() {
        jQuery("form table tfoot input").first().focus();
      });
    };

    $scope.update = function(locations) {
      if (!isDeepEmpty($scope.newLocation))
        $scope.addNewLocation();
      $scope.master.locations = angular.copy($scope.locations);
      LocationList.save($scope.master);
      $scope.message = "Messstellen erfolgreich gespeichert."
      $timeout(function() {
        jQuery("#messageBox").fadeOut(function() {
          $scope.$apply(function() {
            $scope.message = "";
          })
        });
      }, 1000);
    };

    $scope.isValid = function() {
      var valid = true;
      angular.forEach($scope.locations, function(value) {
        if (!angular.equals(value.$errors, {}))
          valid = false;
        if (!angular.equals(value.missingParents, []))
          valid = false;
      });
      return valid;
    };

    $scope.delete = function(index) {
      $scope.locations.splice(index, 1);
      $scope.validateAllParentLocations();
    };

    $scope.reset = function() {
      $scope.locations = angular.copy($scope.master.locations);
      $scope.validateAllParentLocations();
      $scope.initFocus();
    };

    $scope.validateNewLocationNumber = function() {
      if (isDeepEmpty($scope.newLocation))
        return;
      $scope.validateNumber($scope.newLocation);
    };

    $scope.validateNumber = function(location, index) {
      if (!location.$errors)
        location.$errors = {};
      var errors = {};
      var validates = true;
      // check uniqueness
      angular.forEach($scope.locations, function(value, key) {
        if (index != key && location.number == value.number)
          errors.uniqueness = "Die Messstellennummer " + location.number + " ist bereits vergeben!"
      });
      // check existence
      if (!location.number)
        errors.existence = "Die Messstellennummer ist ein Pflichtfeld."
      // format
      var pattern = /^[1-5]\.[0-9]*$/;
      if (!pattern.test(location.number))
        errors.format = "Das Format der Messstellennummer ist [1-5].[0-9]*.";

      if (angular.equals(errors, {})) {
        delete location.$errors.number;
        return true;
      } else {
        location.$errors.number = errors;
        return false;
      }
    };

    /* Validate the parents of the location and set missingParents
     * to the list of parents which don't refer to an existing location.
     */
    $scope.validateParentLocations = function(location) {
      location.missingParents = angular.copy(location.parents);

      angular.forEach($scope.locations, function(value) {
        var ix = location.missingParents.indexOf(value.number);
        if (ix > -1)
          location.missingParents.splice(ix, 1);
      });
    };

    $scope.validateAllParentLocations = function() {
      angular.forEach($scope.locations, function(location, index) {
        $scope.validateParentLocations(location);
      });
    };

    $scope.checkNumber = function(location, index) {
      if ($scope.validateNumber(location, index))
        $scope.changeNumber(location);
    };

    $scope.changeNumber = function(location) {
      if (location.oldNumber == location.number)
        return;
      angular.forEach($scope.locations, function(value) {
        // Fall 2a)
        var ix = value.missingParents.indexOf(location.number);
        if (ix > -1)
          value.missingParents.splice(ix, 1);
        // Fall 2d)
        var ix = value.parents.indexOf(location.oldNumber);
        if (ix > -1) {
          // Setting 'value.parents[ix] = location.number;' doesn't work; it doesn't update the input field
          var newParents = angular.copy(value.parents);
          newParents[ix] = location.number;
          value.parents = newParents; // this is picked up by angular because the object itself is changed ;-)
        }
      });
      location.oldNumber = location.number;
    };

    $scope.addNewLocation = function() {
      // add a copy to locations
      var location = angular.copy($scope.newLocation);
      $scope.locations.push(location);
      $scope.newLocation = {};
      // set defaults
      location.oldNumber = location.number;
      location.missingParents = [];
      location.parents = location.parents || [];
      location.$errors = {};
      // validate
      $scope.validateNumber(location, $scope.locations.length - 1);
      $scope.validateAllParentLocations();
    };

    $scope.createLocationWithTab = function(event) {
      if (isDeepEmpty($scope.newLocation))
        return;
      if (event.keyCode == 9 && !event.shiftKey) {
        $scope.addNewLocation();
        $timeout(function() {
          jQuery("tfoot input").first().focus();
        }, 10);
      };
    };

    $scope.reset();
  },


  LevelController: function($scope, $routeParams, $timeout, LevelList) {
    $scope.sortableOptions = {
      distance: 15 // mouse must be moved at least 15px before dragging starts
    };
    $scope.master = LevelList.findByMeteringConcept($routeParams._id, function(doc) { $scope.reset(); });
    $scope.baseUrl = "/meteringConcepts/" + $routeParams._id;

    $scope.initFocus = function() {
      $timeout(function() {jQuery("form table tfoot input").first().focus();});
    };

    $scope.update = function(levelList) {
      if (!isDeepEmpty($scope.newLevel))
        $scope.copyNewLevel();
      $scope.master = angular.copy($scope.levelList);
      LevelList.save($scope.master);
      $scope.message = "Etagen erfolgreich gespeichert."
      $timeout(function() {
        jQuery("#messageBox").fadeOut(function() {
          $scope.$apply(function() {
            $scope.message = "";
          })
        });
      }, 1000);
    };

    $scope.delete = function(index) {
      $scope.levelList.levels.splice(index, 1);
    };

    $scope.reset = function() {
      $scope.levelList = angular.copy($scope.master);
      $scope.initFocus();
    };
    
    $scope.setDefaults = function() {
      $scope.levelList.levels = LevelList.defaults();
    };

    $scope.copyNewLevel = function() {
      var level = angular.copy($scope.newLevel);
      $scope.levelList.levels.push(level);
      $scope.newLevel = {};
    };

    $scope.createLevelWithTab = function(event) {
      if (isDeepEmpty($scope.newLevel))
        return;
      if (event.keyCode == 9 && !event.shiftKey) {
        $scope.copyNewLevel();
        $timeout(function() {
          jQuery("tfoot input").focus();
        }, 10);
      };
    };

    $scope.reset();
  }

}

angular
  .module('myApp.controllers', [])
  .controller('Welcome', ['$scope', '$location', '$timeout', 'MeteringConcept', 'Customer', controllers.WelcomeController])
  .controller('MeteringConcept', ['$scope', '$routeParams', '$timeout', 'MeteringConcept', controllers.MeteringConceptController])
  .controller('Customer', ['$scope', '$routeParams', '$timeout', 'Customer', controllers.CustomerController])
  .controller('Property', ['$scope', '$routeParams', '$timeout', 'Property', controllers.PropertyController])
  .controller('Locations', ['$scope', '$routeParams', '$timeout', 'LocationList', controllers.LocationsController])
  .controller('Level', ['$scope', '$routeParams', '$timeout', 'LevelList', controllers.LevelController])
  ;


function MainCntl($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  $scope.$routeParams = $routeParams;
}
