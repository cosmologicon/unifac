function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
var tau = 6.283185307179586
window.onerror = function (error, url, line) {
    document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
}

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

UFX.maximize.fill(canvas, "total")
UFX.scene.init({ minups: 5, maxups: 120 })
UFX.mouse.init(canvas)
UFX.mouse.capture.wheel = true
UFX.mouse.qclick = true
UFX.touch.active = false
canvas.ontouchstart = function (event) {
	UFX.touch.active = true
	UFX.touch.init(canvas)
	UFX.mouse.active = false
	canvas.ontouchstart = function () {}
}
UFX.resource.loadwebfonts("Nova Flat")


background.init()
control.init()
state.init()
audio.init()

UFX.scene.push({
	start: function () {
		var leveldata = levels[state.level]
		state.load()
		this.effects = []
		for (var j = 0 ; j < leveldata.texts.length ; ++j) {
			var t = leveldata.texts[j]
			this.effects.push(TextEffect(t[0], t[1], t[2]))
		}
		this.wincurtain = 0
	},
	thinkargs: function (dt) {
		var istate = { pos: [0, 0] }
		var mstate = UFX.mouse.active && UFX.mouse.state()
		var tstate = UFX.touch.active && UFX.touch.state()
		if (mstate) {
			istate.isdown = mstate.left.isdown
			istate.dpos = mstate.dpos
			if (mstate.wheeldy) {
				istate.zoomamt = mstate.wheeldy / 32
				istate.zoomcenter = mstate.pos
			}
			istate.click = mstate.left.click
			istate.start = mstate.left.down
			istate.end = mstate.left.up
			if (mstate.pos) istate.pos = mstate.pos
		}
		if (tstate) {
			istate.isdown = tstate.ids.length == 1
			istate.dpos = istate.isdown && tstate.deltas[tstate.ids[0]]
			if (istate.isdown) istate.pos = tstate.ps[tstate.ids[0]]
			var tstate2 = UFX.touch.twotouchstate(tstate)
			if (tstate2) {
				istate.zoomamt = Math.log(tstate2.rratio)
				istate.zoomcenter = tstate2.center
			} else {
				tstate.tap.forEach(function (event) {
					istate.click = event.pos
				})
				tstate.start.forEach(function (event) {
					istate.start = event.pos
				})
				tstate.release.forEach(function (event) {
					istate.end = event.pos
				})
			}
		}
		return [dt, istate]
	},
	think: function (dt, istate) {
		control.setpos(istate.pos)
		if (istate.isdown && !control.buildstart) {
			view.drag(istate.dpos)
		}
		if (istate.start) {
			control.start(istate.start)
		}
		if (istate.click) {
			var b = control.buttonat(istate.click)
			if (b) {
				control.selectbutton(b)
			}
		}
		if (istate.end) {
			control.end(istate.end)
		}
		if (istate.zoomamt) {
			view.zoom(istate.zoomamt, istate.zoomcenter)
			control.clear()
		}
		view.think(dt)
		background.think(dt)
		control.think(dt)
		state.think(dt)
		this.effects.forEach(function (e) { e.think(dt) })
		if (state.complete) {
			this.wincurtain += dt * 0.8
		}
		audio.think(dt)
	},
	draw: function () {
		background.draw()
		UFX.draw("[")
		view.transform()
		function draw(obj) {
			context.save()
			obj.draw()
			context.restore()
		}
		this.effects.forEach(draw)
		control.drawcursor()
		state.bridges.forEach(draw)
		state.toids.forEach(draw)
		
		UFX.draw("]")
		control.draw()
		
		if (this.wincurtain) {
			UFX.draw("[ alpha", this.wincurtain, "fs white f0 ]")
		}
	},
})


