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


function RestoreCharacters(data) {
    console.log(data);
    for (var i=0; i < data.length; i++) {

        var newDice = [];
        console.log(i);
        console.log(data[i]);
        /*
        for (var t in data[i]) {
            console.log(t);
            console.log(data[i][t]);
        }
        
        console.log(typeof data[i].Dice);
        console.log(data[i]["Dice"]);
        console.log(data[i].Dice);
        */
        
        for (var dice_i=0; dice_i < data[i].Dice.length; dice_i++) {
            newDice[dice_i] = 
                new Dicepool(
                data[i].Dice[dice_i].Name, 
                data[i].Dice[dice_i].BasePool.Normal + "D" +
                data[i].Dice[dice_i].BasePool.Hard + "HD" +
                data[i].Dice[dice_i].BasePool.Wiggle + "W"
            )
            console.log("Built new dicepool")
            console.log(newDice[dice_i]);
        }
        data[i].Dice = newDice;

        //DamageTrack(lar, hardlar, har, hardhar, harfirst, locs)
        var oldTrack = data[i].Track;
        var newTrack = new DamageTrack(
            oldTrack.LAR,
            oldTrack.HardLAR,
            oldTrack.HAR,
            oldTrack.HardHAR,
            oldTrack.HARFirst,
            oldTrack.Locations
        );
        data[i].Track = newTrack;
    }
    
    return data;
}


