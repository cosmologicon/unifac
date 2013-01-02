var record = {
	knownfeats: {
		leap: 2,
		nab: 1,
	},
	unlocked: 1,
	heightrecord: 1,
	comborecord: 1,
	collected: {},
	ncollected: 0,
	bank: 0,
	hiscore: {},
	seentips: {},
	seenscenes: {},
	playername: UFX.random.word(),
}
var record0 = JSON.stringify(record)

var gamestate = {
	level: 1,
	newheightrecord: false,
	newcomborecord: false,
	newcollections: [],
	catchamount: 0,
	bonusamount: 0,
	combocount: 0,
	butterflies: [],

	getstate: function () {
		return [record, this.level]
	},
	
	setstate: function (r, lev) {
		record = r
		this.level = lev
	},

	// Save game
	save: function () {
		var obj = this.getstate()
		localStorage[settings.savegamename] = JSON.stringify(obj)
	},
	
	// Load game
	load: function () {
		var s = localStorage[settings.savegamename]
		if (s) {
			this.setstate.apply(this, JSON.parse(s))
		}
	},
	
	// Reset saved game (after confirmation) and reload page
	reset: function () {
		var s = "Reset saved game and start from the beginning?"
		if (!window.confirm(s)) return
		record = JSON.parse(record0)
		this.level = 1
		this.save()
		window.location.reload()
	},
	
	startlevel: function () {
		this.bars = {} ; this.feattick = {}
		this.resetcounts()
		this.goal = mechanics.levelinfo[this.level].goal
		this.time = mechanics.levelinfo[this.level].t
		this.butterflies = []
		this.btime = mechanics.levelinfo[this.level].btime
		for (var j = 0 ; j < this.btime.length ; ++j) {
			for (var k = 0 ; k < this.btime[j] ; ++k) {
				this.butterflies.push(new Butterfly(mechanics.butterfly[j]))
			}
		}
		this.catchamount = 0
		this.bonusamount = 0
		this.endingproclaimed = false
	},
	// Called when you land to annonouce new records
	// Also end-of-level logic
	proclaimcounts: function (forcefinish) {
		var r = []
		if (this.newheightrecord) r.push("New height record!")
		if (this.newcomborecord) r.push("New combo record!")
		this.newcollections.forEach(function (c) { r.push("You caught a|" + c + "!") })
		if ((!this.endingproclaimed && this.time <= 0) || forcefinish) {
		    this.endingproclaimed = true
		    if (this.catchamount >= this.goal) {
		        r.push("Stage|Complete!")
		        if (!settings.easy && this.catchamount > (record.hiscore[this.level] || 0)) {
		            record.hiscore[this.level] = this.catchamount
		            r.push("New high score!")
	            }
	            this.advance()
		    } else {
		        r.push("Stage|Incomplete")
		    }
		    for (var f in mechanics.feat) {
		        if (record.knownfeats[f]) continue
		        if (record.ncollected < mechanics.feat[f].learnat) continue
		        this.bars[f] = record.knownfeats[f] = 1
		        r.push("New ability|unlocked: " + f)
            }
		}
		if (r) ActionHUD.addproclamations(r)
    },
	resetcounts: function () {
		for (var f in record.knownfeats) {
			this.bars[f] = record.knownfeats[f]
			this.feattick[f] = 0
		}
		this.newheightrecord = false
		this.newcomborecord = false
		this.newcollections = []
		this.combocount = 0
	},
	
	attempt: function (feat) {
		if (!record.knownfeats[feat]) return false
		if (!this.bars[feat]) return false
		this.bars[feat] -= 1
		this.feattick[feat] = mechanics.growtime(this.bars[feat], record.knownfeats[feat])
		// TODO: highlight the HUD effect for this feat
		return true
	},
	
	// When a height of h is reached, update records accordingly
	checkheightrecord: function (h) {
		h = Math.floor(h)
		if (h <= record.heightrecord) return false
		ActionHUD.addheightcasheffect(h)
		record.heightrecord = h
		this.newheightrecord = true
		this.bonusamount += h
		return h
	},
	
	// When a combo amount of c is reached, update records accordingly
	checkcomborecord: function (c) {
		if (c <= record.comborecord) return false
		ActionHUD.addcombocasheffect(c)
		record.comborecord = c
		this.newcomborecord = true
		this.bonusamount += c
		return c
	},
	incrementcombo: function () {
		this.combocount += 1
		this.checkcomborecord(this.combocount)
		// TODO: highlight the effect
	},
	
	nabarea: function (x, y, r, grounded) {
		var collect = false
		for (var j = 0 ; j < this.butterflies.length ; ++j) {
			var b = this.butterflies[j]
			var dx = b.x - x, dy = b.y - y
			if (dx*dx + dy*dy > r*r) continue
			b.collected = true
			collect = true
			this.checknab(b, grounded)
			playsound("pickup")
		}
		if (collect) {
			this.butterflies = this.butterflies.filter(function (b) { return !b.collected })
		}
	},
	
	// When nabbing a butterfly of type b, update record accordingly
	checknab: function (b, grounded) {
        var v = (settings.easy ? 3 : 1) * b.info.value
		this.catchamount += v
		WorldEffects.addcasheffect(v, b.x, b.y)
		if (record.collected[b.info.name]) {
			record.collected[b.info.name] += 1
		} else {
			record.collected[b.info.name] = 1
			record.ncollected += 1
			if (grounded) {
				// TODO: add an effect
				ActionHUD.addproclamations(["You caught a|" + b.info.fname + "!"])
			} else {
				this.newcollections.push(b.info.fname)
			}
		}
	},
			
	// Call when beating a level to see if a new high score is reached
	checkhiscore: function () {
		record.unlocked = Math.max(record.unlocked, this.level + 1)
		if ((record.hiscore[this.level] || 0) < this.catchamount) {
			record.hiscore[this.level] = this.catchamount
			return "New high score!"
		}
	},
	
	combinemoney: function () {
		record.bank += this.catchamount + this.bonusamount
		this.catchamount = 0
		this.bonusamount = 0
	},
	
	think: function (dt) {
	    for (var f in record.knownfeats) {
	        if (this.bars[f] >= record.knownfeats[f]) continue
	        this.feattick[f] -= dt
	        if (this.feattick[f] >= 0) continue
		    this.bars[f] += 1
		    this.feattick[f] = mechanics.growtime(this.bars[f], record.knownfeats[f])
	    }
		for (var j = 0 ; j < this.btime.length ; ++j) {
			if (this.btime[j] && UFX.random(this.btime[j]) < dt) {
				this.butterflies.push(new Butterfly(mechanics.butterfly[j]))
			}
		}
		this.butterflies.forEach(function (b) { b.think(dt) })
		this.time -= dt
		if (this.time < 0 && You.grounded) {
		    this.proclaimcounts()
	    }
	},
	
	// when you beat the current level
	advance: function () {
	    if (this.level == 6) {
	    	this.level++
	    	return
    	}
	    if (this.level == record.unlocked) {
	        this.level = ++record.unlocked
	    }
	},
	
}

gamestate.load()
gamestate.save()

function confirmrecording() {
	if (!("recordgame" in record)) {
		var s = "This game is under development. The developer of this game (Christopher Night) would " +
			"like to upload a recording of your gameplay, in order to make improvements to the game. " +
			"No personal information will be uploaded, and the recording will not be accessible to " +
			"anybody but the developer. If you don't want to participate, pick Cancel (you can still " +
			"play the game)."
		record.recordgame = window.confirm(s)
		gamestate.save()
	}
}

function startrecording() {
	recorder = UFX.Recorder({
		gamename: settings.gamename,
		version: settings.version,
		sessionname: settings.sessionname,
		playername: record.playername,
		getstate: function () {
			return gamestate.getstate()
		},
		tethered: true,
		tetherswap: true,
		postscript: "http://universefactory.net/tools/playback/post/",
	})
}



