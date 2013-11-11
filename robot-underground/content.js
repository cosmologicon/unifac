
function initPlotState(ps) {
	for (var s in ps) delete ps[s]
	ps.act = 1
	ps.sweetheart = "Victoria"
	ps["angel.rescued"] = true
	ps.nextScene = "act1.firstmission"
}

function setupMission(ps, m) {
	if (ps.nextScene in setups) {
		setups[ps.nextScene](ps, m)
	} else {
		throw "Unknown scene: " + ps.nextScene
	}
}

var setups = {}

setups.gameover = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	m.setStartScript([
		["blank"],
		["say_l", "Camden was never seen again."],
		["say_l", "The world was destroyed in flames."],
		["say_l", "Your game is over."],
		["end_game"],
		// TODO: option to load saved game
	])
}

setups.finale = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	m.setStartScript([
		["blank"],
		["say_l", "Thanks for playing the Robot Underground JavaScript demo!"],
		["say_l", "Please leave your feedback!"],
		["say_l", "To find out what happens to Camden and the gang, check out the complete game!"],
		["end_game"],
	])
}

setups["act1.town"] = function (ps, m) {
	makeTown(m)
	var camden = m.addProtag([41, 640])
	
	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["if_first", "act1.goldhawk.intro", [
			["speaker_l", "Camden"],
			["speaker_r", "Goldhawk"],
			["say_l", "I'm alive! By Pancras, it's a miracle!"],
			["say_r", "Congratulations, Camden."],
			["say_r", "You got yourself into trouble back there, but you got yourself out again. That's the mark of a true soldier."],
			["say_r", "In any case, welcome to the town of Dollis Hill."],
			["say_l", "Dollis Hill? That's where I was supposed to be heading all along!"],
			["say_r", "Well, yes."],
			["say_r", "I was aware that you had been posted here, so when you didn't arrive, I set out to look for you in the Outer Zones."],
			["say_r", "I am Commander Goldhawk of the Order of Knightsbridge."],
			["say_l", "Sir!"],
			["say_r", "Oh, there's no need to be so formal."],
			["say_r", "Right now, you and I are the only soliders stationed here."],
			["say_r", "Most of the others are archaeologists here on the dig."],
			["say_r", "Why don't you go take a look around and introduce yourself?"],
			["say_r", "If you want to save, there's a duck by the fountain."],
		], [
			["speaker_r", "Goldhawk"],
			["say_r", "Welcome back, Camden."],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Goldhawk"],
		["say_r", "Camden, as soldiers of Knightsbridge, it's our duty to regularly patrol the Outer Zones."],
		["say_r", "As well as keeping the enemies there in check, you can bring back precious metals, and sometimes even salvaged arms and armour."],
		["ask_r", "Would you like to go there now?", [
			["Yes",
				["say_r", "Remember, you can eject from the Outer Zones at any time."],
				["say_r", "If things turn nasty, there's no shame in retreating."],
				["change_scene", 'act1.ozmission'],
			],
			["No",
				["say_r", "Talk to me again if you'd like to go adventuring later."],
			],
		]],
	], [35, 535], 'Goldhawk', null, 0xbad)

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["speaker_l", "Camden"],
		["if_first", "act1.putney.intro", [
			["say_r", "Everyone else seems to be doing such important things."],
			["say_r", "Do you think there's room in life for everyone to make an important contribution in their own way?"],
			["ask_l", "What should I say?", [
				["Absolutely.",
					["say_r", "Sometimes I wonder."],
				],
				["Life is what you make of it.", 
					["say_r", "I don't know whether I should be pleased to hear that, or terrified."],
				],
				["What a philosophical question.",
					["say_r", "Sorry."],
					["say_r", "You probably aren't interested at all."],
				],
			]],
		], [
			["say_r","What a funny old world it is."],
		]],
	], [1650, 1730], "Putney", null, 240)
	
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Angel"],
		["if_first", 'act1.angel.intro', [
			["say_l", "Hello!"],
			["say_r", "You must be Camden, right?"],
			["say_r", "I'm Angel, the expedition leader."],
			["say_l", "Expedition leader? Oh, there's some sort of archaeological thing going on here, isn't there?"],
			["say_r", "Yes, we're out here on the very edge of Zone 6 looking for an ancient relic called the Charing Cross."],
			["say_r", "I imagine someone probably explained this to you already, but you never know."],
			["say_r", "Anyway, you should go and talk to Hammersmith about getting the scanner array set up."],
			["say_r", "If you want to make yourself useful here, that is."],
			["say_l", "I should? Um, alright then."],
			["say_r", "See you later!"],
			"terminated",
		]],
		["say_r", "Hi, Camden."],
		["if_not_plotstate", 'act1.hammersmith.scanner', [
			["say_r", "I'm still waiting for that scanner array."],
			["if_not_plotstate", 'act1.hammersmith.quest', [
				["say_r", "You should go and talk to Hammersmith."],
		   	], [
				["if_first", 'act1.angel.cobalt', [
					["say_r", "You should go and talk to Hammersmith."],
					["say_l", "Um, I did."],
					["say_l", "He wants me to give him a load of cobalt."],
					["say_r", "Well, do that, then. You must have loads, right?"],
					["say_r", "If you don't, you can totally find some in the Outer Zones."],
				], [
					["say_r", "You should fetch Hammersmith that cobalt he wanted."],
				]],
			]],
			["say_l", "Um, right."],
			"terminated",
		]],
		["if_not_plotstate", 'act1.cleartheway', [
			["if_first", 'act1.angel.foundtemple', [
				["say_l", "Um, I brought the spanner array."],
				["say_r", "Oh, you have it? Give it here."],
				["say_r", "With this, I should totally be able to get a fix on the location of the ancient temple we were looking for."],
				["say_r", "Just a moment ..."],
				["say_r", "Right, there we go. Oh look, it was just over there all along."],
			]],
			["say_r", "Well, now we have the location of the temple, which is awesome, but you just know the route there is going to be crawling with monsters."],
			["say_r", "You're a soldier, so it's your responsibility to clear them out of the way, right?"],
			["ask_r", "Want to go and do it now?", [
				["Sure.",
					["say_r", "Then let's go!"],
					["change_scene", 'act1.cleartheway'],
				],
				["No way!",
					["say_r", "Later, then."],
				],
			]],
		], [
			["say_r", "Since you've cleared the way to the ancient temple, we can go there now if you like."],
			["ask_r", "Shall we?", [
				["Let's do it.",
					["say_r", "Ok!"],
					["change_scene", 'act1.bossfight'],
				],
				["No way!",
					["say_r", "Later, then."],
				],
			]],
		]],
	], [43, 725], "Angel", null, 325)
	
	var chalatscript = [
		["speaker_l", "Camden"],
		["speaker_r", "Chalfont & Latimer"],
		["if_first", 'act1.cnl.intro', [
			["say_l", "Hello!"],
			["speaker_r", "Latimer &"],
			["say_r", "Good day."],
			["say_r", "Corporal Camden, of the Order of Knightsbridge, presumably."],
			["say_l", "Um, yes, that's correct."],
			["say_r", "I am Sub-Inquisitor Latimer of the Holy Robot Empire, and this is my associate, Cardinal Chalfont."],
			["speaker_r", "Chalfont"],
			["say_r", "Bzzt! Bdrrrr zeep zeep kkzt scrweeeeeeeeee!"],
			["speaker_r", "Latimer &"],
			["say_r", "Quite so, my lord."],
			["say_r", "In any case, his Holiness the Robo-Pope is taking a very keen interest in this expedition, so we are here to keep an eye on our flock."],
			["say_r", "Please don't hesitate to consult us about your spiritual wellbeing at any time."],
			["say_l", "Um, right."],
		], [
			["speaker_r", "Chalfont"],
			["say_r", "Breeeeeep! Pip pip pip zreeeee!"],
			["speaker_r", "Latimer &"],
			["say_r", "Absolutely, my lord, at the first sign that they might have found it."],
			["say_r", "If we can pull this off, his Excellency will be most pleased with us."],
			["say_l", "I hope this isn't too overly cynical of me, but I'm somehow compelled to think that those two are suspicious."],
		]],
	]
	m.actorTalkScript(chalatscript, [755, 1001], "Chalfont", null, 90)
	m.actorTalkScript(chalatscript, [743, 964], "Latimer", null, 90)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Hammersmith"],
		["say_l", "Hello!"],
		["say_r", "Hello there, son."],
		["if_first", 'act1.hammersmith.intro', [
			["say_r", "I'm Colonel Hammersmith of the Order of Knightsbridge."],
			["say_l", "Sir!"],
			["say_r", "Oh, there's no need to be so formal."],
			["say_r", "Besides, I'm retired now. You and Commander Goldhawk are the only active soldiers in the village."],
			["say_l", "Oh, I see. Sorry."],
			["say_r", "It's a while since I've seen combat, but I'm still your man if you need any new parts attaching."],
		]],
		
		["if_plotstate", 'act1.angel.intro', [
			["if_first", 'act1.hammersmith.quest', [
				["say_l", "Um, Angel said I had to come to you and get something called a spanner array ..."],
				["say_r", "Oh, the scanner array? Yes, I remember. That Angel does like to make these strange requests."],
				["say_r", "I can put it together, but it'll take a fair amount of cobalt. About sixty-four units should do the trick."],
				["say_l", "Um, right."],
			]],
		]],
		
		["if_plotstate", 'act1.hammersmith.quest', [
			["if_not_plotstate", 'act1.hammersmith.scanner', [
				["if_has_metal", "Cobalt", 64, [
					["ask_l", "Shall I give Hammersmith 64 cobalt?", [
						["Yes",
							["set_plotstate", 'act1.hammersmith.scanner'],
							["change_metal", -64, "Cobalt"],
							["say_r", "There you go, son."],
							["say_r", "I'm sure Angel will be pleased to have that."],
							["say_l", "Um, thank you."],
							["say_l_unlabelled", "Received the SCANNER ARRAY."],
							["speaker_l", "Camden"],
						],
						["No",
							["say_r", "If you bring me 64 units of cobalt, I can put the scanner array together for you."],
						],
					]],
				], [
					["say_r", "If you bring me 64 units of cobalt, I can put the scanner array together for you."],
				]],
			]],
		]],
		
		["if_first", 'act1.hammersmith.inventory.intro', [
			["say_r", "I can help you out by explaning the properties of any items you've found."],
			["say_r", "I'll open your inventory for you, and if you look at a particular item, you can see the options for it."],
			["say_r", "If you don't know what it is yet, I'll appraise it for a small fee. If you do, I can attach it for you. In either case, I'll take it off your hands if you like."],
		]],

		["ask_r", "Need anything?", [
			["Inventory",
				["inventory"],
				// I'm adding this because clicks immediately after the inventory menu skip the first line
				// TODO: is there a better way?
				["say_r", ""],
				["if_first", 'act1.hammersmith.inventory.autofire', [
					["say_r", "I see you've found a weapon with the Autofire option available there."],
					["say_r", "Weapons with that mod can be either on, off, or autofiring, which will highlight them in green."],
					["say_r", "When autofiring, they will choose their own target, rather than taking your direction."],
					["say_r", "This can be either a blessing or a curse. Choose wisely."],
				]],
				["say_r", "Come back any time."],
			],
			["Leave",
			],
		]],
	], [1453, 2057], "Hammersmith", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["if_first", 'act1.harlesden.intro', [
			["say_l", "Hello!"],
			["say_l", "Um, I'm Camden. Who are you?"],
			["say_r", "I'm Professor Harlesden."],
			["say_r", "I came to join the dig because I'm an expert on the anthropological significance of the relics of the era of St Pancras."],
			["say_r", "But no-one seems to care."],
			["ask_l", "What should I say to him?", [
				["That's terrible.",
					["say_r", "I know."],
				],
				["Maybe you should pay more attention to the modern world.",
					["say_r", "I don't think I could cope with that, at my age."],
				],
			]],
		]],
		["say_r", "Oh, woe is me."],
	], [970, 1800], 'Harlesden', null, 290)
	
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "I sometimes try and target enemies and miss and end up moving."],
		["say_r", "It totally throws my balance off, but if you right-click or hold the Ctrl key, that doesn't happen."],
	], [1533, 664], "Pimlico", null, 312)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel",
			],
		]],
	], [940, 1090], "Cutty Sark", null, 289)

	if (!ps['act1.hammersmithgospel']) {
		gospel = m.addNPC([1437, 1944], 78, "Father Gospel")
		camden.addAreaScript([
			["set_plotstate", 'act1.hammersmithgospel'],
			["wait", 10],
			["deny"],
			["speaker_l", "Camden"],
			["say_l", "I hear raised voices ahead..."],
			["freeze", 20],
			["clear_l"],
			["speaker_r", "Hammersmith"],
			["say_r", "I don't care what you think! Putney and I are just fine!"],
			["speaker_l", "Gospel"],
			["say_l", "But the boy is growing up without the love of St Pancras!"],
			["say_l", "Do you wish to damn him as well?"],
			["say_r", "Oh, so I'm damned now, am I?"],
			["say_l", "Only the love of St Pancras can save you."],
			["say_r", "Well I guess I'm damned then!"],
			["say_l", "Do not say such things!"],
			["say_r", "I'll say what I want in my shop, and you say what you want in yours."],
			["say_l", "Hmph!"],
			["set_script_path", gospel, [[1385, 1847], [1608, 1592], [1584, 1211], [1607, 524], [633, 590], [619, 332], [743, 182]], 85],
			// There's some complicated business here with wait_until_moved but honestly I don't
			//   see the benefit.
			//["set_script_path", gospel, [[1385, 1847], [1608, 1592], [1584, 1211]], null],
			//["wait_until_moved", [gospel]],
			//["set_script_path", gospel, [[1607, 524], [633, 590], [619, 332], [743, 182]], 85],
		], [900, 1600], [800, 300])
		gospel.setTalkScript([
			["speaker_r", "Gospel"],
			["say_r", "That Hammersmith robot is insufferable!"],
			["say_r", "And poor Putney..."],
		])
	} else {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["say_l", "Hi, my name's Camden."],
			["speaker_r", "Gospel"],
			["say_r", "Good day to you, my son. I am Father Gospel, of the church of St Pancras."],
			["say_l", "May the light of St Pancras shine upon you."],
		], [743, 182], "Father Gospel", null, 85)
	}
}

