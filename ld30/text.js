var ShowsText = {
	start: function (args) {
		this.text = args.text || ""
		this.fontsize = args.fontsize || 20
		this.alive = true
	},
	think: function (dt) {
		var t = this.t - 3
		if (t > 0 && t * 18 < this.text.length && UFX.random(0.25) < dt) {
			audio.tap()
		}
	},
	draw: function () {
		UFX.draw("z 0.025 0.025 fs rgba(100,100,255,0.33) font " + this.fontsize + "px~'Nova~Flat'")
		var t = this.t - 3
		var n = clamp(t * 18, 0, this.text.length)
		var text = this.text.substr(0, n) + (t < 5 && t % 0.5 > 0.25 ? "|" : "")
		var linesize = this.fontsize * 1.2
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

function TextEffect(words, x, y) {
	if (!(this instanceof TextEffect)) return new TextEffect(words, x, y)
	this.start({
		text: words,
		x: x,
		y: y,
		lifetime: 999999,
	})
}
TextEffect.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Fades)
	.addcomp(ShowsText)

