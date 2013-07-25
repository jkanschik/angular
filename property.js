function Property($scope) {
  $scope.master= {};
 
  $scope.update = function(property) {
    $scope.master= angular.copy(property);
  };
 
  $scope.reset = function() {
    $scope.property = angular.copy($scope.master);
  };
 
  $scope.reset();
}