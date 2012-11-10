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
		this.checkcomborecord()
		return true
	},
	
	// When a height of h is reached, update records accordingly
	checkheightrecord: function (h) {
		h = Math.floor(h)
		if (h <= record.heightrecord) return false
		record.heightrecord = h
		this.newheightrecord = true
		this.bonusamount += h
		return h
	},
	
	// When a combo amount of c is reached, update records accordingly
	checkcomborecord: function (c) {
		if (c <= record.comborecord) return false
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
	
	// When nabbing a butterfly of type b in the air, update record accordingly
	checknab: function (b) {
		this.catchamount += (settings.easy ? 3 : 1) * b.value
		if (record.collected[b.name]) {
			record.collected[b.name] += 1
		} else {
			record.collected[b.name] = 1
			this.newcollections.push(b.fullname)
		}
	},
	
	// When you catch a butterfly on the ground
	checknabgrounded: function (b) {
		this.catchamount += (settings.easy ? 3 : 1) * b.value
		if (record.collected[b.name]) {
			record.collected[b.name] += 1
		} else {
			record.collected[b.name] = 1
			return "You caught a " + b.fullname + "!"
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
	
	// TODO: visit
	// TODO: checkvisit
	// TODO: gethcrecord
	
	
}






