
var content = {
	talkelgo: function () {
		if (this.newcutscene("mission1")) {
			state.done.knowwari = true
		} else {
			this.cutscene("healinfo")
		}
	},
	talkwari: function () {
		if (this.newcutscene("mission2")) {
			state.jhang = 1
			state.done.knowsemt = true
			state.you.maxhp += 1
		} else {
			this.cutscene("wingusage")
		}
	},
	talksemt: function () {
		if (this.newcutscene("mission3")) {
			state.canbuild = true
			state.done.knowpald = true
			state.you.maxhp += 1
		} else {
			this.cutscene("buildusage")
		}
	},
	talkpald: function () {
		if (this.newcutscene("mission4")) {
			state.canwarp = true
			state.done.knowlume = true
			state.you.maxhp += 1
		} else {
			this.cutscene("warpusage")
		}
	},
	talklume: function () {
		if (this.newcutscene("mission5")) {
			state.done.knowmian = true
			state.done.knowlige = true
			state.done.knowsank = true
			state.you.maxhp += 1
			state.njump += 1
		} else if (!state.done.rescuelige) {
			this.cutscene("tosavelige")
		} else if (!state.done.rescuesank) {
			this.cutscene("tosavesank")
		} else if (!state.done.rescuemian) {
			this.cutscene("tosavemian")
		} else if (this.newcutscene("restoresun")) {
			state.njump += 1
			state.you.maxhp += 1
			state.sun = true
			state.gp += 999999999
		} else {
			this.cutscene("seeksart")
		}
	},
	talklige: function () {
		if (this.newcutscene("getinfolige")) {
			state.you.maxhp += 1
			state.jhang += 1
		} else {
			this.cutscene("complete")
		}
	},
	talksank: function () {
		if (this.newcutscene("getinfosank")) {
			state.you.maxhp += 1
			state.jhang += 1
		} else {
			this.cutscene("complete")
		}
	},
	talkmian: function () {
		if (this.newcutscene("getinfomian")) {
			state.you.maxhp += 1
			state.jhang += 1
		} else {
			this.cutscene("complete")
		}
	},
	talksarf: function () {
		UFX.scene.push("endscene")
	},
	cutscene: function (cname) {
		UFX.scene.push("cutscene", cutscenes[cname])
	},
	newcutscene: function (cname) {
		if (state.done[cname]) return false
		state.done[cname] = true
		UFX.scene.push("cutscene", cutscenes[cname])
		return true
	},
}

var HouseNames = {
	elgo: "Eldar",
	wari: "Avex",
	semt: "Kraftin",
	pald: "Zume",
	lume: "Brite",
	lige: "Mentix",
	sank: "Querda",
	mian: "Cogno",
	sarf: "Nirva",
}