setups["act1.firstmission"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "controlroom",
		bottom: "3rooms",
		maxrooms: 6,
	})
	var camden = m.addProtag(m.map.bottomPos([150, 150]))
	m.placeEnemiesRandomlyAnywhere({ Spider: 12, Scorpion: 8 })
	m.setStartScript([
		["change_music", null],
		["speaker_l", "Camden"],
		["say_l", "This is it ... I've had it."],
		["say_l", "How did I get myself into this mess? My first proper mission, and I'm going to die alone in this wasteland."],
		["say_l", "Dammit!"],
		["sound", "radio"],
		["say_r", "... you hear me? Repeat, can you hear me?"],
		["say_l", "What? Who's that? Is salvation at hand?"],
		["say_l", "Who is that?"],
		["say_r", "This is Commander Goldhawk of the Order of Knightsbridge.", "Goldhawk"],
		["say_r", "I can get you out of there, but you're going to have to follow my instructions carefully."],
		["say_l", "I'll do my best!"],
		["say_r", "First, make sure you can move."],
		["say_r", "Clicking on a patch of ground will move you there, assuming there's nothing in the way."],
		["say_r", "You will keep moving towards the cursor until you let go of the button, and then keep going to the latest target."],
		["say_r", "Try this now by moving into the room to your right."],
	])

	if (DEBUG.testdialogue) {
		m.actorTalkScript([
			["speaker_r", "Putney"],
			["speaker_l", "Camden"],
			["if_first", "act1.putney.intro", [
				["say_r", "Everyone else seems to be doing such important things."],
				["say_r", "Do you think there's room in life for everyone to make an important contribution in their own way?"],
				["ask_l", "What should I say?", [
					["Absolutely.",
						["say_r", "Sometimes I wonder."],
					],
					["Life is what you make of it.", 
						["say_r", "I don't know whether I should be pleased to hear that, or terrified."],
					],
					["What a philosophical question.",
						["say_r", "Sorry."],
						["say_r", "You probably aren't interested at all."],
					],
				]],
			], [
				["say_r","What a funny old world it is."],
			]],
		], m.map.bottomPos([50, 250]), "Putney", null, 240)
	}

	if (DEBUG.testinventory) {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Hammersmith"],
			["say_l", "Hello!"],
			["say_r", "Hello there, son."],
			["ask_r", "Need anything?", [
				["Inventory",
					["inventory"],
				],
				["Leave",
				],
			]],
			["say_r", "Come back any time."],
		], m.map.bottomPos([50, 50]), "Hammersmith", null, 270)
	}

	
	camden.addAreaScript([
		["wait", 25],
		["sound", "radio"],
		["wait", 5],
		["say_r", "Good work.", "Goldhawk"],
		["say_r", "Now, in the next room there's an enemy."],
		["say_r", "If you click on an enemy, it becomes your current target, and you'll continue to attack it until you select a different target or it dies."],
		["say_r", "You can move around while attacking, as long as you keep the target in sight and within range of your weapons, and as long as you have at least one active weapon."],
		["say_r", "You have a longer range than this enemy, so keep your distance and he can't hit you."],
//TODO		["say_r", "You can activate and deactivate your weapons by clicking the weapon icons on the lower left, or pressing the number key corresponding to their position."],
		["say_r", "You can activate and deactivate your weapons by clicking the weapon icons on the lower left."],
		["say_r", "Right now you only have one weapon, though, so probably best to keep it on."],
		["say_r", "Good luck, soldier."],
	], [300 + m.map.bottom_offs[0], 0 + m.map.bottom_offs[1]], [300, 300])	

	m.enemyDeathScript([
		["drop_metal", METALS[0], 4],
		["die"],
		["wait", 15],
		["sound", "radio"],
		["wait", 5],
		["say_r", "Good work!", "Goldhawk"],
		["say_r", "You'll notice that the enemy dropped some precious " + METALS[0].toLowerCase() + ", which you can pick up by moving over it."],
		["say_r", "Now, I'm working on restoring the extraction mechanism so that you can get out of there, but you'll need to get a little closer."],
		["say_r", "Move to the top of this area. There are more enemies on the way, but I'm sure you can handle them."],
		["speaker_l", "Camden"],
		["say_l", "Right, I'll do what I can."],
		["say_r", "Just keep your distance, and remember: if you're getting hurt, switch on your repair kit. Just like a weapon, click the icon."],
		["say_r", "Be careful, though. If you leave it switched on, it could drain energy from your weapons in a pinch."],
		["change_music", MISSION_MUSIC],
	], "Spider", [250 + m.map.bottom_offs[0], 650 + m.map.bottom_offs[1]])

	camden.addAreaScript([
		["sound", "radio"],
		["wait", 5],
		["say_r", "Nearly there, soldier.", "Goldhawk"],
		["say_r", "In the room up ahead are a powerful enemy and two minions."],
		["say_r", "Defeat those three and I should be able to get you out."],
	], [300 + m.map.top_offs[0], 0 + m.map.top_offs[1]], [2000, 300])

	var killScorpions = [
		["die_no_drop"],
		["increment", "killedScorpions"],
		["ifeq", "killedScorpions", 3, [
			["drop_weapon", ["MachineGun", null, ["Autofiring", 1]], [  // TODO
				["wait", 25],
				["sound", "radio"],
				["wait", 5],
				["say_r", "Ah, a weapon. When you get back to town, Colonel Hammersmith should be able to help you out with that.", "Goldhawk"],
				["say_r", "Now, I've managed to restore the extraction mechanism."],
				["say_r", "There should be an eject button in the bottom right corner of your screen."],
				["say_r", "You'll need to click on it, and then click again to confirm."],
				["say_r", "You can do so as soon as you're ready."],
				["canEject", true],
			]],
			["wait", 25],
			["sound", "radio"],
			["wait", 5],
			["say_r", "Excellent work.", "Goldhawk"],
			["say_r", "I see the scorpions were hoarding something of worth. You should pick it up and bring it with you."],
		]],
	]
	m.enemyDeathScript(killScorpions, "IntimidatingScorpion", [550 + m.map.top_offs[0], 750 + m.map.top_offs[1]], 270)
	m.enemyDeathScript(killScorpions, "Scorpion", [350 + m.map.top_offs[0], 650 + m.map.top_offs[1]], 290)
	m.enemyDeathScript(killScorpions, "Scorpion", [750 + m.map.top_offs[0], 650 + m.map.top_offs[1]], 250)
	
	m.canEject = false

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act1.town"],
	])

}

