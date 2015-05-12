/*

Character
	Name	(text)
	Init Order (numeric)
	Statblock (big text block)
	Dicepools[] 
	Damagetrack
	
Dicepools
	Name
	Pool (Editable via a textbox)
	+/- buttons for penalty, bonus dice
	Roll button that shows the rolled sets. If there's wiggle dice in the pool, each set can be clicked to allocate a wiggle die to that pool. 
	A way to indicate that dice in a set have been gobbled
	
Damagetrack
	LAR Hardened: Y/N
	HAR Hardened: Y/N
	Specify whether the HAR or LAR is applied first
	Locations[]
		Name
		Upper bound
		Wounds - Maybe store as a string with O,S,K for open,shock,killing tracks
		Upper bound for a carryover damage location?

*/

function Character (name, order, stats, dice, track) {
    this.Name = name;
    this.Order = order;
    this.Statblock = stats;
    this.Dice = dice;
    this.Track = track;
}

function DebugM(str) {
    if (DebugMessages) {
        console.log(str);
    }

}

function ParseDicePool (poolstring) {
    var normal = /(\d+)D/i.exec(poolstring);
    if (normal != null) {
        normal = parseInt(normal[1]);
    } else {
        normal = 0;
    }

    var hard = /(\d+)HD/i.exec(poolstring);
    if (hard != null) {
        hard = parseInt(hard[1]);
    } else {
        hard = 0;
    }

    var wiggle = /(\d+)W/i.exec(poolstring);
    if (wiggle != null) {
        wiggle = parseInt(wiggle[1]);
    } else{
        wiggle = 0;
    }

    return {Normal:normal, Hard: hard, Wiggle:wiggle}
}

function Dicepool(name, pool) {

    this.Name = name;
    this.BasePool = ParseDicePool(pool);
    this.BonusDice = 0;
    this.PenaltyDice = 0;
    this._ModifiedPool = null;
    this.Rollable = true;

    this.Update = function () {
        var p = this.BasePool.Normal + this.BonusDice;
        var h = this.BasePool.Hard;
        var w = this.BasePool.Wiggle;

        var penalty = this.PenaltyDice;

        if (penalty >= (p + h + w)) {
            this.Rollable = false;
        }
        else {
            while (penalty > 0) {
                if (h > 0) {
                    h--;
                    penalty--;
                } else if (p > 0) {
                    p--;
                    penalty--;
                } else if (w > 0) {
                    w--;
                    penalty--;
                }
            }

            var size = p + h + w;

            while (size > 10) {
                if (p > 0) {
                    p--;
                    size--;
                } else if (h > 0) {
                    h--;
                    size--;
                } else if (w > 0) {
                    w--;
                    size--;
                }
            }

            this._ModifiedPool = { Normal: p, Hard: h, Wiggle: w };
            this.Rollable = true;
        }
    }

    this.Roll = function () {
        if (this.Rollable) {
            var rolls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var count = 0;
            var roll = 0;
            for (var i = 0; i < this._ModifiedPool.Normal; i++) {
                roll = Math.floor(Math.random() * 10) + 1;
                rolls[roll - 1]++;
                count++;
            }
            rolls[9] += this._ModifiedPool.Hard;
            count += this._ModifiedPool.Hard;

            if (DebugMessages) {
                DebugM("Here's the raw roll output")
                var dout = "";
                for (var j = 0; j < rolls.length; j++) {
                    dout += rolls[j] + " ";
                }
                DebugM(dout);
            }

            var sets = [];
            var height = 0;
            var width = 0;
            var oneset = [];


            while (count > 0) {
                for (var i = 0; i < rolls.length; i++) {
                    if (rolls[i] >= width) {
                        width = rolls[i];
                        height = i;
                    }
                }

                rolls[height] = 0;

                DebugM("Loop");
                DebugM("Count: " + count);
                DebugM("Width: " + width);
                DebugM("Height: " + height);

                count = count - width;
                for (var i = 0; i < width; i++) {
                    oneset.push(height + 1);
                }

                DebugM("Oneset.length: " + oneset.length + " Value: " + oneset[0])

                sets.push(oneset)
                width = 0;
                height = 0;
                oneset = [];
            }

            return { Sets: sets, Wiggle: this._ModifiedPool.Wiggle }
        }
        else {
            return { Sets: [], Wiggle: 0 }
        }
    }

    this.Update();
}

