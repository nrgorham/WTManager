app.directive('diceTray', function() {
    return {
        restrict: "AE",
        replace:false,
        scope: {
            dice:"="
        },
        templateUrl:"directives/dicetray.html",
        link: function(scope, elem, attrs) {
            //console.log(scope);
            scope.incrementBonus = function(x) {
                x.BonusDice++;
                x.Update();
            }
            scope.decrementBonus = function(x) {
                if (x.BonusDice > 0) {
                    x.BonusDice--;   
                    x.Update();
                } else {
                    x.BonusDice=0;
                }
            }
            scope.incrementPenalty = function(x) {
                x.PenaltyDice++;
                x.Update();
            }
            scope.decrementPenalty = function(x) {
                if (x.PenaltyDice > 0) {
                    x.PenaltyDice--;
                    x.Update();
                } else {
                    x.PenaltyDice = 0;   
                }
            }
            scope.Roll = function(x) {
                x.CurrentRoll = x.SimpleRoll();
                scope.UpdateMax(x);
            }
            scope.Clear = function(x) {
                x.CurrentRoll = null;   
            }

            scope.UpdateMax = function(x) {
                var max = 0;
                for (var i=0; i<x.CurrentRoll.rolls.length;i++) {
                    if (x.CurrentRoll.rolls[i] >= x.CurrentRoll.rolls[max]) {
                        max = i;
                    }
                }
                x.CurrentRoll.Max = max;   
            }

            //scope.CurrentRoll = null;
            scope.Gobble = function(x,index) {
                if (x.CurrentRoll.rolls[index]>0) {
                    x.CurrentRoll.rolls[index]--;
                    scope.UpdateMax(x);
                }
            }
            scope.Wiggle = function(x,index) {
                if (x.CurrentRoll.wiggle > 0) {
                    x.CurrentRoll.rolls[index]++;
                    x.CurrentRoll.wiggle--;
                    scope.UpdateMax(x);
                }
            }
            scope.TableHighlight = function(x,index) {
                if (x.CurrentRoll.Max == index) {
                    return 'success'   
                } else if (x.CurrentRoll.rolls[index]>0) {
                    return 'info'   
                } else {
                    return '';
                }
            }


            scope.PrettyPrint = function (x) {
                x.PrettyString();
                return x.Poolstring;
            }

            scope.NewDiceGroup = function () {
                scope.dice.push(new Dicepool("Name", "1D"));
            }
            
            scope.DeleteDiceGroup = function(x) {
                var i = scope.dice.indexOf(x);
                scope.dice.splice(i,1);
            }

        }
    };
});


/*
            incrementBonus: function() {
                dice.BonusDice++;
                dice.Update();
            },
            decrementBonus: function() {
                if (dice.BonusDice > 0) {
                    dice.BonusDice--;   
                    dice.Update();
                } else {
                    dice.BonusDice=0;
                }
            }
*/