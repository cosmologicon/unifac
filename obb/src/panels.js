// Controls what part of the screen various control panels take up, including gameplay area.
// Going for an extremely repsonsive design here. The screen should be able to be resized
//   arbitrarily at any point in the game without interrupting the flow of gameplay.


var panels = []

var playpanel = {
	draw: function () {
		var vs = state.viewstate
		graphics.progs.checker.use()
		graphics.progs.checker.setcanvassize(canvas.width, canvas.height)
		graphics.progs.checker.setcenter(vs.x0G, vs.y0G)
		graphics.progs.checker.setzoom(vs.VzoomG)
		graphics.drawunitsquare(graphics.progs.checker.attribs.pos)
	},
}



