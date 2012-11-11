var frameoffsets = {
	stand: [94, 150],
	run0: [84, 145],
	run1: [84, 150],
	run2: [84, 145],
	nab0: [94, 150],
	nab1: [94, 150],
	nab2: [94, 150],
	nab3: [94, 150],
	skynab0: [94, 150],
	skynab1: [94, 150],
	skynab2: [94, 150],
	skynab3: [94, 150],
	bound: [94, 150],
	dart: [94, 150],
	roll: [94, 150],
	twirl0: [84, 150],
	twirl1: [84, 150],
	twirl2: [84, 150],
	twirl3: [84, 150],
}

function drawframe(fname, hflip) {
	UFX.draw("[")
	if (hflip) UFX.draw("hflip")
	var off = frameoffsets[fname]
	UFX.draw("drawimage", UFX.resource.images[fname], -off[0], -off[1], "]")
}


var DrawSprite = {
	init: function () {
		this.frame = null
	},
	draw: function () {
		drawframe(this.frame, !this.facingright)
	},
}

