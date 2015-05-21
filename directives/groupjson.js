app.directive('groupJson', function() {
    return {
        restrict:"E",
        replace:false,
        scope:{
            group: "="
        },
        templateUrl:"directives/groupjson.html",
        link:function (scope, elem, attr) {
            scope.Group2JSON = function() {
                //console.log(scope.dude);
                scope.GroupJSON = angular.toJson(scope.group, true);
                //console.log(scope.CharJSON);
            }
            scope.JSON2Group = function() {
                scope.group = JSON.parse(scope.GroupJSON);
            }
            
        }
    }
});