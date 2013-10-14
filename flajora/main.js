

// CONVENTION TIME!
// +x IS TO THE RIGHT
// +y IS DOWN
// A = 0 is RIGHT, A = tau/4 is DOWN
// THUS VECTORS ARE [cos(A), sin(A)]

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.watchlist = "up down left right space esc backspace F12".split(" ")
UFX.maximize.fill(canvas, "total")


UFX.scenes.load = {
	start: function () {
		this.f = 0
	},
	think: function (dt) {
		var kstate = UFX.key.state()
		if (kstate.down.space) {
			UFX.scene.push("game")
			loadgame()
		}
	},
	draw: function () {
		if (this.f >= 1) {
			var text = "Flajora's Flask\n\nPress Space"
		} else {
			text = "Flajora's Flask\n\nLoading (" + (100 * this.f).toFixed(0) + "%)"
		}
		UFX.draw("fs white f0")
		write(text, 0.5, 0.5, settings.tstyles.title)
		write("by Christopher Night, Universe Factory Games", 0.5, 0.45, settings.tstyles.subtitle)
	},
}
UFX.scene.init()
UFX.scene.push("load")


UFX.resource.onload = function () {
	var music = UFX.resource.music = document.getElementById("music")
	music.addEventListener("ended", function() {
		this.currentTime = 0
		this.play()
	}, false)
	music.play()
	stopmusic()
	for (var s in UFX.resource.sounds) {
		UFX.resource.sounds[s] = UFX.resource.Multisound(UFX.resource.sounds[s])
	}
	UFX.resource.mergesounds("die", "get", "hiss", "note", "talk", "teleport")
	UFX.scenes.load.f = 1
}
UFX.resource.onloading = function (f) {
	UFX.scenes.load.f = f
}
UFX.resource.loadwebfonts("Unkempt", "Maiden Orange", "Mouse Memoirs",
	"Boogaloo", "Kavoon", "Luckiest Guy", "Mystery Quest",
	"Alfa Slab One")
var res = {
	ship: "img/ship.png",
}
allitems.forEach(function (item) { res[item] = "img/" + item + ".png" })
"die0 die1 die2 die3 get0 get1 hiss0 hiss1 hiss2 hiss3 hiss4 note0 note1 note2 note3 note4 note5 note6 note7 note8 talk0 talk1 talk2 teleport0 teleport1 teleport2".split(" ").forEach(function (sound) { res[sound] = "sound/" + sound + ".ogg" })
UFX.resource.load(res)


function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}
var tau = 6.28318530718
function extend(obj, attribs) {
	var ret = Object.create(obj)
	for (var x in attribs) ret[x] = attribs[x]
	return ret
}
function dist(obj0, obj1) {
	var dx = obj0.x - obj1.x, dy = obj0.y - obj1.y
	return Math.sqrt(dx * dx + dy * dy)
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

// Also return the width and height, and lineheight
function splittext(text, style) {

	context.font = style.size + "px '" + style.font + "'"
	var texts = text.split("\n")
	if (style.width) {
		texts = [].concat.apply([], texts.map(function(t) { return wordwrap(t, style.width) }))
	}

	var lh = Math.ceil(1.25 * style.size)
	var w = Math.max.apply(null, texts.map(function (t) { return context.measureText(t).width }))
	var h = style.size + lh * (texts.length - 1)

	return [texts, w, h, lh]
}

function write(text, x, y, tstyle, opts) {
	var style = opts ? extend(tstyle, opts) : tstyle
	var metrics = splittext(text, style)
	var texts = metrics[0], w0 = metrics[1], h0 = metrics[2], lh = metrics[3]
	
	context.save()
	var hanchor = style.hanchor || 0, vanchor = style.vanchor || 0
	context.textAlign = {0: "left", 0.5: "center", 1: "right"}[hanchor]
	context.textBaseline = {0: "top", 0.5: "middle", 1: "bottom"}[vanchor]

	context.translate(x * settings.sx, y * settings.sy)
	if (style.boxcolor || style.boxbcolor) {
		var bw = w0 + 0.8 * lh, bh = h0 + 0.7 * lh, bx = -bw * hanchor, by = -bh * vanchor
		UFX.draw("tr", bx, by, bw, bh)
		if (style.boxcolor) {
			UFX.draw("fs", style.boxcolor, "f")
		}
		if (style.boxbcolor) {
			UFX.draw("lw", Math.ceil(0.1 * style.size), "ss", style.boxbcolor, "s")
		}
	}
	if (style.color) context.fillStyle = style.color
	if (style.bcolor) {
		context.strokeStyle = style.bcolor
		context.lineWidth = Math.ceil(0.05 * style.size)
	}
	if (style.shadow) {
		context.shadowColor = style.shadow
		context.shadowOffsetX = context.shadowOffsetY = Math.ceil(0.03 * style.size)
	}
	texts.forEach(function (text, j) {
		context.save()
		context.translate(0, Math.round((j + 0.5) * lh - h0 * vanchor))
		if (style.bcolor) context.strokeText(text, 0, 0)
		if (style.color) context.fillText(text, 0, 0)
		context.restore()
	})
	context.restore()
}

function worldwrite(text, tstyle, opts) {
	context.save()
	context.scale(0.1, 0.1)
	write(text, 0, 0, tstyle, opts)
	context.restore()
}

function playsound(sname) {
	UFX.resource.sounds[sname].play()
}
function playmusic() {
	UFX.resource.music.volume = 1
}
function stopmusic() {
	UFX.resource.music.volume = 0
}