setups["act1.cleartheway"] = function (ps, m) {
	m.map = makeDungeon2({
		left: "entry_left",
		maxrooms: 12,
	})
	var camden = m.addProtag(m.map.leftPos([50, 150]))
	m.placeEnemiesRandomlyAnywhere({
		Spider: 8,
		Scorpion: 4,
		SpikeDrone: 8,
		StagBeetle: 12,
	})
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act1.cleartheway.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "Okay, Camden, I'll be monitoring the scanners. Good luck.", "Goldhawk"],
			["clear_r"],
			["say_l", "Right. I can do this."],
		]],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act1.town"],
	])
		
	m.setClearScript([
		["set_plotstate", 'act1.cleartheway'],
		["speaker_l", "Camden"],
		["sound", "radio"],
		["say_r", "That was the last one. Eject whenever you're ready.", "Goldhawk"],
		["add_xp", 64],
	])
}

setups["act1.bossfight"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "temple_end",
		bottom: "entry_bottom",
		maxrooms: 20,
		minroomsize: 2,
		maxroomsize: 3,
	})
	var camden = m.addProtag(m.map.bottomPos([250, 150]))
	m.placeEnemiesRandomlyAnywhere({
		Spider: 8,
		SpiderQueen: 2,
		SpikeDrone: 32,
		BladeDrone: 16,
		MiniTank: 16,
	})

	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([150, 450]), 0))
	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([150, 850]), 0))
	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([750, 450]), 180))
	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([750, 850]), 180))

	var door = m.entities.add(makeScenery("BlastDoor", m, m.map.topPos([450,650]), 90, true))
	
	m.setStartScript([
		["change_music", MISSION_MUSIC],
	])

	var boss = m.addBoss("Monument", m.map.topPos([450, 1750]), 270)
	boss.hostile = false
	boss.setTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Monument Asleep"],
		["say_l", "What's this?"],
		["say_l", "It looks really old ..."],
		["speaker_r", "Monument Awake"],
		["say_r", "INTRUSION DETECTED. ADOPTING COUNTERMEASURES."],
		["say_l", "Uh oh."],
		["change_music", LO_BOSS_MUSIC],
		["set_hostile", true],
		["do", door.close.bind(door)],
		["canEject", false],
	])

	boss.setDeathScript([
		["die"],
		["kill_type", "Minument"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Look! It's the Charing Cross!"],
		["say_l", "I should eject and tell Angel at once!"],
		["canEject"],
	])

	m.canEject = true
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["if_boss_dead", [
			["change_scene", "act1.party"],
		], [
			["change_scene", "act1.town"],
		]],
	])

}