function WTCharacter(name, order, stats, dice, track) {
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

function ParseDicePool(poolstring) {
    this.Normal = /(\d+)D/i.exec(poolstring);
    if (this.Normal != null) {
        this.Normal = parseInt(this.Normal[1]);
    } else {
        this.Normal = 0;
    }

    this.Hard = /(\d+)HD/i.exec(poolstring);
    if (this.Hard != null) {
        this.Hard = parseInt(this.Hard[1]);
    } else {
        this.Hard = 0;
    }

    this.Wiggle = /(\d+)W/i.exec(poolstring);
    if (this.Wiggle != null) {
        this.Wiggle = parseInt(this.Wiggle[1]);
    } else {
        this.Wiggle = 0;
    }

    this.toString = function() {
        var s = "";
        if (this.Normal > 0) {
            s += this.Normal + "D";
        }
        if (this.Hard > 0) {
            s += this.Hard + "HD";   
        }
        if (this.Wiggle > 0) {
            s += this.Wiggle + "WD";   
        }
        return s;
    }
}

function Dicepool(name, pool) {

    this.Name = name;
    this.BasePool = new ParseDicePool(pool);
    this.Poolstring = pool;
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
            this.PrettyString();
        }
    }

    this.PrettyString = function() {
        var ret = "";

        if (this.BasePool.Normal > 0) {
            ret += this.BasePool.Normal + "D"   
        }
        if (this.BasePool.Hard > 0 ) {
            ret += this.BasePool.Hard + "HD"   
        }
        if (this.BasePool.Wiggle > 0 ) {
            ret += this.BasePool.Wiggle + "W"   
        }
        this.Poolstring = ret;
    }

    this.SimpleRoll = function () {
        if (this.Rollable) {
            this.Update();
            var rolls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var roll = 0;
            for (var i = 0; i < this._ModifiedPool.Normal; i++) {
                roll = Math.floor(Math.random() * 10) + 1;
                rolls[roll - 1]++;
            }
            rolls[9] += this._ModifiedPool.Hard;
            return {rolls:rolls, wiggle:this._ModifiedPool.Wiggle}

        } else {
            return {rolls:[0,0,0,0,0,0,0,0,0,0],wiggle:0};   
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
        return this.Name + " <= " + this.Upper + " " + this.Track + "";
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

        var AllLoc = /\*$|\s+ALL$/i.test(damagestring);
        var NoHead = /%$|\s+nohead$/i.test(damagestring);

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

            DebugM("Healing!");

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
            DebugM("Damaging");


            if (!DamageObject.NonPhysical) {
                //If we're not non-phys

                DebugM("Applying Armor values");
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

                DebugM("AppHAR is " + AppHAR + "\nAppLAR is " + AppLAR);

                if (this.HARFirst) {
                    //Apply HAR first

                    DebugM("Applying HAR First\n" + "Shock is " + DamageObject.Shock + "\nKilling is " + DamageObject.Killing);

                    DamageObject.Shock = Math.max(DamageObject.Shock - AppHAR, 0);
                    DamageObject.Killing = Math.max(DamageObject.Killing - AppHAR, 0);

                    DebugM("Applied HAR First" + "\nShock is " + DamageObject.Shock + "\nKilling is " + DamageObject.Killing);

                    //Apply LAR

                    if (AppLAR > 0) {

                        DamageObject.Shock = Math.min(DamageObject.Shock, 1);

                        var KillToShock = Math.min(DamageObject.Killing, AppLAR);
                        DamageObject.Killing = DamageObject.Killing - KillToShock;
                        DamageObject.Shock += KillToShock;
                    }

                } else {
                    //Apply LAR first	 
                    DebugM("Applying LAR First" + "\nShock is " + DamageObject.Shock + "Killing is " + DamageObject.Killing);

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

                DebugM("Beginning damage stuff.\nTarget is " 
                       + target + "\nIncShock is " + IncShock + 
                       "\nIncKilling is " + IncKilling);


                while ((IncKilling + IncShock) > 0) {
                    DebugM("While Loop!\nTarget is " + target.Name + " " + 
                           target.Track.toString() + "\nIncShock is " + 
                           IncShock + "\nIncKilling is " + IncKilling);
                    //If there's open boxes, they get killed with killing first

                    if (target.Track.Open > 0) {
                        if (IncKilling > 0) {
                            DebugM("Applying killing damage to empty boxes");

                            var appKill = Math.min(target.Track.Open, IncKilling);
                            target.Track.Open -= appKill;
                            IncKilling -= appKill;
                            target.Track.Killing += appKill;
                            DebugM("Applied " + appKill + " killing. IncKilling is now " + IncKilling + 
                                   "\nIncShock is " + IncShock + "\nIncKilling is " + IncKilling);

                        } else {
                            DebugM("Applying shock damage to empty boxes");

                            var appShock = Math.min(target.Track.Open, IncShock);
                            target.Track.Open -= appShock;
                            target.Track.Shock += appShock;
                            IncShock -= appShock;
                            DebugM("Applied " + appShock + " shock. IncShock is now " + IncShock + " " + target.Track + "" +
                                   "\nIncShock is " + IncShock + "\nIncKilling is " + IncKilling);
                        }

                    } else if (target.Track.Shock > 0) {
                        //No open boxes. If there's shock boxes, we make them killing
                        DebugM("Converting shock boxes to killing");

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
                        DebugM("We don't have either shock boxes nor empty boxes." + 
                               "\nIncShock is " + IncShock + "\nIncKilling is " + IncKilling + 
                               "\nTarget is " + target.Track + "");

                        if (target.CarryOver != null) {
                            //Send it up the queue

                            DebugM("Carrying over damage" + 
                                   "\nOur target's carryover spot is " + target.CarryOver +
                                   "\nOur new DamageString is going to be:" + 
                                   "\n" + IncShock + "S" + IncKilling + "K! " + target.CarryOver)

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

var DebugMessages = false;

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

function CreateDisplayTestGroup() {

    var dudes = [];

    dude1 = new WTCharacter("Steve", 3, "Steve's statblock", [new Dicepool("Brawling", "7D1W"), new Dicepool("Shooting", "6D2HD")], HumanTrack(0));
    dude2 = new WTCharacter("Bob", 2, "Bob's statblock", [new Dicepool("Brawling", "3D1W"), new Dicepool("Shooting", "4D2HD1W")], HumanTrack(0));
    dude3 = new WTCharacter("Jane", 1, "Jane's statblock", [new Dicepool("Stability", "15D"), new Dicepool("Mind", "7D1W"), new Dicepool("Shooting", "6D2HD")], HumanTrack(0));

    dudes = [dude1, dude2, dude3];

    for (var i=0; i < dudes.length; i++) {
        
        dudes[i].Willpower = Math.floor(Math.random()*20)+1;
        dudes[i].BaseWill = Math.floor(Math.random()*10)+1;
        
    }
    
    return dudes;
}

