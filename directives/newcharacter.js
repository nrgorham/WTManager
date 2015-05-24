app.directive('newCharacter', function() {
    return {
        restrict: "E",
        replace: false,
        scope: {
            characters: "="
        },
        templateUrl:"directives/newcharacter.html",
        link: function (scope, elem, attr) {
            //Add all our scope functions
            scope.cPools = [];
            for (var i=0; i < 10; i++) 
            {
                scope.cPools.push(
                    {
                        name:"",
                        pool:
                        {
                            Normal:0,
                            Hard:0,
                            Wiggle:0
                        }
                    }
                );
            }

            //scope.cTemplates = [];

            /*

                TODO - Make this less dumb

            */

            scope.cTemplates = [
                {
                    Name: "Normal human",
                    Build: function() {

                        scope.newLocs = 
                            [ new DamageLocation("Left Leg", 1, new Track(0, 0, 5 + scope.cExtraTough), 7), 
                             new DamageLocation("Right Leg", 2, new Track(0,0,5+scope.cExtraTough),7), 
                             new DamageLocation("Left Arm", 4, new Track(0,0,5+scope.cExtraTough), 7),
                             new DamageLocation("Right Arm", 6, new Track(0,0,5+scope.cExtraTough), 7),
                             new DamageLocation("Torso", 9, new Track(0,0,10+scope.cExtraTough), null),
                             new DamageLocation("Head", 10, new Track(0,0,4+scope.cExtraTough), null)
                            ]
                        console.log(scope.newLocs);
                    }
                },
                {   Name: "Blob",
                 Build: function() {
                     scope.newLocs = [
                         new DamageLocation(
                             "Body",
                             10,
                             new Track(0, 0, 34 + scope.cExtraTough*6),
                             null
                         )
                     ]
                 }
                }
            ]


            scope.testPool = function() {
                console.log(scope.cPools);
            }

            scope.cBuild = function () {
                scope.newGuy = {};

                //Build our damage track objects

                console.log(scope.newLocs);

                scope.newLocs.sort(function(a,b) {
                    return (a.Upper - b.Upper);   
                });

                for (var i=0; i < scope.newLocs.length; i++) {
                    if (scope.newLocs[i].CarryOver >= 1 && scope.newLocs[i].CarryOver <= 10) {

                    } else {
                        scope.newLocs[i].CarryOver = null;   
                    }
                }

                var newTrack = new DamageTrack(
                    scope.LAR,
                    scope.hardLAR,
                    scope.HAR,
                    scope.hardHAR,
                    scope.HARFirst,
                    scope.newLocs
                );

                var newPools = [];

                for (var i=0; i < scope.cPools.length; i++) {
                    var total = 
                        scope.cPools[i].pool.Normal +
                        scope.cPools[i].pool.Hard + 
                        scope.cPools[i].pool.Wiggle

                    if (total > 0) {
                        newPools.push(new Dicepool(
                            scope.cPools[i].name,
                            scope.cPools[i].pool.Normal + "D" +
                            scope.cPools[i].pool.Hard + "HD" +
                            scope.cPools[i].pool.Wiggle + "WD"
                        )
                                     )
                    }

                }

                var initStr = "";
                initStr += (scope.cInitSense - 1);
                initStr += (scope.cInitPerception - 1);
                initStr += (scope.cInitMind - 1);

                console.log(initStr);

                scope.newGuy = new WTCharacter(
                    scope.cName,
                    initStr,
                    scope.cStatblock,
                    newPools,
                    newTrack
                )

                console.log(scope.newGuy);

            }

            scope.cAdd = function() {
                //scope.characters.push(scope.newGuy); 
                //scope.cInit();
                scope.cBuild();
                console.log("scope.newGuy is");
                console.log(scope.newGuy);
                scope.cJSONOut = angular.toJson(scope.newGuy, true)
                var t = JSON.parse(scope.cJSONOut);
                var u = RestoreCharacters([t]);
                console.log(u);
                scope.characters.push(u[0]);

            }

            scope.cJSON = function() {
                scope.cBuild();
                scope.cJSONOut = angular.toJson(scope.newGuy, true)
            }

            scope.cInit = function () {
                scope.cPools = [];
                for (var i=0; i < 10; i++) 
                {
                    scope.cPools.push(
                        {
                            name:"",
                            pool:
                            {
                                Normal:0,
                                Hard:0,
                                Wiggle:0
                            }
                        }
                    );
                }

                scope.newLocs = [];
            }

            scope.prettyBounds = function(i) {

                if (i == 0) {
                    if (scope.newLocs[i].Upper != 1) {
                        return "1 - " + scope.newLocs[i].Upper
                    } else {
                        return "1"   
                    }
                } else {
                    var diff = scope.newLocs[i].Upper - scope.newLocs[i-1].Upper;
                    if (diff > 1) {
                        return scope.newLocs[i-1].Upper+1 + " - " + scope.newLocs[i].Upper;
                    } else {
                        return scope.newLocs[i].Upper+"";   
                    }
                }
            }


        }
    }
});