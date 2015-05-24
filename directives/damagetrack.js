app.directive('damageTrack', function() {
    return {
        restrict:"E",
        replace:false,
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
            
            scope.prettyBounds = function(i) {

                if (i == 0) {
                    if (scope.track.Locations[i].Upper != 1) {
                        return "1 - " + scope.track.Locations[i].Upper
                    } else {
                        return "1"   
                    }
                } else {
                    var diff = scope.track.Locations[i].Upper - scope.track.Locations[i-1].Upper;
                    if (diff > 1) {
                        return scope.track.Locations[i-1].Upper+1 + " - " + scope.track.Locations[i].Upper;
                    } else {
                        return scope.track.Locations[i].Upper+"";   
                    }
                }
            }
            
        }

    }
});