var app = angular.module('WTManager', ['ui.bootstrap'])
    .controller('myCtrl', ['$scope', function($scope) {
    
    var self=this;
    
    $scope.Characters = [];
        
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
        
    $scope.deleteCharacter = function(char) {
     
        //console.log(char);
        
        var i = $scope.Characters.indexOf(char);
        
        $scope.Characters.splice(i,1);
        
        
    }
    
}]);


// disable mousewheel on a input number field when in focus
// (to prevent Cromium browsers change the value when scrolling)
$('input[type=number]').on('focus', function (e) {
  $(this).on('mousewheel.disableScroll', function (e) {
    e.preventDefault()
  })
})
$('input[type=number]').on('blur', function (e) {
  $(this).off('mousewheel.disableScroll')
}) 