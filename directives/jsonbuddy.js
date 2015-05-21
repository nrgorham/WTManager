app.directive('jsonBuddy', function() {
    return {
        restrict:"E",
        replace:false,
        scope:{
            dude: "="
        },
        templateUrl:"directives/jsonbuddy.html",
        link:function (scope, elem, attr) {
            scope.Char2JSON = function() {
                console.log(scope.dude);
                scope.CharJSON = angular.toJson(scope.dude, true);
                console.log(scope.CharJSON);
            }
            scope.JSON2Char = function() {
                scope.dude = JSON.parse(scope.CharJSON);
            }
            
        }
    }
});