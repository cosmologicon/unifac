// AFTER LITTLE CONSIDERATION I HAVE DECIDED THAT THE CONVENTION FOR THIS GAME WILL BE
// THAT "DOWN" IS THE POSITIVE Y DIRECTION AND "UP" IS THE NEGATIVE Y DIRECTION. SO BE IT.


var WorldBound = {
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var FacesDirection = {
	init: function () {
		this.facingright = true
	},
	draw: function () {
		if (!this.facingright) UFX.draw("hflip")
	},
}

var KeepsLastPosition = {
	think: function (dt) {
		this.oldx = this.x
		this.oldy = this.y
	},
}