setups["act1.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		SpikeDrone: 16,
		BladeDrone: 16,
		Spider: 16,
		Scorpion:16,
		StagBeetle: 16,
		MiniTank: 16,
		SpiderQueen: 8,
		ScorpionPack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([
		["change_music", OZ_MUSIC],
		["if_first", 'ozmission', [
			["sound", "radio"],
			["say_r", "Listen up, Camden. In the Outer Zones we can't sustain your power supply indefinitely.", "Goldhawk"],
			["say_r", "After five standard minutes, you will no longer regain energy. Clear what you can, but don't be a hero."],
		]],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act1.town"],
	])
}

setups["act1.party"] = function (ps, m) {
	makeTown(m)
	camden = m.addProtag([1201, 1230])
	camden.bearing = 71
	
	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["say_l", "Back at Dollis Hill, a spontaneous party has broken out to celebrate the recovery of the Charing Cross."],
		["speaker_l", "Camden"],
		["say_r", "Camden!"],
		["speaker_r", "Angel"],
		["say_r", "Camden! Over here."],
		["say_l", "Oh, hi, Angel. Everyone's having a good time."],
		["say_r", "So join us, join me, have a drink."],
		["say_l", "As soldier of Knightsbridge I have a duty..."],
		["say_r","You have a right to enjoy your victories. You should talk to everyone here, they all want to thank you."],
		["say_r", "Including me."],
		["set_plotstate", 'act1.party.counter', 0],
	])
	
	var theftScript = [
		["say_l", "Suddenly..."],
		["blank"],
		["speaker_l", "Camden"],
		["say_l", "What happened to the light?"],
		["speaker_r", "Goldhawk"],
		["say_r", "Easy, soldier. I'll sort it out."],
		["say_r", "..."],
		["freeze", 40],
		["say_r", "This should fix it."],
		["blank", false],
		["freeze", 10],
		["say_l", "Phew. What hap-"],
		["speaker_r", "Angel"],
		["say_r", "It's gone! The Cross has been stolen!"],
		["speaker_l", "Great Portland"],
		["say_l", "What's this?"],
		["speaker_r", "Harlesden cape"],
		["say_r", "That can't be true!"],
		["speaker_r", "Putney"],
		["say_r", "..."],
		["speaker_l", "Cutty Sark"],
		["say_l", "... Quack."],
		["clear_r"],
		["clear_l"],

		["blank"],
		["say_l", "A commotion arose amidst the party. Nobody knew who had taken the Charing Cross. Suspicion was rife."],
		["speaker_l", "Camden"],
		["speaker_r", "Angel"],
		["say_l", "What's going on, Angel? Who would steal it?"],
		["say_r", "I can't say. Sub-Inquisitor Latimer says he saw Putney leaving the party. So he's currently suspect."],
		["say_l", "Putney? No, I can't believe that. I mean, I don't really know him..."],
		["say_r", "Maybe none of us really did."],
		["say_l", "Well, I'm going to find out who did this. I'm responsible for losing it, after all."],
		["say_r", "It's not your fault. But thanks, I'll help you with your search. Together, we'll find out who did this!"],

		["set_plotstate", "act", 2],
		["addWeaponSlot"],
		["change_scene", "act2.town"],
	]

	m.actorTalkScript([
		["speaker_r", "Goldhawk"],
		["speaker_l", "Camden"],
		["if_first", 'act1.party.goldhawk', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Good work, soldier!"],
			["say_l", "Thank you, sir."],
			["say_r", "Cut it out with the 'sir', this is a party."],
			["say_l", "Sorry, but I feel that I should be on the look out for trouble."],
			["say_r", "That you should, but leave it today. You're no good to anyone if you're on edge the whole time."],
			["say_l", "Understood, sir. I mean... okay."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "Keep up the good work."],
		]],
	], [812, 1105], 'Goldhawk', null, 76)


	m.actorTalkScript([
		["speaker_r", "Putney"],
		["speaker_l", "Camden"],
		["if_first", 'act1.party.putney', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "We found the cross, thanks to you and everyone else."],
			["ask_l", "(Should I..)", [
				["Agree",
					["say_l", "Yes, it's good to feel part of something like this."],
					["say_r", "(Sigh.)"],
				],
				["Disagree",
					["say_l", "Don't forget your part in all this."],
					["say_r", "..."],
				],
			]],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["ask_r", "Enjoying the party?", [
				["Yes",
					["say_r", "Good."],
				],
				["No",
					["say_r", "Oh..."],
				],
			]],
		]],
	], [912, 918], "Putney", null, 43)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Angel"],
		["if_first", 'act1.party.angel', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Camden, finding the cross and this party, its all thanks to you."],
			["say_l", "Thanks, but it is my duty to..."],
			["say_r", "No, it isn't because of your duty, you do it out of goodness. I want you to know that we... that I really appreciate it."],
			["say_l", "... Thanks."],
			["clear_r"],
			["say_l", "... Was she... ? No... probably not."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "Weeeeeeeeeeee!"],
		]],
	], [1214, 1291], "Angel", null, 197)

	var cnlscript = [
		["speaker_l", "Camden"],
		["if_first", 'act1.party.cnl', [
			["increment_plotstate", 'act1.party.counter'],
			["speaker_r", "Latimer &"],
			["say_r", "Corporal Camden, his Holiness the Robo-Pope will be very pleased to hear of this progress."],
			["say_l", "That's good news. So what are the duties of a 'Sub-Inquisitor'?"],
			["speaker_r", "Chalfont &"],
			["say_r", "Brrzt bkzz. Peep peep krzz srweee."],
			["speaker_r", "Latimer &"],
			["say_r", "That's right."],
			["say_l", "..."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["speaker_r", "Chalfont &"],
			["say_r", "Buzz pip pip."],
		]],
	]
	m.actorTalkScript(cnlscript, [1152, 1102], "Chalfont", null, 135)
	m.actorTalkScript(cnlscript, [1182, 1122], "Latimer", null, 149)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_first", 'act1.party.portland', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Greetings, young one!"],
			["say_l", "Um, hi."],
			["say_r", "Your achievements here have been great, but I sense they are the start of a greater darkness."],
			["say_l", "Um, okay?"],
			["say_r", "Keep your guard up."],
			["clear_r"],
			["say_l", "That guy really makes me nervous."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "(Mutter mutter) terrible evil (mutter mutter) impending doom (mutter mutter)."],
			["say_l", "Best to not disturb him."],
		]],
	], [770, 1301], "Great Portland", null, 311, 45)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Hammersmith"],
		["if_first", 'act1.party.hammersmith', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Easy there, son. You've done a good job!"],
			["say_l", "So I'm told. Although everything has happened quite suddenly."],
			["say_r", "Get used to it. When I was in Knightsbridge you had to stay ahead of the game."],
			["say_l", "I'm surprised that the dig needed me. Commander Goldhawk seems to have everything under control."],
			["say_r", "With a find like this, we could be drawing a lot of attention. Shouldn't be surprised if the two of you aren't enough."],
			["say_l", "(Gulp.)"],
			["say_r", "Ha ha ha! Don't worry, son, I'll back you up"],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "It's a great day to be alive."],
		]],
	], [1195, 1346], "Hammersmith", null, 210)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden cape"],
		["if_first", 'act1.party.harlesden', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Ah, hello, Camden. Don't you think this is an incredible find?"],
			["say_l", "I don't really understand..."],
			["say_r", "The relics from the era of St. Pancras were mostly destroyed. Finding the Charing Cross has profound significance."],
			["say_r", "St. Pancras used the cross to restore life."],
			["say_l", "You mean, from a backup?"],
			["say_r", "Without a backup, dear boy."],
			["ask_l", "Wow.", [
				["I can see why you're excited.",
					["say_r", "Indeed."],
				],
				["Why are you dressed up?", 
					["say_r", "Oh this, I thought it was a costume party. So I put on my wizard's hat and cape."],
					["say_r", "I miss my youth."],
				],
			]],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "When I speak, how can I know that you hear?"],
		]],
	], [862, 1377], "Harlesden", null, 287)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Gospel"],
		["if_first", "act1.party.gospel", [
			["increment_plotstate", "act1.party.counter"],
			["say_r", "Good evening, my son."],
			["say_r", "You are the heroic soldier that brought this boon of St. Pancras upon us. Blessing to you."],
			["say_l", "Um... Thanks?"],
			["say_r", "And modest too, truly, you are a noble soul. Through you is manifested the love of St. Pancras himself."],
		], [
			["say_r", "Praise to St. Pancras, my son."],
		]],
	], [962, 968], 'Father Gospel', null, 190)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Cutty Sark"],
		["say_r", "Quack... quack..."],
		["say_l", "He's muttering in his sleep."],
	], [950, 1140], 'Cutty Sark', null, 129)
		
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "When I get tired and need a break, I go talk to the duck to save my progress."],
		["say_r", "He's asleep now though."],
	], [729, 978], "Pimlico", null, 26)
}

