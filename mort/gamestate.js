var record = {
	knownfeats: {
		leap: 2,
		nab: 1,
	},
	unlocked: 1,
	maxvisited: 0,
	heightrecord: 1,
	comborecord: 1,
	collected: {},
	bank: 0,
	hiscore: {},
	seentips: {},
}

var gamestate = {
	level: 1,
	newheightrecord: false,
	newcomborecord: false,
	newcollections: [],
	catchamount: 0,
	bonusamount: 0,
	combocount: 0,
	butterflies: [],

	// Save game
	save: function () {
		var obj = [record, this.level]
		localStorage[settings.savegamename] = JSON.stringify(obj)
	},
	
	// Load game
	load: function () {
		var s = localStorage[settings.savegamename]
		if (s) {
			var obj = JSON.parse(s)
			record = obj[0]
			this.level = obj[1]
		}
	},
	
	startlevel: function () {
		this.bars = {} ; this.feattick = {}
		this.resetcounts()
		this.goal = mechanics.levelinfo[this.level].goal
		this.time = mechanics.levelinfo[this.level].t
		this.butterflies = []
		var btime = mechanics.levelinfo[this.level].btime
		for (var j = 0 ; j < btime.length ; ++j) {
			for (var k = 0 ; k < btime[j] ; ++k) {
				this.butterflies.push(new Butterfly(mechanics.butterfly[j]))
			}
		}
	},
	resetcounts: function () {
		for (var f in record.knownfeats) {
			this.bars[f] = record.knownfeats[f]
			this.feattick[f] = 0
		}
		var r = []
		if (this.newheightrecord) r.push("New height record!")
		if (this.newcomborecord) r.push("New combo record!")
		this.newcollections.forEach(function (c) { r.push("You caught a " + c + "!") })
		this.newheightrecord = false
		this.newcomborecord = false
		this.newcollections = []
		this.combocount = 0
		return r
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
			if (grounded) {
				// TODO: add an effect
				return "You caught a " + b.info.fullname + "!"
			} else {
				this.newcollections.push(b.info.fullname)
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
		var btime = mechanics.levelinfo[this.level].btime
		for (var j = 0 ; j < btime.length ; ++j) {
			if (btime[j] && UFX.random(btime[j]) < dt) {
				this.butterflies.push(new Butterfly(mechanics.butterfly[j]))
			}
		}
		this.butterflies.forEach(function (b) { b.think(dt) })
		this.time -= dt
	},
	
	// TODO: visit
	// TODO: checkvisit
	// TODO: gethcrecord
	
	
}






