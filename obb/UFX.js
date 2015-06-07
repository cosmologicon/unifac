// UFX.ticker: handle game loop

// Suggested that you use the UFX.scene module along with this one, in which case you never need
// to call any UFX.ticker methods. If you wish to use UFX.ticker manually:
// 1. Call UFX.ticker.init(think) or UFX.ticker.init(think, draw) to kick off the game loop.
// 2. think is a callback that optionally takes one argument, dt, time elapsed this update.
// 3. draw (optional) is a callback

// UFX.ticker by default aims for 30fps. This can be set to a variety of possibilities with options.
// You can check on the actual framerate achieved with UFX.ticker.getrates()

// For more options, see the documentation:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.ticker_:_game_loop_management

"use strict"
var UFX = UFX || {}

UFX.ticker = {
	// Default options
	defaultopts: {
		sync: "auto",  // Whether to use window.requestAnimationFrame
		cthis: null,   // The "this" object for the callbacks
		delay: 0,      // Minimum time between ticks (milliseconds)
		minupf: 1,     // If set, minimum number of updates per frame
		maxupf: 1,     // If set, maximum number of updates per frame
		ups: null,     // Number of updates per second (defaults to upf * fps)
		minups: null,  // If set, minimum number of updates per second
		maxups: null,  // If set, maximum number of updates per second
		fps: 30,       // Minimum frame (render, draw) rate
	},

	// Main entry point. Pass a think callback, (optionally) a draw callback,
 	//   and (optionally) a options initialization object		
	init: function (tcallback, dcallback, opts) {
		this.setcallbacks(tcallback, dcallback)
		this.setoptions(opts)
		this.resume()
	},
	setcallbacks: function (tcallback, dcallback) {
		this._tcallback = tcallback
		this._dcallback = dcallback
	},
	setoptions: function (opts, keepopts) {
		if (!keepopts) {
			for (var oname in this.defaultopts) {
				this[oname] = this.defaultopts[oname]
			}
		}
		if (!opts) return
		for (var oname in this.defaultopts) {
			if (oname in opts) {
				this[oname] = opts[oname]
			}
		}
		
		// TODO: put in some assert statements
		
		// if ups is not specified, minupf must equal maxupf
		
	},
	resume: function () {
		this.stop()
		this.resetcounters()
		this._running = true
		this._tick()
	},
	stop: function () {
		if (this._shandle) window.cancelAnimationFrame(this._shandle)
		if (this._thandle) clearTimeout(this._thandle)
		this._shandle = this._thandle = null
		this._running = false
	},
	// Reset the FPS counters etc.
	resetcounters: function () {
		this._accumulator = 0  // accumulated wall time for update
		this._dtu = 0  // average wall dt between updates (ms)
		this._dtg = 0  // average game dt between updates (ms)
		this._dtf = 0  // average wall dt between frames (ms)
		this._lastthink = Date.now()
		this._lastdraw = Date.now()
		this.wfactor = 1
	},
	// A handy-formatted string of the current info from this module
	getrates: function () {
		return [
			this.wfps.toPrecision(3) + "fps",
			this.wups.toPrecision(3) + "ups",
			this.wfactor.toPrecision(3) + "x",
		].join(" ")
	},

	// Where the magic happens.
	// Calls the thick callback 0 or more times, and the draw callback 0 or 1 time.
	_tick: function () {
		if (!this._running) return
		var now = Date.now()
		var dt0 = this._lasttick ? (now - this._lasttick) * 0.001 : 0
		this._lasttick = now
		this._accumulator += dt0
		
		var fps = this.fps
		var minupf = this.minupf
		var maxupf = this.maxupf
		var minups = this.minups || this.ups || fps
		var maxups = this.maxups || this.ups || minups
		
		var dodraw, nthink, dt, dtmin

		if (minupf == 0) {
			dodraw = true
		} else {
			dodraw = this._accumulator >= minupf / maxups
		}

		if (!dodraw) {
			nthink = 0
			dtmin = minupf / maxups
		} else if (minupf >= maxupf) {
			nthink = minupf
			// Need to redo this formula. It always maxes out semi-fixed timesteps
			dtmin = dt = Math.min(this._accumulator, minupf / minups)
//			console.log(dt, dt0)
		} else {
			// Choose the number of updates and length of each update so as to
			//   maximize the amount of accumulated time consumed, and then to
			//   minimize the number of updates, subject to the constraints
			var n = Math.floor(this._accumulator * minups)
			if ((n + 1) / maxups <= this._accumulator) n += 1
			nthink = Math.max(Math.min(n, maxupf), minupf)
			dt = Math.min(nthink / minups, this._accumulator)
			dtmin = Math.max(minupf, 1) / maxups
			console.log(minups, maxups, this._accumulator, n, nthink, dt, dt0, this._dtu, this._dtg)
		}

		// Invoke the think callback
		if (nthink) {
			this._accumulator -= dt
			now = Date.now()
			var afac = 0.05 * nthink
			this._dtu = (1 - afac) * this._dtu + afac * 0.001 * (now - this._lastthink)
			this._dtg = (1 - afac) * this._dtg + afac * dt
			this._lastthink = now
			dt /= nthink
			for (var jthink = 0 ; jthink < nthink ; ++jthink) {
				this._tcallback.call(this.cthis, dt, jthink, nthink)
			}
		}

		// Invoke the draw callback
		if (dodraw && this._dcallback) {
			var f = this._accumulator * minups
			this._dcallback.call(this.cthis, f)
			now = Date.now()
			this._dtf = 0.95 * this._dtf + 0.05 * 0.001 * (now - this._lastdraw)
			this._lastdraw = now
		}

		// Accumulators should never be allowed to stay over 1 update
		this._accumulator = Math.max(Math.min(this._accumulator, dtmin), 0)
		// TODO: reconsider the margin for accumulator amounts close to 0

		// Update frame rate counters
		this.wups = 1 / this._dtu
		this.wfps = this._dcallback ? 1 / this._dtf : this.wups
		this.wfactor = this._dtg / this._dtu

		// In case someone called UFX.ticker.stop during the loop
		if (!this._running) return

		// Queue up the next tick
		var tosync = this.sync == "auto" ? window.requestAnimationFrame : this.sync
		this._shandle = this._thandle = null
		var callback = (function (obj) { return function () { obj._tick() } })(this)
		if (tosync) {
		    this._shandle = window.requestAnimationFrame(callback)
		} else {
			// The next time at which a frame would actually execute
			var nexttick = this._lasttick + (dtmin - this._accumulator)
			var delay = Math.max(Date.now() - nexttick, this.delay)
			delay = 0
		    this._thandle = window.setTimeout(callback, delay)
		}
	},
}


// UFX.scene: keep track of the scene stack

// Basic usage:
// 1. include UFX.tikcer
// 2. call UFX.scene.init()
// 3. call UFX.scene.push(sceneobj) to push a scene object onto the stack
// 4. call UFX.scene.pop() to pop the top scene object off the stack

// Scene objects should at least have a think method, which gets invoked every update
// They can also optionally have a start method, invoked when they're pushed on the stack, and
//   a draw method, if you want to separate your model from your view.

// For more options, please see the documentation:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.scene_:_scene_management

"use strict"
var UFX = UFX || {}

UFX.SceneStack = function () {
	if (!(this instanceof UFX.SceneStack)) return new UFX.SceneStack()
	this._actionq = []
	this._stack = []
	this.resolveargs = true
	this.recorder = null
	this.frozen = false
}
UFX.SceneStack.prototype = {
	init: function (opts, keepopts) {
		opts = Object.create(opts || null)
		opts.cthis = this
		UFX.ticker.init(this.think, this.draw, opts, keepopts)
	},
	top: function () {
		var n = this._stack.length
		return n ? this._stack[n-1] : null
	},
	getscene: function (c) {
		if (typeof c === "string") {
			if (c.substr(0,4) == "new_") {
				c = c.substr(4)
				if (!(c in UFX.scenes)) throw "Unrecognized scene: " + c
				return new UFX.scenes[c]()
			} else if (c.substr(0,7) == "create_") {
				c = c.substr(7)
				if (!(c in UFX.scenes)) throw "Unrecognized scene: " + c
				return Object.create(UFX.scenes[c])
			}
			if (!(c in UFX.scenes)) throw "Unrecognized scene: " + c
			return UFX.scenes[c]
		}
		return c
	},
	ipush: function (cname) {
		if (this.frozen) return
		var old = this.top()
		if (old && old.suspend) old.suspend()
		var c = this.getscene(cname)
		this._stack.push(c)
		var args = Array.prototype.slice.call(arguments, 1)
		if (this.resolveargs && c.startargs) args = c.startargs.apply(c, args)
		if (this.recorder) this.recorder.addpush(cname, args)
		if (c.checkpoint && this.recorder) {
			this.recorder.checkpoint(c.getchaptername ? c.getchaptername.apply(c, args) : cname)
		}
		if (c.start) c.start.apply(c, args)
	},
	ipop: function (n) {
		if (this.frozen) return
		n = n || 1
		for (var j = 0 ; j < n ; ++j) {
			var c = this._stack.pop()
			if (c.stop) c.stop()
			var d = this.top()
			if (d && d.resume) d.resume()
			if (this.recorder) this.recorder.addpop()
		}
		return c
	},
	iswap: function (cname) {
		if (this.frozen) return
		var c0 = this._stack.pop()
		if (c0 && c0.stop) c0.stop()
		var c = this.getscene(cname)
		this._stack.push(c)
		var args = Array.prototype.slice.call(arguments, 1)
		if (this.resolveargs && c.startargs) args = c.startargs.apply(c, args)
		if (this.recorder) this.recorder.addswap(cname, args)
		if (c.checkpoint && this.recorder) {
			this.recorder.checkpoint(c.getchaptername ? c.getchaptername.apply(c, args) : cname)
		}
		if (c.start) c.start.apply(c, args)
		return c0
	},
	push: function () {
		this._actionq.push(["push", Array.prototype.slice.call(arguments, 0)])
	},
	pop: function () {
		this._actionq.push(["pop", Array.prototype.slice.call(arguments, 0)])
	},
	swap: function () {
		this._actionq.push(["swap", Array.prototype.slice.call(arguments, 0)])
	},
	_resolveq: function () {
		for (var j = 0 ; j < this._actionq.length ; ++j) {
			switch (this._actionq[j][0]) {
				case "push": this.ipush.apply(this, this._actionq[j][1]) ; break
				case "pop": this.ipop.apply(this, this._actionq[j][1]) ; break
				case "swap": this.iswap.apply(this, this._actionq[j][1]) ; break
			}
		}
		this._actionq = []
	},
	think: function () {
		this._resolveq()
		var c = this.top()
		this._lastthinker = c
		if (c) {
			var args = arguments
			if (this.resolveargs && c.thinkargs) args = c.thinkargs.apply(c, args)
			if (this.recorder) this.recorder.addthink(args)
			if (c.think) c.think.apply(c, args)
		}
	},
	draw: function () {
		var c = this._lastthinker
		if (c && c.draw) {
			c.draw.apply(c, arguments)
		}
	},
}
// The default for your basic scene stack needs
UFX.scene = new UFX.SceneStack()
UFX.scenes = {}

