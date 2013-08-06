'use strict';

/* Directives */


angular.module('myApp.directives', [])
  // From demo: simply shows the current version number, which is available via a service (see service.js).
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  /* myAccessky replaces the standard HTML accesskey attribute in a browser independent way.
     Example: <a my-accesskey='Alt-M'> is triggered on Alt-m
     Some caveats:
      1.  For firefox, the handler has to be on keypress, because on keydown the preventDefault doesn't work.
          If keydown were used in FF, ALT-L would open the menu.
      2.  In keydown, event.which corresponds to uppercase letters (ALT-m and ALT-SHIFT-m would result in event.which = 'M').
          In keypress, event.which corresponds to uppercase or lowercase letters (for ALT-m event.which = 'm', but 'M' for ALT-SHIFT-m).
          As a result, which is normalized to uppercase letters in function eventMatches()
  */
  .directive('myAccesskey', ['$document', function($document) {
    return {
      restrict: 'A',
      link: function(scope, elm, attr) {
        var key = attr.myAccesskey.toUpperCase();
        var options = {
          isAlt: (key.indexOf("ALT") > -1),
          which: key.substr(-1, 1)
        };
        var eventMatches = function(e) {
          if (options.isAlt && !e.altKey)
            return false;
          if (options.which != String.fromCharCode(e.which).toUpperCase())
            return false;
          return true;
        };
        var handler = function(e) {
          if (eventMatches(e)) {
            elm.click();
            e.preventDefault();
            return false;
          }
        };
        if (navigator.userAgent.indexOf("Firefox") > -1)
          $document.keypress(handler);
        else
          $document.keydown(handler);
      }
    }
  }])
  // Shows online state and manages any changes to the online change via the controller.
  .directive('online', ['$rootScope', function($rootScope) {
    return {
      restrict: "E",
      templateUrl: "partials/onlineState.html",
      controller: [
        '$scope', '$rootScope', '$window', 'MeteringConcept', 'Customer', 'Property', 'LocationList', 'LevelList',
        function($scope, $rootScope, $window, MeteringConcept, Customer, Property, LocationList, LevelList) {
          console.log("Initialising controller .");
          $rootScope.onlineState = navigator.onLine ? 'online' : 'offline';

          $scope.toggle = function() {
            console.log("Manually toggling onlineState, old value: ", $rootScope.onlineState);
            switch($rootScope.onlineState) {
              case 'online':
                $rootScope.onlineState = "offline";
                break;
              case 'offline':
                $rootScope.onlineState = "available";
                break;
              case 'available':
                $scope.dirtyDocuments = $scope.getDirtyDocuments();
                if (angular.equals($scope.dirtyDocuments, {}))
                  // switch directly to online if there are no changes
                  $rootScope.onlineState = "online";
                else {
                  // open a dialog
                  $scope.modal = jQuery("#myModal").modal();
                }
                break;
            }
          };

          $scope.goOnline = function() {
            console.log("Going online");
            angular.forEach($scope.dirtyDocuments, function(row) {
              console.log("Pushing data for concept", row.meteringConcept.name);
              for (var ix = 0; ix < row.resources.length; ix++) {
                var resource = row.resources[ix];
                console.log("Pushing resource ", resource);
                resource.type.push(resource.data);
              }
            });
            $scope.modal.modal('hide');
            $rootScope.onlineState = "online";
          };

          $scope.stayOffline = function() {
            console.log("Staying offline");
            $rootScope.onlineState = "available";
          };

          $scope.getDirtyDocuments = function() {
            var dirtyDocuments = {};
            for (var id in localStorage) {
              var resource = localStorage.getItem(id);
              resource = JSON.parse(resource);
              if (resource.notSynchronized) {
                var meteringConceptId = id.substring(0, 36);
                var meteringConcept = MeteringConcept.get(meteringConceptId);

                var row = dirtyDocuments[meteringConceptId];
                if (!row)
                  row = dirtyDocuments[meteringConceptId] = {
                    meteringConcept: meteringConcept,
                    labels: [],
                    resources: []
                  };

                var entityType = id.substring(36);
                switch(entityType) {
                  case "":
                    row.labels.push("Allgemein");
                    row.resources.push({data: meteringConcept, type: MeteringConcept});
                    break;
                  case "_customer":
                    row.labels.push("Kunde");
                    row.resources.push({data: Customer.get(id), type: Customer});
                    break;
                  case "_property":
                    row.labels.push("Liegenschaft");
                    row.resources.push({data: Property.get(id), type: Property});
                    break;
                  case "_locationList":
                    row.labels.push("Messstellen");
                    row.resources.push({data: LocationList.get(id), type: LocationList});
                    break;
                  case "_levelList":
                    row.labels.push("Etagen");
                    row.resources.push({data: LevelList.get(id), type: LevelList});
                    break;
                }
              }
            }
            return dirtyDocuments;
          };

          $window.addEventListener("offline", function () {
            console.log("Browser event 'offline'.");
            $rootScope.$apply(function() {
              switch($rootScope.onlineState) {
                case 'online':
                  $rootScope.onlineState = "offline";
                  break;
                case 'offline':
                  break;
                case 'available':
                  $rootScope.onlineState = "offline";
                  break;
              }
            });
          }, false);

          $window.addEventListener("online", function () {
            console.log("Browser event 'online'.");
            $rootScope.$apply(function() {
              switch($rootScope.onlineState) {
                case 'online':
                  break;
                case 'offline':
                  $rootScope.onlineState = "available";
                  break;
                case 'available':
                  break;
              }
            });
          }, false);

        }
      ]
    }
  }]);
