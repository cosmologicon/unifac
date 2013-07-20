
function Button(fn, x, y, width, height, icon, color, border, box) {
	this.x = x
	this.y = y
	this.width = width
	this.height = height
	this.icon = icon
	this.color = color || [1, 1, 1]
	this.border = border || [1, 1, 1]
	this.box = box === undefined ? true : box
	this.fn = fn
}
Button.prototype = {
	draw: function () {
		if (this.boox) {
			graphics.drawrect([this.x, this.y], [this.width, this.height], this.border, [0, 0, 0, 0.8])
		}
		if (this.icon) {
			graphics.draw(this.icon, this.x, this.y, this.height, 0, { colour: this.color })
		}
	},
	activate: function () {
		this.fn()
	},
	point_within: function (x, y) {
		return this.x <= x && x - this.x <= this.width && this.y <= y && y - this.y <= this.height
	},
	on_mouse_press: function (x, y) {
		if (this.point_within(x, y)) {
			this.activate()
			return true
		}
	},
}


