
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
		// TODO: option to load saved game?
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

setups["act3.town"] = function (ps, m) {
	makeTown(m)
	var camden = m.addProtag([100,800])

	var hammersmithScript = [
		["sound", "radio"],
		["say_r", "Camden, come in, son. This is Hammersmith, I need you to come see me in town.", "Hammersmith"],
		["say_r", "I have important information for you."],
	]
	
	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["if_first", 'act3.town', [
			["set_plotstate", 'act3.quests', 0],
			["speaker_l", "Camden"],
			["speaker_r", "Putney"],
			["say_l", "Putney?"],
			["say_r", "Camden, the fountain is surrounded by tanks!"],
			["say_l", "What? Why?"],
			["say_r", "Robo-Pope Hornchurch has seized control of the village. He's just marched in!"],
			["say_l", "Hornchurch? Oh no, Angel must've been in league with him! This is all part of their plan!"],
			["speaker_r", "Victoria"],
			["say_r", "I always knew that rotten Hornchurch was no good."],
			["speaker_r", "Putney"],
			["say_r", "They're after Victoria, they're searching all over for her."],
			["say_l", "Why, Victoria?"],
			["speaker_r", "Victoria"],
			["say_r", "Because I'm a princess."],
			["speaker_r", "Putney"],
			["say_r", "We have to get her out of here. It's not safe."],
			["say_l", "But where shall we go?"],
			["say_r", "I know a cave, it's infested with vermin, but I'm sure you can clear it out."],
			["speaker_r", "Victoria"],
			["say_r", "Infested? No, that won't do, you'll have to find me somewhere else."],
			["say_l", "I'm sorry, Princess, but you may not have a choice."],
			["say_r", "Insolence!"],
			["say_l", "Call it what you will. I don't work for Hornchurch though, I'm on your side. Your chances are better with me than here on your own."],
			["speaker_r", "Putney"],
			["say_r", "Talk to me when you're ready."],
		]],
	])

	var tankps = [[1255, 1445], [1255, 949], [750, 949], [750, 1445]]
	var bearings = [225, 135, 45, 315]
	for (var j = 0 ; j < 4 ; ++j) {
		if (!ps["act3.tank" + j + "dead"]) {
			m.enemyDeathScript([
				["set_plotstate", "act3.tank" + j + "dead"],
				["die"],
			], "TownTank", tankps[j], bearings[j])
		}
	}

	if (!ps["act3.killsomespiders"]) {
		m.actorTalkScript([
			["speaker_r", "Goldhawk"],
			["say_r", "Stick it out, soldier. We'll get through this."],
		], "Goldhawk", [1530, 1450], null, 0)

		m.actorTalkScript([
			["speaker_r", "Victoria"],
			["say_r", "I'm a princess! I don't want to live in a cave!"],
		], [135, 835], "Victoria", null, 265)
	}

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["if_plotstate", 'act3.killsomespiders', [
			["say_r", "I hope Victoria's okay."],
			["ask_r", "Do you need something?", [
				["Outer Zones", 
					["say_r", "Right!"],
					["set_plotstate", 'act3.ozfrom', 'act3.town'],
					["change_scene", "act3.ozmission"],
				],
				["Victoria's Secret Cave",
					["say_r", "Right!"],
					["change_scene", "act3.camp"],
				],
				["Nothing",
					["say_r", "Later, then."],
				],
			]],
		], [
			["ask_r", "Do you need something?", [
				["Clear the cave",
					["say_r", "Right!"],
					["change_scene", "act3.killsomespiders"],
				],
				["Outer Zones"
					["say_r", "Right!"],
					["set_plotstate", 'act3.ozfrom', 'act3.town'],
					["change_scene", "act3.ozmission"],
				],
				["Nothing",
					["say_r", "Later, then."],
				],
			]],
		]],
	], [131, 761], "Putney", null, 95)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_plotstate", 'act3.portland.questdone', [
			["say_r", "..."],
			["say_l", "..."],
			["say_r", "...?"],
			["say_l", "Wow. How did you do that?"],
			["say_r", "The young are too impatient to learn."],
			"terminated",
		]],
		["if_plotstate", "act3.killsomespiders", [
			["if_first", "act3.portland.quest", [
				["say_r", "This is a time of uncertain futures, young one. We all must come together or be torn apart."],
				["say_r", "I have, for you, an important quest. I dare say the most important quest there is."],
				["say_r", "It will challenge every aspect of your fitness and faculties. It will push you to achieve more."],
				["say_r", "More importantly, it will ensure the safety of this village and all who live in it."],
				["say_r", "You, Camden, must fetch me 32 units of molybdenum."],
				["say_l", "That's it?"],
				["say_r", "Yes. Now go."],
			], [
				["say_r", "Camden, I yet await those 32 units of molybdenum."],
			]],
			["if_has_metal", "Molybdenum", 32, [
				["ask_l", "Shall I give Great Portland 32 molybdenum?", [
					["Yes",
						["set_plotstate", 'act3.portland.questdone'],
						["increment_plotstate", 'act3.quests'],
						["change_metal", -32, "Molybdenum"],
						["say_r", "Excellent work, young one, now leave me."],
						["if_plotstate_counter", 'act3.quests', 2, [["runScript", hammersmithScript, 50]]],
					],
					["No",
					],
				]],
			]],
		], [
			["say_r", "These are dark times for our village."],
		]],
	], [1088, 280], "Great Portland", null, 90, 45)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Hammersmith"],
		["if_plotstate_counter", 'act3.quests', 2, [
			["if_first", 'act3.hammersmith.mission', [
				["say_r", "Good to see you, son."],
				["say_l", "What's up?"],
				["say_r", "Goldhawk's gone missing. He went undercover in the enemy base but he hasn't reported in."],
				["say_r", "You've gotta go in there and find him, son."],
				["say_l", "Okay, I'm there."],
				["say_r", "Are you sure? This is a dangerous mission. There's no telling if you'll come back."],
				["say_l", "Definitely. Goldhawk pulled me out of a mess just before I got here."],
				["say_l", "I owe him a favour, as my CO and my friend."],
				["say_r", "You got it, son. I know you're gonna go far."],
			], [
				["say_r", "Goldhawk's still not back."],
			]],
			["ask_r", "What will you do?", [
				["Rescue Goldhawk",
					["say_r", "Good luck, son!"],
					["change_scene", "act3.assaultthebase"],
				],
				["Inventory",
					["inventory"],
					["say_r", "Come back any time."],
				],
				["Nothing",
				],
			]],
		], [
			["ask_r", "Need anything?", [
				["Inventory",
					["inventory"],
					["say_r", "Come back any time."],
				],
				["Leave",
				],
			]],
		]],
	], [1453, 2057], 'Hammersmith', null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["if_plotstate", 'act3.harlesden.questdone', [
			// The hell is this...?
			["say_r", "What if I am a butterfly who dreams of being a robot?"],
			"endConversation",
			["say_r", "What if I am a butterfly who dreams of being a robot?"],
			["say_l", "What if you're a butterfly who dreams of being a flying egg-thing with dangly arms?"],
			"endConversation",
			["say_r", "Your questions pierce me to my core. Am I my form, or am I my nature?"],
			"endConversation",
			["say_r", "Am I my form, or am I my nature?"],
			["say_l", "Are you always this philosophical, or are you on drugs?"],
		], [
			["if_plotstate", 'act3.killsomespiders', [
				["if_first", "act3.harlesden.quest", [
					["say_r", "Camden, I would like to ask you a favour."],
					["say_r", "I am currently working on a particularly incisive research project."],
					["say_r", "However, progress is stalled for want of a large amount of molybdenum."],
					["say_r", "If you could fetch me 32 units, that would be very useful."],
				], [
					["say_r", "I could still use 32 units of molybdenum."],
				]],
				["if_has_metal", "Molybdenum", 32, [
					["ask_l", "Shall I give Harlesden 32 molybdenum?", [
						["Yes",
							["set_plotstate", 'act3.harlesden.questdone'],
							["increment_plotstate", 'act3.quests'],
							["change_metal", -32, "Molybdenum"],
							["say_r", "Excellent. Now I can equip my flamethrower!"],
							["say_l", "Research project?"],
							["say_r", "Hmmm?"],
							["if_plotstate_counter", 'act3.quests', 2, [["runScript", hammersmithScript, 50]]],
						],
					]],
				]],
			], [
				["say_r", "How now, brown cow."],
				["say_r", "I am working. Please return later."],
			]],
		]],
	], [630, 309], "Harlesden", null, 6)

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
	], [40, 560], "Cutty Sark", null, 7)

	m.actorTalkScript([
		["speaker_r", "Gospel"],
		["say_r", "The so-called 'Holy' Robot Empire knows nothing of true faith. Do not be deceived by their lies, my son."],
	], [768, 134], "Father Gospel", null, 270)
		
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "I sometimes try to target enemies but miss and end up moving instead."],
		["say_r", "It totally throws my balance off, but if you right-click or hold the Ctrl key when you click, that doesn't happen!"],
	], [1533, 664], "Pimlico", null, 312)
}


