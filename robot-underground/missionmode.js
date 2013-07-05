
UFX.scenes.missionmode = {
	start: function () {
		this.mission = new Mission()
	},
	
	draw_world: function (minx, miny, maxx, maxy) {
		var cs = this.mission.map.csize
		
	},
	draw: function () {
		graphics.clear()
		graphics.cz = 0.1
		graphics.setxform()
		imagedata["robots.goldhawk"].forEach(function (ps, j) {
			ps = new Float32Array(ps)
			graphics.drawlinestrip(ps, [0, 0, 1])
		})
	},
}


