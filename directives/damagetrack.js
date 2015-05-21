app.directive('damageTrack', function() {
    return {
        restrict:"E",
        replace:true,
        scope: {
            track:"="
        },
        templateUrl:"directives/damagetrack.html",
        link: function(scope, elem, attrs) {
            //console.log(scope);
            scope.TableHighlight = function(t) {
                
                //console.log(t)
                
                if (t.Track.Open == 0 && t.Track.Shock == 0) {
                    return 'danger'   
                } else if (t.Track.Killing > 0) {
                    return 'warning'   
                } else 
                    return ''
            }
        }

    }
});