setups["act3.camp"] = function (ps, m) {
	m.map = loadFixedMap("camp")
	var camden = m.addProtag([250,250])
	m.style = 'cave'

	var hammersmithScript = [
		["sound", "radio"],
		["say_r", "Camden, come in, son. This is Hammersmith, I need you to come see me in town.", "Hammersmith"],
		["say_r", "I have important information for you."],
	]

	m.setStartScript([
		["change_music", CAMP_MUSIC],
		["if_first", 'act3.camp', [
			["speaker_l", "Putney"],
			["speaker_r", "Victoria"],
			["say_r", "This is it?"],
			["say_l", "Yeah, it's great isn't it?"],
			["say_r", "It's rotten."],
			["say_l", "... But you'll be safe."],
			["say_r", "Camden, you can't expect me to stay here."],
			["speaker_l", "Camden"],
			["say_l", "You will be safer here than in town. We don't know how far Hornchurch's hand stretches, so we have to keep you hidden."],
			["say_r", "Hmph. I do not approve. But I suppose I will give you a chance."],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["say_r", "What do you think of the place? Neat, huh?"],
		["ask_r", "Do you need something?", [
			["Outer Zones",
				["say_r", "Right!"],
				["set_plotstate", 'act3.ozfrom', 'act3.camp'],
				["change_scene", "act3.ozmission"],
			],
			["Town",
				["say_r", "Right!"],
				["change_scene", "act3.town"],
			],
			["Nothing",
				["say_r", "Later, then."],
			],
		]],
	], [118, 779], "Putney", null, 95)
			
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Victoria"],
		["if_plotstate", 'act3.victoria.questdone', [
			["say_r", "I guess this cave isn't too bad."],
			"terminated",
		]],
		["if_first", "act3.victoria.quest", [
			["say_r", "This cave is horrible. It's all your fault."],
			["say_l", "Sorry, but you're safer here than in town."],
			["say_r", "Well, you can at least make up for it by bringing me 32 molybdenum."],
			["say_l", "..."],
		], [
			["say_r", "I'm still waiting for some molybdenum."],
		]],
		["if_has_metal", "Molybdenum", 32, [
			["ask_l", "Shall I give Victoria 32 molybdenum?", [
				["Yes",
					["set_plotstate", 'act3.victoria.questdone'],
					["increment_plotstate", 'act3.quests'],
					["change_metal", -32, "Molybdenum"],
					["say_r", "Excellent. I can at least make this place liveable."],
					["if_plotstate_counter", 'act3.quests', 2, [["runScript", hammersmithScript, 50]]],
				],
				["No",
				],
			]],
		]],
	], [250, 350], "Victoria", null, 270)
}

setups["act3.killsomespiders"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "entry_top",
		bottom: "camp",
		maxrooms: 16,
	})
	var camden = m.addProtag(m.map.topPos([200, 200]))
	m.placeEnemiesRandomlyAnywhere({
		GreaterFireScorpion: 16,
		NinjaSpider: 16,
		JadeBeetle: 16,
	})
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act3.killsomespiders.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "You're very brave, Camden.", "Putney"],
			["say_r", "Some of the monsters in there are pretty scary, but I'm sure you can beat them!"],
		]],
	])

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act3.town"],
	])

	m.setClearScript([
		["set_plotstate", 'act3.killsomespiders'],
		["wait", 45],
		["sound", "radio"],
		["wait", 5],
		["speaker_l", "Camden"],
		["say_r", "Camden, did you really get rid of all of those spiders by yourself?", "Putney"],
		["say_r", "You're amazing!"],
		["say_r", "Come back to town now and we can get ready to smuggle Victoria over there."],
		["add_xp", 64],
	])
}

