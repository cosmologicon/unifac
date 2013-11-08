
function initPlotState(ps) {
	for (var s in ps) delete ps[s]
	ps.act = 1
	ps.sweetheart = "Victoria"
	ps["angel.rescued"] = true
	ps.nextScene = "act1.firstmission"
}

function setupMission(ps, m) {
	switch (ps.nextScene) {
		case "act1.town": setupTown(ps, m) ; break
		case "act1.party": setupParty(ps, m) ; break
		case "act1.firstmission": setupFirstMission(ps, m) ; break
		case "act1.cleartheway": setupClearTheWay(ps, m) ; break
		case "act1.bossfight": setupBossFight(ps, m) ; break
		case "act1.ozmission": setupOZ(ps, m) ; break
		case "gameover": setupGameOver(ps, m) ; break
		case "finale": setupFinale(ps, m) ; break
		default: throw "Unknown scene: " + ps.nextScene
	}
}


function setupTown(ps, m) {
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
		]]
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
                    ["say_l", "Um, I did."]
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
		            		["say_r", "If you bring me 64 units of cobalt, I can put the scanner array together for you."]
						]
					]],
            	], [
		            ["say_r", "If you bring me 64 units of cobalt, I can put the scanner array together for you."]
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
                ]
        	]],
        ]],
        ["say_r", "Oh, woe is me."],
	], [970, 1800], 'Harlesden', null, 290)
    
    m.actorTalkScript([
        ["speaker_l", "Camden"],
        ["speaker_r", "Pimlico"],
        ["say_r", "I sometimes try and target enemies and miss and end up moving."],
        ["say_r", "It totally throws my balance off, but if you hold the Ctrl key, that doesn't happen."],
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
        ]]
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

// TODO: setupParty

function setupFirstMission(ps, m) {
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

function setupClearTheWay(ps, m) {
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

function setupBossFight(ps, m) {
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
        	["change_scene", "finale"],
		], [
            ["change_scene", "act1.town"],
        ]],
    ])

}


function setupOZ(ps, m) {
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

function setupGameOver(ps, m) {
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

function setupFinale(ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	m.setStartScript([
		["blank"],
		["say_l", "Thanks for playing the Robot Underground JavaScript demo!"],
		["say_l", "Please leave your feedback!"],
		["say_l", "To find out what happens to Camden and the gang, check out the complete game!"],
		["end_game"],
		// TODO: option to load saved game
	])
}




