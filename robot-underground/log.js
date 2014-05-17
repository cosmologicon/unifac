// I'm not trying to replicated the python version's logs here.
// These are things I think would be useful for my own balancing, etc.

function log() {
	log.record.push([Date.now()].concat([].slice.apply(arguments)))
}
log.sessionname = UFX.random.word()

log.startscene = function () {
	this.record = []
	
	this.mission = UFX.scenes.missionmode.mission
	
	this.protagweapids = robotstate.weaponry.map(function (w) { return w && w.id })

	this.weaponlogs = {}

	this("session", this.sessionname)
	this("useragent", navigator.userAgent)
	this("windowsize", window.innerWidth, window.innerHeight)
	this("settings", clone(settings))
	this("scene", plotstate.nextScene)
	this("gamestate", clone(getstate()))
	this("protagweapids", this.protagweapids)
}
log.error = function (error, url, line) {
	if (!this.record) this.record = []
	this("useragent", navigator.userAgent)
	this("settings", clone(settings))
	this("error", error, url, line)
	this.send()
}
log.damage = function (weapid, amount, target) {
	var targettype = target === this.mission.protag ? "protag" : "other"

	var key = weapid + "|" + targettype, wl = this.weaponlogs[key]
	if (!wl) {
		wl = this.weaponlogs[key] = {
			hits: 0,
			kills: 0,
			nominaldamage: 0,
			actualdamage: 0,
		}
	}
	wl.hits++
	wl.kills += amount >= target.currenthp ? 1 : 0
	wl.nominaldamage += amount
	wl.actualdamage += Math.min(amount, target.currenthp)
}

log.send = function () {
	var records = this.record.splice(0)
	if (settings.nolog) return
	var obj = {
		url: window.location.href,
		gamename: settings.gamename,
		gameversion: settings.version,
		sessionname: this.sessionname,
		statename: robotstate.name,
		records: records,
		weaponlogs: this.weaponlogs,
	}
    var req = new XMLHttpRequest()
    req.open("POST", "http://universefactory.net/tools/rawjsondump/", true)
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send("data=" + encodeURIComponent(JSON.stringify(obj)))
}



