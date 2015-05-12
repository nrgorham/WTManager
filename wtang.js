var app = angular.module('WTManager', [])
    .controller('myCtrl', [function() {
    
    var self=this;
    
    self.Characters = CreateDisplayTestGroup();
    console.log(self.Characters);
    
}]);
                          