// UFX.draw module: some convenience functions for invoking context methods

// The basic UFX.draw() function takes a string inspired by the SVG path string specification,
//   but with some important differences

// For a complete listing of UFX.draw tokens, please see the UFX documentation here:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.draw_token_list

// Three ways to invoke the function here.
// UFX.draw(context, drawstring)
// UFX.draw.setcontext(context) ; UFX.draw(drawstring)
// UFX.draw.extend(context) ; context.draw(drawstring)

// The drawstring can also be a series of strings or values.
// UFX.draw(context, "( m 0 0 l", x, y, ") s")

"use strict"
var UFX = UFX || {}

UFX._draw = function () {
    var t = []  // Draw tokens
    function addt() {
        for (var argj = 0 ; argj < arguments.length ; ++argj) {
            var arg = arguments[argj]
            if (arg.split)
                t.push.apply(t, arg.split(" "))
            else if (arg instanceof Array)
                addt.apply(this, arg)
            else
                t.push(arg)
        }
    }
    addt.apply(this, arguments)
    var ctx = this
    function getcolor(s) {
        if (typeof s !== "string") return s
        switch (s.substr(0,3)) {
            case "lg~": return UFX._draw.lingrad.apply(ctx, s.substr(3).split("~"))
            case "rg~": return UFX._draw.radgrad.apply(ctx, s.substr(3).split("~"))
            default: return s
        }
    }
    for (var j = 0 ; j < t.length ; ++j) {
        switch (t[j].toLowerCase()) {
            case "b": case "(": case "beginpath":
                this.beginPath()
                break
            case ")": case "closepath":
                this.closePath()
                break
            case "m": case "moveto":
                this.moveTo(+t[++j], +t[++j])
                break
            case "l": case "lineto":
                this.lineTo(+t[++j], +t[++j])
                break
            case "q": case "quadraticcurveto":
                this.quadraticCurveTo(+t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "c": case "beziercurveto":
                this.bezierCurveTo(+t[++j], +t[++j], +t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "a": case "arc":
                this.arc(+t[++j], +t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "aa": case "antiarc":
                this.arc(+t[++j], +t[++j], +t[++j], +t[++j], +t[++j], true)
                break
            case "arcto":
                this.arcTo(+t[++j], +t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "o": case "circle":
                this.arc(+t[++j], +t[++j], +t[++j], 0, 2*Math.PI)
                break
            case "rr": case "roundedrect":
                var x = +t[++j], y = +t[++j], w = +t[++j], h = +t[++j], r = +t[++j]
                this.beginPath()
                this.moveTo(x+r, y)
                this.arcTo(x+w, y, x+w, y+h, r)
                this.arcTo(x+w, y+h, x, y+h, r)
                this.arcTo(x, y+h, x, y, r)
                this.arcTo(x, y, x+w, y, r)
                this.closePath()
                break
            case "t": case "translate":
                this.translate(+t[++j], +t[++j])
                break
            case "r": case "rotate":
                this.rotate(+t[++j])
                break
            case "z": case "scale":
                this.scale(+t[++j], +t[++j])
                break
            case "zx": case "xscale":
                this.scale(+t[++j], 1)
                break
            case "zy": case "yscale":
                this.scale(1, +t[++j])
                break
            case "hflip":
                this.scale(-1, 1)
                break
            case "vflip":
                this.scale(1, -1)
                break
            case "x": case "transform":
                this.transform(+t[++j], +t[++j], +t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "xshear":
                this.transform(1, 0, +t[++j], 1, 0, 0)
                break
            case "yshear":
                this.transform(1, +t[++j], 0, 1, 0, 0)
                break
            case "f": case "fill":
                this.fill()
                break
            case "s": case "stroke":
                this.stroke()
                break
            case "fr": case "fillrect":
                this.fillRect(+t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "sr": case "strokerect":
                this.strokeRect(+t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "fsr": case "fillstrokerect":
                var x = +t[++j], y = +t[++j], w = +t[++j], h = +t[++j]
                this.fillRect(x, y, w, h)
                this.strokeRect(x, y, w, h)
                break
            case "cr": case "clearrect":
                this.clearRect(+t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "f0": case "fillall":
            	this.fillRect(0, 0, this.canvas.width, this.canvas.height)
            	break
            case "c0": case "clearall":
            	this.clearRect(0, 0, this.canvas.width, this.canvas.height)
            	break
            case "tr": case "tracerect":
                var x = +t[++j], y = +t[++j], w = +t[++j], h = +t[++j]
                this.beginPath()
                this.moveTo(x, y)
                this.lineTo(x+w, y)
                this.lineTo(x+w, y+h)
                this.lineTo(x, y+h)
                this.closePath()
                break
            case "fs": case "fillstyle":
                this.fillStyle = getcolor(t[++j])
                break
            case "ss": case "strokestyle":
                this.strokeStyle = getcolor(t[++j])
                break
            case "shadowblur": case "shb":
                this.shadowBlur = +t[++j]
                break
            case "shadowcolor": case "shc":
                this.shadowColor = getcolor(t[++j])
                break
            case "shadowoffsetx": case "shadowx": case "shx":
                this.shadowOffsetX = +t[++j]
                break
            case "shadowoffsety": case "shadowy": case "shy":
                this.shadowOffsetY = +t[++j]
                break
            case "shadowoffsetxy": case "shadowxy": case "shxy":
                this.shadowOffsetX = +t[++j]
                this.shadowOffsetY = +t[++j]
                break
            case "shadow": case "sh":
                this.shadowColor = getcolor(t[++j])
                this.shadowOffsetX = +t[++j]
                this.shadowOffsetY = +t[++j]
                this.shadowBlur = +t[++j]
                break
            case "drawimage":
                this.drawImage(t[++j], +t[++j], +t[++j])
                break
            case "drawimage0":
                this.drawImage(t[++j], 0, 0)
                break
            case "clip":
                this.clip()
                break
            case "al": case "alpha": case "globalalpha":
                this.globalAlpha = +t[++j]
                break
            case "lw": case "linewidth":
                this.lineWidth = +t[++j]
                break
            case "lc": case "linecap":
                this.lineCap = t[++j]
                break
            case "textalign":
                this.textAlign = t[++j]
                break
            case "textbaseline":
                this.textBaseline = t[++j]
                break
            case "[": case "save":
                this.save()
                break
            case "]": case "restore":
                this.restore()
                break
            case "font":
                this.font = t[++j].replace(/~/g, " ")
                break
            case "filltext": case "ft":
                this.fillText(t[++j].replace(/~/g, " "), +t[++j], +t[++j])
                break
            case "filltext0": case "ft0":
                this.fillText(t[++j].replace(/~/g, " "), 0, 0)
                break
            case "stroketext": case "st":
                this.strokeText(t[++j].replace(/~/g, " "), +t[++j], +t[++j])
                break
            case "stroketext0": case "st0":
                this.strokeText(t[++j].replace(/~/g, " "), 0, 0)
                break
            case "fillstroketext": case "fst":
                var s = t[++j].replace(/~/g, " "), x = +t[++j], y = +t[++j]
                this.fillText(s, x, y)
                this.strokeText(s, x, y)
                break
            case "fillstroketext0": case "fst0":
                var s = t[++j].replace(/~/g, " ")
                this.fillText(s, 0, 0)
                this.strokeText(s, 0, 0)
                break
            default:
                throw "Unrecognized draw token " + t[j]
        
        }
    }
}
UFX._draw.circle = function (x, y, r, fs, ss, lw) {
    this.save()
    this.beginPath()
    this.arc(x, y, r, 0, 2*Math.PI)
    if (fs) {
        this.fillStyle = fs
        this.fill()
    }
    if (ss || lw) {
        if (ss) this.strokeStyle = ss
        if (lw) this.lineWidth = lw
        this.stroke()
    }
    this.restore()
}
UFX._draw.lingrad = function (x0, y0, x1, y1) {
    var grad = this.createLinearGradient(+x0, +y0, +x1, +y1)
    for (var j = 4 ; j < arguments.length ; j += 2) {
        grad.addColorStop(+arguments[j], arguments[j+1])
    }
    return grad
}
UFX._draw.radgrad = function (x0, y0, r0, x1, y1, r1) {
    var grad = this.createRadialGradient(+x0, +y0, +r0, +x1, +y1, +r1)
    for (var j = 6 ; j < arguments.length ; j += 2) {
        grad.addColorStop(+arguments[j], arguments[j+1])
    }
    return grad
}


UFX.draw = function (context) {
    if (context.beginPath) {
        return UFX._draw.apply(context, Array.prototype.slice.call(arguments, 1))
    } else if (UFX.draw._context) {
        return UFX._draw.apply(UFX.draw._context, arguments)
    } else {
        throw "UFX.draw must be called with context as first argument"
    }
}
for (var mname in UFX._draw) {
    UFX.draw[mname] = (function (method, mname) {
        return function (context) {
            if (context.beginPath) {
                return method.apply(context, Array.prototype.slice.call(arguments, 1))
            } else {
                if (!UFX.draw._context) UFX.draw._context = document.createElement("canvas").getContext("2d")
                return method.apply(UFX.draw._context, arguments)
            }
        }
    })(UFX._draw[mname], mname)
}
UFX.draw.setcontext = function (context) {
    UFX.draw._context = context
}

// Wow this is really inelegant. Is there any better way to do this? I should ask on SO sometime.
UFX.draw.extend = function(context) {
    context.draw = function () { UFX._draw.apply(context, arguments) }
    for (var mname in UFX._draw) {
        context.draw[mname] = (function (method) {
            return function () { return method.apply(context, arguments) }
        })(UFX._draw[mname])
    }
}





// UFX.maximize: expand a canvas to take up the whole window or screen

// May require polyfill for fullscreening
// UFX.maximize.full(canvas): fullscreen
// UFX.maximize.fill(canvas): fill window
// UFX.maximize.maximize(canvas): fullscreen if possible, fill window otherwise

// When resizing or maximizing, the callback UFX.maximize.onadjust will be invoked with arguments
// (canvas, width, height).

// UFX.maximize.resizemode can be set to "none", "fixed", "aspect", or "total", depending on how
// you want the canvas resized upon maximization.

// For more details and options, see the UFX.maximize documentation here:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.maximize_:_resize_canvas_to_fit_screen/window

"use strict"
var UFX = UFX || {}

UFX.maximize = {
	resizemode: "fixed",
	preventscroll: true,
	fillcolor: "black",
	onadjust: null,
	init: function (element) {
		this.element = element
		this.mode = null
		function c(obj, method) { return function () { obj[method]() } }
		this.calladjust = c(this, "adjust")
		this.getsettings()
	},
	setmode: function (mode) {
		if (this.mode == mode) return
		if (this.mode == "fill") window.removeEventListener("resize", this.calladjust)
		if (this.mode == "full") {
			document.cancelFullscreen()
			window.removeEventListener("resize", this.calladjust)
		}
			
		this.mode = mode
		if (this.mode == "fill") window.addEventListener("resize", this.calladjust)
		if (this.mode == "full") {
			this.element.requestFullscreen()
			window.addEventListener("resize", this.calladjust)
		}
	},
	adjust: function () {
		var wx = window.innerWidth, wy = window.innerHeight
		var ex = this.element.width, ey = this.element.height
		var dx, dy, gx, gy

		if (this.resizemode == "none") {
			
		} else if (this.resizemode == "fixed") {
			if (ex * wy > ey * wx) {
				dx = wx
				dy = Math.round(wx * ey / ex)
			} else {
				dx = Math.round(wy * ex / ey)
				dy = wy
			}
		} else if (this.resizemode == "aspect") {
			if (ex * wy > ey * wx) {
				gx = dx = wx
				gy = dy = Math.round(wx * ey / ex)
			} else {
				gx = dx = Math.round(wy * ex / ey)
				gy = dy = wy
			}
		} else if (this.resizemode == "total") {
			gx = dx = wx
			gy = dy = wy
		}
		
		var es = this.element.style
		if (dx) {
			es.width = dx + "px"
			es.height = dy + "px"
		}
		if (gx) {
			this.element.width = gx
			this.element.height = gy
		}
		if (this.mode == "fill") {
			var bx = wx - (dx || gx || this.element.width)
			var by = wy - (dy || gy || this.element.height)
			es.borderLeft = es.borderRight = bx > 0 ? (0.5 * bx + 1) + "px " + this.fillcolor + " solid" : "none"
			es.borderTop = es.borderBottom = by > 0 ? (0.5 * by + 1) + "px " + this.fillcolor + " solid" : "none"
			setTimeout(function () { window.scrollTo(0, 1) }, 1)
		} else if (this.mode == "full") {
			es.borderLeft = es.borderRight = "none"
			es.borderTop = es.borderBottom = "none"
		}
		if (this.onadjust) {
			this.onadjust(this.element, this.element.width, this.element.height)
		}
	},
	fill: function (element, resizemode) {
		if (resizemode) this.resizemode = resizemode
		if (element) this.init(element)
		this.setmode("fill")
		if (this.preventscroll) {
			document.body.addEventListener('touchstart', this.preventdefault)
			this.scrollprevented = true
		}
		this.adjust()
		var es = this.element.style
		es.position = "absolute"
		es.left = "0px"
		es.top = "1px"
		document.body.style.overflow = "hidden"
	},
	full: function (element, resizemode) {
		if (resizemode) this.resizemode = resizemode
		if (element) this.init(element)
		this.setmode("full")
		var fs = this
		setTimeout(function () {
			if (fs.getfullscreenelement() === fs.element) {
				fs.adjust()
			} else {
				fs.restore()
			}
		}, 100)
	},
	maximize: function (element, resizemode) {
		if (resizemode) this.resizemode = resizemode
		if (element) this.init(element)
		if (!this.element.requestFullscreen) {
			this.fill()
			return
		}
		this.setmode("full")
		var fs = this
		setTimeout(function () {
			if (fs.getfullscreenelement() === fs.element) {
			} else {
				fs.fill()
			}
		}, 100)
	},
	getfullscreenelement: function () {
		return document.getFullscreenElement
	},
	restore: function () {
		this.setmode()
		if (this.scrollprevented) {
			document.body.removeEventListener('touchstart', this.preventdefault)
			this.scrollprevented = false
		}
		this.restoresettings()
		if (this.onadjust) {
			this.onadjust(this.element, this.element.width, this.element.height)
		}
	},
	getsettings: function () {
		var es = this.element.style, ds = this.settings = {
			width: this.element.width,
			height: this.element.height,
			overflow: document.body.style.overflow,
			style: {},
		}
		var vars = "width height position left top borderLeft borderRight borderTop borderBottom border".split(" ")
		vars.forEach(function (v) {
			ds.style[v] = es[v]
		})
	},
	restoresettings: function () {
		var es = this.element.style, ds = this.settings
		width: this.element.width = this.settings.width
		height: this.element.height = this.settings.height
		overflow: document.body.style.overflow = this.settings.overflow
		var vars = "width height position left top borderLeft borderRight borderTop borderBottom border".split(" ")
		vars.forEach(function (v) {
			es[v] = ds.style[v]
		})
	},
	fillnoresize: function () {
		es.position = "absolute"
		es.left = "0px"
		es.top = "1px"
		this.setbordersizes(wx - px, wy - py)
		document.body.style.overflow = "hidden"
	},
	preventdefault: function (event) {
		event.preventDefault()
	},
}

// UFX.key module: enqueue keyboard events

// Generally for games you want to know:
//   - when a key is pressed
//   - when a key is released
//   - how long the key was held down for
//   - what keys are currently being pressed
// And you want to prevent key events (eg arrow keys) from being interpreted by the browser

// For games with frame-based updates, I don't generally like callback-based key handling, so this
//   module will enqueue all the key events so they can be handled at the appropriate place in the
//   main game loop.

// The simplest way to use this module is to start it with:
//   UFX.key.init()
// which will capture all key events. Then each frame, call:
//   var kstate = UFX.key.state()

// For options and details, please see the documentation here:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.key_:_handle_keyboard_input

"use strict"
var UFX = UFX || {}
UFX.key = {}

// PUBLIC API

// Feel free to set these manually
UFX.key.active = true   // set to false to (temporarily) disable all handling of keyboard events
UFX.key.capture = true  // should we prevent key events from bubbling?
UFX.key.qdown = true    // should we remember and enqueue key down events?
UFX.key.qup = true      // should we remember and enqueue key up events?
// Combos (multiple keys pressed at once, registering as unified events)
UFX.key.qcombo = false  // should we remember and enqueue combos?
UFX.key.combodt = 100   // Time between keydown/up events to be considered in the same combo (ms)
// Set the watchlist to the keys you want to capture - everything else will be let through
// Set it to null to catch everything
UFX.key.watchlist = null

// Currently pressed keys (values are truthy Objects if key is pressed, undefined if not)
UFX.key.ispressed = {}   // by name, eg UFX.key.ispressed.space
UFX.key.codepressed = {} // by key code, eg UFX.key.codepressed[32]

// Functions for reading/resetting the event queue
UFX.key.events = function () {
    var r = UFX.key._downevents.concat(UFX.key._upevents)
    UFX.key.clearevents()
    return r
}
UFX.key.combos = function () {
    UFX.key._checkcombo()
    var r = UFX.key._combos
    UFX.key.clearcombos()
    return r
}

UFX.key.clearevents = function () {
    UFX.key._downevents = []
    UFX.key._upevents = []
}
UFX.key.clearcombos = function (clearpending) {
    UFX.key._combos = []
    if (clearpending) UFX.key._currentcombo = null
}

// Return a lightweight summary of the current keys being pressed and the
//   pending events on the event queue. Also clears the event queue.
UFX.key.state = function () {
    var state = { pressed: {}, }
    for (var key in UFX.key.ispressed) {
        if (UFX.key.ispressed[key])
            state.pressed[key] = 1
    }
    if (UFX.key.qdown) state.down = {}
    if (UFX.key.qup) state.up = {}
    UFX.key.events().forEach(function (event) {
        state[event.type][event.name] = 1
    })
    if (UFX.key.qcombo) {
        state.combo = {}
        UFX.key.combos().forEach(function (combo) {
            state.combo[combo.kstring] = 1
        })
    }
    return state
}


// Call this to start capturing key presses
// key presses will be captured when the element in question has focus (defaults to document)
UFX.key.init = function(element) {
    UFX.key._captureevents(element)
}

// TODO: add alternate key names
UFX.key.map = {
    8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 20: "caps",
    27: "esc", 32: "space", 33: "pgup", 34: "pgdn", 35: "end", 36: "home",
    37: "left", 38: "up", 39: "right", 40: "down", 45: "ins", 46: "del",
    48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9",
    59: "semicolon", 61: "equals",
    65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H", 73: "I", 74: "J",
    75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P", 81: "Q", 82: "R", 83: "S", 84: "T",
    85: "U", 86: "V", 87: "W", 88: "X", 89: "Y", 90: "Z",
    96: "np0", 97: "np1", 98: "np2", 99: "np3", 100: "np4",
    101: "np5", 102: "np6", 103: "np7", 104: "np8", 105: "np9",
    106: "star", 107: "plus", 109: "hyphen", 110: "period", 111: "slash",
    112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6",
    118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12",
    144: "num", 188: "comma", 190: "period", 
    191: "slash", 192: "backtick",
    219: "openbracket", 220: "backslash", 221: "closebracket", 222: "apostrophe",
}

// TODO: properly handle overlapping events for different keys mapped to the same name
UFX.key.remap = function () {
    for (var j = 0 ; j < arguments.length ; ++j) {
        var kmap = arguments[j]
        for (var k in kmap) {
            var v = kmap[k]
            for (var code in UFX.key.map) {
                if (UFX.key.map[code] === k) {
                    UFX.key.map[code] = v
                }
            }
        }
    }
}

UFX.key.remaparrows = function (dvorakToo) {
    UFX.key.remap({ A: "left", S: "down", D: "right", W: "up", })
    if (dvorakToo) {
        UFX.key.remap({ O: "down", comma: "up", ",": "up", E: "right", })
    }
}

UFX.key.remappunct = function () {
    UFX.key.remap({ semicolon: ";", equals: "=", star: "*", plus: "+", hyphen: "-", period: ".",
        slash: "/", comma: ",", backtick: "`", openbracket: "[", backslash: "\\",
        closebracket: "]", apostrophe: "'",
    })
}




// PRIVATE MEMBERS AND METHODS

// Pending key events to be read
UFX.key._downevents = []
UFX.key._upevents = []
UFX.key._combos = []
UFX.key._currentcombo = null

UFX.key._captureevents = function (element) {
    element = element || document
    if (typeof element == "String") element = document.getElementById(element)
    // TODO: this seems like a bit of a hack but I can't really figure this blur thing out....
    element.addEventListener("blur", UFX.key._onblur, true)
    window.onblur = UFX.key._onblur
    element.onkeypress = UFX.key._onkeypress
    element.onkeyup = UFX.key._onkeyup
    element.onkeydown = UFX.key._onkeydown
    UFX.key._element = element
}

UFX.key._onblur = function (event) {
    for (var code in UFX.key.codepressed) {
        UFX.key._storeup(event, code)
    }
    return true
}
UFX.key._watching = function (event) {
    if (!UFX.key.watchlist) return true
    return UFX.key.watchlist.indexOf(UFX.key.map[event.which]) > -1
}
UFX.key._onkeypress = function (event) {
	console.log("onkeypress")
    if (!UFX.key.active || !UFX.key._watching(event)) return true
    return !UFX.key.capture
}
UFX.key._onkeydown = function (event) {
    if (!UFX.key.active || !UFX.key._watching(event)) return true
    var code = event.which
    if (UFX.key.codepressed[code]) {
        return !UFX.key.capture
    }
    UFX.key._storedown(event, code)
    return !UFX.key.capture
}
UFX.key._onkeyup = function (event) {
    if (!UFX.key.active || !UFX.key._watching(event)) return true
    UFX.key._storeup(event, event.which)
    return !UFX.key.capture
}
UFX.key._storedown = function (event, code) {
    code = code || event.which
    var now = (new Date()).getTime()
    var kname = UFX.key.map[code] || "key#" + code
    var kevent = {
        baseevent: event,
        type: "down",
        code: code,
        name: kname,
        time: now,
    }
    // Remember that this key is currently pressed
    UFX.key.codepressed[code] = kevent
    if (kevent.name) {
        UFX.key.ispressed[kevent.name] = kevent
    }
    // Store the key down event on the event queue
    if (UFX.key.qdown) {
        UFX.key._downevents.push(kevent)
    }
    // Store it on the current combo
    if (UFX.key.qcombo) {
        UFX.key._checkcombo()
        if (UFX.key._currentcombo) {
            UFX.key._currentcombo.keys.push(kname)
        } else {
            UFX.key._currentcombo = {
                start: now,
                keys: [kname],
            }
        }
    }
}
UFX.key._storeup = function (event, code) {
    var time = (new Date()).getTime()
    var dt = UFX.key.codepressed[code] ? time - UFX.key.codepressed[code].time : 0
    var kevent = {
        type: "up",
        baseevent: event,
        code: code,
        name: UFX.key.map[code] || "key#" + code,
        time: time,
        dt: dt,
    }
    delete UFX.key.codepressed[code]
    if (kevent.name) {
        delete UFX.key.ispressed[kevent.name]
    }
    if (UFX.key.qup) {
        UFX.key._upevents.push(kevent)
    }
}
// Check to see if the current combo has timed out and if so add it to the combo list.
UFX.key._checkcombo = function () {
    if (!UFX.key._currentcombo) return
    var now = (new Date()).getTime()
    if (UFX.key._currentcombo.start + UFX.key.combodt < now) {  // combo has timed out
        var keys = UFX.key._currentcombo.keys
        keys.sort()
        UFX.key._combos.push({
            keys: keys,
            kstring: keys.join(" "),
            time: UFX.key._currentcombo.start,
        })
        UFX.key._currentcombo = null
    }
}


// UFX.mouse module: enqueue mouse events

// This is an alternative system to handling mouse events in event handlers.

// The simplest way to use it is to begin by calling:
//   UFX.mouse.init(canvas)
// and then each frame call:
//   var mstate = UFX.mouse.state()

// By default, only the left mouse button is captured.

// Does not yet handle horizontal scrolling

// For more details and options, please see the documentation at:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.mouse_:_handle_mouse_events

"use strict"
var UFX = UFX || {}
UFX.mouse = {}

UFX.mouse.active = true
UFX.mouse.qdown = true
UFX.mouse.qup = true
UFX.mouse.qclick = false
UFX.mouse.qblur = false
UFX.mouse.qwheel = false
// Should we watch for left, middle, right, and wheel events?
UFX.mouse.capture = { left: true, middle: false, right: false, wheel: false }

// While the mouse is down, this is updated with info on the current drag event
UFX.mouse.watchdrag = true
UFX.mouse.drag = {}

UFX.mouse.events = function () {
    var r = UFX.mouse._events
    UFX.mouse._clearevents()
    return r
}

UFX.mouse.state = function () {
    var r = {}
    r.pos = UFX.mouse.pos
    if (r.pos && UFX.mouse._opos) {
        r.dpos = [r.pos[0] - UFX.mouse._opos[0], r.pos[1] - UFX.mouse._opos[1]]
    } else {
        r.dpos = [0, 0]
    }
    UFX.mouse._opos = r.pos
    if (UFX.mouse.capture.left) r.left = {}
    if (UFX.mouse.capture.middle) r.middle = {}
    if (UFX.mouse.capture.right) r.right = {}
    for (var b in UFX.mouse.buttonsdown) {
        if (UFX.mouse.buttonsdown[b] && r[b]) r[b].isdown = true
    }
    UFX.mouse._events.forEach(function (event) {
        r[UFX.mouse._buttonmap[event.button]][event.type] = event.pos
    })
    UFX.mouse._clearevents()
    if (UFX.mouse.capture.wheel) r.wheeldy = UFX.mouse.getwheeldy()
    if (UFX.mouse.watchdrag) {
    	for (var bname in UFX.mouse.drag) {
    	    if (!r[bname] || !r[bname].isdown) continue
    	    var drag = UFX.mouse.drag[bname]
        	r[bname].dx = r.pos[0] - drag.pos0[0]
        	r[bname].dy = r.pos[1] - drag.pos0[1]
        	r[bname].dt = Date.now() - drag.t0
//            drag.opos = drag.pos
        }
    }
    return r
}

UFX.mouse._clearevents = function () {
    UFX.mouse._events = []
}

UFX.mouse.getwheeldy = function () {
    var dy = UFX.mouse.wheeldy
    UFX.mouse.wheeldy = 0
    return dy
}

// This is updated every mouse event with the last known mouse position (as a length-2 array)
UFX.mouse.pos = null
UFX.mouse._opos = null
// This is updated every event with the latest known info on which mouse buttons are currently down
UFX.mouse.buttonsdown = {}
//UFX.mouse.wheeldx = 0
UFX.mouse.wheeldy = 0

UFX.mouse.init = function (element, backdrop) {
    UFX.mouse._captureevents(element, backdrop)
}


UFX.mouse._events = []

UFX.mouse._captureevents = function (element, backdrop) {
    element = element || document
    backdrop = backdrop || document
    if (typeof element == "string") element = document.getElementById(element)
    if (typeof backdrop == "string") backdrop = document.getElementById(backdrop)

    backdrop.addEventListener("blur", UFX.mouse._onblur, true)
    // TODO: add these instead of replacing the event handlers
    element.onmouseout = UFX.mouse._onmouseout
    element.onmousedown = UFX.mouse._onmousedown
    backdrop.onmouseup = UFX.mouse._onmouseup
    element.onclick = UFX.mouse._onclick
    element.oncontextmenu = UFX.mouse._oncontextmenu
    element.onmousewheel = UFX.mouse._onmousewheel  // non-Firefox
    element.addEventListener("DOMMouseScroll", UFX.mouse._onmousewheel)  // Firefox
    
    backdrop.onmousemove = UFX.mouse._onmousemove

    UFX.mouse._element = element
    UFX.mouse._backdrop = backdrop
    
}

// http://stackoverflow.com/questions/6773481/how-to-get-the-mouseevent-coordinates-for-an-element-that-has-css3-transform
UFX.mouse._elemoffset = function (elem) {
    var rect = elem.getBoundingClientRect()
    var x = rect.left + elem.clientLeft - elem.scrollLeft
    var y = rect.top + elem.clientTop - elem.scrollTop
    return [x, y]
}
UFX.mouse._geteventpos = function (event, elem) {
    elem = elem || event.target
    var off = UFX.mouse._elemoffset(elem)
    if (elem.style.width || elem.style.height) {
        var s = elem.style
        var xf = s.width ? elem.width / parseFloat(s.width) : elem.height / parseFloat(s.height)
        var yf = s.height ? elem.height / parseFloat(s.height) : elem.width / parseFloat(s.width)
        return [xf * (event.clientX - off[0]), yf * (event.clientY - off[1])]
    }
    return [event.clientX - off[0], event.clientY - off[1]]
}

// TODO: make sure the drag event is destroyed when this happens
UFX.mouse._onblur = function (event) {
    if (!UFX.mouse.active) return true
    
    return true
}
UFX.mouse._onmouseout = function (event) {
}
UFX.mouse._oncontextmenu = function (event) {
    if (!UFX.mouse.active || !UFX.mouse.capture.right) return true
    event.preventDefault()
    return false
}
UFX.mouse._buttonmap = ["left", "middle", "right"]
UFX.mouse._onclick = function (event) {
    if (!UFX.mouse.active || !UFX.mouse.capture[UFX.mouse._buttonmap[event.button]]) return true
    if (UFX.mouse.qclick) {
        var mevent = {
            type: "click",
            pos: UFX.mouse._geteventpos(event, UFX.mouse._element),
            button: event.button,
            time: Date.now(),
            baseevent: event,
        }
        UFX.mouse._events.push(mevent)
    }
    event.preventDefault()
    return false
}
UFX.mouse._onmousedown = function (event) {
    if (!UFX.mouse.active) return true
    var bname = UFX.mouse._buttonmap[event.button]
    UFX.mouse.buttonsdown[bname] = true
    if (!UFX.mouse.capture[bname]) return true
    var pos = UFX.mouse._geteventpos(event)
    if (UFX.mouse.watchdrag) {
        UFX.mouse.drag[bname] = {
            downevent: event,
            pos0: pos,
//            opos: pos,
            pos: pos,
            dx: 0,
            dy: 0,
            t0: Date.now(),
            dt: 0,
        }
    }
    if (UFX.mouse.qdown) {
        var mevent = {
            type: "down",
            pos: UFX.mouse._geteventpos(event, UFX.mouse._element),
            button: event.button,
            time: Date.now(),
            baseevent: event,
        }
        UFX.mouse._events.push(mevent)
    }
    event.preventDefault()
    return false
}
UFX.mouse._onmouseup = function (event) {
    if (!UFX.mouse.active) return true
    var bname = UFX.mouse._buttonmap[event.button]
    UFX.mouse.buttonsdown[bname] = false
    if (!UFX.mouse.capture[bname]) return true
//    if (!UFX.mouse.drag[bname]) return true
    if (UFX.mouse.qup) {
        var mevent = {
            type: "up",
            pos: UFX.mouse._geteventpos(event, UFX.mouse._element),
            button: event.button,
            time: Date.now(),
            baseevent: event,
        }
        if (UFX.mouse.drag[bname]) {
            mevent.t0 = UFX.mouse.drag[bname].t0
            mevent.dt = Date.now() - mevent.t0
            mevent.pos0 = UFX.mouse.drag[bname].pos0
            mevent.dx = mevent.pos[0] - mevent.pos0[0]
            mevent.dy = mevent.pos[1] - mevent.pos0[1]
        }
        UFX.mouse._events.push(mevent)
    }
    delete UFX.mouse.drag[bname]
    event.preventDefault()
    return false
}


UFX.mouse._onmousemove = function (event) {
    if (!UFX.mouse.active) return true
    var pos = UFX.mouse._geteventpos(event, UFX.mouse._element)
    UFX.mouse.pos = pos
    for (var bname in UFX.mouse.drag) {
        var d = UFX.mouse.drag[bname]
        d.pos = pos
        d.dx = pos[0] - d.pos0[0]
        d.dy = pos[1] - d.pos0[1]
        d.dt = Date.now() - d.t0
    }
    return false
}

UFX.mouse._onmousewheel = function (event) {
    if (!UFX.mouse.active || !UFX.mouse.capture.wheel) return true
    var dy = "wheelDelta" in event ? event.wheelDelta / 40. : -event.detail
    UFX.mouse.wheeldy += dy
    if (UFX.mouse.qwheel) {
        var mevent = {
            type: "wheel",
            pos: UFX.mouse._geteventpos(event, UFX.mouse._element),
            dy: dy,
//            dx: event.wheelDeltaX,
            time: Date.now(),
            baseevent: event,
        }
        UFX.mouse._events.push(mevent)
    }
    event.preventDefault()
    return false
}


// UFX.touch: touch and multitouch event handling

// Still working out the API on this one. I don't really have a handle on touch events yet.
// Use with caution.

// Basically, though, I'm trying to make it mostly similar to UFX.mouse.

// Basic usage:
// 1. Call UFX.touch.init(canvas)
// 2. Each frame call: var tstate = UFX.touch.state()

// TODO: add documentation to unifac wiki

"use strict"
var UFX = UFX || {}

UFX.touch = {
	// Some options
	capture: {
		start: true,
		end: true,
		tap: true,
		hold: true,
		swipe: true,
		release: true,
	},
	active: true,
	multi: true,
	touchmax: 0,
	tmulti: 100,
	usetouchid: true,
	ps: [],
	qtap: true,
	qdrag: true,
	thold: 300,
	roundpos: true,
	dmove: 50,
	_events: [],
	_mtouch: 0,  // max touches during current event
	_touches: {},  // info on all current touches
	_tkeys: [],   // valid keys for the _touches object
	_ntouches: 0,  // number of touches seen, used to give each a unique identifier
	init: function (element, backdrop) {
		this._captureevents(element, backdrop)
	},
	events: function () {
		this._checkhold()
		var e = this._events
		this._events = []
		return e
	},
	state: function () {
		var state = {
			ps: {},
			deltas: {},
		}
		var capture = this.capture, utid = this.usetouchid
		for (var type in capture) state[type] = []
		this.events().forEach(function (event) {
			if (!capture[event.type]) return
			var id = utid ? event.touchid : event.id, obj
			if (event.type == "tap") {
				obj = { dt: event.dt }
			} else if (event.type == "release") {
				obj = { dt: event.dt, v: event.v, multi: event.multi, }
			} else {
				obj = {}
			}
			obj.id = id
			obj.pos = event.pos
			obj.t = event.t
			state[event.type].push(obj)
		})
		state.ids = []
		for (var id in this._touches) {
			var touch = this._touches[id], tid = utid ? touch.touchid : id
			if (!touch.followed) continue
			state.ids.push(tid)
			var pos = touch.pos, opos = touch.opos
			state.ps[tid] = pos
			state.deltas[tid] = [pos[0] - opos[0], pos[1] - opos[1]]
			touch.ot = touch.t
			touch.opos = pos
		}
		state.ids.sort()
		return state
	},
	// static method. Pass it a state and get an object and get info about two-touch motions
	twotouchstate: function (state) {
		if (state.ids.length != 2) return null
		// convention: lowercase is first finger, uppercase is second finger
		var id = state.ids[0], ID = state.ids[1]
		var x1 = state.ps[id][0], y1 = state.ps[id][1]
		var X1 = state.ps[ID][0], Y1 = state.ps[ID][1]
		var dx1 = X1-x1, dy1 = Y1-y1
		var r1 = Math.sqrt(dx1*dx1+dy1*dy1)
		var theta1 = r1 ? Math.atan2(dy1,dx1) : 0
		var x0 = x1-state.deltas[id][0], y0 = y1-state.deltas[id][1]
		var X0 = X1-state.deltas[ID][0], Y0 = Y1-state.deltas[ID][1]
		var dx0 = X0-x0, dy0 = Y0-y0
		var r0 = Math.sqrt(dx0*dx0+dy0*dy0)
		var theta0 = r0 ? Math.atan2(dy0,dx0) : 0
		return {
			center: [(x1+X1)/2, (y1+Y1)/2],
			dcenter: [(x1+X1-x0-X0)/2, (y1+Y1-y0-Y1)/2],
			r: r1,
			dr: r1-r0,
			rratio: r0 ? r1/r0 : 1,
			theta: theta1,
			dtheta: theta1-theta0,
		}
	},
	_captureevents: function (element, backdrop) {
		element = element || document
		backdrop = backdrop || document
		if (typeof element == "string") element = document.getElementById(element)
		if (typeof backdrop == "string") backdrop = document.getElementById(backdrop)
		//backdrop.addEventListener("blur", UFX.mouse._onblur, true)
		// TODO: add these instead of replacing the event handlers
		function c(obj, mname) { return function (event) { obj[mname](event) } }
		element.ontouchstart = c(this, "_ontouchstart")
		element.ontouchmove = c(this, "_ontouchmove")
		element.ontouchend = c(this, "_ontouchend")
//		backdrop.ontouchmove = element.ontouchmove

		this._element = element
		this._backdrop = backdrop
	},
	_addevent: function (type, id, touchid, obj) {
		if (this.capture[type] && this._touches[id].followed) {
			obj.type = type
			obj.id = id
			obj.touchid = touchid
			this._events.push(obj)
		}
	},
	_handlestart: function (touch) {
		if (!this.active) return
		var id = touch.identifier, touchid = this._ntouches++
		var pos = this._eventpos(touch), t = Date.now()
		this._touches[id] = {
			id: id,   // ID as assigned by the DOM
			touchid: touchid,  // ID as assigned by UFX.touch (will be unique)
			t0: t,  // time of touchstart
			pos0: pos,  // position of touchstart
			tlast: t,  // time of last reconciliation
			poslast: pos,  // position of last reconciliation
			ot: t,  // time of last observation (via UFX.touch.state)
			opos: pos,  // position of last observation
			t: t,  // time of last update
			pos: pos,  // position of last update
			moved: false,  // has the touch moved at all?
			followed: true,  // are we registering events for this touch?
			held: false,  // has this touch registered a hold event?
			multi: 1,  // other touches co-generating multitouch events with this one
			multit0: t,
			vx: 0,
			vy: 0,
		}
		this._settkeys()
		if (this.touchmax && this._tkeys.length > this.touchmax) {
			this._touches[id].followed = false
		}
		this._addevent("start", id, touchid, {
			pos: pos,
			t: t,
		})
		if (this.multi) {
			//this._syncmulti(id)
		}
	},
	// Associate this touch with any other touches that were made at the same time.
/*	_syncmulti: function (id) {
		var t = this._touches[id].t0
		var tmstart = t - this.tmulti, mtouches = [], multit0 = t
		for (var k in this._touches) {
			if (k == id || this._touches[k].multit0 + this.tmstart < t) continue
			mtouches.push(this._touches[k])
		}
		if (mtouches.length == 0) return
		for (var j = 0 ; j < mtouches.length ; ++j) {
			var mmulti = this._touches[mtouches[j]].multi
			if (!mmulit
			
		}
	}, */
	_handlemove: function (touch) {
		if (!this.active) return
		var id = touch.identifier
		if (!this._touches[id]) this._handlestart(touch)
		var tobj = this._touches[id]
		var pos = this._eventpos(touch), t = Date.now()
		var dt = t - tobj.t, dx = pos[0] - tobj.pos[0], dy = pos[1] - tobj.pos[1]
		var dx0 = pos[0] - tobj.pos0[0], dy0 = pos[1] - tobj.pos0[1]
		tobj.t = t
		tobj.pos = pos
		if (!tobj.moved && Math.abs(dx0) + Math.abs(dy0) > this.dmove) {
			tobj.moved = true
		}
		if (dt) {
			tobj.vx = 1000 * dx / dt + 7
			tobj.vy = 1000 * dy / dt
		}
		this._checkhold()
	},
	_handleend: function (touch) {
		if (!this.active) return
		var id = touch.identifier
		if (!this._touches[id]) return
//		this._handlemove(touch)
		var tobj = this._touches[id]
		var pos = this._eventpos(touch)
		var t = Date.now(), dt = t - tobj.t0
		this._addevent("end", tobj.id, tobj.touchid, {
			t: t,
			dt: dt,
			pos: pos,
		})
		if (!tobj.moved && !tobj.held) {
			this._addevent("tap", tobj.id, tobj.touchid, {
				t: t,
				dt: dt,
				pos: pos,
			})
		} else {
			this._addevent("release", tobj.id, tobj.touchid, {
				t: t,
				dt: dt,
				pos0: tobj.pos0,
				pos: pos,
				v: [tobj.vx, tobj.vy],
				multi: tobj.multi,
			})
		}
		delete this._touches[id]
	},
	_settkeys: function () {
		this._tkeys = []
		for (var k in this._touches) this._tkeys.push(k)
		this._tkeys.sort()
		var n = this._tkeys.length
		for (var k in this._touches) {
			this._touches[k].multi = Math.max(this._touches[k].multi, n)
		}
	},
	_checkhold: function () {
		var t = Date.now()
		for (var k in this._touches) {
			var touch = this._touches[k]
			if (touch.held || touch.moved) continue
			if (touch.t0 + this.thold > t) continue
			touch.held = true
			this._addevent("hold", touch.id, touch.touchid, {
				t: touch.t0 + this.thold,
				pos: touch.pos,
			})
		}
	},
	_ontouchstart: function (event) {
		this.ps = this._getps(event.touches)
		this._mtouch = Math.max(this._mtouch, event.touches.length)
		for (var j = 0 ; j < event.changedTouches.length ; ++j) {
			this._handlestart(event.changedTouches[j])
		}
		this._checkhold()
		event.preventDefault()
	},
	_ontouchmove: function (event) {
		this.ps = this._getps(event.touches)
		this._mtouch = Math.max(this._mtouch, event.touches.length)
		for (var j = 0 ; j < event.changedTouches.length ; ++j) {
			this._handlemove(event.changedTouches[j])
		}
		this._checkhold()
		event.preventDefault()
	},
	_ontouchend: function (event) {
		this.ps = this._getps(event.touches)
		this._mtouch = Math.max(this._mtouch, event.touches.length)
		this._checkhold()
		for (var j = 0 ; j < event.changedTouches.length ; ++j) {
			this._handleend(event.changedTouches[j])
		}
		if (!event.touches.length) this._mtouch = 0
		this._settkeys()
		event.preventDefault()
	},
	_eventpos: function (event, elem) {
		elem = elem || this._element
		var rect = elem.getBoundingClientRect()
		var ex = rect.left + elem.clientLeft - elem.scrollLeft
		var ey = rect.top + elem.clientTop - elem.scrollTop
		var x = event.clientX - ex, y = event.clientY - ey
		return this.roundpos ? [Math.round(x), Math.round(y)] : [x, y]
	},
	_getps: function(touches) {
		var ps = []
		for (var j = 0 ; j < touches.length ; ++j) {
			ps.push(this._eventpos(touches[j], this._element))
		}
		return ps
	},
}


// UFX.resource: load external resources

// Basic usage:
// 1. define the callback UFX.resource.onloading(f), which will be called every time a resource is
//    loaded, with f the fraction of resources loaded
// 2. define the callback UFX.resource.onload(), which will be called when the last resource has
//    loaded
// 3. call UFX.resource.load(res), where res is an object mapping names to urls

// The resources will be loaded into the objects UFX.resource.images, UFX.resource.sounds, and
// UFX.resource.data, based on the url extension, and parsed into the appropriate type.

// TODO: add documentation to the unifac wiki

"use strict"
var UFX = UFX || {}
UFX.resource = {}

// These will become populated as you call load
UFX.resource.images = {}
UFX.resource.sounds = {}
UFX.resource.data = {}

// Recognized extensions
UFX.resource.jsontypes = "js json".split(" ")
UFX.resource.imagetypes = "png gif jpg jpeg bmp tiff".split(" ")
UFX.resource.soundtypes = "wav mp3 ogg au".split(" ")
UFX.resource.rawtypes = "csv txt frag vert".split(" ")

// Base path for loading resources
UFX.resource.base = null

// Set this to a function that should be called when all resources are loaded
UFX.resource.onload = function () {}

// Set this to a function that should be called while resources are loading.
// It takes one argument, which is the fraction of resources that have loaded successfully.
UFX.resource.onloading = function (f) {}

// Give it a bunch of resource URLs to preload.
// Resource type (image or audio) is determined by extension
// Can call as:
//   load(url) or
//   load(url1, url2, url3, ...) or
//   load(array-of-urls) or
//   load({name1: url1, name2: url2, ... })
// If you use the last syntax, then you can key off UFX.resource.images and UFX.resource.sounds
//   as UFX.resource.images[name1], etc.
// Otherwise key as UFX.resource.images[url1], etc.
UFX.resource.load = function () {
    var resnames = UFX.resource._extractlist(arguments)
    for (var j = 0 ; j < resnames.length ; ++j) {
        var res = resnames[j]
        UFX.resource._load(res[0], res[1])
    }
    if (UFX.resource._toload === 0) {
        setTimeout(UFX.resource.onload, 0)
    }
}

// Calling loadimage or loadsound is recommended when the resource type cannot be auto-detected
//   from the URL. Or if you just want to be explicit about it.
// Same calling conventions as load.
UFX.resource.loadimage = function () {
    var resnames = UFX.resource._extractlist(arguments)
    for (var j = 0 ; j < resnames.length ; ++j) {
        var res = resnames[j]
        UFX.resource._loadimage(res[0], res[1])
    }
}
UFX.resource.loadsound = function () {
    var resnames = UFX.resource._extractlist(arguments)
    for (var j = 0 ; j < resnames.length ; ++j) {
        var res = resnames[j]
        UFX.resource._loadsound(res[0], res[1])
    }
}
UFX.resource.loadjson = function () {
    var resnames = UFX.resource._extractlist(arguments)
    for (var j = 0 ; j < resnames.length ; ++j) {
        var res = resnames[j]
        UFX.resource._loadjson(res[0], res[1])
    }
}

// Load Google web fonts
var WebFontConfig
UFX.resource.loadwebfonts = function () {
    WebFontConfig = {
        google: { families: Array.prototype.slice.call(arguments) },
        fontactive: UFX.resource._onload,
    }
    var wf = document.createElement("script")
    wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js"
    wf.type = "text/javascript"
    wf.async = "true"
    document.getElementsByTagName("head")[0].appendChild(wf)
    UFX.resource._toload += arguments.length
}


// Firefox won't let me play a sound more than once every 10 seconds or so.
// Use this class to create a set of identical sounds if you want to play in rapid succession
// url can be a sound or a sound.src attribute. Multisound doesn't participate in the loading
//   cycle, so you should have the url already preloaded when you call this factory.
// n is the number of identical copies. Defaults to 10.
UFX.resource.Multisound = function (url, n) {
    var ms = Object.create(UFX.resource.Multisound.prototype)
    ms._init(url, n)
    return ms
}

UFX.resource.Multisound.prototype = {
    _init: function (url, n) {
        this.src = typeof url == "string" ? url : url.src
        this._sounds = []
        this._n = n || 10
        this._k = 0
        this.volume = 1.0
        for (var j = 0 ; j < this._n ; ++j) {
            var s = new Audio()
            s.src = this.src
            this._sounds.push(s)
        }
    },
    play: function () {
        var s = this._sounds[this._k++]
        this._k %= this._n
        s.volume = this.volume
        s.play()
    },
    pause: function () {
        for (var j = 0 ; j < this._n ; ++j) {
            this._sounds[j].pause()
        }
    },
}

// Sometimes when you've got a sound that plays over and over again (like gunshots) you want to
// add a small amount of variation. Pass a list of closely-related sounds to this class to get an
// object that lets you play one at random. Requires UFX.random.
UFX.resource.SoundRandomizer = function (slist, nskip) {
    if (!(this instanceof UFX.resource.SoundRandomizer))
        return new UFX.resource.SoundRandomizer(slist, nskip)
    this._sounds = []
    for (var j = 0 ; j < slist.length ; ++j) {
        this._sounds.push(typeof slist[j] == "string" ? UFX.resource.sounds[slist[j]] : slist[j])
    }
    this._nskip = Math.min(this._sounds.length - 1, (nskip || 3))
    this._played = []
    this.volume = 1.0
}
UFX.resource.SoundRandomizer.prototype = {
    play: function () {
        do {
            var k = UFX.random.rand(this._sounds.length)
        } while (this._played.indexOf(k) > -1)
        var s = this._sounds[k]
        s.volume = this.volume
        s.play()
        if (this._nskip) {
            this._played.push(k)
            while (this._played.length >= this._nskip)
                this._played = this._played.slice(1)
        }
    },
    pause: function () {
        for (var j = 0 ; j < this._sounds.length ; ++j) {
            this._sounds[j].pause()
        }
    },
}
UFX.resource.mergesounds = function () {
	for (var j = 0 ; j < arguments.length ; ++j) {
		var slist = [], sname = arguments[j]
		for (var s in UFX.resource.sounds) {
			if (s.indexOf(sname) == 0) {
				slist.push(s)
			}
		}
		UFX.resource.sounds[sname] = UFX.resource.SoundRandomizer(slist)
	}
}


UFX.resource._seturl = function (url) {
    if (!UFX.resource.base) return url
    var n = UFX.resource.base.length
    if (!n) return url
    return UFX.resource.base + (UFX.resource.base.charAt(n-1) == "/" ? "" : "/") + url
}

// Try to deduce what type the resource is based on the url
UFX.resource._load = function (name, url) {
    var ext = url.split(".").pop()
    if (UFX.resource.imagetypes.indexOf(ext) > -1) {
        return UFX.resource._loadimage(name, url)
    } else if (UFX.resource.soundtypes.indexOf(ext) > -1) {
        return UFX.resource._loadsound(name, url)
    } else if (UFX.resource.jsontypes.indexOf(ext) > -1) {
        return UFX.resource._loadjson(name, url)
    } else if (UFX.resource.rawtypes.indexOf(ext) > -1) {
        return UFX.resource._loaddata(name, url)
    }
    console.log("Treating unknown extension " + ext + " as raw data")
    return UFX.resource._loaddata(name, url)
}

// Load a single image with the given name
UFX.resource._loadimage = function (iname, imageurl) {
    var img = new Image()
    img.onload = UFX.resource._onload
    img.src = UFX.resource._seturl(imageurl)
    img.iname = iname
    UFX.resource.images[iname] = img
    ++UFX.resource._toload
}
// Load a single audio file with the given name
UFX.resource._loadsound = function (aname, audiourl) {
    var audio = new Audio()
    audio.addEventListener("canplaythrough", UFX.resource._onload, false)
    audio.src = UFX.resource._seturl(audiourl)
    audio.aname = aname
    UFX.resource.sounds[aname] = audio
    ++UFX.resource._toload
}
// Load a single json resource
UFX.resource._loadjson = function (jname, jsonurl) {
    var req = new XMLHttpRequest()
    req.overrideMimeType("application/json")
    req.open('GET', jsonurl, true);  
    var target = this;
    req.onload  = function() {
        UFX.resource.data[jname] = JSON.parse(req.responseText)
        UFX.resource._onload()
    }
    req.send(null);
    ++UFX.resource._toload
}
// Load a single raw data resource
UFX.resource._loaddata = function (dname, dataurl) {
    var req = new XMLHttpRequest()
    req.open('GET', dataurl, true);  
    var target = this;
    req.onload  = function() {
        UFX.resource.data[dname] = req.responseText
        UFX.resource._onload()
    }
    req.send(null);
    ++UFX.resource._toload
}

UFX.resource._extractlist = function (args) {
    var ret = []
    for (var j = 0 ; j < args.length ; ++j) {
        var arg = args[j]
        if (typeof arg == "string") {
            ret.push([arg, arg])
        } else if (arg instanceof Array) {
            for (var k = 0 ; k < arg.length ; ++k) {
                ret.push([arg[k], arg[k]])
            }
        } else {
            for (var k in arg) {
                ret.push([k, arg[k]])
            }
        }
    }
    return ret
}

UFX.resource._toload = 0
UFX.resource._loaded = 0
UFX.resource._onload = function () {
    ++UFX.resource._loaded
    var f = 1. * UFX.resource._loaded / UFX.resource._toload
    UFX.resource.onloading(f)
    if (UFX.resource._loaded === UFX.resource._toload) {
        UFX.resource.onload()
    }
}

// UFX.Thing: component-based entity system

// Call UFX.Thing as a factory or constructor. Call the addcomp method of the resulting object
// to add a component.

// You are strongly recommended to read the documentation with example usage at:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.Thing_:_component-based_entities
// https://code.google.com/p/unifac/wiki/UFXComponentModel

"use strict"
var UFX = UFX || {}

// Thing factory/constructor. Give it a Component or a list of Components
UFX.Thing = function () {
    var thing = Object.create(UFX.Thing.prototype)
    for (var j = 0 ; j < arguments.length ; ++j) {
        thing.addcomp(arguments[j])
    }
    return thing
}
UFX.Thing.prototype = {
    _createmethod: function (mname, mtype, mlist) {
        mlist = mlist || []
        var f
        if (!mtype) {
            f = function () {
                var r
                for (var j = 0 ; j < mlist.length ; ++j) {
                    r = mlist[j].apply(this, arguments)
                }
                return r
            }
        } else if (mtype === "any") {
            f = function () {
                var r
                for (var j = 0 ; j < mlist.length ; ++j) {
                    r = mlist[j].apply(this, arguments)
                    if (r) return r
                }
                return r
            }
        } else if (mtype === "all") {
            f = function () {
                var r
                for (var j = 0 ; j < mlist.length ; ++j) {
                    r = mlist[j].apply(this, arguments)
                    if (!r) return r
                }
                return r
            }
        } else if (mtype === "getarray") {
            f = function () {
                var r = []
                for (var j = 0 ; j < mlist.length ; ++j) {
                    r.push(mlist[j].apply(this, arguments))
                }
                return r
            }
        } else if (mtype === "putarray") {
            f = function (arg) {
                var r = []
                for (var j = 0 ; j < mlist.length ; ++j) {
                    r.push(mlist[j].apply(this, arg[j]))
                }
                return r
            }
        } else {
            // TODO: throw an error
        }
        f.mlist = mlist
        return f
    },
    definemethod: function (mname, mtype) {
        if (this[mname]) return this
        this[mname] = this._createmethod(mname, mtype)
        return this
    },
    addcomp: function (comp) {
        if (comp instanceof Array) {
            // clone to avoid Chrome bug with assigning to arguments
            var comps = comp.slice(0)
            for (var j = 0 ; j < comps.length ; ++j) {
                arguments[0] = comps[j]
                this.addcomp.apply(this, arguments)
            }
            return this
        }
        for (var mname in comp) {
            if (mname == "init" || mname == "remove") continue
            if (typeof comp[mname] != "function") continue
            this.definemethod(mname)
            this[mname].mlist.push(comp[mname])
        }
        if (comp.init) {
            comp.init.apply(this, [].slice.call(arguments, 1))
        }
        return this
    },
    removecomp: function (comp) {
        if (comp instanceof Array) {
            var comps = comp.slice(0)
            for (var j = 0 ; j < comps.length ; ++j) {
                arguments[0] = comps[j]
                this.removecomp.apply(this, arguments)
            }
            return this
        }
        if (comp.remove) {
            comp.remove.apply(this, [].slice.call(arguments, 1))
        }
        for (var mname in comp) {
            if (mname == "init" || mname == "remove") continue
            if (!(mname in this)) continue
            this[mname].mlist = this[mname].mlist.filter(function (m) { return m !== comp[mname] })
        }
        return this
    },
    reversemethods: function (mname) {
        this[mname].mlist.reverse()
        return this
    },
    setmethodmode: function (mname, mtype) {
        this[mname] = this._createmethod(mname, mtype, (this[mname] ? this[mname].mlist : []))
        return this
    },
    normalize: function () {
        for (mname in this) {
            if (this.hasOwnProperty(mname) && this[mname].mlist && this[mname].mlist.length == 1) {
                this[mname] = this[mname].mlist[0]
            }
        }
    },
}



UFX.Component = {}

UFX.Component.HasChildren = {
    init: function () {
        this.children = []
    },
    nchildren: function () {
        return this.children.length
    },
    _addchild: function (child) {
        this.children.push(child)
        return this
    },
    _removechild: function (child) {
        this.children = this.children.filter(function (c) { return c !== child })
        return this
    },
    lastchild: function () {
        return this.children[this.children.length - 1]
    },
    die: function () {
        for (var j = 0 ; j < this.children.length ; ++j) {
            this.children[j].die()
        }
    },
    think: function () {
        for (var j = 0 ; j < this.children.length ; ++j) {
            this.children[j].think.apply(this.children[j], arguments)
        }
    },
    // TODO: is this what we want?
    draw: function (context) {
        for (var j = 0 ; j < this.children.length ; ++j) {
            context.save()
            this.children[j].draw(context)
            context.restore()
        }
    },
}

UFX.Component.SortChildren = {
    init: function (func) {
        this.childsortfunc = func || function(a,b) { return a.z - b.z }
    },
    addchild: function (child) {
        this.children.sort(this.childsortfunc)
    },
}

UFX.Component.HasParent = {
    init: function (parent) {
        this.attachto(parent)
    },
    attachto: function (parent) {
        if (this.parent) {
            this.parent._removechild(this)
        }
        this.parent = parent
        if (this.parent) {
            this.parent._addchild(this)
        }
        return this
    },
    detach: function () {
        return this.attachto()
    },
    die: function () {
        return this.detach()
    },
}

// UFX.random: random number generation

// The random numbers are generated by a quick and easy LCG, which is good enough for games, but
// definitely not for simulations or cryptography.

// There are two reasons to use this instead of Math.random. First, you can seed this RNG, so you
// can deterministically generate the same sequence over again if you want. Second, there are a
// number of handy functions I always wanted.

// You don't need to seed it before the first usage. It's automatically seeded with Math.random in
// that case.

// For more information and options, please see the documentation:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.random_:_generate_pseudorandom_numbers


"use strict"
var UFX = UFX || {}

// UFX.random and UFX.random.rand - the two basic RNG functions

// UFX.random() : float in [0, 1)
// UFX.random(a) : float in [0, a)
// UFX.random(a, b) : float in [a, b)
// UFX.random.rand() : integer in [0, 2^32)
// UFX.random.rand(n) : integer in [0, n)
// UFX.random.rand(m, n) : integer in [m, n)

UFX.random = function (a, b) {
    if (typeof b == "undefined") {
        b = a
        a = 0
        if (typeof b == "undefined") {
            b = 1
        }
    }
    return UFX.random.rand() * (b - a) / 4294967296 + a
}
UFX.random.rand = function (m, n) {
    if (typeof n != "undefined") return m + UFX.random.rand(n-m)
    if (typeof UFX.random.seed == "undefined") {
        UFX.random.setseed()
    }
    // Values from Numerical Recipes, according to Wikipedia
    UFX.random.seed = (1664525 * UFX.random.seed + 1013904223) % 4294967296
    return m ? Math.floor(UFX.random.seed * m / 4294967296) : UFX.random.seed
}

// Jenkins hash function - used to get a number for seeding the RNG from an arbitrary object
//   http://en.wikipedia.org/wiki/Jenkins_hash_function
// For the purposes of bitwise operations, JavaScript's Number type is a 32-bit signed
//   integer. So we can operate as normal on the lower 32 bits, and only at the very end
//   do we have to worry about whether it's negative.
UFX.random.hash = function (obj) {
    var s = typeof obj == "string" ? obj : JSON.stringify(obj), n = s.length, h = 0
    for (var j = 0 ; j < n ; ++j) {
        h += s.charCodeAt(j)
        h += h << 10
        h ^= h >>> 6
    }
    h += h << 3
    h ^= h >>> 11
    h += h << 15
    if (h < 0) h += 4294967296 
    return h
}

// Call with no argument to set a seed from Math.random
// Call with an integer in the range [0, 4294967296) to set that seed
//   (can also just assign to UFX.random.seed)
// Call with an arbitrary object to set a seed based on that object's hash
// Returns the new seed
UFX.random.setseed = function (n) {
    if (typeof n == "undefined") {
        n = Math.floor(Math.random() * 4294967296)
    } else if (typeof n == "number") {
        n = Math.floor(n) % 4294967296
    } else {
        n = UFX.random.hash(n)
    }
    UFX.random.seed = n
    delete UFX.random.normal._y
    return n
}

// Save the state of the RNG for later use
// Useful if you want to generate some random numbers without messing with the RNG
UFX.random._seedstack = []
UFX.random.pushseed = function (n) {
    if (typeof UFX.random.seed == "undefined") UFX.random.setseed()
    UFX.random._seedstack.push(UFX.random.seed)
    UFX.random.setseed(n)
    return UFX.random.seed
}
// Restore the old state of the RNG
UFX.random.popseed = function () {
    UFX.random.seed = UFX.random._seedstack.pop()
    return UFX.random.seed
}

// Select a random element from the array arr.
// If remove is set to true, the selected element is removed.
UFX.random.choice = function (arr, remove) {
    return remove ? arr.splice(UFX.random.rand(arr.length), 1)[0] : arr[UFX.random.rand(arr.length)]
}

// string of n random letters
UFX.random.word = function (n, letters) {
	var a = []
	n = n || 8
	letters = letters || "abcdefghijklmnopqrstuvwxyz"
	for (var j = 0 ; j < n ; ++j)
		a.push(UFX.random.choice(letters))
	return a.join("")
}

UFX.random.color = function () {
	return "#" + UFX.random.word(6, "0123456789ABCDEF")
}

// Fisher-Yates shuffle (in-place)
UFX.random.shuffle = function (arr) {
    for (var i = arr.length - 1 ; i > 0 ; --i) {
        var j = UFX.random.rand(i+1)
        var temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }
    return arr
}

// TODO: extend the following two functions into more than 3 dimensions
// A random point in the unit circle
UFX.random.rdisk = function () {
    var x, y
    do {
        x = UFX.random(-1, 1)
        y = UFX.random(-1, 1)
    } while (x * x + y * y > 1)
    return [x, y]
}

// A random point on the unit sphere
UFX.random.rsphere = function () {
    var x, y, z
    do {
        x = UFX.random(-1, 1)
        y = UFX.random(-1, 1)
        z = UFX.random(-1, 1)
    } while (x * x + y * y + z * z > 1)
    var d = Math.sqrt(x*x + y*y + z*z)
    if (d === 0) return [0, 0, 1]
    return [x/d, y/d, z/d]
}


// N points in the unit square that avoid clustering
// setting dfac will affect how non-random it appears
// dfac = 1 : very non-random, regular spacing
// dfac = 0.01 : pretty much like a random distribution
// defaults to 0.15
UFX.random.spread = function (n, dfac, scalex, scaley, x0, y0) {
    n = n || 100
    dfac = dfac || 0.15
    scalex = scalex || 1.0
    scaley = scaley || scalex
    x0 = x0 || 0
    y0 = y0 || x0
    var r = [], d2min = 1.
    while (r.length < n) {
        var x = UFX.random(), y = UFX.random(), valid = true
        for (var j = 0 ; j < r.length ; ++j) {
            var dx = Math.abs(x - r[j][0]), dy = Math.abs(y - r[j][1])
            if (dx > 0.5) dx = 1 - dx
            if (dy > 0.5) dy = 1 - dy
            if (dx * dx + dy * dy < d2min) {
                valid = false
                break
            }
        }
        if (valid) {
            r.push([x, y])
            d2min = dfac / r.length
        } else {
            d2min *= 0.9
        }
    }
    for (var j = 0 ; j < n ; ++j) {
        r[j][0] = x0 + r[j][0] * scalex
        r[j][1] = y0 + r[j][1] * scaley
    }
    return r
}

UFX.random.spread1d = function (n, dfac) {
    n = n || 100
    dfac = dfac || 0.15
    var r = [], dmin = 1
    while (r.length < n) {
        var x = UFX.random(), valid = true
        for (var j = 0 ; j < r.length ; ++j) {
            var dx = Math.abs(x - r[j])
            if (dx > 0.5) dx = 1 - dx
            if (dx < dmin) {
                valid = false
                break
            }
        }
        if (valid) {
            r.push(x)
            dmin = 0.5 * dfac / r.length
        } else {
            dmin *= 0.95
        }
    }
//    var scalex = 1, x0 = 0
    return r
}

// Gaussian normal variable
// http://www.taygeta.com/random/gaussian.html
UFX.random.normal = function (mu, sigma) {
    mu = mu || 0
    sigma = sigma || 1
    if (typeof UFX.random.normal._y == "number") {
        var x = UFX.random.normal._y
        delete UFX.random.normal._y
    } else {
        var x, y, w
        do {
            x = UFX.random(-1, 1)
            y = UFX.random(-1, 1)
            w = x * x + y * y
        } while (w > 1)
        try {
            w = Math.sqrt(-2. * Math.log(w) / w)
            x *= w
            y *= w
        } catch (err) {
            x = y = 0
        }
        UFX.random.normal._y = y
    }
    return x * sigma + mu
}




