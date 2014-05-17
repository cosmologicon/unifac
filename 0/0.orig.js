// UFX.maximize - expand a canvas to take up the whole window or screen
// Requires polyfill for fullscreening
// UFX.maximize.full(canvas): fullscreen
// UFX.maximize.fill(canvas): fill window
// UFX.maximize.maximize(canvas): fullscreen if possible, fill window otherwise


if (typeof UFX == "undefined") UFX = {}

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
	fill: function (element) {
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
	full: function (element) {
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
	maximize: function (element) {
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

// Resource loading

if (typeof UFX == "undefined") UFX = {}
UFX.resource = {}

// These will become populated as you call load
UFX.resource.images = {}
UFX.resource.sounds = {}

// Recognized extensions
UFX.resource.imagetypes = "png gif jpg jpeg bmp tiff".split(" ")
UFX.resource.soundtypes = "wav mp3 ogg au".split(" ")

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

// Load Google web fonts
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
    }
    console.log("Treating unknown extension " + ext + " as image")
    return UFX.resource._loadimage(name, url)
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

// UFX.ticker module
// Handle game loop

if (typeof UFX == "undefined") UFX = {}

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
		this._running = true
		this._tick()
	},
	stop: function () {
		if (this._shandle) window.cancelAnimationFrame(this._shandle)
		if (this._thandle) clearTimeout(this._thandle)
		this._shandle = this._thandle = null
		this._running = false
		this.resetcounters()
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
//			console.log(minups, maxups, this._accumulator, n, nthink, dt, dt0)
		}
		

		// Invoke the think callback
		if (nthink) {
			this._accumulator -= dt
			dt /= nthink
			for (var jthink = 0 ; jthink < nthink ; ++jthink) {
				this._tcallback.call(this.cthis, dt, jthink, nthink)
				now = Date.now()
				this._dtu = 0.95 * this._dtu + 0.05 * (now - this._lastthink)
				this._dtg = 0.95 * this._dtg + 0.05 * (dt * 1000)
				this._lastthink = now
			}
		}

		// Invoke the draw callback
		if (dodraw && this._dcallback) {
			var f = this._accumulator * minups
			this._dcallback.call(this.cthis, f)
			now = Date.now()
			this._dtf = 0.95 * this._dtf + 0.05 * (now - this._lastdraw)
			this._lastdraw = now
		}

		// Accumulators should never be allowed to stay over 1 update
		this._accumulator = Math.max(Math.min(this._accumulator, dtmin), 0)
		// TODO: reconsider the margin for accumulator amounts close to 0

		// Update frame rate counters
		this.wups = 1000 / this._dtu
		this.wfps = this._dcallback ? 1000 / this._dtf : this.wups
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


// The scene module - keeps track of the scene stack

if (typeof UFX == "undefined") UFX = {}

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
	ipop: function () {
		if (this.frozen) return
		var c = this._stack.pop()
		if (c.stop) c.stop()
		var n = this.top()
		if (n && n.resume) n.resume()
		if (this.recorder) this.recorder.addpop()
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
		this._actionq.push(["pop"])
	},
	swap: function () {
		this._actionq.push(["swap", Array.prototype.slice.call(arguments, 0)])
	},
	_resolveq: function () {
		for (var j = 0 ; j < this._actionq.length ; ++j) {
			switch (this._actionq[j][0]) {
				case "push": this.ipush.apply(this, this._actionq[j][1]) ; break
				case "pop": this.ipop() ; break
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

// draw module - some convenience functions for invoking context methods
// The basic UFX.draw() function takes a string based on the SVG path string specification,
//   but with some important differences

// Three ways to invoke the function here.
// UFX.draw(context, drawstring)
// UFX.draw.setcontext(context) ; UFX.draw(drawstring)
// UFX.draw.extend(context) ; context.draw(drawstring)

// The drawstring can also be a series of strings or values.
// UFX.draw(context, "( m 0 0 l", x, y, ") s")

if (typeof UFX == "undefined") UFX = {}

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





// Mouse module - puts mouse events in a queue

// Does not yet handle horizontal scrolling or multitouch


if (typeof UFX == "undefined") UFX = {}
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
UFX.mouse.drag = null

UFX.mouse.events = function () {
    var r = UFX.mouse._events
    UFX.mouse.clearevents()
    return r
}

UFX.mouse.state = function () {
    var r = {}
    if (UFX.mouse.capture.left) r.left = {}
    if (UFX.mouse.capture.middle) r.middle = {}
    if (UFX.mouse.capture.right) r.right = {}
    UFX.mouse._events.forEach(function (event) {
        r[UFX.mouse._buttonmap[event.button]][event.type] = event.pos
    })
    UFX.mouse.clearevents()
    if (UFX.mouse.capture.wheel) r.wheeldy = UFX.mouse.getwheeldy()
    if (UFX.mouse.watchdrag && UFX.mouse.drag) {
    	var drag = UFX.mouse.drag
    	r[UFX.mouse._buttonmap[drag.button]].drag = {
    		dx: drag.pos[0] - drag.opos[0],
    		dy: drag.pos[1] - drag.opos[1],
		}
		drag.opos = drag.pos
    }
    r.pos = UFX.mouse.pos
    return r
}

UFX.mouse.clearevents = function () {
    UFX.mouse._events = []
}

UFX.mouse.getwheeldy = function () {
    var dy = UFX.mouse.wheeldy
    UFX.mouse.wheeldy = 0
    return dy
}

// This is updated every mouse event with the last known mouse position (as a length-2 array)
UFX.mouse.pos = null
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
    var off = UFX.mouse._elemoffset(elem || event.target)
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
    if (!UFX.mouse.active || !UFX.mouse.capture[UFX.mouse._buttonmap[event.button]]) return true
    var pos = UFX.mouse._geteventpos(event)
    if (UFX.mouse.watchdrag) {
        UFX.mouse.drag = {
            downevent: event,
            button: event.button,
            pos0: pos,
            opos: pos,
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
    if (!UFX.mouse.active || !UFX.mouse.capture[UFX.mouse._buttonmap[event.button]]) return true
    if (!UFX.mouse.drag) return true
    if (UFX.mouse.qup) {
        var mevent = {
            type: "up",
            pos: UFX.mouse._geteventpos(event, UFX.mouse._element),
            button: event.button,
            time: Date.now(),
            baseevent: event,
        }
        if (UFX.mouse.drag) {
            mevent.t0 = UFX.mouse.drag.t0
            mevent.dt = Date.now() - mevent.t0
            mevent.pos0 = UFX.mouse.drag.pos0
            mevent.dx = mevent.pos[0] - mevent.pos0[0]
            mevent.dy = mevent.pos[1] - mevent.pos0[1]
        }
        UFX.mouse._events.push(mevent)
    }
    UFX.mouse.drag = null
    event.preventDefault()
    return false
}


UFX.mouse._onmousemove = function (event) {
    if (!UFX.mouse.active) return true
    var pos = UFX.mouse._geteventpos(event, UFX.mouse._element)
    UFX.mouse.pos = pos
    if (UFX.mouse.drag) {
        UFX.mouse.drag.pos = pos
        UFX.mouse.drag.dx = pos[0] - UFX.mouse.drag.pos0[0]
        UFX.mouse.drag.dy = pos[1] - UFX.mouse.drag.pos0[1]
        UFX.mouse.drag.dt = Date.now() - UFX.mouse.drag.t0
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


// UFX.touch - touch and multitouch event handling

if (typeof UFX == "undefined") UFX = {}

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


// Thing - component-based game object
// Basic usage is very simple. Use UFX.Thing as a factory/constructor
// Components are simply a collection of named methods.

if (typeof UFX == "undefined") UFX = {}

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


var settings = {
	gamename: "0",
	version: "LD-0",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	silent: window.location.href.indexOf("SILENT") > -1,
	
	ghostv: 32,
	Dmin: 0.5,
}


var beaten = {}

function getlevels() {
	var ret = ["north", "south"]
	if (beaten.north) {
		ret.push("northwest")
		ret.push("northeast")
	}
	if (beaten.south) {
		ret.push("southwest")
		ret.push("southeast")
	}
	if (beaten.southwest && beaten.northwest) {
		ret.push("west")
	}
	if (beaten.southeast && beaten.northeast) {
		ret.push("east")
	}
	if (beaten.east && beaten.west) {
		ret.push("0")
	}
	var unbeaten = function (lname) { return !beaten[lname] }
	return ret.filter(unbeaten)
}


var things = []


var WorldBound = {
	init: function (x, y) {
		this.x = x || 0
		this.y = y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}
var Ticks = {
	init: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
	},
}
var Transitions = {
	init: function () {
		this.trans = null
	},
	think: function (dt) {
		if (!this.trans) return
		this.trans.think(dt, this)
		if (this.trans.done) {
			if (this.trans.kills) this.done = true
			this.trans = null
		}
	},
	draw: function () {
		if (this.trans) {
			this.trans.draw(this)
		}
	},
	halts: function () {
		return this.trans && this.trans.halts
	},
}

var Clickable = {
	init: function (r) {
		this.r = r || 0
	},
	hits: function (x, y) {
		var dx = x - this.x, dy = y - this.y
		return dx * dx + dy * dy < this.r * this.r
	},
	draw: function () {
		if (settings.DEBUG) {
			UFX.draw("b o 0 0", this.r, "lw 0.03 ss red s")
		}
	},
}
var Unclickable = {
	hits: function () {
		return false
	},
}
var Collectible = {
	init: function () {
		this.collectible = true
	},
}
var Disposible = {
	init: function () {
		this.disposible = true
	},
}
var FreesSister = {
	think: function (dt) {
		if (this.active && !this.sister.free) {
			this.sister.free = true
			this.sister.trans = new GrowFadeHalt(this.sister)
		}
	},
}

var WobbleOnActive = {
	init: function (omega, beta) {
		this.womega = omega || 2.6
		this.wbeta = beta || 0.12
		this.wf = 0
	},
	think: function (dt) {
		this.wf += (this.active ? 2 : -2) * dt
		this.wf = clip(this.wf, 0, 1)
	},
	draw: function () {
		if (this.wf) {
			var s = Math.exp(this.wf * this.wbeta * Math.sin(this.t * this.womega))
			UFX.draw("z", s, 1/s)
		}
	},
}
var Rocks = {
	draw: function () {
		var A = 20 * Math.sin(this.t * 0.1)
		UFX.draw("r", A)
	},
}

var FacesActive = {
	init: function () {
		this.A = 0
	},
	think: function (dt) {
		var as = things.filter(function (thing) { return thing.active })
		if (!as.length) return
		var dx = as[0].x - this.x, dy = as[0].y - this.y
		var A = Math.atan2(dx, -dy), dA = zmod(A - this.A, tau)
		this.A += 5 * dt * dA
	},
	draw: function () {
		UFX.draw("r", this.A)
	},
}



var DrawPath = {
	init: function (path) {
		this.path = path || "b o 0 0 2"
	},
	draw: function (menu, selected, a) {
		if (!menu) {
			selected = true
			a = 0
		}
		if (a >= 1) {
			UFX.draw("lw 0.2", this.path, "fs #CCC ss black f s")
		} else if (selected) {
			var c0 = clip(Math.floor(192 * a), 0, 192) + 32
			var c1 = clip(Math.floor(255 * (1-a)), 0, 255)
			var color0 = "rgb(" + c0 + "," + c0 + "," + c0 + ")"
			var color1 = "rgb(" + c1 + "," + c1 + "," + c1 + ")"
			UFX.draw("lw 0.2", this.path, "fs", color0, "ss", color1, "f s")
		} else {
			UFX.draw("lw 0.2", this.path, "alpha", a, "fs #CCC ss black f s")
		}
	},
}
var DrawTcircle = {
	draw: function () {
		UFX.draw("b o 0 0 1 lw 0.3 s b o 0 0 0.5 f")
	},
}
var DrawTtriangle = {
	draw: function () {
		UFX.draw("( m 1 0.6 l -1 0.6 l 0 -1.4 ) lw 0.3 s")
		UFX.draw("[ z 0.4 0.4 ( m 1 0.6 l -1 0.6 l 0 -1.4 ) ] f")
	},
}
var DrawTsquare = {
	draw: function () {
		UFX.draw("lw 0.3 sr -1 -1 2 2 fr -0.5 -0.5 1 1")
	},
}
var DrawStar = {
	draw: function () {
		UFX.draw("z 0.2 0.2 ( m 0 4 l 1 1 l 4 0 l 1 -1 l 0 -4 l -1 -1 l -4 0 l -1 1 ) f")
	},
}
var DrawString = {
	draw: function () {
		if (this.active || this.trans || this.done) return
		if (this.sister.active || this.sister.trans || this.sister.done) return
		UFX.draw("[ b m", this.x, this.y, "l", this.sister.x, this.sister.y, "lw 0.1 s ]")
	},
}


// Centerpiece of each level, also the level identifier shape
function Piece(name, path, x, y, r) {
	this.name = name
	this.x = x || 0
	this.y = y || 0
	this.path = path || this.path
	this.r = r || 2
}
Piece.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(WobbleOnActive, null, 0.05)
	.addcomp(DrawPath)
	.addcomp(Clickable, 2)

// Just a normal target
function Target(x, y) {
	this.x = x
	this.y = y
}
Target.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(WobbleOnActive)
	.addcomp(DrawTcircle)
	.addcomp(Clickable, 1.4)
	.addcomp(Disposible)

function Dagger(x, y) {
	this.x = x
	this.y = y
}
Dagger.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(FacesActive)
	.addcomp(DrawTtriangle)
	.addcomp(Clickable, 1.4)
	.addcomp(Disposible)


function Sister(x, y, sister) {
	this.x = x
	this.y = y
	this.sister = sister
}
Sister.prototype = UFX.Thing()
	.addcomp(DrawString)
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(DrawTsquare)
	.addcomp(Clickable, 1.4)
	.addcomp(Disposible)
	.addcomp(FreesSister)


// Star bits. These represent your possessions or whatever
function Bit(x, y) {
	this.x = x
	this.y = y
	this.t = Math.random() * 1000
	this.think(0)
}
Bit.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(Rocks)
	.addcomp(DrawStar)
	.addcomp(Unclickable)
	.addcomp(Collectible)

// Object transitions


var FiniteLife = {
	init: function (T) {
		this.T = T || 1
	},
	think: function (dt) {
		if (this.t > this.T) {
			this.t = this.T
			this.done = true
		}
	},
}
var LinearTrans = {
	think: function (dt) {
		this.f = this.t / this.T
	},
}
var NonLinearTrans = {
	init: function (p) {
		this.p = p || 0
		this.A = p ? 1 / (Math.exp(this.p) - 1) : 0
	},
	think: function (dt) {
		var f = this.t / this.T
		this.f = this.p ? this.A * (Math.exp(this.p * f) - 1) : f
	},
}

var Hesitates = {
	init: function (T) {
		this.hT0 = T || 0
		this.hT = 0
	},
	think: function (dt) {
		this.hT += dt
		this.t = Math.max(Math.min(this.t, this.hT - this.hT0), 0)
	},
}




function Spin() {
}
Spin.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.8)
	.addcomp(NonLinearTrans, -1)
	.addcomp({
		draw: function (obj) {
			UFX.draw("r", this.f * tau)
		},
	})

function Deploy(obj) {
	var A = Math.atan2(obj.x, obj.y)
	this.hT0 = 0.1 * A
}
Deploy.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(Hesitates)
	.addcomp(FiniteLife, 0.8)
	.addcomp(NonLinearTrans, -3)
	.addcomp({
		init: function () {
			this.halts = true
		},
		draw: function (obj) {
			UFX.draw("t", -obj.x * (1-this.f), -obj.y * (1-this.f))
		},
	})

function Undeploy(obj) {
	var A = Math.atan2(obj.x, obj.y)
	this.hT0 = 0.1 * A
}
Undeploy.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(Hesitates)
	.addcomp(FiniteLife, 0.8)
	.addcomp(NonLinearTrans, -3)
	.addcomp({
		init: function () {
			this.kills = true
			this.halts = true
		},
		draw: function (obj) {
			UFX.draw("t", -obj.x * this.f, -obj.y * this.f)
		},
	})

function GrowFade() {
}
GrowFade.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.5)
	.addcomp(NonLinearTrans)
	.addcomp({
		init: function () {
			this.kills = true
		},
		draw: function (obj) {
			s = 1 + 2 * this.f
			UFX.draw("z", s, s, "alpha", 1-this.f)
		},
	})

function GrowFadeHalt() {
}
GrowFadeHalt.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.5)
	.addcomp(NonLinearTrans)
	.addcomp({
		init: function () {
			this.kills = true
			this.halts = true
		},
		draw: function (obj) {
			s = 1 + 2 * this.f
			UFX.draw("z", s, s, "alpha", 1-this.f)
		},
	})


// Effects

function Ghost(thing0, thing1) {
	this.thing0 = thing0
	this.thing1 = thing1
	var dx = thing1.x - thing0.x, dy = thing1.y - thing0.y
	this.T = Math.sqrt(Math.max(dx * dx + dy * dy, 1)) / settings.ghostv
	this.think(0)
	this.trans = { kills: true }
}
Ghost.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.3)
	.addcomp(NonLinearTrans, -3)
	.addcomp({
		getf: function (t) {
			var f = clip(t / this.T, 0, 1)
			return this.p ? this.A * (Math.exp(this.p * f) - 1) : f
		},
		getpos: function (t) {
			var f = this.getf(t)
			return [
				this.thing1.x * f + this.thing0.x * (1 - f),
				this.thing1.y * f + this.thing0.y * (1 - f),
			]
		},
		draw: function () {
			UFX.draw("[ t", this.getpos(this.t), "b o 0 0 0.4 f ]")
			UFX.draw("[ t", this.getpos(this.t - 0.02), "b o 0 0 0.3 f ]")
			UFX.draw("[ t", this.getpos(this.t - 0.03), "b o 0 0 0.2 f ]")
		},
		halts: function () {
			return true
		},
	})
	.addcomp(Unclickable)


var levels = {}

levels[0] = {
	ppath: "b o 0 0 3.6",
	px: 0,
	py: 0,
	pr: 3.6,
	targetps: [
		[-8, -8],
		[8, -8],
		[-8, 8],
		[8, 8],
	],
	sisterps: [
		[-4, -12, 12, 4],
		[-12, -4, 4, 12],
		[4, -12, -12, 4],
		[12, -4, -4, 12],
	],
	daggerps: [
		[-12, -12],
		[12, -12],
		[-12, 12],
		[12, 12],
	],
	bitks: [
		[9, 5],
		[2, 11],
		[0, 3],
		[3, 4],
		[1, 2],
		[16, 6],
	],
	bitxs: [
		[1, 2, 5, 10],
		[5, 12, 3, 4],
		[14, 4, 0, 6],
		[11, 3, 2, 4],
		[9, 7, 0, 5],
		[14, 12, 5, 8],
	],
}

levels.north = {
	ppath: "[ r 3.1416 t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: 0,
	py: -1.8,
	targetps: [
		[-5, -8],
		[5, -8],
		[10, 0],
		[5, 8],
		[-5, 8],
		[-10, 0],
	],
	bitks: [
		[0, 1, 0.7],
		[0, 2, 0.7],
		[0, 3, 0.7],
		[0, 4, 0.7],
		[0, 5, 0.7],
		[0, 6, 0.7],
		[1, 2],
	],
	bitxs: [
		[2, 4, 3, 5],
		[1, 5, 4, 6],
	],
}

levels.northwest = {
	ppath: "[ r 3.1416 t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: -1.8,
	py: -1.8,
	targetps: [
		[-10, -10],
		[0, -10],
		[10, -10],
		[10, 0],
		[10, 10],
		[0, 10],
		[-10, 10],
		[-10, 0],
	],
	bitks: [
		[1, 2],
		[1, 8],
		[8, 7],
		[0, 3, 0.7],
		[0, 6, 0.7],
		[4, 6],
		[5, 6],
	],
	bitxs: [
		[1, 4, 2, 8],
		[2, 4, 3, 6],
		[0, 7, 5, 8],
	],
}

levels.northeast = {
	ppath: "[ r -1.5708 t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: 1.8,
	py: -1.8,
	targetps: [
		[-9, -7],
		[-3, -7],
		[3, -7],
		[9, -7],
		[-9, 7],
		[-3, 7],
		[3, 7],
		[9, 7],
	],
	bitks: [
		[0, 8, 0.75],
		[0, 4],
		[2, 5, 0.75],
		[4, 7, 0.25],
	],
	bitxs: [
		[0, 1, 2, 6],
		[0, 5, 1, 6],
		[2, 8, 3, 5],
	],
}

levels.south = {
	ppath: "[ t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: 0,
	py: 1.8,
	targetps: [
		[-10, -10],
		[-6, -6],
		[6, -6],
		[10, -10],
		[-10, 10],
		[-6, 6],
		[6, 6],
		[10, 10],
	],
	bitks: [
		[1, 4],
		[5, 8],
		[0, 2],
		[0, 3],
		[0, 6],
		[0, 7],
	],
	bitxs: [
		[1, 3, 2, 4],
		[1, 6, 2, 5],
		[3, 8, 4, 7],
		[5, 7, 6, 8],
	],
}


levels.southeast = {
	ppath: "[ t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: 1.8,
	py: 1.8,
	targetps: [
		[-10, -10],
		[10, -10],
		[-10, 10],
		[10, 10],
	],
	daggerps: [
		[0, -10],
		[-10, 0],
		[10, 0],
		[0, 10],
	],
	bitks: [
		[1, 6],
		[1, 0],
		[5, 0],
		[2, 0],
		[2, 7],
		[6, 0],
		[7, 0],
		[3, 6],
		[6, 8],
		[0, 8],
		[7, 8],
		[4, 7],
	],
	bitxs: [
	],
}

levels.southwest = {
	ppath: "[ r 1.5708 t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: -1.8,
	py: 1.8,
	targetps: [
	],
	sisterps: [
		[-10, -5, -5, -10],
		[5, -10, 10, -5],
		[-10, 5, -5, 10],
		[5, 10, 10, 5],
	],
	bitks: [
		[1, 4],
		[2, 6],
		[3, 7],
		[5, 8],
	],
	bitxs: [
		[2, 6, 5, 8],
		[5, 8, 3, 7],
	],
}

levels.west = {
	ppath: "[ r 1.5708 t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: -1.8,
	py: 0,
	targetps: [
		[-24, 0],
		[-8, 0],
		[0, -10],
		[0, 10],
		[8, 0],
		[24, 0],
	],
	sisterps: [
		[-16, -10, -16, 10],
		[16, -10, 16, 10],
	],
	bitks: [
		[3, 9],
		[7, 8],
		[9, 10],
	],
	bitxs: [
		[1, 9, 2, 3],
		[7, 6, 3, 5],
		[8, 6, 5, 4],
		[10, 1, 2, 4],
		[0, 3, 1, 9],
		[0, 4, 1, 10],
	],
}


levels.east = {
	ppath: "[ r -1.5708 t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: 1.8,
	py: 0,
	targetps: [
		[0, -12],
		[-8, -8],
		[8, -8],
		[-12, 0],
		[12, 0],
		[-8, 8],
		[8, 8],
		[0, 12],
	],
	daggerps: [
		[0, -8],
		[-8, 0],
		[8, 0],
		[0, 8],
	],
	bitks: [
		[1, 9],
		[8, 12],
		[4, 10],
		[11, 5],
		[2, 4],
		[5, 7],
		[9, 2],
		[12, 7],
	],
	bitxs: [
		[2, 6, 4, 8],
		[3, 7, 1, 5],
		[0, 1, 3, 4],
		[0, 8, 5, 6],
		[0, 4, 2, 8],
		[0, 5, 3, 8],
		[9, 4, 0, 2],
		[9, 5, 0, 3],
		[12, 4, 0, 6],
		[12, 5, 0, 7],
	],
}


var camera = {
	think: function (dt, zfactor) {
		var sx = canvas.width, sy = canvas.height, s = Math.min(sx, sy)
		var xmax = 12, ymax = 12
		things.forEach(function (thing) {
			if (thing.x) xmax = Math.max(Math.abs(thing.x), xmax)
			if (thing.y) ymax = Math.max(Math.abs(thing.y), ymax)
		})
		this.x0 = sx / 2
		this.y0 = sy / 2
		this.z = Math.min(sx/(2*xmax+4), sy/(2*ymax+4)) * (zfactor || 1)
	},
	screentoworld: function (p) {
		if (!p) return null
		return [
			(p[0] - this.x0) / this.z,
			(p[1] - this.y0) / this.z,
		]
	},
	draw: function () {
		UFX.draw("t", this.x0, this.y0, "z", this.z, this.z)
	},
}


UFX.scenes.select = {
	start: function (lastlevel, victory) {
		var levelnames = getlevels()
		things = []
		var selected = null
		levelnames.forEach(function (levelname) {
			var level = levels[levelname]
			var piece = new Piece(levelname, level.ppath, level.px, level.py, level.pr)
			if (!victory && levelname == lastlevel) {
				piece.trans = new Deploy(piece)
				selected = piece
			} else {
				things.push(piece)
			}
		})
		if (!selected && lastlevel) {
			selected = new Piece(lastlevel, levels[lastlevel].ppath, 0, 0, levels[lastlevel].pr)
			selected.trans = new GrowFadeHalt(selected)
		}
		if (selected) things.push(selected)
		this.selected = selected
		this.done = false
	},
	thinkargs: function (dt) {
		var clicked = false, pos = [-1000, -1000]
		if (UFX.mouse.active) {
			UFX.mouse.events().forEach(function (event) {
				clicked = clicked || event.type == "down"
			})
			pos = UFX.mouse.pos
		} else if (UFX.touch.active) {
			UFX.touch.events().forEach(function (event) {
				clicked = clicked || event.type == "start"
				pos = event.pos
			})
		}
		return [dt, camera.screentoworld(pos), clicked]
	},
	think: function (dt, mpos, clicked) {
		if (this.selected && !this.done) {
			if (!this.selected.trans) {
				this.selected = null
			}
		}
		var halted = this.selected && this.selected.trans
		things.forEach(function (thing) {
			halted = halted || thing.halts()
		})
		if (!halted && clicked) {
			var mx = mpos[0], my = mpos[1]
			var chosen = null
			things.forEach(function (thing) {
				if (thing.hits(mx, my)) {
					chosen = thing
				}
			})
			if (chosen) {
				play("note-34")
				this.done = true
				this.selected = chosen
				chosen.trans = new Undeploy(chosen)
				things.splice(things.indexOf(chosen), 1)
				things.push(chosen)
			}
		}
		things.forEach(function (thing) {
			thing.think(dt)
		})
		things = things.filter(function (thing) { return !thing.done })
		if (this.selected && this.done) {
			if (!this.selected.trans) {
				UFX.scene.swap("main", this.selected.name)
			}
		}

		this.f = 1
		if (this.selected) {
			//this.f = this.selected.trans ? this.selected.trans.t / this.selected.trans.T : 1
			this.f = this.selected.trans ? this.selected.trans.f : 1
			if (this.done) this.f = 1 - this.f
			this.f = clip(this.f, 0, 1)
		}
		camera.think(dt, 1 + this.f)

	},
	draw: function () {

		var c = clip(Math.floor(255 * this.f), 0, 255)
		var bcolor = "rgb(" + c + "," + c + "," + c + ")"

		UFX.draw("[ fs", bcolor, "f0 fs black ss black")
		camera.draw()
		var selected = this.selected, f = this.f
		things.forEach(function (thing) {
			context.save()
			thing.draw(true, thing === selected, f)
			context.restore()
		})
		UFX.draw("]")
		
		drawdebuginfo()
	},
}

UFX.scenes.main = {
	start: function (levelname) {
		this.levelname = levelname
		var level = levels[levelname]
		things = []

		this.piece = new Piece(levelname, level.ppath, 0, 0, level.pr)
		this.athing = this.piece
		this.piece.active = true
		things.push(this.piece)
		level.targetps.forEach(function (p) {
			things.push(new Target(p[0], p[1]))
		})
		if (level.sisterps) {
			level.sisterps.forEach(function (p) {
				var s0 = new Sister(p[0], p[1])
				var s1 = new Sister(p[2], p[3], s0)
				s0.sister = s1
				things.push(s0)
				things.push(s1)
			})
		}
		if (level.daggerps) {
			level.daggerps.forEach(function (p) {
				things.push(new Dagger(p[0], p[1]))
			})
		}
		level.bitks.forEach(function (kspec) {
			var thing0 = things[kspec[0]], thing1 = things[kspec[1]], f = kspec[2] || 0.5
			things.push(new Bit(
				(1-f) * thing0.x + f * thing1.x,
				(1-f) * thing0.y + f * thing1.y
			))
		})
		level.bitxs.forEach(function (xspec) {
			// http://en.wikipedia.org/wiki/Line-line_intersection
			var x = xspec.map(function (k) { return things[k].x })
			var y = xspec.map(function (k) { return things[k].y })
			var D = (x[0] - x[1]) * (y[2] - y[3]) - (y[0] - y[1]) * (x[2] - x[3])
			var px = (x[0]*y[1]-y[0]*x[1])*(x[2]-x[3]) - (x[0]-x[1])*(x[2]*y[3]-y[2]*x[3])
			var py = (x[0]*y[1]-y[0]*x[1])*(y[2]-y[3]) - (y[0]-y[1])*(x[2]*y[3]-y[2]*x[3])
			things.push(new Bit(px/D, py/D))
		})
		things.forEach(function (thing) {
			thing.trans = new Deploy(thing)
		})
		things.reverse()
		this.clickedhome = false
		this.scored = false
		this.homet = 0.3
	},
	thinkargs: function (dt) {
		var clicked = false, pos = [-1000, -1000]
		if (UFX.mouse.active) {
			UFX.mouse.events().forEach(function (event) {
				clicked = clicked || event.type == "down"
			})
			pos = UFX.mouse.pos
		} else if (UFX.touch.active) {
			UFX.touch.events().forEach(function (event) {
				clicked = clicked || event.type == "start"
				pos = event.pos
			})
		}
		return [dt, camera.screentoworld(pos), clicked]
	},
	think: function (dt, mpos, clicked) {
		this.dirty = true
		var halted = false
		things.forEach(function (thing) {
			halted = halted || thing.halts()
		})
		var atarget = null
		this.ptarget = null
		if (!halted && !this.clickedhome) {
			var mx = mpos[0], my = mpos[1]
			things.forEach(function (thing) {
				if (thing.hits(mx, my)) {
					atarget = thing
				}
			})
			if (!clicked && atarget && !atarget.active) {
				this.ptarget = atarget
			}
			if (clicked && atarget && !atarget.active) {
				if (atarget instanceof Dagger) {
					if (this.athing && !(this.athing instanceof Piece)) {
						this.collect(this.athing, atarget)
						atarget.done = true
						things.unshift(new Ghost(atarget, this.athing))
						play("note-3")
					}
				} else {
					if (this.athing) {
						this.athing.active = false
						this.collect(this.athing, atarget)
						if (this.athing.disposible) {
							this.athing.done = true
						}
						things.unshift(new Ghost(this.athing, atarget))
						play("note-3")
					}
					this.athing = atarget
					this.athing.active = true
				}
			}
		}
		things.forEach(function (thing) {
			thing.think(dt)
		})
		things = things.filter(function (thing) { return !thing.done })
		camera.think(dt)

		if (this.clickedhome) {
			this.homet -= dt
			if (this.homet <= 0) {
				if (!this.scored) {
					this.score()
				}
				if (things.length == 1) {
					if (this.superfluous) {
						UFX.scene.swap("select", this.levelname)
						play("note-543")
					} else {
						beaten[this.levelname] = true
						UFX.scene.swap("select", this.levelname, true)
						play(this.levelname == "0" ? "fin" : "note-346")
					}
				}
			}
		}
		if (clicked && atarget === this.piece) {
			this.clickedhome = true
			this.piece.active = false
		}

		if (settings.DEBUG) this.dirty = true
	},
	collect: function (thing0, thing1) {
		var px = thing1.x - thing0.x, py = thing1.y - thing0.y, p2 = px * px + py * py
		things.forEach(function (thing) {
			if (!thing.collectible) return
			var dx = thing.x - thing0.x, dy = thing.y - thing0.y //, d = Math.sqrt(dx * dx + dy * dy)
			var dot = dx * px + dy * py
			var a = clip(dot / p2, 0, 1)
			var ax = thing.x - (thing0.x + a * px)
			var ay = thing.y - (thing0.y + a * py)
			if (ax * ax + ay * ay <= settings.Dmin * settings.Dmin) {
				thing.trans = new GrowFade()
				play("note-68")
			}
		})
	},
	score: function () {
		var athings = things.filter(function (thing) {
			return !thing.done && !(thing.trans && thing.trans.kills)
		})
		if (athings.length > 1) {
			this.superfluous = true
			var piece = this.piece
			athings.forEach(function (thing) {
				if (thing !== piece && !thing.trans) {
					thing.trans = new Undeploy(thing)
				}
			})
		} else {
			this.superfluous = false
		}
		this.scored = true
	},
	draw: function () {
		if (!this.dirty) return
		UFX.draw("[ fs black f0 fs white ss white")
		camera.draw()
		if (this.ptarget && this.athing) {
			UFX.draw("lw 0.05 m", this.athing.x, this.athing.y, "l", this.ptarget.x, this.ptarget.y, "s")
		}
		things.forEach(function (thing) {
			context.save()
			thing.draw()
			context.restore()
		})
		UFX.draw("]")
		
		drawdebuginfo()
	},
}

function drawdebuginfo() {
	if (!settings.DEBUG) return
	var text = canvas.width + "x" + canvas.height + "  " + UFX.ticker.getrates()
	UFX.draw(
		"textbaseline top font 36px~monospace fs white ss black lw 1",
		"fst", text.replace(/ /g, "~"), "12 12"
	)
}



// Put as much code here to keep the HTML minimal
if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}
function zmod(x,z){return((x+z/2)%z+z)%z-z/2}
var tau = 6.283185307179586

var canvas = null, context = null
window.onload = function () {
	document.title = settings.gamename
	canvas = document.createElement("canvas")
	document.body.insertBefore(canvas, null)
	context = canvas.getContext("2d")
	UFX.draw.setcontext(context)
	UFX.maximize.resizemode = "total"
	UFX.maximize.fill(canvas)
	UFX.scene.init({
		minups: 10,
		maxups: 200,
	})
	UFX.scene.push("select")
	UFX.mouse.init(canvas)
	UFX.mouse.qup = false
	UFX.mouse.qdown = true
	UFX.touch.active = false
	UFX.touch.capture = {
		start: true,
	}
	canvas.ontouchstart = function (event) {
		UFX.touch.active = true
		UFX.touch.init(canvas)
		UFX.mouse.active = false
	}
}


UFX.resource.onload = function () {
	for (var s in UFX.resource.sounds) {
		if (s.indexOf("note") > -1) {
			UFX.resource.sounds[s] = new UFX.resource.Multisound(UFX.resource.sounds[s])
		}
	}
}
UFX.resource.load({
	"note-3": "sound/note-3.ogg",
	"note-34": "sound/note-34.ogg",
	"note-68": "sound/note-68.ogg",
	"note-346": "sound/note-346.ogg",
	"note-543": "sound/note-543.ogg",
	"fin": "sound/fin.ogg",
})

function play(sname) {
	if (settings.silent) return
	if (UFX.resource.sounds[sname] && UFX.resource.sounds[sname].play) {
		UFX.resource.sounds[sname].play()
	}
}