setups["act3.assaultthebase"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "goldhawk_base",
		bottom: "entry_bottom",
		maxrooms: 24,
	})
	var camden = m.addProtag(m.map.bottomPos([255, 255]))
	m.placeEnemiesRandomlyAnywhere({
		MechDroid: 16,
		Copter: 4,
		SawDrone: 32,
		SentryDroid: 32
	})
	
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", 'act3.assaultthebase.intro', [
			["sound", "radio"],
			["speaker_l", "Camden"],
			["say_r", "Good luck, son.", "Hammersmith"],
			["say_l", "Thanks. I'll do my best."],
		]],
	])

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["if_plotstate", 'act3.assaultthebase', [
			["set_plotstate", 'act', 4],
			["addWeaponSlot"],
			["change_scene", "act4.camp"],
		], [
			["change_scene", "act3.town"],
		]],
	])

	var door = m.entities.add(makeScenery("BlastDoor", m, m.map.topPos([250, 150]), 90, true))

	var goldhawk = m.entities.add(makeEnemy("Goldhawk", m, m.map.topPos([250, 950]), 270))
	goldhawk.hostile = false
	
	var droids = [], dxs = [150, 200, 300, 350], dys = [800, 750, 700, 650, 600]
	dxs.forEach(function (dx) { dys.forEach(function (dy) {
		var d = m.addEntity(makeEnemy("SentryDroid", m, m.map.topPos([dx, dy]), 90))
		d.hostile = false
		d.setTalkScript([
			["speaker_l", "Camden"],
			["say_l", "It's not responding."],
		])
		droids.push(d)
	})})

	goldhawk.setTalkScript([
		["change_music", HI_BOSS_MUSIC],
		["speaker_l", "Camden"],
		["speaker_r", "Goldhawk"],
		["say_l", "Goldhawk?"],
		["say_r", "Oh, Camden. I bet Hammersmith sent you here, didn't he?"],
		["say_l", "I don't understand ... are they keeping you here?"],
		["say_l", "No ... it's not that, is it? What did the Robo-Pope buy you with?"],
		["say_r", "I'm not one to be bought, Camden. I came to him of my own accord, and don't you ever say otherwise."],
		["say_l", "Goldhawk, we don't have to do this. You could call off the troops and come back to Dollis Hill."],
		["say_r", "And you'd forget about what I've done, just like that?"],
		["ask_l", "What should I say?", [
			["Of course I would.",
				["say_r", "Camden, you idiot."],
				["say_r", "If you don't quit being so foolishly trusting, you'll end up in the Robo-Papal dungeons just like that simpleton Prince Regent."],
				["say_l", "You're holding the Prince Regent captive?"],
				["say_r", "Yes, and that irritating Angel girl as well. If you don't want to end up rusting away to nothing alongside them, I suggest you prepare to fight for your life!"],
			],
			["I wouldn't forget, but I might forgive.",
				["say_r", "You and your stupid platitudes, Camden."],
				["say_r", "You remind me of that irritating Angel girl we now have languishing in the Robo-Papal dungeon."],
				["say_l", "You're holding Angel captive? Wasn't she working for you?"],
				["say_r", "She's locked up right next to the Prince Regent. And yes, she was."],
				["say_r", "But I am not as trusting as you are, Camden, which is why I'm still alive, while you are shortly not to be."],
				["say_r", "Now prepare to fight!"],
			],
		]],
		["set_hostile", true],
		["canEject", false],
		["do", door.close.bind(door)],
		["do", droids.forEach.bind(droids, function (d) { d.hostile = true })],
	])

	goldhawk.setDeathScript([
		["do", droids.forEach.bind(droids, function (d) { d.kill() })],
		["canEject"],
		["set_plotstate", 'act3.assaultthebase'],
		["speaker_l", "Camden"],
		["speaker_r", "Goldhawk"],
		["say_r", "Damn you, Camden! This isn't over!"],
		["clear_r"],
		["die"],
		["wait", 50],
		["say_l", "I have a feeling I haven't seen the last of him."],
		["say_l", "Anyway, I should probably get out of here."],
	])
}

setups["act3.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		GreaterFireScorpion: 16,
		NinjaSpider: 16,
		JadeBeetle: 16,
		MechDroid: 16,
		Copter: 4,
		SawDrone: 8,
		SawDronePack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([
		["change_music", OZ_MUSIC],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", ps["act3.ozfrom"]],
	])
}

setups["act4.camp"] = function (ps, m) {
	m.map = loadFixedMap("camp")
	var camden = m.addProtag([250, 250])
	m.style = 'cave'

	m.setStartScript([
		["change_music", CAMP_MUSIC],
		["if_first", 'act4.camp', [
			["speaker_l", "Camden"],
			["speaker_r", "Victoria"],
			["say_r", "Camden?"],
			["say_l", "Goldhawk has turned against us. He was with Hornchurch all along."],
			["say_l", "We can't go back to town now at all. Hornchurch's allies are surely looking for all of us."],
			["say_r", "So what do we do? I'm not staying here forever"],
			["say_l", "Well, there is one stroke of luck. Goldhawk gave away something when I found him."],
			["say_l", "He told me that Angel had been imprisoned by the Holy Robot Empire."],
			["say_r", "Angel? The horrid girl? Serves her right."],
			["say_l", "I want to rescue her."],
			["ask_r", "What?! Why?", [
				["She might help us.",
					["say_l", "Because if they imprisoned her then perhaps she's not on their side. We need allies."],
				],
				["Sweet revenge.",
					["say_l", "So I can show her that betrayal comes with a high price."],
				],
				["Love has a face.",
					["say_l", "Well, I'm fairly sure she was hitting on me at that party."],
				],
			]],
			["say_l", "Besides, there's someone else they've got I want to see."],
			["say_r", "Who?"],
			["say_l", "Your father."],
			["say_r", "Daddy?"],
			["say_l", "Yes. Get ready, we're heading out."],
			["clear_l"],
			["clear_r"],
			["speaker_r", "Putney"],
			["say_r", "..."],
		]],
		["if_plotstate", 'act4.villagecutscene', [
			["if_first", 'act4.camp.aftervillagecutscene', [
				["say_r", "Back at camp..."],
				["speaker_l", "Camden"],
				["speaker_r", "Putney"],
				["say_l", "Putney?"],
				["say_r", "Hi, Camden? Who are these people?"],
				["say_l", "This is Cockfosters and Marylebone, we're helping them out, and I need your help with that."],
				["say_r", "You do? Um... okay."],
				["say_l", "There's a monster of some kind up in the pass that stole their child. I'm going to go and distract it while you retrieve the child."],
				["ask_r", "Really? Me? Are you sure?", [
					["Absolutely", 
 						["say_l", "Yes, I know you can do this Putney. I believe in you"],
						["say_r", "Thanks, Camden. I won't let you down."],
					],
					["Lesser of two evils",
						["say_l", "Well, it's you or Victoria. I'm not spoilt for choice."],
						["say_r", "Oh."],
					],
				]],
				["say_l", "Make sure you're ready. We're heading out soon."],
				["say_r", "Let me know when you're ready."],
			]],
		]],
		["if_plotstate", 'act4.defendthevillage', [
			["if_first", 'act4.camp.aftervillage', [
				["say_r", "Back at camp..."],
				["speaker_l", "Putney"],
				["say_l", "We did it! We saved the child."],
				["speaker_r", "Marylebone"],
				["say_r", "Oh, Pancras be praised, this is a blessing."],
				["speaker_r", "Cockfosters"],
				["say_r", "Thank you, sirs. We are in your debt."],
				["speaker_l", "Camden"],
				["say_l", "It was nothing. We wanted to get across the pass anyway."],
				["say_l", "Good work, Putney."],
				["speaker_r", "Putney"],
				["say_r", "Thanks, Camden. I'm surprised at myself."],
				["speaker_r", "Victoria"],
				["say_r", "Can we go find Daddy now?"],
				["say_l", "Yes we can. Once we're over the mountains it'll be clear paths to our destination."],
				["say_r", "Good, I'll be waiting once you're ready."],
			]],
		]],
	])
				
	m.actorTalkScript([
		["speaker_r", "Putney"],
		["if_plotstate", 'act4.villagecutscene', [
			["if_plotstate", 'act4.defendthevillage', [
				["if_first", "act4.putney.aftervillage", [
					["say_r", "Thanks, Camden. I feel like I'm part of things."],
				]],
				["ask_r", "Need anything?", [
					["Outer Zones",
						["say_l", "Sure thing."],
						["change_scene", "act4.ozmission"],
					],
					["Leave",
					],
				]],
			], [
				["say_r", "I guess I'm ready when you are."],
				["ask_r", "What do you need?", [
					["Save the baby",
						["say_r", "... Okay."],
						["change_scene", "act4.defendthevillage"],
					],
					["Outer Zones",
						["say_r", "Okay."],
						["change_scene", "act4.ozmission"],
					],
					["Nothing",
					],
				]],
			]],
		], [
			["say_r", "I'm sorry about Goldhawk, Camden."],
			["ask_r", "Need anything?", [
				["Outer Zones",
					["say_l", "Sure thing."],
					["change_scene", "act4.ozmission"],
				],
				["Leave",
				],
			]],
		]],
	], [250, 450], "Putney", null, 270)
			
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Victoria"],
		["if_plotstate", 'act4.villagecutscene', [
			["if_plotstate", 'act4.defendthevillage', [
				["ask_r", "Ready to go save my dad?", [
					[ "Yes",
						["say_l", "Let's go then."],
						["change_scene", "act4.savetheprince"],
					],
					["Not yet",
						["say_l", "Well, hurry up!"],
					],
				]],
			], [
				["say_r", "Hmph, sharing my cave with peasants..."],
			]],
		], [
			["say_r", "I'm ready when you are."],
			["ask_r", "Ready to go?", [
				["Yes",
					["change_scene", "act4.villagecutscene"],
				],
				["No",
				],
			]],
		]],
	], [250, 350], "Victoria", null, 270)

	if (ps['act4.defendthevillage']) {
		m.actorTalkScript([
			["speaker_r", "Cockfosters"],
			["say_r", "Thanks for helping us."],
			["if_plotstate", 'act4.cockfosters.questdone', [
			], [
				["if_first", "act4.cockfosters.quest", [
					["say_r", "I used to work in a mine, so believe me when I say this cave is structurally unsound."],
					["say_r", "I could build some supports for you, but I'll need some materials. Say, 64 bismuth?"],
				], [
					["say_r", "I'll need some bismuth if you want those supports."],
				]],
				["if_has_metals", "Bismuth", 64, [
					["ask_l", "Shall I give Cockfosters 64 bismuth?", [
						["Yes",
							["set_plotstate", 'act4.cockfosters.questdone'],
							["change_metal", -64, "Bismuth"],
							["say_r", "Excellent, I'll get these up in no time."],
						],
						["No",
						],
					]],
				]],
			]],
		], [450, 450], "Cockfosters", null, 270)

		m.actorTalkScript([
			["speaker_r", "Marylebone"],
			["say_r", "Thank you for your help."],
		], [550, 450], "Marylebone", null, 270)
	}

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
	], [640, 170], "Cutty Sark", null, 295)

	m.actorTalkScript([
		["speaker_r", "Canary Wharf"],
		["say_r", "Quack quack quack! Quack, quack quack quack!"],
		["inventory"],
	], [625, 125], "Canary Wharf", null, 350)
}

