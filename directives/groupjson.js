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
                var t = JSON.parse(scope.GroupJSON);
                scope.group = RestoreCharacters(t);
            }
            scope.AddToGroup = function() {
                var t = JSON.parse(scope.GroupJSON);
                t = RestoreCharacters(t);
                
                for (var i = 0; i < t.length; i++) {
                    scope.group.push(t[i]);   
                }
                
            }
            
        }
    }
});