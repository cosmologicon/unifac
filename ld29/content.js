
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
			this.cutscene("complete")
		}
	},
	talkpald: function () {
		if (this.newcutscene("mission4")) {
			state.canwarp = true
			state.done.knowlume = true
			state.you.maxhp += 1
		} else {
			this.cutscene("complete")
		}
	},
	talklume: function () {
		if (this.newcutscene("mission5")) {
			state.done.knowmian = true
			state.done.knowlige = true
			state.done.knowsank = true
			state.you.maxhp += 1
			state.njump += 1
		} else {
			this.cutscene("complete")
		}
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
	sank: "sank",
	lige: "lige",
	mian: "mian",
}


var cutscenes = {
	mission1: [
		"Apprentice, my time is short. My thoughts of late have turned to Heaven.",
		"You have heard the story of Heaven, yes? But do you know what that word means?",
		"What we know as Heaven is in fact the surface of this world, which our ancestors abandoned 100 generations ago.",
		"I wonder now what we have left behind....",
		"Go to the House of Avex. There you will find a powerful tool.",
	],
	wingusage: [
		"Have you learned to use your wings?",
		"Press Up near an enemy to slash it. Hold Up and you will hang in the air briefly.",
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
		"Press and hold Space to create a platform.",
		"Now you must go to the House of Zume.",
	],
	buildusage: [
		"Have you learned to build pathways?",
		"Press and hold Space while standing on a platform.",
		"Choose the placement with the arrow keys, then release Space to build.",
	],
	mission4: [
		"Wow, close one. Anyway, press Tab to warp between Houses.",
		"And yeah, you've got another house to visit. Check out the House of Brite.",
	],
	mission5: [
		"This is where the Artificial Sun once shone.",
		"Visit the Houses of ..., ..., and ... to restore it.",
		"Learned Double Jump! Tap Up twice to reach new heights."
	],

	complete: [
		"Good luck, builder.",
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
			if (!this.texts.length) UFX.scene.pop()
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