setups["act4.villagecutscene"] = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])

	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["set_plotstate", 'act4.villagecutscene'],
		["blank"],
		["freeze", 10],
		["speaker_l", "Camden"],
		["speaker_r", "Victoria"],
		["say_r", "Camden, this is a peasant village."],
		["say_l", "Yes, I know."],
		["say_r", "But I'm a princess."],
		["say_l", "We need to scout out the pass before we can cross. The best way to do that is to ask the locals."],
		["say_r", "But they're peasants, what will they know?"],
		["say_l", "A lot, I hope."],
		["say_r", "I don't think that-"],
		["clear_r", ],
		["say_r", "Eeeeeeeeeek!"],
		["say_l", "Who was that?"],
		["speaker_r", "Marylebone"],
		["say_r", "It's taken our baby! The demon has taken our baby!"],
		["say_r", "Cockfosters, our baby is gone. Baby Goodge, he's been taken by the demon!"],
		["speaker_r", "Cockfosters"],
		["say_r", "Egads! What'll we do?"],
		["say_l", "Excuse me, but what is this demon?"],
		["speaker_r", "Marylebone"],
		["say_r", "Oh, it's a foul thing and no mistake! Vile and horrid! It lives up on the pass and it'll come down and preys on us poor village folk!"],
		["say_l", "We shall defeat this monster and retrieve your child."],
		["speaker_r", "Victoria"],
		["say_r", "We shall?"],
		["say_l", "Well, I shall."],
		["say_r", "Look, we're supposed to be finding my daddy."],
		["say_l", "That'll be more quickly accomplished if we can cross the mountains. Besides, we'd be helping out these villagers."],
		["say_r", "They're peasants, Camden..."],
		["say_l", "And?"],
		["say_r", "..."],
		["say_l", "Come on, we should go back to camp first, I'll need Putney's help."],
		["speaker_r", "Cockfosters"],
		["say_r", "Oh, thank you, sir."],
		["change_scene", 'act4.camp'],
	])
}
  
setups["act4.defendthevillage"] = function (ps, m) {
	m.map = loadFixedMap('openarea')
	camden = m.addProtag([897, 685])
	
	m.setStartScript([
		["change_music", LO_BOSS_MUSIC],
		["blank", ],
		["say_l", "On the mountain pass..."],
		["speaker_l", "Camden"],
		["say_l", "This must be it, but I don't see-"],
		["say_r", "DEEEEEATH..."],
		["say_l", "What was that?"],
		["say_r", "DEEEEEATH..."],
		["say_l", "I don't see-"],
		["speaker_r", "Hyde"],
		["say_r", "DEEEEEATH..."],
		["say_l", "Oh, now I see."],
		["say_l", "Okay Putney, don't let me down..."],
		["say_l", "Here I come!"],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act4.camp"],
	])
	
	m.enemyDeathScript([
		["die"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "I defeated it... That seems too easy."],
		["say_l", "Shouldn't complain, I guess."],
		["set_plotstate", 'act4.defendthevillage'],
		["canEject"],
	], "Hyde", [1111, 730], 200)
}