setups["act2.town"] = function (ps, m) {
	makeTown(m)
	camden = m.addProtag([41,640])

	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["if_first", 'act2.town', [
			["say_r", "Following the commotion at the party, an uneasy state of suspicion has spread throughout Dollis Hill."],
		]],
		["if_plotstate", 'act2.makewayforthepope', [
			["if_first", 'act2.popearrives', [
				["blank"],
				["speaker_r", "Latimer"],
				["say_r", "Make way for his Holiness, Robo-Pope Hornchurch 0x0D!"],
				["speaker_l", "Chalfont"],
				["say_l", "Skrrzzt! Beep beep beep! Bzzzzzrrrrr.... ZEEP!"],
				["speaker_r", "Hornchurch"],
				["say_r", "Thank you, Cardinal Chalfont, your kind words are much appreciated."],
				["say_l", "Bzzzzt. Skrzzzzzzzzeeep!"],
				["say_r", "Indeed."],
				["speaker_l", "Angel"],
				["say_l", "Welcome to Dollis Hill, your Holiness. I am Angel, leader of the archaeological expedition here."],
				["say_r", "Ah, so it was you who found and lost the Charing Cross."],
				["say_l", "No, that was Camden. I mean, Camden..."],
				["say_r", "Who is this Camden?"],
				["speaker_l", "Camden"],
				["say_l", "That's me, your Popeliness."],
				["say_r", "You will address me by my proper title, young man. I am much displeased with your performance here."],
				["say_r", "Your lack of vigilance has led to the loss of the Charing Cross. I shall be having harsh words with your superior officer."],
				["say_l", "Nice to meet you too."],
				["speaker_l", "Great Portland"],
				["say_l", "Harumph. What's going on here? Who's this chap?"],
				["speaker_r", "Chalfont"],
				["say_r", "Zzzzzzp! KZZZEEP! KZZZEEP!"],
				["say_l", "What's he doing here?"],
				["say_r", "Brrrrzzzt."],
				["say_l", "Well, I never voted for him."],
				["speaker_r", "Hornchurch"],
				["say_r", "Who is this insolent robot?"],
				["say_l", "Name's Great Portland, elder of this village. And I don't much care for your tone, whippersnapper."],
				["say_l", "Young Camden has been nothing but helpful in finding the Charing Cross."],
				["say_l", "It's not his fault that the Cross was stolen. I'd suggest you look elsewhere for your thief."],
				["say_r", "There shall be repercussions. Be warned."],
				["speaker_l", "Victoria"],
				["say_l", "What's all this commotion?"],
				["say_r", "Princess Victoria, you should not concern yourself with this rabble."],
				["say_l", "Oh, nonsense, Mr Pope. I'm sure they're lovely people. I'm sure Camden will be perfectly capable of escorting me back to town. You may leave."],
				["say_r", "Very well, your Majesty."],
				["say_r", "Come, Cardinal Chalfont, Sub-Inquisitor Latimer. We have business to attend to."],
				["speaker_l", "Chalfont &"],
				["say_l", "Kzzzzzrp! Bzzzzk bzzzzk bzzzzk."],
				["speaker_l", "Latimer &"],
				["say_l", "Coming, my Lord!"],
				["speaker_l", "Camden"],
				["speaker_r", "Angel"],
				["say_r", "Sorry, Camden. I think I landed you in it there. I feel terrible."],
				["ask_l", "What should I say?", [
					["Don't worry, it's not your fault.",
						["say_r", "It's very nice of you to say so."],
						["say_r", "You're always so nice to me."],
					],
					["That was a little mean of you.",
						["say_r", "I know. I'm really sorry. I'm a little bit thoughtless sometimes."],
					],
				]],
				["say_r", "Anyway, we should get back to town and try to find out who stole the Cross."],
				["say_l", "Sure, coming."],
				["speaker_r", "Victoria"],
				["say_r", "Hi, I'm a princess."],
				["say_l", "Hello, I'm Camden."],
				["say_r", "You're supposed to bow, you know. I am a princess."],
				["say_l", "Oh, sorry."],
				["say_r", "Don't worry. Daddy says it's important to be nice to peasants."],
				["say_r", "You can take me back to town now."],
				["clear_l"],
				["clear_r"],
				["blank", false],
				["say_l", "Camden leads Angel and Victoria back to town."],
				["speaker_r", "Angel"],
				["say_r", "You should ask around to see if anyone's heard anything about the Cross."],
				["say_r", "I'll be here if you find anything."],
			]],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Goldhawk"],
		["say_r", "Terrible business with the theft of the Charing Cross."],
		["if_first", 'act2.goldhawk', [
			["say_r", "As soldiers of Knightsbridge, it's our duty to remain ever vigilant against such crimes."],
			["say_r", "However, all this suspicion and accusation is tearing this community apart."],
			["say_r", "If you're smart, you won't get involved in these matters."],
			["if_plotstate", 'act2.makewayforthepope', [
				["say_r", "Leave the inquisitors of the Holy Robot Empire to their business."],
			]],
		]],
		["ask_r", "Anyway, would you like to go to the Outer Zones?", [
			["Yes",
				["say_r", "Good luck, soldier."],
				["change_scene", 'act2.ozmission'],
			],
			["No",
				["say_r", "Come back later if you change your mind."],
				["say_r", "And stay out of trouble."],
			],
		]],
	], [34, 535], "Goldhawk", null, 0xbad)

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["if_plotstate", 'act2.putneycleared', [
			["speaker_l", "Camden"],
			["say_r", "Thanks for helping to clear me, Camden."],
			["say_l", "Don't mention it."],
			["say_r", "But don't tell my dad, please."],
		], [
			["say_r", "What's going on? Why is everybody looking at me funny?"],
		]],
	], [1653, 1736], "Putney", null, 270)

	// Warning! Complicated dialogue tree ahead!
	var angelaskspope = [
		["say_r", "I know we're hunting for the Charing Cross, but you've got another mission too."],
		["say_r", "Robo-Pope Hornchurch is quite annoyed that we lost it, so he's coming over here to kick up a fuss."],
		["say_l", "The Robo-Pope is coming here?"],
		["say_r", "Yes, and he's a very powerful man, so it's important that we not get on his bad side."],
		["say_l", "He's not happy about the whole Cross thing then, is he?"],
		["say_r", "No, Camden, he's not."],
		["say_r", "Since you're a Knightsbridge soldier, you have to clear the way for him and his entourage."],
	]
	var putneyalibi = [
		["set_plotstate", 'act2.putneycleared'],
		["say_l", "Wait, I have proof that he's not."],
		["say_l", "Father Gospel says that he was with Putney at the time of the theft."],
		["say_r", "That's great! Chalfont and Latimer can't doubt the word of a robot of the cloth."],
		["say_r", "Let's go tell everyone!"],
		["blank"],
		["clear_l"],
		["clear_r"],
		["speaker_r", "Latimer"],
		["speaker_l", "Chalfont"],
		["say_r", "And so we find that the boy Putney, using powers of advanced hypnotism, has caused us all to become unable to perceive cruciform, that is, cross-shaped objects."],
		["say_l", "Bzzzzzzk! Zzzzzeeep!"],
		["say_r", "As his Eminence says, under orders from powers hostile to the Holy Robot Empire and our beloved Robo-Pope, he has spirited the cross away to be melted down to make an unholy pair of scissors."],
		["say_r", "With these scissors, he shall cut the very strands which support our beloved..."],
		["speaker_l", "Camden"],
		["say_l", "Wait!"],
		["say_l", "We have proof that Putney is innocent!"],
		["speaker_r", "Latimer &"],
		["say_r", "The very strands which..."],
		["speaker_l", "Gospel"],
		["say_l", "It is true, your Lordship."],
		["say_l", "At the time of the theft, Putney was with me."],
		["say_l", "I swear before St Pancras himself that he could not have stolen the Cross."],
		["speaker_r", "Chalfont &"],
		["say_r", "Skrrrrrrzp?"],
		["say_l", "Certainly, your Eminence."],
		["say_l", "I beg your leave now, to return to my duties."],
		["say_r", "Beeep! Zzzzzzrrrr."],
		["speaker_l", "Camden"],
		["say_l", "So now Putney is cleared."],
		["speaker_r", "Latimer &"],
		["say_r", "Not so fast. The Holy Inquisition is not so easily swayed."],
		["speaker_l", "Victoria"],
		["say_l", "Oh, don't be silly, Latimer. Putney's obviously innocent."],
		["speaker_r", "Chalfont &"],
		["say_r", "Zzzzrrrpeeep!"],
		["say_l", "Stop being a silly little cardinal man."],
		["say_l", "I say Putney's innocent, and I'm a princess."],
		["say_l", "Don't make me get Daddy."],
		["say_r", "Skzzzzt. Zzzoop. Beep beep bzzt."],
		["speaker_r", "Latimer &"],
		["say_r", "Your wisdom is, as ever, unbounded, my Lord."],
		["say_r", "We shall retire for further deliberations."],
		["speaker_r", "Putney"],
		["say_r", "Thanks, Miss Princess, ma'am!"],
		["say_r", "I was really worried what my dad would think when he found out."],
		["say_l", "That's OK. Hornchurch and his cronies are always trying to boss people around."],
		["say_r", "If there's ever anything I can do to repay you..."],
		["say_l", "Don't be silly. I'm a princess. What could you do to repay me?"],
		["say_l", "Anyway, I'm going to go look around."],
		["say_l", "I've never seen a proper peasant village before."],
		["clear_l"],
		["blank", false],
		["speaker_r", "Angel"],
		["say_r", "Now that Putney is cleared, we should look for the real thief."],
		["speaker_l", "Camden"],
		["say_l", "And you think that Chalfont and Latimer are involved?"],
		["say_r", "Well, I can't see why they'd come up with such a ridiculous theory if they weren't covering something up."],
		["say_l", "Good point."],
		["say_r", "They have a little hideout just outside of town. I found it one day when I was on the dig."],
		["say_r", "We should go investigate."],
	]
	m.actorTalkScript([
		["speaker_r", "Angel"],
		["speaker_l", "Camden"],
		["say_r", "Hi, Camden."],
		["if_first", "act2.angel.intro", [
			["say_r", "What are we going to do, Camden? This is terrible!"],
			["ask_l", "What should I say?", [
				["We should try to find the thief.",
					["say_r", "I don't know, that sounds like it could be dangerous."],
				],
				["It's someone else's problem.",
					["say_r", "That doesn't sound like you, Camden."],
					["say_l", "I guess I just don't know where to start."],
					["say_r", "Don't worry, I'll help."],
				],
			]],
		]],
		["if_plotstate", 'act2.makewayforthepope', [
			["if_plotstate", 'act2.putneycleared', [
				["say_r", "So, we think Chalfont and Latimer took the Cross?"],
				["say_r", "They're probably keeping it at their hideout. It could be dangerous though. You should make sure you're prepared."],
				["ask_r", "Want to go there now?", [
					["Cool!", 
						["say_r", "Right, let's go."],
						["change_scene", "act2.findthehideout"],
					],
					["No way!",
						["say_r", "Later, then."],
					],
				]],
			], [
				["say_r", "Chalfont and Latimer seem to think Putney is the thief."],
				["if_plotstate", 'act2.putneyalibi', putneyalibi, [
					["say_r", "But to be honest, I think those two are pretty suspicious themselves."],
				]],
			]],
		], [
			["if_first", "act2.angelaskspope", angelaskspope, [
				["say_r", "You still haven't cleared the way for the Robo-Pope."],
			]],
			["ask_r", "Want to do it now?", [
				["Ok.",
					["say_r", "Right!"],
					["change_scene", "act2.makewayforthepope"],
				],
				["No way!",
					["say_r", "Later, then."],
				],
			]],
		]],
	], [43, 725], "Angel", null, 325)

	if (plotstate['act2.makewayforthepope']) {
		m.actorTalkScript([
			["speaker_r", "Victoria"],
			["speaker_l", "Camden"],
			["if_first", "act2.victoria.intro", [
				["say_l", "So you're a princess?"],
				["say_r", "Yes."],
				["say_l", "..."],
				["say_r", "You may speak."],
				["say_l", "I don't really know what to say."],
				["say_r", "Hmmph."],
			], [
				["if_plotstate", 'act2.putneycleared', [
					["say_l", "That was really nice of you, what you did for Putney."],
					["say_r", "Of course it was. I'm a princess."],
				], [
					["say_l", "Do you know who stole the Cross?"],
					["say_r", "I'm a princess. I don't talk to thieves."],
				]],
			]],
		], [1151, 1325], "Victoria", null, 270)
	}

	var cnlscript = [
		["speaker_l", "Camden"],
		["speaker_r", "Latimer &"],
		["if_first", "act2.putneyaccused", [
			["say_r", "You will be glad to know that you have been removed from our investigation."],
			["speaker_r", "Chalfont"],
			["say_r", "Skrrrrrrzoop!"],
			["speaker_r", "Latimer &"],
			["say_r", "His Eminence Cardinal Chalfont extends his deepest apologies."],
			["say_l", "Tell him thanks."],
			["speaker_r", "Chalfont"],
			["say_r", "ZZZZZZZRRRRTT! KZZZEEEEEEEEE! Zoop! Zoop!"],
			["speaker_r", "Latimer &"],
			["say_r", "His Eminence can understand you perfectly himself. He's not an idiot."],
			["say_l", "Sorry."],
			["say_r", "Our investigations now center on the child Putney."],
		], [
			["if_plotstate", "act2.putneycleared", [
				["say_r", "It seems we were wrong about the child Putney."],
				["speaker_r", "Chalfont &"],
				["say_r", "Bzrzt. Krzee peep."],
				["speaker_r", "Latimer &"],
				["say_r", "Agreed, your eminence."],
			], [
				["say_r", "Our investigations still center on the child Putney."],
				["if_plotstate", "act2.putneyalibi", [
					["say_l", "What if I had someone who could vouch-"],
					["speaker_r", "Chalfont"],
					["say_r", "Bzeeeep zip zip zooop zeep dreeeeeeeeeee ping ping!"],
					["speaker_r", "Latimer &"],
					["say_r", "You presume that one such as yourself has the slightest scrap of wisdom to offer our investigation?"],
					["say_r", "His Eminence is mortally offended at your presumptuousness."],
					["clear_r"],
					["say_l", "Hmm... maybe I need Angel to back me up."],
				]],
			]],
		]],
	]
	m.actorTalkScript(cnlscript, [755, 1001], "Chalfont", null, 270)
	m.actorTalkScript(cnlscript, [743, 964], "Latimer", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_first", "act2.portland.intro", [
			["say_r", "This is a dark trial that has been put before us."],
			["say_l", "What do you mean?"],
			["say_r", "The theft, young one. It implies that one amongst us is a thief."],
			["say_l", "But who would want the Cross?"],
			["say_r", "Almost anyone. It is said to have the power to restore life."],
			["say_l", "Do you suspect anyone?"],
			["say_r", "I must not say."],
		], [
			["say_r", "..."],
			["say_l", "He seems to be thinking."],
		]],
	], [1088, 280], 'Great Portland', null, 90, 45)

	m.actorTalkScript([
		["speaker_r", "Hammersmith"],
		["ask_r", "What can I get you, son?", [
			["Inventory",
				["inventory"],
			],
			["Leave",
			],
		]],
	], [1453, 2057], "Hammersmith", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["if_first", "act2.harlesden.intro", [
			["say_r", "This is terrible."],
			["say_l", "I'm going to get it back!"],
			["say_r", "I hope you do, I really hope you do."],
		], [
			["say_r", "This is very bad."],
		]],
	], [970,1800], "Harlesden", null, 290)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel",
			],
		]],
	], [940, 1090], "Cutty Sark", null, 289)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Gospel"],
		["if_first", 'act2.gospel', [
			["if_plotstate", "act1.party.gospel", [], [
				["say_r", "Greetings, my son."],
				["say_l", "Hi, my name's Camden."],
				["say_r", "I am Gospel, priest of the Church of St. Pancras. But of course I know who you are..."],
				["say_r", "You are the heroic soldier that brought this boon of St. Pancras upon us. Blessings to you."],
				["say_l", "Um... Thanks?"],
				["say_r", "And modest too. Truly you are a noble soul. Through you is manifested the love of St. Pancras himself."],
			]],
		]],
		["if_plotstate", 'act2.makewayforthepope', [
			["if_first", "act2.gospel.alibi", [
				["say_l", "Father Gospel, Cardinal Chalfont & Sub-Inquisitor Latimer are convinced that Putney stole the Cross."],
				["say_r", "Really? That is interesting."],
				["say_l", "Do you know something?"],
				["say_r", "Well, I may just be able to provide the boy with an alibi."],
				["say_l", "Oh?"],
				["say_r", "Of course, it is really beneath one such as myself to involve myself in these mundane affairs of burglary."],
				["say_r", "Perhaps a donation to the chapel's coffers would ease my mind."],
				["say_l", "..."],
				["say_r", "All donations are welcome, but about 128 zinc would be much appreciated."],
			], [
				["if_plotstate", "act2.putneyalibi", [], [
					["say_r", "Yes, a donation of 128 zinc would definitely be the thing."],
				]],
			]],
			
			// TODO: I removed the ability to donate extra zinc, the logic was confusing and didn't
			//   seem worth it. Consider putting it back.
			["if_has_metal", "Zinc", 128, [
				["if_plotstate", "act2.putneyalibi", [
					["say_r", "Blessings of St. Pancras be upon you."],
				], [
					["ask_l", "Shall I give Gospel 128 zinc?", [
						["Yes",
							["set_plotstate", 'act2.putneyalibi'],
							["change_metal", -128, "Zinc"],
							["say_r", "Bless you, my son, for your kind donation."],
							["say_l", "Alibi?"],
							["say_r", "Yes, I was with Putney throughout the party. There is no way he could have left to steal the Cross."],
							["say_l", "That's it? That's your alibi?"],
							["say_r", "Are you doubting the words of a priest of St. Pancras?"],
							["say_l", "Ah, no, of course not."],
							["say_r", "Good, because their Eminences Chalfont and Latimer most certainly will not do so either."],
							["say_l", "I see..."],
						],
						["No",
							["say_r", "Blessings of St. Pancras be upon you."],
						],
					]],
				]],
			], [
				["say_r", "Blessings of St. Pancras be upon you."],
			]],
		], [
			["say_r", "Blessings of St. Pancras be upon you."],
		]],
	], [768, 134], 'Father Gospel', null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "When I'm on a mission I like to press tab to hide my HUD!"],
		["say_l", "When you're on a mission?"],
	], [1533, 664], "Pimlico", null, 312)
}

