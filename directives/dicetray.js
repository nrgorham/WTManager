app.directive('diceTray', function() {
    return {
        restrict: "E",
        replace:true,
        scope: {
            dice:"="
        },
        templateUrl:"directives/dicetray.html",
        link: function(scope, elem, attrs) {
            //console.log(scope);
            scope.incrementBonus = function() {
                scope.dice.BonusDice++;
                scope.dice.Update();
            }
            scope.decrementBonus = function() {
                if (scope.dice.BonusDice > 0) {
                    scope.dice.BonusDice--;   
                    scope.dice.Update();
                } else {
                    scope.dice.BonusDice=0;
                }
            }
            scope.incrementPenalty = function() {
                scope.dice.PenaltyDice++;
                scope.dice.Update();
            }
            scope.decrementPenalty = function() {
                if (scope.dice.PenaltyDice > 0) {
                    scope.dice.PenaltyDice--;
                    scope.dice.Update();
                } else {
                    scope.dice.PenaltyDice = 0;   
                }
            }
            scope.Roll = function() {
                scope.CurrentRoll = scope.dice.SimpleRoll();
                scope.UpdateMax();
            }
            scope.Clear = function() {
                scope.CurrentRoll = null;   
            }

            scope.UpdateMax = function() {
                var max = 0;
                for (var i=0; i<scope.CurrentRoll.rolls.length;i++) {
                    if (scope.CurrentRoll.rolls[i] >= scope.CurrentRoll.rolls[max]) {
                        max = i;
                    }
                }
                scope.CurrentRoll.Max = max;   
            }

            scope.CurrentRoll = null;
            scope.Gobble = function(index) {
                if (scope.CurrentRoll.rolls[index]>0) {
                    scope.CurrentRoll.rolls[index]--;
                    scope.UpdateMax();
                }
            }
            scope.Wiggle = function(index) {
                if (scope.CurrentRoll.wiggle > 0) {
                    scope.CurrentRoll.rolls[index]++;
                    scope.CurrentRoll.wiggle--;
                    scope.UpdateMax();
                }
            }
            scope.TableHighlight = function(index) {
                if (scope.CurrentRoll.Max == index) {
                    return 'success'   
                } else if (scope.CurrentRoll.rolls[index]>0) {
                    return 'info'   
                } else 
                    return ''
                
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