setups["act4.savetheprince"] = function (ps, m) {
	m.map = makeDungeon2({
		left: 'entry_left',
		right: 'grid',
	})
	var camden = m.addProtag(m.map.leftPos([96, 96]))
	
	m.placeEnemiesRandomlyAnywhere({
		JusticeDrone: 16,
		Copter: 32,
		RailgunTank: 32,
		RocketTank: 32,
	})

	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["speaker_l", "Camden"],
		["say_l", "Right, here I go."],
		["sound", "radio"],
		["say_r", "I hope you can save Daddy, Camden!", "Victoria"],
		["ask_l", "What shall I say?", [["Don't worry!"], ["So do I."], ["Anything for you."]]],
	])

	m.canEject = true
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act4.camp"],
	])

	var door_in = m.entities.add(makeScenery("BlastDoor", m, m.map.rightPos([1050, 50]), 0, true))
	var door_out = m.entities.add(makeScenery("BlastDoor", m, m.map.rightPos([1750, 750]), 90, false))
	
	var cnl = m.addEntity(makeEnemy("ChalfontAndLatimer", m, m.map.rightPos([1100, 700]), 270))
	cnl.hostile = false
	cnl.setDeathScript([
		["die"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Well, those two were full of surprises."],
		["say_l", "Now, time to see if I can find Angel and the Prince Regent."],
		["do", door_out.open.bind(door_out)],
	])

	camden.addAreaScript([
		["wait", 50],
		["set_plotstate", 'act4.savetheprince'],
		["set_plotstate", 'act', 5],
		["addWeaponSlot"],
		["change_scene", 'act5.intro'],
	], m.map.rightPos([1650, 750]), [200,200])

	camden.addAreaScript([
		["speaker_l", "Camden"],
		["say_l", "You!"],
		["speaker_r", "Chalfont"],
		["say_r", "B'deeeee zzzzt zzp skreeeeeeow piiiii!"],
		["speaker_r", "Latimer &"],
		["say_r", "And here returns the prodigal son to slay our fatted calf."],
		["speaker_r", "Chalfont"],
		["say_r", "Prrrrrrrrrrr dipdipdip bee bee beeeeeeee pzow!"],
		["speaker_r", "Latimer &"],
		["say_r", "Well, no, my lord, but I felt it appropriate."],
		["say_r", "Corporal Camden of the Order of Knightsbridge, I am hereby relieving you of your rank with immediate notice."],
		["say_l", "What?"],
		["say_r", "You heard me. You are hereby returned to civilian status, effective immediately."],
		["say_l", "Since when can you do that?"],
		["say_r", "You will find, ex-Corporal Camden, that the Holy Robot Empire holds a great deal of influence in a great many circles."],
		["say_r", "Fortunately it seems that the Prince Regent has finally decided to acknowledge our great and bountiful wisdom ..."],
		["say_r", "And has abdicated his gubernatorial responsibilities to His Holiness the Robo-Pope."],
		["say_l", "Enough of the florid language, sub-Inquisitor. You and I know that this was a coup d'etat, plain and simple."],
		["speaker_r", "Chalfont"],
		["say_r", "Pdbdbdbd prrr beee eee beeee!"],
		["speaker_r", "Latimer &"],
		["say_r", "Most eloquently put, my lord. History will bear us out, ex-Corporal. But you will not be there to see it."],
		["say_l", "Ha! I beat you handily last time, you unholy double-act, and I'll do it again!"],
		["say_r", "I see the folly of youth knows no bounds. Prepare to face our full fury!"],
		["speaker_l", "Latimer"],
		["speaker_r", "Chalfont"],
		["change_music", LO_BOSS_MUSIC],
		["say_l", "Inquisitorial and Robo-Cardinal digitally-enhanced combat mode activation sequence ..."],
		["say_l", "... combine and transform!"],
		["say_r", "Skreeeow!"],
		["speaker_l", "Camden"],
		["speaker_r", "Chalfont/Latimer Fusion"],
		["say_l", "What the ..."],
		["do", (function () { this.hostile = true }).bind(cnl)],
		["do", door_in.close.bind(door_in)],
	], m.map.rightPos([600, 150]), [1000, 1000])
}

setups["act4.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		JusticeDrone: 16,
		SupportCopterPack: 8,
		RailgunTank: 16,
		RocketTank: 8,
		PincerTank: 16,
		MoonSpider: 16,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([["change_music", OZ_MUSIC]])
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act4.camp"],
	])
}

setups["act5.town"] = function (ps, m) {
	makeTown(m)
	var camden = m.addProtag([1051, 401])
	camden.bearing = 275

	m.setStartScript([  // plot dump - seriously needs rewriting
		["change_music", TOWN_MUSIC],
		["if_first", "act5.plotdump", [
			["speaker_l", "Camden"],
			["speaker_r", "Great Portland"],
			["say_r", "... well, we seem to be in a very grave situation."],
			["say_r", "The safe return of Prince Regent is something of a blessing, but nonetheless we have little cause to rejoice."],
			["say_r", "According to Hammersmith's scouts, Robo-Pope Hornchurch has taken the Charing Cross and headed deep into the blasted wastes of the Outer Zones."],
			["say_r", "I cannot be certain of his precise intention..."],
			["say_r", "... but I fear that he may intend to release the seal on the ancient Tomb of St. Pancras itself."],
			["say_l", "Unseal the Tomb of St. Pancras?"],
			["say_l", "But that would be the utmost heresy! What could he possibly have to gain from doing that?"],
			["say_r", "There is a rumour which continues to resurface among those who deal in forbidden magicks concerning the Tomb of St. Pancras."],
			["say_r", "A rumour never spoken, yet often whispered."],
			["say_r", "It is said that St. Pancras had some powerful item sealed within the tomb, which would bring great power to any brave enough to break the seal."],
			["say_r", "Brave ... or foolish."],
			["speaker_l", "Victoria"],
			["say_l", "And is it true?"],
			["say_r", "True?"],
			["say_r", "Is it true?"],
			["say_r", "Whether or not it is true that St. Pancras had a powerful magical item sealed within his tomb is entirely immaterial!"],
			["say_r", "The unsealing of the Tomb of St. Pancras would be a cosmological event akin to the sinking of Atlantis or the extinction of the humans!"],
			["say_r", "I do not know whether Robo-Pope Hornchurch knows this; he may be misled, or simply very, very foolish."],
			["speaker_l", "Camden"],
			["say_l", "But if he unseals the tomb, it could unleash some kind of disaster?"],
			["say_r", "Oh, no, my boy."],
			["say_r", "Ah, I should have known better than to expect one so young to appreciate the gravity of the situation."],
			["say_r", "Unsealing the tomb will most certainly unleash a great many kinds of disaster!"],
			["say_l", "Right."],
			["say_l", "Then we have to stop him!"],
			["speaker_r", "Victoria"],
			["say_r", "Stop him how?"],
			["say_l", "We'll do whatever it takes."],
			["speaker_r", "Great Portland"],
			["say_r", "Robo-Pope Hornchurch is a powerful and dangerous creature."],
			["say_r", "If he thinks you are an obstacle to his plans, he will not hesitate to remove you."],
			["say_r", "Are you brave enough to face him?"],
			["ask_l", "", [["I know no fear."], ["My wits will see me through."], ["My friends are my shield."]]],
			["say_r", "You are strong."],
			["say_r", "However, even the strongest warrior cannot pass through the furthest Outer Zones unaided."],
			["say_r", "Hornchurch carries the Charing Cross, which will shield him from harm."],
			["say_r", "But even one such as you would not pass through unshielded."],
			["ask_l", "", [["There must be something we can do!"], ["If this is the end, I'll face it with dignity."]]],
			["say_r", "This is something that I did not expect that I would ever do."],
			["say_r", "However, given the circumstances, and your most peculiar resolve ... I think it is fitting that I bequeath this to you."],
			["say_l_unlabelled", "Received the KING'S CROSS."],
			["say_r", "Carry that with you, and you may be able to pursue Robo-Pope Hornchurch through the Outer Zones."],
			["say_r", "Young Camden, the fate of all our people now rests with you."],
			["speaker_l", "Camden"],
			["say_l", "Thank you, Great Portland. I won't let you down."],
			["say_r", "I am confident that you will not."],
			["say_r", "Speak to me when you are ready to depart."],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["say_r", "You're very brave, Camden."],
		["ask_r", "Do you want to go to the Outer Zones?", [
			["Yes",
				["change_scene", "act5.ozmission"],
			],
			["No"],
		]],
	], [1653, 1736], "Putney", null, 270)

	if (ps['angel.rescued']) {
		m.actorTalkScript([
			["speaker_r", "Angel"],
			["speaker_l", "Camden"],
			["say_r", "You chose to rescue me even after what I did to you, Camden."],
			["say_r", "I won't forget that."],
		], [43, 725], "Angel", null, 325)
	}
		
	m.actorTalkScript([
		["speaker_r", "Victoria"],
		["speaker_l", "Camden"],
		["say_l", "So you're a princess?"],
		["say_r", "Hadn't you heard?"],
	], [1156, 399], "Victoria", null, 261)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["say_r", "This is the final battle, young Camden. After this point, there can be no turning back."],
		["ask_r", "Are you ready?", [
			["I'm ready.", 
				["change_scene", "act5.bossfight1"],
			],
			["I need more time."],
		]],
	], [1088, 280], "Great Portland", null, 90, 45)

	m.actorTalkScript([
		["speaker_r", "Hammersmith"],
		["ask_r", "What can I get you, son?", [
			["Inventory",
				["inventory"],
			],
			["Leave"],
		]],
	], [1453, 2057], "Hammersmith", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["say_r", "Would you like a backrub?"],
	], [970, 1800], "Harlesden", null, 290)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel"],
		]],
	], [940, 1090], "Cutty Sark", null, 289)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Gospel"],
		["say_r", "Blessings of St. Pancras be upon you."],
	], [768, 134], "Father Gospel", null, 270)

	ps["act5.superdungeon.next"] = ps["act5.superdungeon.next"] || 1
	if (ps['act5.superdungeon.next'] < 101) {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Pimlico"],
			["say_r", "I once killed a man just to watch him die!"],
			["say_l", "You're just messing with me, aren't you?"],
			["say_r", "..."],
			["say_l", "Well, I hope you're just messing."],
			["say_r", "I've found a cave with some really tough enemies in. Do you want to come explore it with me?"],
			["ask_r", "Shall we go?", [
				["With you? Of course!",
					["change_scene", "act5.superdungeon"],
				],
				["Helpful as your tips have been, I'm not sure I'm ready for this."],
			]],
		], [1533, 664], "Pimlico", null, 312)
	}
}