var SHOCKSYMBOL = "\\";
var KILLINGSYMBOL = "X";
var OPENSYMBOL = "O";

function DamageLocation(name, upper, wounds, carryover) {
	
	this.Name = name;
	this.Upper = upper;
	this.Track = wounds;
	this.CarryOver = carryover;

	this.toString = function () {
	    return this.Name + " <= " + this.Upper + " " + this.Track + " ";
	}

}

function Track(shock, killing, open) {
	
	this.Shock = shock;
	this.Killing = killing;
	this.Open = open;
	
	this.toString = function () {
		retstring = "";
		
		for (var i=0; i < this.Killing; i++) {
			retstring += KILLINGSYMBOL;
		}
		
		for (var i=0; i < this.Shock; i++) {
			retstring += SHOCKSYMBOL;
		}
		
		for (var i=0; i < this.Open; i++) {
			retstring += OPENSYMBOL;
		}
		
		return retstring;
	}
}

function DamageTrack(lar, hardlar, har, hardhar, harfirst, locs) {
	
	this.LAR = lar;
	this.HardLAR = hardlar;
	this.HAR = har;
	this.HardHAR = hardhar;
	this.HARFirst = harfirst;
	this.Locations = locs;
	

/*
    Return type is:
    {
		Heal: Heal, 
		Shock:ShockAmount, 
		Killing:KillingAmount, 
		NonPhysical:NP, 
		Pen: PenAmount, 
		Locations:Locations
	}
*/
	this.ParseDamage = function (damagestring) {
	    var ShockAmount = /(\d+)S/i.exec(damagestring);
	    if (ShockAmount != null) {
	        ShockAmount = parseInt(ShockAmount[1]);
	    } else {
	        ShockAmount = 0;
	    }

	    var KillingAmount = /(\d+)K/i.exec(damagestring);
	    if (KillingAmount != null) {
	        KillingAmount = parseInt(KillingAmount[1]);
	    } else {
	        KillingAmount = 0;
	    }

	    var NP = /!/.test(damagestring);
	    var Heal = /^H/i.test(damagestring);

	    var PenAmount = /P(\d+)/i.exec(damagestring);
	    if (PenAmount != null) {
	        PenAmount = parseInt(PenAmount[1]);
	    } else {
	        PenAmount = 0;
	    }

	    var AllLoc = /\*$/.test(damagestring);
	    var NoHead = /%$/.test(damagestring);

	    if (AllLoc) {
	        Locations = [];
	        for (var i = 0; i < this.Locations.length; i++) {
	            Locations.push(this.Locations[i].Upper);
	        }

	    } else if (NoHead) {
	        Locations = [];
	        if (this.Locations.length > 1) {
	            for (var i = 0; i < this.Locations.length - 1; i++) {
	                Locations.push(this.Locations[i].Upper);
	            }
	        } else {
	            Locations = [10];
	        }
	    }
	    else {
	        var Locations = /\s+([\d,]+)$/.exec(damagestring);
	        Locations = Locations[1].split(",");
	        for (var i = 0; i < Locations.length; i++) {

	            Locations[i] = parseInt(Locations[i]);

	        }
	    }
	    return {
	        Heal: Heal,
	        Shock: ShockAmount,
	        Killing: KillingAmount,
	        NonPhysical: NP,
	        Pen: PenAmount,
	        Locations: Locations
	    };
	}
	
	this.PickLocation = function (number) {
		for (var i=0; i < this.Locations.length; i++) {
			if (number <= this.Locations[i].Upper)
				return this.Locations[i];
		}
	}

	this.TakeDamage = function (damagestring) {
	    DamageObject = this.ParseDamage(damagestring);
	    /*
	    if (DebugMessages) {
	    console.log("Here's out DamageObject");
	    console.log("Heal" + DamageObject.Heal);
	    console.log("Shock" + DamageObject.Shock);
	    console.log("Killing" + DamageObject.Killing);
	    console.log("NonPhysical" + DamageObject.NonPhysical);
	    console.log("Pen" + DamageObject.Pen);
	    console.log("Locations" + DamageObject.Locations);
	    }
	    */

	    //Our first main decision, are we healing damage or taking it
	    if (DamageObject.Heal) {
	        if (DebugMessages) {
	            console.log("Healing!");
	        }
	        //Hooray! The easiest thing to do
	        for (var i = 0; i < DamageObject.Locations.length; i++) {
	            var t = this.PickLocation(DamageObject.Locations[i]);

	            var ShockHealAmount = (DamageObject.Shock >= t.Track.Shock) ? t.Track.Shock : DamageObject.Shock;
	            var KillingHealAmount = DamageObject.Killing >= t.Track.Killing ? t.Track.Killing : DamageObject.Killing;

	            //Healing doesn't carry over to additional locations

	            t.Track.Shock -= ShockHealAmount;
	            t.Track.Open += ShockHealAmount;

	            t.Track.Killing -= KillingHealAmount;
	            t.Track.Open += KillingHealAmount;
	        }


	    } else {
	        //We're making things hurt
	        if (DebugMessages) {
	            console.log("Damaging");
	        }

	        if (!DamageObject.NonPhysical) {
	            //If we're not non-phys
	            if (DebugMessages) {
	                console.log("Applying Armor values");
	            }
	            var AppHAR;
	            var AppLAR;

	            if (this.HardLAR) {
	                AppLAR = this.LAR;
	            } else {
	                AppLAR = Math.max(this.LAR - DamageObject.Pen, 0)
	            }

	            if (this.HardHAR) {
	                AppHAR = this.HAR;
	            } else {
	                AppHAR = Math.max(this.HAR - DamageObject.Pen, 0)
	            }

	            if (DebugMessages) {

	                console.log("AppHAR is " + AppHAR);
	                console.log("AppLAR is " + AppLAR);

	            }


	            if (this.HARFirst) {
	                //Apply HAR first

	                if (DebugMessages) {
	                    console.log("Applying HAR First");
	                    console.log("Shock is " + DamageObject.Shock);
	                    console.log("Killing is " + DamageObject.Killing);
	                }

	                DamageObject.Shock = Math.max(DamageObject.Shock - AppHAR, 0);
	                DamageObject.Killing = Math.max(DamageObject.Killing - AppHAR, 0);

	                if (DebugMessages) {
	                    console.log("Applied HAR First");
	                    console.log("Shock is " + DamageObject.Shock);
	                    console.log("Killing is " + DamageObject.Killing);
	                }


	                //Apply LAR

	                if (AppLAR > 0) {

	                    DamageObject.Shock = Math.min(DamageObject.Shock, 1);

	                    var KillToShock = Math.min(DamageObject.Killing, AppLAR);
	                    DamageObject.Killing = DamageObject.Killing - KillToShock;
	                    DamageObject.Shock += KillToShock;
	                }

	            } else {
	                //Apply LAR first	 
	                if (DebugMessages) {
	                    console.log("Applying LAR First");
	                    console.log("Shock is " + DamageObject.Shock);
	                    console.log("Killing is " + DamageObject.Killing);
	                }

	                if (AppLAR > 0) {
	                    DamageObject.Shock = Math.min(DamageObject.Shock, 1);

	                    var KillToShock = Math.min(DamageObject.Killing, AppLAR);
	                    DamageObject.Killing = DamageObject.Killing - KillToShock;
	                    DamageObject.Shock += KillToShock;
	                }

	                //Apply HAR
	                DamageObject.Shock = Math.max(DamageObject.Shock - AppHAR, 0);
	                DamageObject.Killing = Math.max(DamageObject.Killing - AppHAR, 0);
	            }

	        }


	        /*Armor has been applied or doesn't matter.*/
	        /*
	        if (DebugMessages) {
	        console.log("Armor has been applied");
	        console.log("Here's out DamageObject");
	        console.log("Heal" + DamageObject.Heal);
	        console.log("Shock" + DamageObject.Shock);
	        console.log("Killing" + DamageObject.Killing);
	        console.log("NonPhysical" + DamageObject.NonPhysical);
	        console.log("Pen" + DamageObject.Pen);
	        console.log("Locations" + DamageObject.Locations);
	        }
	        */

	        for (var i = 0; i < DamageObject.Locations.length; i++) {
	            var target = this.PickLocation(DamageObject.Locations[i]);
	            var IncShock = DamageObject.Shock;
	            var IncKilling = DamageObject.Killing;

	            var DamageLoss = false;

	            if (DebugMessages) {
	                console.log("Beginning damage stuff.\nTarget is " + target + "\nIncShock is " + IncShock + "\nIncKilling is " + IncKilling)
	            }

	            while ((IncKilling + IncShock) > 0) {
	                if (DebugMessages) {
	                    console.log("While Loop!\nTarget is " + target.Name + " " + target.Track.toString() + "\nIncShock is " + IncShock + "\nIncKilling is " + IncKilling)
	                }
	                //If there's open boxes, they get killed with killing first

	                if (target.Track.Open > 0) {
	                    if (IncKilling > 0) {
	                        if (DebugMessages) {
	                            console.log("Applying killing damage to empty boxes");
	                        }
	                        var appKill = Math.min(target.Track.Open, IncKilling);
	                        target.Track.Open -= appKill;
	                        IncKilling -= appKill;
	                        target.Track.Killing += appKill;
	                        if (DebugMessages) {
	                            console.log("Applied " + appKill + " killing. IncKilling is now " + IncKilling);
	                            console.log("IncShock is " + IncShock + "\nIncKilling is " + IncKilling);
	                        }
	                    } else {
	                        if (DebugMessages) {
	                            console.log("Applying shock damage to empty boxes");
	                        }
	                        var appShock = Math.min(target.Track.Open, IncShock);
	                        target.Track.Open -= appShock;
	                        target.Track.Shock += appShock;
	                        IncShock -= appShock;
	                        if (DebugMessages) {
	                            console.log("Applied " + appShock + " shock. IncShock is now " + IncShock + " " + target.Track + "");
	                            console.log("IncShock is " + IncShock + "\nIncKilling is " + IncKilling);
	                        }
	                    }

	                } else if (target.Track.Shock > 0) {
	                    //No open boxes. If there's shock boxes, we make them killing
	                    if (DebugMessages) {
	                        console.log("Converting shock boxes to killing");
	                    }
	                    if (IncKilling > 0) {
	                        //Convert some killing to shock
	                        IncKilling--;
	                        IncShock += 2;

	                    } else {
	                        var appShock = Math.min(target.Track.Shock, IncShock);
	                        target.Track.Shock -= appShock;
	                        target.Track.Killing += appShock;
	                        IncShock -= appShock;
	                    }

	                } else {
	                    //We've got neither shock nor open boxes, just killing
	                    if (DebugMessages) {
	                        console.log("We don't have either shock boxes nor empty boxes.");
	                        console.log("IncShock is " + IncShock + "\nIncKilling is " + IncKilling);
	                        console.log("Target is " + target.Track + "");
	                    }

	                    if (target.CarryOver != null) {
	                        //Send it up the queue

	                        if (DebugMessages) {
	                            console.log("Carrying over damage");
	                            console.log("Our target's carryover spot is " + target.CarryOver);
	                            console.log("Our new DamageString is going to be:");
	                            console.log("" + IncShock + "S" + IncKilling + "K! " + target.CarryOver)
	                        }

	                        var newDamStr = "" + IncShock + "S" + IncKilling + "K! " + target.CarryOver

                            //After you blowed it up, you can't carry over from it anymore.
	                        target.CarryOver = null;

	                        this.TakeDamage(newDamStr);
	                        IncKilling = 0;
	                        IncShock = 0;
	                    } else {
	                        DamageLoss = true;
	                        IncKilling = 0;
	                        IncShock = 0;
	                    }

	                }

	            }


	        }


	    }

	}

    this.StatusString = function () {
        var out = "I'm a debug damage track.\n"
        for (var i=0; i < this.Locations.length; i++) {
            var loc = this.Locations[i];
            out += loc.Name + " " + loc.Track.toString() + "\n"
        }

        return out;
    }

}

/*Testing stuff*/

var DebugMessages = true;

test1 = new DamageTrack(0,false,0,false,false,[]);

testDO1 = test1.ParseDamage("H3S3K 10");

function HumanTrack(extratough) {
    
    var locs =[ new DamageLocation("Left Leg", 1, new Track(0, 0, 5 + extratough), 7), 
                new DamageLocation("Right Leg", 2, new Track(0,0,5+extratough),7), 
                new DamageLocation("Left Arm", 4, new Track(0,0,5+extratough), 7),
                new DamageLocation("Right Arm", 6, new Track(0,0,5+extratough), 7),
                new DamageLocation("Torso", 9, new Track(0,0,10+extratough), null),
                new DamageLocation("Head", 10, new Track(0,0,4+extratough), null)]
    
    return new DamageTrack(0, false, 0, false, true, locs);
}

var test2 = HumanTrack(0);
test2.StatusString();
test2.TakeDamage("3S 5");

var dicetest1 = new Dicepool("Steve", "6D2HD3W");
dicetest1.Roll();
