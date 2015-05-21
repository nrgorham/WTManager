var app = angular.module('WTManager', [])
    .controller('myCtrl', ['$scope', function($scope) {
    
    var self=this;
    
    $scope.Characters = CreateDisplayTestGroup();
    
    //self.Characters = CreateDisplayTestGroup();
    //console.log(self.Characters);
    
}]);
                          