setups["act5.intro"] = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	
	m.setStartScript([
		["blank"],
		["speaker_l", "Camden"],
		["say_l", "Angel? Angel!"],
		["speaker_r", "Angel"],
		["say_r", "Camden!"],
		["say_r", "What are you doing here?"],

		["set_plotstate", "sweetheart", "Victoria"],
		["ask_l", "", [
			["I'm here to save you.",
				["say_r", "Me? Why?"],
				["ask_l", "", [
					["I believe in second chances."
						["set_plotstate", "whyrescue", "secondchance"],
					],
					["Because I love you."
						["set_plotstate", "whyrescue", "love"],
					],
					["I lied. I'm actually here for Prince Regent.",
						["set_plotstate", "whyrescue", "regent"],
					],
				]],
			],
			["I'm here to save Prince Regent.",
				["set_plotstate", "whyrescue", "regent"],
			],
		]],

		["if_plotstate_eq", "whyrescue", "regent", [
			["say_r", "What, this old lunatic?"],
			["speaker_r", "Regent"],
			["say_r", "Hello, moonbeams!"],
			["speaker_l", "Victoria"],
			["say_l", "Daddy!"],
			["say_r", "Good afternoon, my splendid seeker after truths and teeth."],
			["speaker_r", "Angel"],
			["say_r", "That's why you fought your way in here?"],
			["say_l", "Shut up, you."],
			["speaker_l", "Camden"],
			["ask_l", "", [
				["Sorry about her, Angel.",
					["ask_r", "So, are you going to take me with you as well?", [
						["Yes",
							["say_r", "Thank you, Camden. I really am sorry for what I've done."],
							["set_plotstate", "angel.rescued"],
						],
						["Sorry",
							["say_l", "Sorry, Angel. I can't forgive you so easily."],
							["say_r", "Would it help if I apologised?"],
							["say_l", "No."],
							["clear_l"],
							["say_r", "Hey, wait! Hey! Come back! Camden!"],
						],
					]],
				],
				["Shut up, Angel.",
					["say_r", "Camden! I can't believe you. Wandering around with this brainless princess trying to save her lunatic father!"],
					["speaker_r", "Victoria"],
					["say_r", "Hey, I'm not the one who betrayed her so-called 'friends'."],
					["speaker_r", "Angel"],
					["say_r", "Yeah, well, I didn't..."],
					["speaker_l", "Regent"],
					["say_l", "Interjection! There's no such word as didn't, except in very expensive dictionaries."],
					["say_r", "..."],
					["speaker_r", "Victoria"],
					["say_r", "..."],
					["speaker_l", "Camden"],
					["speaker_r", "Angel"],
					["ask_r", "So, are you going to get me out of here, too?", [
						["Yes",
							["say_r", "Well, at least that's something. Let's get going."],
							["set_plotstate", "angel.rescued"],
						],
						["(Leave)",
							["clear_l"],
							["say_r", "... Hey! Camden! Come back here!"],
							["say_r", "Please come back..."],
						],
					]],
				],
			]],
		]],
		["if_plotstate", "whyrescue", "secondchance", [
			["say_r", "So does that mean you're getting me out of here?"],
			["say_l", "Yes, you and Prince Regent as well."],
			["speaker_r", "Regent"],
			["say_r", "And well you might, or at least, you might as well."],
			["set_plotstate", "sweetheart", "Angel"],
			["set_plotstate", "angel.rescued"],
		]],
		["if_plotstate", "whyrescue", "love", [
			["say_r", "..."],
			["speaker_r", "Victoria"],
			["say_r", "..."],
			["speaker_r", "Angel"],
			["say_r", "You... you do?"],
			["say_l", "..."],
			["speaker_r", "Regent"],
			["say_r", "Well I think we've all come to a very special place."],
			["say_r", "A special place with wind chimes and matchboxes."],
			["say_r", "Now let us wend our wiggly way westwards."],
			["ask_l", "Take Angel with you?", [
				["Yes",
					["say_r", "Camden..."],
					["set_plotstate", "sweetheart", "Angel"],
					["set_plotstate", "angel.rescued"],
				],
				["No",
					["say_r", "Camden? I don't understand."],
					["clear_l"],
					["say_r", "Why are you leaving?"],
					["say_r", "Camden... I love you, too."],
				],
			]],
		]],
		["clear_l"],
		["freeze", 20],
		["clear_r"],
		["change_scene", "act5.town"],
	])
}

