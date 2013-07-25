function Customer($scope) {
  $scope.master= {};
 
  $scope.update = function(customer) {
    $scope.master= angular.copy(customer);
  };
 
  $scope.reset = function() {
    $scope.customer = angular.copy($scope.master);
  };
 
  $scope.reset();
}