var building = {
	imgs: {},
	iscale: 3,
	getimg: function (w, h) {
		w = Math.round(w)
		h = Math.round(h)
		var key = w + "," + h
		if (this.imgs[key]) return this.imgs[key]
		var img = this.imgs[key] = document.createElement("canvas")
		img.width = w
		img.height = h
		var con = img.getContext("2d")
//		var color0 = "#" + UFX.random.choice(["33", "44", "55", "66"]) + UFX.random.choice("6789A")
		var color0 = "#" + UFX.random.choice(["22", "33", "44", "55", "66", "77"]) + UFX.random.choice("56789ABC")
		var color1 = "#" + UFX.random.choice("56789") + UFX.random.choice("23456") + UFX.random.choice("01234")
		UFX.draw(con, "fs", color0, "f0")
/*
		var n = UFX.random.rand(Math.ceil(w / 20), Math.floor(w / 8))
		var m = UFX.random.rand(Math.ceil(h / 20), Math.floor(h / 6))
		UFX.draw(con, "b ss", color1, "lw 3")
		for (var j = 0 ; j <= n ; ++j) UFX.draw(con, "m", j/n*(w-1), 0, "l", j/n*(w-1), h)
		for (var j = 0 ; j <= m ; ++j) UFX.draw(con, "m", 0, j/m*(h-1), "l", w, j/m*(h-1))
		UFX.draw(con, "s")
*/
		var grad = UFX.draw.lingrad(con, 0, h, w, 0, 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.5)")
		UFX.draw(con, "fs", grad, "f0")
		return img
	},
	getspec: function (x0, w, h) {
		var img = this.getimg(w * this.iscale, h * this.iscale)
		return [
			"[ t", -x0, 0, "z", 1/this.iscale, 1/this.iscale,
			"drawimage", img, -img.width/2, 0,
			"]"
		]
	},
}