var cutscenes = {
	mission1: [
		"Apprentice, my time is short. My thoughts of late have turned to Heaven.",
		"You've heard the story of Heaven, yes? But do you know what that word means?",
		"What we know as Heaven is in fact the surface of this world, which our ancestors abandoned 100 generations ago.",
		"There is a place beyond the darkness, a place that might still be there, but this fact seems to have been forgotten by our people.",
		"Promise me that you will keep this knowledge alive.",
		"Go to the House of Avex. There you will find a powerful tool.",
	],
	healinfo: [
		"Remember, return to any House if you need to heal.",
	],
	mission2: [
		"There was once a lamp brighter than anything you can imagine, called the Artifical Sun.",
		"But sadly it broke many years ago, before you were born.",
		"How I wish you could have seen the daylight....",
		"Since the Sun disappeared, the creatures of the darkness have grown bolder.",
		"Will you sojourn at the House of Kraftin? I have not heard from them in ages and I fear the worst.",
		"Received Wings! You now slash when you jump. Hold Up while jumping to hover.",
	],
	wingusage: [
		"Have you learned to use your wings?",
		"Press Up near an enemy to slash it. Hold Up and you will hang in the air briefly.",
	],
	mission3: [
		"Thank you! Never have these creatures attacked Houses before. This is cause for alarm!",
		"Our shelters have served us well for many centuries, but they are finally decaying.",
		"Our ancestors were builders, you know. Very little existed here before they came.",
		"Although most of their technologies have been lost, I can teach you one.",
		"Press and hold Space to create a platform. Use Arrow keys to place it.",
		"Platforms cost " + settings.pcost + "GP each. If you run low, slay some monsters or visit any House.",
		"Please visit the House of Zume. I believe your path lies there.",
	],
	buildusage: [
		"Have you learned to build pathways?",
		"Press and hold Space while standing on a platform.",
		"Choose the placement with the arrow keys, then release Space to build.",
		"What? You want to build a path to Heaven? No, it would never work.",
		"These pathways cannot be built above 60 fathoms. Such technology is long lost, I'm afraid.",
	],
	mission4: [
		"Wow, close one. I don't know how much longer we can last.",
		"Look, I know that mentor of yours likes old stories of Heaven and salvation, but we have real problems to deal with.",
		"Right now we need to turn the Sun back on, before these attacks destroy us.",
		"Find the House of Brite and see what can be done, if it's not too late.",
		"Got warp! Press Tab to warp between Houses you've visited.",
	],
	warpusage: [
		"Press Tab at any time to warp to a random House that you've already visited.",
		"Houses will refill your health and money (up to 20GP) and save your progress.",
	],
	mission5: [
		"This is where we once controlled the Artificial Sun, but we have not seen daylight in many years.",
		"I could repair it, I know, if only I had replacement parts....",
		"The technology of our ancestors is thought to be lost, but it is simply scattered.",
		"Perhaps if you visit the Houses of Mentix, Querda, and Cogno, you may find what I need.",
		"Learned Double Jump! Tap Up twice.",
	],
	tosavelige: [
		"Visit the Houses of Mentix, Querda, and Cogno to restore the Sun.",
		"You still have not come back from Mentix.",
	],
	tosavesank: [
		"Visit the Houses of Mentix, Querda, and Cogno to restore the Sun.",
		"You still have not come back from Querda.",
	],
	tosavemian: [
		"Visit the Houses of Mentix, Querda, and Cogno to restore the Sun.",
		"You still have not come back from Cogno.",
	],
	getinfolige: [
		"The House of Brite seeks to restore the Sun?",
		"Their retroencabulator must be broken, please take this replacement!",
		"Wings upgraded!",
	],
	getinfosank: [
		"The House of Brite seeks to restore the Sun?",
		"Their improbability drive must be broken, please take this replacement!",
		"Wings upgraded!",
		"Er.... I don't really know how to get out of here. Better press Tab.",
	],
	getinfomian: [
		"The House of Brite seeks to restore the Sun?",
		"Their flux capacitor must be broken, please take this replacement!",
		"Wings upgraded!",
	],
	restoresun: [
		"Amazing! With the parts you've collected, I think we may be able to restore the Sun....",
		"....",
		"Let there be light!",
		"Got triple jump!",
		"Got unlimited GP!",
	],
	seeksart: [
		"Thanks to you, the light is restored.... for now.",
		"You want to know if there is a path to Heaven? As in the actual Heaven?",
		"Legend tells of one to the east, of course, but I'm sure it's long gone, if it ever existed.",
		"Still....",
	],

	complete: [
		"Good luck, young one.",
	],
}

UFX.scenes.cutscene = {
	start: function (texts) {
		this.texts = texts.slice(0)
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (kstate.down.space) {
			this.texts.shift()
			if (!this.texts.length) {
				UFX.scene.pop()
				playsound("powerup")
				playmusic("song" + state.njump)
			}
		}
	},
	draw: function () {
		UFX.scenes.play.draw()
		UFX.draw("fs rgba(0,0,0,0.9) f0")
		if (!this.texts[0]) return
		UFX.draw("[ fs white sh #00A 1 1 0 font 40px~'Pirata~One' textalign center")
		wordwrap(this.texts[0], 500, context).forEach(function (t, j, ts) {
			context.fillText(t, canvas.width / 2, canvas.height / 2 + 50 * (j - ts.length / 2))
		})
		UFX.draw("]")
	},
}

UFX.scenes.endscene = {
	start: function (texts) {
		this.texts = [
			"Whoa, you okay? Did you just come out of that hole in the ground?",
			"You having trouble seeing? It's just sunlight. Let's get you inside.",
			"Now, how long have you been down there? Your whole life?!",
			"What? Is this 'Heaven'? Yeah sure, whatever you want. Just sit tight for a minute.",
			"How many of you people are underground? A whole race?! Holy smokes, what a find!",
			"Hey, do you have an agent? Of course not, I'll be your agent. I'm your best friend, after all!",
			"A race of subterranian people... hey, are you a cannibal? No? Okay, well, maybe we can say you are anyway.",
			"I can see it now... front pages... talk shows... here we come!",
			"Welcome to Heaven, kid, you're gonna love it!",
		]
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (kstate.down.space) {
			this.texts.shift()
			if (!this.texts.length) { UFX.scene.pop() ; UFX.scene.swap("reset") }
		}
	},
	draw: function () {
		UFX.scenes.play.draw()
		UFX.draw("fs rgba(0,0,0,0.9) f0")
		if (!this.texts[0]) return
		UFX.draw("[ fs white sh #00A 1 1 0 font 40px~'Pirata~One' textalign center")
		wordwrap(this.texts[0], 500, context).forEach(function (t, j, ts) {
			context.fillText(t, canvas.width / 2, canvas.height / 2 + 50 * (j - ts.length / 2))
		})
		UFX.draw("]")
	},
}


function wordwrap(text, twidth, con) {
    con = con || context
    twidth = twidth || con.canvas.width
    var texts = [text], n = 0, s
    while (con.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
        var t = texts[n], a = t.lastIndexOf(" ")
        while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
        texts[n++] = t.substr(0, a)
        texts.push(t.substr(a+1))
    }
    return texts
}



