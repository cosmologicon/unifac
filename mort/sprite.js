var frameoffsets = {
	stand: [94, 150],
	run0: [84, 145],
	run1: [84, 150],
	run2: [84, 145],
	nab0: [94, 150],
	nab1: [94, 150],
	nab2: [94, 150],
	nab3: [94, 150],
}

function drawframe(fname, hflip) {
	UFX.draw("[")
	if (hflip) UFX.draw("hflip")
	var off = frameoffsets[fname]
	context.drawImage(UFX.resource.images[fname], -off[0], -off[1])
	UFX.draw("]")
}


var DrawSprite = {
	init: function () {
		this.frame = null
	},
	draw: function () {
		drawframe(this.frame, !this.facingright)
	},
}

