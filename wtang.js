var app = angular.module('WTManager', ['ui.bootstrap'])
    .controller('myCtrl', ['$scope', function($scope) {
    
    var self=this;
    
    //$scope.Characters = [];
        
    $scope.Characters = CreateDisplayTestGroup();
    
    //self.Characters = CreateDisplayTestGroup();
    //console.log(self.Characters);
    
    $scope.decrementFloor = function(val, floor) {
        //console.log("Hello?")
        //console.log(val);
        return Math.max(val - 1, 0);
        //console.log(val);
    }
    
    $scope.incrementCeiling = function(val, ceiling) {
        
        return Math.min(val + 1, ceiling);
    }
        
}]);
                          