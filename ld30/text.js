var ShowsText = {
	start: function (args) {
		this.text = args.text || ""
		this.fontsize = args.fontsize || 20
		this.alive = true
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
	start: function (args) {
		this.lifetime = args.lifetime || 10
	},
	think: function (dt) {
		this.alive = this.t < this.lifetime
	},
}

var Fades = {
	start: function (args) {
		this.alpha = 1
		this.lifetime = args.lifetime || 10
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
	this.start({
		text: words,
		x: x,
		y: y,
		lifetime: 6,
	})
}
TextEffect.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Fades)
	.addcomp(ShowsText)