setups["act5.bossfight1"] = function (ps, m) {
	m.map = loadFixedMap("clearing")
	var camden = m.addProtag([1000, 234])
	m.canEject = false
	
	m.setStartScript([
		["change_music", null],
		["blank"],
		["say_l", "Protected by the King's Cross, Camden treks for many miles across the impossible wastelands of the Outer Zones."],
		["speaker_l", "Camden"],
		["say_l", "It can't be far now."],
		["say_l", "I think that must be the tomb of St. Pancras just ahead."],
		["say_r", "Not so fast, soldier."],
		["say_r", "This is as far as you go."],
		["say_l", "Goldhawk!"],
		["blank", false],
		["change_music", LO_BOSS_MUSIC],
		["speaker_r", "Goldhawk"],
		["say_r", "Yes, Camden, I'm still alive."],
		["say_l", "I can't believe you're protecting the Robo-Pope, Goldhawk."],
		["say_l", "Don't you understand what it is he plans to do?"],
		["say_l", "Won't you die along with everyone else if he brings his plans to fruition?"],
		["say_r", "You're still so naive, Camden."],
		["say_r", "I'm here to protect his Holiness. That's all that matters."],
		["say_l", "I wish it didn't have to be this way, Goldhawk. But I have a job to do, for the sake of all my friends."],
		["say_r", "And you'll die doing it!"],
	])

	m.enemyDeathScript([
		["die_no_drop"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Goldhawk ..."],
		["say_l", "Why wouldn't you listen to me?"],
		["say_l", "Well, I've come this far."],
		["say_l", "Time to confront the Robo-Pope himself."],
		["clear_l"],
		["freeze", 10],
		["blank"],
		["freeze", 10],
		["change_scene", "act5.bossfight2"],		
	], "GoldhawkReloaded", [1000, 456], 270)
}

setups["act5.bossfight2"] = function (ps, m) {
	m.map = loadFixedMap("crypt")
	var camden = m.addProtag([750, 234])
	m.canEject = false

	m.setStartScript([
		["change_music", LO_BOSS_MUSIC],
		["speaker_l", "Camden"],
		["say_l", "Stop right there!"],
		["say_l", "I won't let you unseal the tomb!"],
		["say_l", "Whatever it is you think you stand to gain from it, you're wrong!"],
		["speaker_r", "Hornchurch"],
		["say_r", "What confidence you have."],
		["say_r", "I might ask how you presume to know what it is I expect to accomplish here."],
		["say_r", "But frankly, I don't care. In mere moments, the seal will open and the ultimate power of St. Pancras will flow into me!"],
		["say_r", "Prepare to bow down before your new god!"],
	])

	m.enemyDeathScript([
		["die_no_drop"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Is he ..."],
		["say_l", "Is he dead?"],
		["say_l", "It feels like whatever he was trying to do... is still going on..."],
		["say_l", "In fact..."],
		["clear_l"],
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act5.bossfight3"],
	], "Hornchurch", [250, 550], 270)
}

setups["act5.bossfight3"] = function (ps, m) {
	m.map = loadFixedMap("plane")
	var camden = m.addProtag([450, 50])
	m.canEject = false

	m.setStartScript([
		["change_music", null],
		["blank"],
		["speaker_l", "Camden"],
		["say_l", "Where am I?"],
		["say_l", "What's going on?"],
		["say_l", "And what in the world..."],
		["change_music", HI_BOSS_MUSIC],
		["speaker_r", "Pancras happy"],
		["say_r", "I AM ALPHA."],
		["say_r", "I AM OMEGA."],
		["say_r", "I AM THE GLORIOUS ARC OF THE UNIVERSE AND I AM THE MOTE IN A PROTON'S EYE."],
		["say_r", "FINALLY THE SEAL IS BROKEN."],
		["speaker_r", "Pancras angry"],
		["say_r", "FINALLY I AM FREED TO RULE AGAIN."],
		["say_r", "ALL WILL BEND TO MY WILL..."],
		["say_r", "OR BE BROKEN AT MY COMMAND!"],
		["speaker_r", "Pancras happy"],
		["say_l", "You expect us to bow down before you?"],
		["speaker_r", "Pancras angry"],
		["say_r", "OBEY OR YOU WILL BE CRUSHED!"],
		["say_l", "Never!"],
		["say_l", "I, Camden, on behalf of the people of this world, stand before you now and I say: We will not surrender!"],
		["say_l", "We will not be destroyed!"],
		["say_r", "YOU DARE DEFY ME?"],
		["say_r", "TASTE MY WRATH!"],
	])

	m.enemyDeathScript([
		["speaker_r", "Pancras angry"],
		["speaker_l", "Camden"],
		["say_r", "I DON'T UNDERSTAND... HOW ARE YOU STILL ALIVE?"],
		["say_l", "My resolve is far stronger than you can imagine."],
		["say_l", "Only Death can stop me, but not before he stops you too!"],
		["say_r", "FOOLISH MACHINE... YOU THINK I CAN BE BEATEN? YOU ARE MORTAL!"],
		["say_r", "YOU WILL SUCCUMB TO RUST AND CRUMBLE INTO THE EARTH BEFORE THE SLIGHTEST OF MY STRENGTH BEGINS TO WANE."],
		["say_l", "(He's right, I've been fighting for so long, and he seems barely fatigued! There must be a way to finish this...)"],
		["if_eq_plotstate", "sweetheart", "Angel", [
			["speaker_r", "Angel"],
			["say_r", "Camden. Listen to my voice."],
			["say_l", "Angel? Angel!"],
			["say_r", "Camden, I am not Angel. But I am everything you love in her."],
			["say_l", "You're what?"],
			["say_r", "Your love, Camden. Every ounce of it embodied."],
			["say_r", "Now you must focus, there is so much at stake but everything to gain."],
			["say_r", "Take your love for Angel and the world and all the robots within it."],
			["say_l", "What is this power I can feel?"],
			["say_r", "That is your gift, Camden. Now unleash it! Unleash your passion!"],
			["say_l", "..."],
			["say_l", "For this world, and everyone in it. For the skies and the seas, for every creature..."],
			["say_l", "AND FOR ANGEL, I VANQUISH YOU!"],
		]],
		["if_eq_plotstate", "sweetheart", "Victoria", [
			["speaker_r", "Victoria"],
			["say_r", "Camden! I demand you hear me!"],
			["say_l", "Victoria? But... how?"],
			["say_r", "I am not Victoria, Camden. I merely manifest your love for her."],
			["say_l", "You manifest my... hey, what is this?"],
			["say_r", "Focus, child. Focus on your love."],
			["say_l", "Focus?"],
			["say_r", "Yes, and quickly! Focus on everything you love in this world. Focus on all the good things that are worth fighting for."],
			["say_r", "Focus on Victoria. Gather your love of all things deep within you..."],
			["say_l", "What is this power I can feel?"],
			["say_r", "Your gift, child. Now unleash it! Unleash your love!"],
			["say_l", "..."],
			["say_l", "For this world, and everyone in it. For the skies and the seas, for every creature..."],
			["say_l", "AND FOR VICTORIA, I VANQUISH YOU!"],
		]],
		["speaker_r", "Pancras angry"],
		["say_r", "Aaaaaarrrrrggghhhh!"],
		["die_no_drop"],
		["clear_r"],
		["blank"],
		["say_l", "I've won..."],
		["freeze", 40],
		["change_scene", "finale"],
	], "StPancras", [450, 450], 270)
}

setups["act5.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		InjusticeDrone: 16,
		GiantBladeDrone: 16,
		FlameAvatar: 16,
		TerrorTank: 16,
		WarChopper: 16,
		CombatDroidZero: 16,
		VarietySpiderPack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([["change_music", OZ_MUSIC]])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act5.town"],
	])
}
	
