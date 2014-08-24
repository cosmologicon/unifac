var ShowsText = {
	init: function (text) {
		this.text = text || ""
		this.t = 0
		this.fontsize = 20
		this.alive = true
	},
	think: function (dt) {
		this.t += dt
	},
	draw: function () {
		UFX.draw("z 0.025 0.025 fs rgba(100,100,255,0.33) font " + this.fontsize + "px~'sans-serif'")
		var n = Math.min(this.text.length, 18 * this.t)
		var text = this.text.substr(0, n) + (this.t % 0.5 > 0.25 ? "|" : "")
		var linesize = this.fontsize * 1.1
		text.split("\n").forEach(function (t, j) {
			context.fillText(t, 0, linesize * j)
		})
	},
}

var Lifetime = {
	init: function (lifetime) {
		this.lifetime = lifetime || 10
	},
	think: function (dt) {
		this.alive = this.t < this.lifetime
	},
}

var Fades = {
	init: function (lifetime) {
		this.alpha = 1
		this.lifetime = lifetime || 10
	},
	think: function (dt) {
		if (this.t > this.lifetime) {
			this.alpha -= dt
		}
		this.alive = this.alpha > 0
	},
	draw: function () {
		UFX.draw("alpha", Math.max(this.alpha, 0))
	},
}


function TextEffect(words, x, y) {
	if (!(this instanceof TextEffect)) return new TextEffect(words, x, y)
	this.text = words
	this.x = x
	this.y = y
}
TextEffect.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Fades, 6)
	.addcomp(ShowsText)

