# WTManager
A character/combat manager for One Roll Engine RPG games like Wild Talents

It's not finished yet, but this is a working version of my Wild Talents encounter management app thingydo.

//The link's dead at the moment

So right now all the die rolling and damage tracking stuff should work correctly. You can specify your dice pools and the engine will correctly prune out whatever you end up with to take care of penalties or making sure you're only rolling at most 10 dice and all that fun stuff. If you have wiggle dice in your pool, after you've rolled you'll be able to add them to existing sets or allocate them to whatever the hell number you want. You can also gobble dice from sets. It'll also highlight your widest set in green.

For the damage stuff, I think it should correctly apply HAR/LAR/hardened armor/penetration and all that other fun stuff. My goal for the damage tracker was to be able to tell it something like "3S3K 7" and have it apply 3 shock and 3 killing to location 7, so that's why there's a text input box down there. 

Other damage string format info:

You can start the string off with H and it'll heal damage instead.

Adding P and a number right after the damage (e.g. 3S3KP2 3 will give the attack a penetrating rating of 2). Instead of P, you can give it a ! (e.g. 3K! 10) to make it a non-physical attack that ignores all armor.

You can specify more than one location number to take damage, just separate them with commas. (e.g. 2S2K 1,5,10) and that should probably work.

There's also keywords like 'all' and 'nohead' that can be used to apply damage to either all the target's hit locations or everything but the head (which is how burning works and is the only reason I implemented that). Ideally * should be a valid substitute for 'all' and % should be a substitute for 'nohead', but that may not work.

It also handles damage carryover, so if you take more to your leg than your leg has boxes, those are correctly carried over to the torso.

Locations are highlighted in yellow if you've taken any killing damage or in red if the location is filled with killing.

Let me know what you think.

-Nate