setups["act2.makewayforthepope"] = function (ps, m) {
	m.map = makeDungeon2({
		left: "entry_left",
		maxrooms: 12,
	})
	var camden = m.addProtag(m.map.leftPos([50,50]))
	m.placeEnemiesRandomlyAnywhere({
		BladeDrone: 12,
		SpiderQueen: 4,
		MachineGunTank: 8,
		FireScorpion: 16
	})
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act2.makewayforthepope.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "Make sure you clear out everything before the pope arrives. Good luck, Camden!", "Angel"],
		]],
	])

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act2.town"],
	])
		
	m.setClearScript([
		["set_plotstate", 'act2.makewayforthepope'],
		["sound", "radio"],
		["say_r", "That's great, Camden! The area's clear. You can come back now.", "Angel"],
		["add_xp", 64],
	])
}

setups["act2.findthehideout"] = function (ps, m) {
	m.map = makeDungeon2({
		top: 'entry_top',
		bottom: 't5base',
		maxrooms: 15,
	})
	var camden = m.addProtag(m.map.topPos([50,550]))
	m.placeEnemiesRandomlyAnywhere({
		MachineGunTank: 8,
		HeavyTank: 16,
		DrillTank: 16,
		SentryDroid: 14,
	})

	m.entities.add(makeEnemy("SentryDroid", m, m.map.bottomPos([350,1850])))
	m.entities.add(makeEnemy("SentryDroid", m, m.map.bottomPos([950,1450])))
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act2.findthehideout.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "Okay, the hideout is a little beyond here.", "Angel"],
			["say_r", "See if you can get inside and find out what's going on."],
			["say_l", "Right, I'm on my way."],
		]],
	])
			
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act2.town"],
	])

	camden.addAreaScript([
		["sound", "radio"],
		["wait", 10],
		["speaker_l", "Camden"],
		["say_r", "Camden? Camden? Come in, Camden!", "Angel"],
		["say_l", "Angel? This is Camden."],
		["say_r", "Camden, where are you? Have you reached the hideout yet?"],
		["say_l", "Yes, I'm inside. What's wrong?"],
		["say_r", "Camden, I think you should get out of there. It's ..."],
		["sound", "roar"],
		["blank"],
		["change_music", LO_BOSS_MUSIC],
		["speaker_r", "Arsenal"],
		["say_r", "Awright!"],
		["say_l", "Oh, my..."],
		["say_r", "You're going down, boy-o! Prepare to eat rust!"],
		["change_scene", "act2.bossfight"],
	], [m.map.bottom_offs[0], m.map.bottom_offs[1]], [800, 800])
}