setups["act5.superdungeon"] = function (ps, m) {
	m.map = loadFixedMap("clearing")
	var camden = m.addProtag([900, 234])

	var div = Math.floor(ps['act5.superdungeon.next'] / 10)
	var rem = ps['act5.superdungeon.next'] % 10
	if (rem == 0) {
		m.canEject = true
		var pimlico = makeEnemy("Pimlico", m, [1000, 234], 180)
		pimlico.hostile = false
		m.entities.add(pimlico)
		pimlico.setTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Pimlico"],
			["say_r", "Well done!"],
			["if_eq_plotstate", "act5.superdungeon.next", 100, [
				["say_r", "No-one's ever made it this far with me before!"],
				["change_music", HI_BOSS_MUSIC],
				["say_r", "That will make your soul all the tastier!!"],
				["set_hostile", true],
				["canEject", false],
			], [
				["ask_r", "Ready to keep going?", [
					["Of course!",
						["increment_plotstate", 'act5.superdungeon.next'],
						["say_r", "I'll see you further down..."],
						["change_scene", "act5.superdungeon"],
					],
					["Inventory",
						["inventory"],
					],
					["Not yet.",
						["say_r", "Maybe later then..."],
					],
				]],
			]],
		])
		pimlico.setDeathScript([
			["die_no_drop"],
			["drop_item", "SpiderThrower"],
		])
	} else {
		var enemygroups = [
			["Spider", "Scorpion", "MiniTank", "StagBeetle", "SpikeDrone"],
			["BladeDrone", "SpiderQueen", "FireScorpion", "MachineGunTank"],
			["DrillTank", "HeavyTank", "SentryDroid", "GreaterFireScorpion"],
			["JadeBeetle", "NinjaSpider", "Bat", "Monument"],
			["MechDroid", "SawDrone", "Copter", "Arsenal"],
			["RailgunTank", "RocketTank", "JusticeDrone", "PincerTank", "MoonSpider"],
			["InjusticeDrone", "TerrorTank", "FlameAvatar"],
			["TerrorTank", "CombatDroidZero", "WarChopper"],
			["InjusticeDrone", "TerrorTank", "FlameAvatar", "TerrorTank", "CombatDroidZero", "WarChopper"],
			["SuperRocketTank", "Arachne", "AssassinDroid", "NinjaDrone"],
		]
	
		for (var i = 0 ; i < rem ; ++i) {
			var etype = UFX.random.choice(enemygroups[div])
			m.entities.add(makeEnemy(etype, m, [750, 50 + (100 * i)], 0))
		}
		m.canEject = false
	}
   
	m.setStartScript([
		["change_music", OZ_MUSIC],
		["say_l", "Level " + ps['act5.superdungeon.next']],
	])
	
	m.setClearScript([
		["increment_plotstate", 'act5.superdungeon.next'],
		["wait", 45],
		["if_plotstate_counter", 'act5.superdungeon.next', 101, [
			["speaker_l", "Camden"],
			["say_l", "Okay, seriously."],
			["say_l", "Who on earth was she?"],
			["canEject", true],
		], [
			["speaker_r", "Pimlico"],
			["say_r", "Well done, keep coming..."],
			["add_xp", 1 << (12+div)],
			["wait", 25],
			["change_scene", "act5.superdungeon"],
		]],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act5.town"],
	])
}

setups["finale"] = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	
	m.setStartScript([
		["change_music", MENU_MUSIC],
		["blank"],
		["freeze", 40],
		["speaker_l", "Camden"],
		["say_l", "Hi, there. My name's Camden."],
		["say_l", "Of course, you know that already. I just wanted to say thanks for playing the game."],
		["say_l", "I'm assured that it was a lot of fun creating. I'm even told that this game and its engine may see updates or improvements in the future."],
		["say_l", "So stay tuned. Oh and pay attention after the credits to find out what we characters are up to."],
		["clear_l", ],
		["say_l", "Hi there, I did loads of hacking on the combat and scripting engines and wrote a bunch of content.", "Adam Biltcliffe"],
		["say_r", "Hi, I did programming. Especially SVG code the scripting engine.", "Martin O'Leary"],
		["say_l", "Hi, I drew everything! I hope you liked it!", "Carrie Oliver"],
		["say_r", "Hey, I programmed all the interface components and scripted lots of content.", "Richard Thomas"],
		["say_l", "I wrote item generation and did game balance.", "John-Joseph Wilks"],
		["say_r", "I ported the game to JavaScript.", "Christopher Night"],
		["say_l_unlabelled", "Also thanks to Kevin MacLeod (incompetech.com), for all the game music..."],
		["say_l_unlabelled", "... Thanks to Tom Murphy for the in-game font which we liked."],
		["say_l_unlabelled", "... And thanks to David Birch for some bug testing."],
		["say_l_unlabelled", "Special thanks to Richard Jones for organising PyWeek."],

		["speaker_l", "Cockfosters"],
		["clear_r", ],
		["say_r", "Cockfosters eventually moved to the city and got a job as a mining safety consultant."],

		["speaker_r", "Marylebone"],
		["clear_l", ],
		["say_l", "Marylebone works in a seedy bar, but manages to pay the bills and is putting aside the money to send Baby Goodge to university."],
		
		["speaker_l", "Gospel"],
		["clear_r", ],
		["say_r", "Father Gospel became a missionary and now lives in the Caribbean."],

		["speaker_r", "Harlesden"],
		["clear_l", ],
		["say_l", "Harlesden eventually got tenure and now carries on an illicit affair with his beautiful young lab assistant."],

		["speaker_l", "Hammersmith"],
		["clear_r", ],
		["say_r", "Hammersmith decided he was becoming soft after years away from the front line, and so now works as a drugs education outreach worker in schools."],

		["speaker_r", "Chalfont & Latimer"],
		["clear_l", ],
		["say_l", "Chalfont and Latimer survived the collapse of the Holy Robot Empire and took the semi-professional ten-pin bowling world by storm."],

		["speaker_l", "Great Portland"],
		["clear_r", ],
		["say_r", "Great Portland eventually found a publisher for his crime novel and now writes regularly under the pseudonym of Temperance Brennan."],

		["speaker_r", "Putney"],
		["clear_l", ],
		["say_l", "Putney finally found his place in life as an entertainer for children's parties."],

		["speaker_l", "Regent"],
		["clear_r", ],
		["say_r", "Prince Regent went back to Philadephia to live with his mother."],

		["if_plotstate_counter", 'act5.superdungeon.next', 101, [
			["speaker_r", "Pimlico"],
			["clear_l", ],
			["say_l", "Pimlico fled to a secret base in the jungles of South America, where she plots to one day rule the world."],
		], [
			["speaker_r", "Pimlico"],
			["clear_l", ],
			["say_l", "Pimlico is now in secondary school. Her teachers report that she is doing very well, especially in drama and creative writing."],
		]],

		["if_eq_plotstate", 'sweetheart', 'Angel', [
			["speaker_l", "Victoria"],
			["clear_r", ],
			["say_r", "Victoria is now Princess Regina, and her rule is perhaps a little less haphazard than her father's."],
		], [
			["if_plotstate", 'angel.rescued', [
				["speaker_l", "Angel"],
				["clear_r", ],
				["say_r", "Angel went back to the dig site. The revelation of St. Pancras changed a lot, and there was much to learn."],
			], [
				["speaker_l", "Angel"],
				["clear_r", ],
				["say_r", "Angel was never heard from again..."],
			]],
		]],

		["speaker_r", ps['sweetheart']],
		["speaker_l", "Camden"],
		["say_l", "And as for us... that's another story."],
		["freeze", 20],
		["clear_r", ],
		["freeze", 30],
		["clear_l", ],
		["say_l", "Fin."],
		["clear_l", ],
		["freeze", 20],
		"endGame",
	])
}