setups["act2.bossfight"] = function (ps, m) {
	m.map = loadFixedMap('t5interior')
	camden = m.addProtag([150,150])
	camden.bearing = 45
	
	m.setStartScript([
		["change_music", LO_BOSS_MUSIC],
	])

	m.setEjectScript([
		["set_plotstate", "act", 3],
		["addWeaponSlot"],
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act3.town"],
	])

	// This is a particularly inelegant way of handling the fact that script specs are not
	//   arbitrary functions, like they were in the python version.
	// Try to avoid this sort of thing, okay?
	var setupcnl = (function (m, camden) {
		return function () {
			playmusic(LO_BOSS_MUSIC)
			camden.pos = [450,350]
			camden.currenthp = camden.getMaxHP()
			m.entities.add(camden)
			var chalfont = m.addEnemy("Chalfont", [250,550], 0)
			var latimer = m.addEnemy("Latimer", [650,550], 180)
			var cnlkillspec = [
				["die"],
				["increment", "cnlkilled"],
				["ifeq", "cnlkilled", 2, [
					["wait", 50],
					["speaker_l", "Camden"],
					["say_l", "Oh, my goodness."],
					["say_l", "What am I supposed to do now?"],
					["say_l", "Better eject back to town."],
					["canEject", true],
				]],
			]
			chalfont.setDeathScript(cnlkillspec)
			latimer.setDeathScript(cnlkillspec)
		}
	})(m, camden)

	m.enemyDeathScript([
		["change_music", null],
		["die"],
		["wait", 75],
		["speaker_l", "Camden"],
		["say_l", "Thank goodness."],
		["say_l", "What on earth was that?"],
		["sound", "radio"],
		["say_r", "Camden?", "Angel"],
		["say_l", "Angel?"],
		["say_r", "Camden, thank Pancras you're alright! Um, I ..."],
		["say_l", "Angel, what's going on? Who or what was that and how did ..."],
		["sound", "roar"],
		["speaker_r", "Arsenal"],
		["say_r", "Raaaaarrrgh!"],
		["say_r", "If I go down, I'm taking you with me!"],
		["kill_protag"],
		["set_zoom", 3],
		["wait", 50],
		["blank"],
		["set_zoom", 1],
		["clear_l"],
		["clear_r"],
		["say_l", "..."],
		["say_l", "....."],
		["say_l", "......."],
		["speaker_l", "Angel"],
		["say_l", "Camden?"],
		["speaker_r", "Camden"],
		["say_r", "Angel?"],
		["say_r", "What's going on?"],
		["say_r", "And is that ..."],
		["say_l", "Yes, it's the Charing Cross."],
		["say_l", "Camden, I'm so sorry."],
		["clear_l"],
		["say_r", "How did you ..."],
		["say_r", "Wait!"],
		["say_l", "Apologies, my recently-resurrected friend."],
		["say_l", "Her apparent change of heart just now notwithstanding, your floozy there has played you for a fool."],
		["say_l", "How wretched it must be, to be unable to penetrate even such a transparent deception."],
		["speaker_l", "Chalfont"],
		["say_l", "Bzzt skkkkrt bi-deep deep wheeeeeeeee!"],
		["speaker_l", "Chalfont & Latimer"],
		["say_r", "You!"],
		["speaker_l", "Latimer &"],
		["say_l", "How foolish of you to think you could oppose the might of the Holy Robot Empire!"],
		["say_r", "Angel! Wait!"],
		["say_l", "Don't disregard his lordship, thou heathen worm! We shall detain you here, by force if we have to!"],
		["do", setupcnl],
	], "Arsenal", [650,650], bearing=215)
}

setups["act2.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		DrillTank: 16,
		HeavyTank: 16,
		MachineGunTank: 16,
		FireScorpion: 16,
		SentryDroid: 16,
		BladeDrone: 16,
		Minument: 8,
		TankPack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([
		["change_music", OZ_MUSIC],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act2.town"],
	])
}


