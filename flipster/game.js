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

// UFX.Recorder and UFX.Playback: record a gameplay scene for later playback

// The idea is that you can record the keypresses etc that a player makes, serialize this record
// into an object, upload it to the universefactory.net server, and then download it and play it
// back so you can see exactly what the player did.

// This is pretty fragile and I still haven't worked out exactly how I want the API to look, but
// I did implement it in Mortimer the Lepidopterist and it seems to work.

// This is pretty advanced stuff. I recommend avoiding this module until I've had more practice
// with it.

// If you want to use it, and you don't replicate the server-side functionality yourself, you'll
// have to get an account on universefactory.net and register a game before you can use this.

// Requires UFX.scene

UFX.Recorder = function (obj) {
    if (!(this instanceof UFX.Recorder)) return new UFX.Recorder(obj)
    this.init(obj)
}

UFX.Recorder.prototype = {
    init: function (obj) {
        obj = obj || {}
        this.sessionstart = Date.now()
        this.setnames(obj.gamename, obj.version, obj.playername, obj.sessionname)
        this.setstatefuncs(obj.getprestate, obj.getstate, obj.getpoststate)
        this.sethandler(obj.handler)
        this.setscene(obj.scene || UFX.scene, obj.tethered, obj.tetherswap)
        this.postscript = obj.postscript
        this.keepchapters = obj.keepchapters
        this.copystate = true
        return this.session
    },
    // Register to record with a scene stack (pass in null in order to de-register)
    setnames: function (gamename, version, playername, sessionname) {
        this.gamename = gamename
        this.version = version === undefined ? "" : version
        this.playername = playername || ""
        this.sessionname = sessionname || this.playername + "-" + this.sessionstart
    },
    setstatefuncs: function (getprestate, getstate, getpoststate) {
        this.getprestate = getprestate
        this.getstate = getstate
        this.getpoststate = getpoststate
    },
    sethandler: function (handler) {
        this.handler = handler || {}
    },
    setscene: function (scene, tethered, tetherswap) {
        if (this.scene) this.scene.recorder = null
        this.scene = scene
        this.nchapters = 0
        if (this.scene) {
            if (this.scene.recorder) {
                throw "Specified recording scene already has associated playback"
            }
            this.scene.recorder = this
            this.prestate = this.getprestate && this.getprestate()
            if (this.prestate && this.copystate) this.prestate = JSON.parse(JSON.stringify(this.prestate))
            this.state = []
            this.chapters = []
            this.startchapter()
            this.tethered = tethered
            this.tetherswap = tetherswap
        }
        this.session = {
            gamename: this.gamename,
            version: this.version,
            playername: this.playername,
            name: this.sessionname,
            chapters: this.chapters,
            nchapters: this.nchapters,
            t: this.sessionstart,
        }
    },
    stop: function () {
        this.completechapter()
        var session = this.session
        this.setscene()
        return session
    },
    startchapter: function (chaptername) {
        var chapter = this.chapter
        this.poststate = this.getpoststate && this.getpoststate()
        if (this.poststate && this.copystate) this.poststate = JSON.parse(JSON.stringify(this.poststate))
        this.chapter = {
            n: this.nchapters++,
            name: chaptername,
            t: Date.now(),
            duration: 0,
            prestate: this.prestate,
            state: this.state.slice(0),
            poststate: this.poststate,
            data: []
        }
        this.chapters.push(this.chapter)
        this.data = this.chapter.data
        this.lastdatum = null
        return chapter
    },
    completechapter: function () {
        var jchapter = this.nchapters - 1
        this.chapters[jchapter].duration = Date.now() - this.chapters[jchapter].t
        if (this.postscript) {
            this.pushchapter(jchapter)
            if (!this.keepchapters) {
                this.chapters[jchapter] = null
            }
        } else {
            return this.chapters[jchapter]
        }
    },
    checkpoint: function (chaptername) {
        if (!this.chapter.data.length) return
        var chapter = this.completechapter()
        this.startchapter(chaptername)
        return chapter
    },
    addpush: function (scenename, args) {
        var state = this.getstate && this.getstate()
        if (state && this.copystate) state = JSON.parse(JSON.stringify(state))
        this.lastdatum = [Date.now(), "push", scenename, args, state]
        this.data.push(this.lastdatum)
        this.state.push([scenename, args, state])
    },
    addpop: function () {
        this.lastdatum = [Date.now(), "pop"]
        this.data.push(this.lastdatum)
        this.state.pop()
        if (!this.state.length && this.tethered) this.stop()
    },
    addswap: function (scenename, args) {
        var state = this.getstate && this.getstate()
        if (state && this.copystate) state = JSON.parse(JSON.stringify(state))
        this.lastdatum = [Date.now(), "swap", scenename, args, state]
        this.data.push(this.lastdatum)
        this.state.pop()
        if (!this.state.length && this.tethered && !this.tetherswap) this.stop()
        this.state.push([scenename, args, state])
    },
    addthink: function (args) {
        if (this.paused || this.scene.top().clipplayback) {
            return this.addclip()
        }
        if (!this.lastdatum || this.lastdatum[1] !== "think") {
            this.lastdatum = [Date.now(), "think"]
            this.data.push(this.lastdatum)
        }
        this.lastdatum.push(args)
    },
    addclip: function () {
        if (!this.lastdatum || this.lastdatum[1] !== "clip") {
            this.lastdatum = [Date.now(), "clip", 0, null]
            this.data.push(this.lastdatum)
        }
        this.lastdatum[2]++
        this.lastdatum[3] = Date.now()
    },
    log: function () {
        this.lastdatum = [Date.now(), "log"]
        this.lastdatum.push.apply(this.lastdatum, arguments)
        this.data.push(this.lastdatum)
    },
    handle: function (eventtype) {
        if (typeof eventtype !== "string") throw "Invalid event type: " + eventtype
        switch (eventtype) {
            case "push":  this.addpush(arguments[1], arguments[2]) ; break
            case "pop":   this.addpop() ; break
            case "swap":  this.addswap(arguments[1], arguments[2]) ; break
            case "think": this.addthink(arguments[1]) ; break
            case "clip":  this.addclip() ; break
            case "log": this.log.apply(this, Array.prototype.slice.call(arguments, 1)) ; break
            default:
                var args = Array.prototype.slice.call(arguments, 1)
                this.lastdatum = [Date.now(), eventtype, args]
                this.data.push(this.lastdatum)
                if (this.handler[eventtype]) {
                    this.handler[eventtype].apply(null, args)
                }
        }
    },
    pushchapter: function (jchapter) {
        var req = new XMLHttpRequest()
        req.open("POST", this.postscript, true)
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        var qstring = [
            "act=postchapter",
            "gamename=" + encodeURIComponent(this.session.gamename),
            "gameversion=" + encodeURIComponent(this.session.version),
            "sessionname=" + encodeURIComponent(this.session.name),
            "sessiontime=" + encodeURIComponent(this.session.t),
            "playername=" + encodeURIComponent(this.playername),
            "chapternumber=" + encodeURIComponent(jchapter),
            "chaptertime=" + encodeURIComponent(this.chapters[jchapter].t),
            "chapterduration=" + encodeURIComponent(this.chapters[jchapter].duration),
            "chapterdata=" + encodeURIComponent(JSON.stringify(this.chapters[jchapter])),
        ]
        req.send(qstring.join("&"))
        this.req = req
        // TODO: add errback
    },
}

UFX.Playback = function (session, obj) {
    if (!(this instanceof UFX.Playback)) return new UFX.Playback(session, obj)
    this.session = session
    this.init(obj)
    this.playing = false
    this.stack = new UFX.SceneStack()
    this.stack.resolveargs = false
}

UFX.Playback.prototype = {
    init: function (obj) {
        obj = obj || {}
        this.setstatefuncs(obj.setprestate, obj.setstate, obj.setpoststate)
        this.sethandler(obj.handler)
        this.setscene(obj.scene || UFX.scene)
        this.raw = obj.raw   // Just replay the input rather than recreating the scene stack
        this.syncfactor = obj.syncfactor || 1
        this.sync = obj.sync
        this.persistonstop = obj.persistonstop
        this.ontakedown = obj.ontakedown
        this.cancelcallback = obj.cancelcallback  // why the heck did I make this?
    },
    setstatefuncs: function (setprestate, setstate, setpoststate) {
        this.setprestate = setprestate
        this.setstate = setstate
        this.setpoststate = setpoststate
    },
    sethandler: function (handler) {
        this.handler = handler || {}
    },
    setscene: function (scene) {
        this.scene = scene
    },
    playall: function () {
        this.jchapter = 0
        this.t = 0
        this.playing = true
        this.loadchapter()
        this.scene.ipush(Object.create(this.PlayScene), this)
        this.scene.frozen = true
    },
    playraw: function () {
    	this.raw = true
		this.playall()
	},
    stop: function () {
        this.playing = false
        if (!this.persistonstop) {
            this.takedown()
        }
    },
    takedown: function () {
        this.scene.frozen = false
        this.scene.ipop()
        if (this.raw) {
        	console.log(this.scene._stack)
        	console.log(this.stack._stack)
        	this.scene._stack = this.stack._stack.slice()
        }
        if (this.ontakedown) {
        	this.ontakedown()
    	}
    },
    loadchapter: function () {
        if (!this.session.chapters[this.jchapter]) return false
        this.chapter = JSON.parse(JSON.stringify(this.session.chapters[this.jchapter]))
        if (this.setprestate) this.setprestate.apply(null, this.chapter.prestate)
        this.stack._stack = []
        if (this.raw) this.stack._stack = this.scene._stack.slice()
        this.stack._lastthinker = null
        var state = this.chapter.state
        for (var j = 0 ; j < state.length ; ++j) {
//            console.log(state[j])
//            if (this.setstate) this.setstate.apply(null, state[j][2])
            this.applypush(state[j][0], state[j][1], state[j][2])
        }
        if (this.setpoststate) this.setpoststate.apply(null, this.chapter.poststate)

        this.jdatum = 0
        this.jthink = 0
        this.chaptert = 0
        return true
    },
    // Returns undefined for end of chapter
    nextdatum: function () {
        if (this.jdatum >= this.chapter.data.length) return
        var datum = this.chapter.data[this.jdatum]
        if (datum[1] === "think") {
            if (this.jthink < 2) this.jthink = 2
            if (this.jthink < datum.length) {
                return [datum[0], datum[1], datum[this.jthink++]]
            } else {
                this.jdatum++
                this.jthink = 0
                return this.nextdatum()
            }
        }
        this.jdatum++
        return datum
    },
    applypush: function (scenename, args, state) {
        if (this.setstate) this.setstate.apply(null, state)
        return this.stack.ipush.apply(this.stack, [scenename].concat(args))
    },
    applypop: function () {
        this.stack.ipop()
    },
    // Have to manually implement swap because we want the state to be updated
    //   in between the pop and the push.
    applyswap: function (scenename, args, state) {
		var c0 = this.stack._stack.pop()
		if (c0 && c0.stop) c0.stop()
        if (this.setstate) this.setstate.apply(null, state)
		var c = this.stack.getscene(scenename)
		this.stack._stack.push(c)
		if (c.start) c.start.apply(c, args)
		return c0
    },
    applythink: function (args) {
        this.stack.think.apply(this.stack, args)
        if (this.sync) {
            this.t += args[0]
            this.chaptert += args[0]
        }
    },
    applyclip: function () {
    },
    // log messages from specified chapter, or current chapter if not specified
    getlogs: function (jchapter) {
        if (jchapter == undefined) jchapter = this.jchapter
        var r = [], chapter = this.session.chapters[jchapter]
        chapter.data.forEach(function (datum) {
            if (datum[1] == "log") r.push(datum.slice(2))
        })
        return r
    },
    // log messages from all chapters
    alllogs: function () {
        var r = []
        this.session.chapters.forEach(function (chapter) {
            var n = chapter.name || chapter.n
            chapter.data.forEach(function (datum) {
                if (datum[1] != "log") return
                var d = datum.slice(2)
                d.splice(0, 0, n)
                r.push(d)
            })
        })
        return r
    },
    handle: function (t, eventtype) {
        if (typeof eventtype !== "string") throw "Invalid event type: " + eventtype
        switch (eventtype) {
            case "push":  this.applypush(arguments[2], arguments[3], arguments[4]) ; break
            case "pop":   this.applypop() ; break
            case "swap":  this.applyswap(arguments[2], arguments[3], arguments[4]) ; break
            case "think": this.applythink(arguments[2]) ; break
            case "clip":  this.applyclip() ; break
            default:
                var args = Array.prototype.slice.call(arguments, 2)
                if (this.handler[eventtype]) {
                    this.handler[eventtype].apply(null, args)
                }
        }
    },
    step: function () {
        var datum = this.nextdatum()
        if (!datum) {
            this.jchapter++
            return this.loadchapter() && this.step()
        }
        this.handle.apply(this, datum)
        return true
    },
    PlayScene: {
        start: function (playback) {
            this.playback = playback
            this.t = 0
        },
        think: function (dt) {
            if (!this.playback.playing) return
            if (this.playback.sync) {
                this.t += dt * this.playback.syncfactor
                while (this.t > this.playback.t) {
                    if (!this.playback.step()) {
                        this.playback.stop()
                        return
                    }
                }
            } else {
                if (!this.playback.step()) this.playback.stop()
            }
        },
        draw: function () {
            if (!this.playback.playing) return
            this.playback.stack.draw()
        },
    },
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


// UFX.Thing: component-based entity system

// Call UFX.Thing as a factory or constructor. Call the addcomp method of the resulting object
// to add a component.

// You are strongly recommended to read the documentation with example usage at:
// https://code.google.com/p/unifac/wiki/UFXDocumentation#UFX.Thing_:_component-based_entities
// https://code.google.com/p/unifac/wiki/UFXComponentModel

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




// UFX.noise module: Perlin noise generation

// Actually this uses a slight variation of Perlin noise that I prefer, where the gradient vectors
// follow an n-dimensional Gaussian distribution rather than being uniformly-distributed unit
// vectors.

// TODO: add documentation to the unifac wiki
// For now, please see examples in UFX/test/noise.html


var UFX = UFX || {}

// The basic function that returns noise at a given position in n-space.
// This a slow, general reference implementation. Most calls should use a faster function
//   that computes many values at once.
UFX.noise = function (p, wrapsize) {
    var n = p.length
    var q = new Array(n)  // coordinates of lattice points on all sides of the given point
    var a = new Array(n)  // distance to lower lattice point
    for (var j = 0 ; j < n ; ++j) {
        var w = wrapsize ? wrapsize[j] : 256
        var i = Math.floor(p[j]) % w
        if (i < 0) i += w
        q[j] = [i, (i+1) % w]
        a[j] = p[j] - Math.floor(p[j])
    }
    var r = 0  // return value
    // Loop through the 2^n lattice points bordering this point
    for (var k = 0, kmax = 1 << n ; k < kmax ; ++k) {
        var v = new Array(n)
        for (var j = 0 ; j < n ; ++j) {
            v[j] = q[j][(k >> j) & 1]
        }
        var dprod = 0, cprod = 1
        for (var j = 0 ; j < n ; ++j) {
            var g = UFX.noise._gvalue(v, j)  // the j-th component of the gradient
            var t = ((k >> j) & 1) ? 1 - a[j] : -a[j]  // distance along the j-axis to lattice point
            dprod += g * t  // dot product sum
            cprod *= 1 - t * t * (3 - 2 * Math.abs(t))  // cross-fade factor
        }
        r += dprod * cprod
    }
    return r / 1000. / Math.sqrt(n)
}

// A tileable 2d noise map
UFX.noise.wrap2d = function (s, ngrid, soff, noff) {
    var sx = s[0], sy = s[1], size = sx * sy
    var val = new Array(size)
    var gx0 = new Array(sx), gx1 = new Array(sx)
    var ax = new Array(sx), bx = new Array(sx), cax = new Array(sx), cbx = new Array(sx)
    ngrid = ngrid || [8, 8]
    var nx = ngrid[0], ny = ngrid[1], n = nx * ny
    noff = noff || [0, 0]
    var gradx = new Array(n), grady = new Array(n)
    for (var gy = 0, gj = 0 ; gy < ny ; ++gy) {
        for (var gx = 0 ; gx < nx ; ++gx, ++gj) {
            gradx[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1]], 0)
            grady[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1]], 1)
        }
    }
    soff = soff || [0, 0]
    for (var px = 0 ; px < sx ; ++px) {
        var x = (px + 0.5) * nx / sx + soff[0]
        gx0[px] = Math.floor(x) % nx
        if (gx0[px] < 0) gx0[px] += nx
        gx1[px] = (gx0[px] + 1) % nx
        var axj = x - Math.floor(x), bxj = 1 - axj
        ax[px] = axj
        bx[px] = bxj
        cax[px] = axj*axj*(3-2*axj)
        cbx[px] = 1 - cax[px]
    }
    for (var py = 0, pj = 0 ; py < sy ; ++py) {
        var y = (py + 0.5) * ny / sy + soff[1]
        var gy0j = Math.floor(y) % ny
        if (gy0j < 0) gy0j += ny
        var gy1j = (gy0j + 1) % ny
        var ayj = y - Math.floor(y), byj = 1 - ayj
        var cayj = ayj*ayj*(3-2*ayj), cbyj = 1 - cayj
        for (var px = 0 ; px < sx ; ++px, ++pj) {
            var gx0j = gx0[px], gx1j = gx1[px]
            var axj = ax[px], bxj = bx[px], caxj = cax[px], cbxj = cbx[px]
            var j00 = gx0j + gy0j * nx, j01 = gx0j + gy1j * nx
            var j10 = gx1j + gy0j * nx, j11 = gx1j + gy1j * nx
            val[pj] = ((-axj*gradx[j00] - ayj*grady[j00]) * cbyj +
                       (-axj*gradx[j01] + byj*grady[j01]) * cayj) * cbxj +
                      (( bxj*gradx[j10] - ayj*grady[j10]) * cbyj +
                       ( bxj*gradx[j11] + byj*grady[j11]) * cayj) * caxj
            val[pj] /= 1414.213
        }
    }
    return val
}

// A tileable 2d noise map that's a slice of a 3d map (so it can morph over time)
UFX.noise.wrapslice = function (s, zoff, ngrid, soff, noff) {
    var sx = s[0], sy = s[1], size = sx * sy
    var val = new Array(size)
    var gx0 = new Array(sx), gx1 = new Array(sx)
    var ax = new Array(sx), bx = new Array(sx), cax = new Array(sx), cbx = new Array(sx)
    ngrid = ngrid || [8, 8, 256]
    if (ngrid.length == 2) ngrid = [ngrid[0], ngrid[1], 256]
    var nx = ngrid[0], ny = ngrid[1], nz = ngrid[2], n = nx * ny
    noff = noff || [0, 0]
    var gz0 = Math.floor(zoff) % nz
    if (gz0 < 0) gz0 += nz
    var gz1 = (gz0 + 1) % nz
    var az = zoff - Math.floor(zoff), bz = 1 - az
    var caz = az*az*(3-2*az), cbz = 1 - caz
    var gradx0 = new Array(n), grady0 = new Array(n), gradz0 = new Array(n)
    var gradx1 = new Array(n), grady1 = new Array(n), gradz1 = new Array(n)
    for (var gy = 0, gj = 0 ; gy < ny ; ++gy) {
        for (var gx = 0 ; gx < nx ; ++gx, ++gj) {
            gradx0[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1], gz0], 0)
            grady0[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1], gz0], 1)
            gradz0[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1], gz0], 2)
            gradx1[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1], gz1], 0)
            grady1[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1], gz1], 1)
            gradz1[gj] = UFX.noise._gvalue([gx + noff[0], gy + noff[1], gz1], 2)
        }
    }
    soff = soff || [0, 0]
    for (var px = 0 ; px < sx ; ++px) {
        var x = (px + 0.5) * nx / sx + soff[0]
        gx0[px] = Math.floor(x) % nx
        if (gx0[px] < 0) gx0[px] += nx
        gx1[px] = (gx0[px] + 1) % nx
        var axj = x - Math.floor(x), bxj = 1 - axj
        ax[px] = axj
        bx[px] = bxj
        cax[px] = axj*axj*(3-2*axj)
        cbx[px] = 1 - cax[px]
    }
    for (var py = 0, pj = 0 ; py < sy ; ++py) {
        var y = (py + 0.5) * ny / sy + soff[1]
        var gy0j = Math.floor(y) % ny
        if (gy0j < 0) gy0j += ny
        var gy1j = (gy0j + 1) % ny
        var ayj = y - Math.floor(y), byj = 1 - ayj
        var cayj = ayj*ayj*(3-2*ayj), cbyj = 1 - cayj
        for (var px = 0 ; px < sx ; ++px, ++pj) {
            var gx0j = gx0[px], gx1j = gx1[px]
            var axj = ax[px], bxj = bx[px], caxj = cax[px], cbxj = cbx[px]
            var j00 = gx0j + gy0j * nx, j01 = gx0j + gy1j * nx
            var j10 = gx1j + gy0j * nx, j11 = gx1j + gy1j * nx
            val[pj] = (((-axj*gradx0[j00] - ayj*grady0[j00] - az*gradz0[j00]) * cbyj +
                        (-axj*gradx0[j01] + byj*grady0[j01] - az*gradz0[j01]) * cayj) * cbxj +
                       (( bxj*gradx0[j10] - ayj*grady0[j10] - az*gradz0[j10]) * cbyj +
                        ( bxj*gradx0[j11] + byj*grady0[j11] - az*gradz0[j11]) * cayj) * caxj) * cbz +
                      (((-axj*gradx1[j00] - ayj*grady1[j00] + bz*gradz1[j00]) * cbyj +
                        (-axj*gradx1[j01] + byj*grady1[j01] + bz*gradz1[j01]) * cayj) * cbxj +
                       (( bxj*gradx1[j10] - ayj*grady1[j10] + bz*gradz1[j10]) * cbyj +
                        ( bxj*gradx1[j11] + byj*grady1[j11] + bz*gradz1[j11]) * cayj) * caxj) * caz
            val[pj] /= 1732.051
        }
    }
    return val
}

// Fractalize a noise map
// TODO: handle non-power-of-2 sizes
UFX.noise.fractalize = function (v, s, levels) {
    var sx = s[0], sy = s[1]  // TODO: assume sqrt sizes if s is not given
    var sx2 = sx/2, sy2 = sy/2, s2 = sx2 * sy2
    if (sx2 < 2 || sy2 < 2) return
    var v2 = new Array(sx2 * sy2)
    for (var y = 0, j = 0 ; y < sy ; y += 2) {
        var h = y * sx
        for (var x = 0 ; x < sx ; x += 2, ++j) {
            v2[j] = v[h + x]
        }
    }
    if (levels !== 1) {
        UFX.noise.fractalize(v2, [sx2, sy2], (typeof levels == "number" ? levels - 1 : levels))
    }
    for (var j = 0 ; j < s2 ; ++j) v2[j] *= 0.5
    for (var y2 = 0, j2 = 0 ; y2 < sy2 ; ++y2) {
        for (var x2 = 0 ; x2 < sx2 ; ++x2, ++j2) {
            var val = v2[j2]
            v[y2*sx+x2] += val
            v[y2*sx+x2+sx2] += val
            v[(y2+sy2)*sx+x2] += val
            v[(y2+sy2)*sx+x2+sx2] += val
        }
    }
}



// TODO: can we get by with 64 elements?

// 256 values in a Gaussian normal distribution (multiplied by 1000 for convenience)
// >>> a = [math.sqrt(2) * scipy.special.erfinv((0.5 + j) / 128. - 1.) for j in range(256)]
// >>> ",".join([str(int(x*1000)) for x in a])
UFX.noise._grad = [-2885,-2520,-2335,-2206,-2106,-2024,-1953,-1891,-1835,-1785,-1739,-1696,-1656,
  -1618,-1583,-1550,-1518,-1488,-1459,-1431,-1404,-1378,-1353,-1329,-1306,-1283,-1261,-1240,-1219,
  -1199,-1179,-1159,-1140,-1122,-1104,-1086,-1068,-1051,-1034,-1018,-1001,-985,-970,-954,-939,-924,
  -909,-894,-879,-865,-851,-837,-823,-809,-796,-783,-769,-756,-743,-730,-718,-705,-693,-680,-668,
  -656,-644,-632,-620,-608,-596,-584,-573,-561,-550,-539,-527,-516,-505,-494,-483,-472,-461,-450,
  -439,-428,-418,-407,-396,-386,-375,-365,-354,-344,-334,-323,-313,-303,-292,-282,-272,-262,-252,
  -242,-232,-222,-212,-202,-192,-182,-172,-162,-152,-142,-132,-122,-112,-102,-93,-83,-73,-63,-53,
  -44,-34,-24,-14,-4,4,14,24,34,44,53,63,73,83,93,102,112,122,132,142,152,162,172,182,192,202,212,
  222,232,242,252,262,272,282,292,303,313,323,334,344,354,365,375,386,396,407,418,428,439,450,461,
  472,483,494,505,516,527,539,550,561,573,584,596,608,620,632,644,656,668,680,693,705,718,730,743,
  756,769,783,796,809,823,837,851,865,879,894,909,924,939,954,970,985,1001,1018,1034,1051,1068,1086,
  1104,1122,1140,1159,1179,1199,1219,1240,1261,1283,1306,1329,1353,1378,1404,1431,1459,1488,1518,
  1550,1583,1618,1656,1696,1739,1785,1835,1891,1953,2024,2106,2206,2335,2520,2885]
// A random permutation of [0,256)
UFX.noise._perm = [127,13,214,153,195,181,253,32,17,180,95,9,159,81,209,129,31,157,21,76,118,79,91,
  0,38,234,8,147,148,227,206,78,22,223,198,109,240,46,115,71,133,175,232,14,168,37,196,49,213,106,
  62,119,85,61,104,220,139,203,44,73,189,237,39,210,28,57,6,172,164,40,51,186,233,52,204,199,50,243,
  161,126,249,7,36,244,131,231,24,1,252,142,27,53,188,254,137,184,92,201,136,165,43,145,205,216,33,
  19,101,75,156,60,228,215,197,185,248,30,26,200,107,96,11,247,173,111,108,235,166,241,105,120,47,
  110,130,167,112,208,160,154,42,16,48,34,202,221,74,122,236,64,143,246,103,88,222,238,162,155,163,
  80,230,72,25,176,68,158,121,124,63,177,113,41,3,45,86,55,114,67,134,212,58,242,179,192,35,170,211,
  15,149,224,140,66,128,219,193,2,229,117,93,54,132,135,218,169,187,207,191,144,138,245,190,65,23,
  146,123,56,152,194,171,18,4,100,150,255,99,98,183,83,70,97,141,178,182,250,84,10,239,217,94,116,
  174,29,151,82,12,225,59,125,20,5,69,251,77,102,90,89,226,87]
// Use the permutation to convert an vector of indices into a gradient value
UFX.noise._gvalue = function (v, n) {
    var i = UFX.noise._perm[n]
    for (var j = 0 ; j < v.length ; ++j) i = UFX.noise._perm[(i + v[j]) & 255]
    return UFX.noise._grad[i]
}




var walkthrough = {"0":{"version":"","playername":"","name":"-1361405723439","chapters":[{"n":0,"t":1361405723440,"duration":8512,"state":[],"data":[[1361405723440,"think",[0.001,null,false,{}],[0.08,null,false,{}],[0.018000000000000002,null,false,{}],[0.037,null,false,{}],[0.016,null,false,{}],[0.017,null,false,{}],[0.017,null,false,{}],[0.016,null,false,{}],[0.017,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.017,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.08600000000000001,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.017,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.024,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.017,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,null,false,{}],[0.016,[355,1],false,{}],[0.017,[353,16],false,{}],[0.016,[346,41],false,{}],[0.016,[313,133],false,{}],[0.016,[291,196],false,{}],[0.016,[272,247],false,{}],[0.016,[249,286],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.017,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[243,289],false,{}],[0.016,[240,302],false,{}],[0.016,[239,318],false,{}],[0.017,[238,366],false,{}],[0.016,[240,393],false,{}],[0.016,[242,421],false,{}],[0.016,[248,479],false,{}],[0.016,[254,507],false,{}],[0.016,[255,516],false,{}],[0.016,[259,534],false,{}],[0.016,[260,538],false,{}],[0.016,[261,540],false,{}],[0.016,[261,540],false,{}],[0.017,[262,540],false,{}],[0.016,[262,540],false,{}],[0.016,[262,539],false,{}],[0.016,[262,539],false,{}],[0.016,[262,538],false,{}],[0.016,[263,537],false,{}],[0.016,[264,533],false,{}],[0.016,[268,525],false,{}],[0.016,[272,517],false,{}],[0.016,[274,510],false,{}],[0.016,[275,492],false,{}],[0.017,[275,478],false,{}],[0.018000000000000002,[273,456],false,{}],[0.016,[273,450],false,{}],[0.016,[272,444],false,{}],[0.017,[272,443],false,{}],[0.016,[272,442],false,{}],[0.016,[272,442],false,{}],[0.016,[272,442],false,{}],[0.016,[272,442],false,{}],[0.016,[274,443],false,{}],[0.016,[289,447],false,{}],[0.016,[296,449],false,{}],[0.016,[300,450],false,{}],[0.016,[305,452],false,{}],[0.016,[306,452],false,{}],[0.017,[306,452],false,{}],[0.016,[306,453],false,{}],[0.016,[306,454],false,{}],[0.016,[305,455],false,{}],[0.016,[305,457],false,{}],[0.016,[304,458],false,{}],[0.016,[304,459],false,{}],[0.016,[304,460],false,{}],[0.016,[303,461],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.017,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[303,462],false,{}],[0.016,[304,462],false,{}],[0.016,[304,462],false,{}],[0.016,[304,463],false,{}],[0.016,[304,463],false,{}],[0.017,[304,463],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[305,464],false,{}],[0.016,[305,464],false,{}],[0.016,[305,464],false,{}],[0.016,[305,464],false,{}],[0.017,[305,464],false,{}],[0.016,[305,464],false,{}],[0.016,[305,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,464],false,{}],[0.016,[304,465],false,{}],[0.016,[304,465],false,{}],[0.016,[304,465],false,{}],[0.016,[304,465],false,{}],[0.016,[304,465],false,{}],[0.016,[304,465],false,{}],[0.017,[304,465],false,{}],[0.018000000000000002,[304,465],false,{}],[0.016,[304,465],false,{}],[0.016,[303,465],false,{}],[0.016,[303,465],false,{}],[0.017,[303,465],false,{}],[0.016,[303,465],false,{}],[0.016,[303,465],false,{}],[0.016,[303,465],false,{}],[0.016,[303,465],false,{}],[0.016,[303,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.017,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,465],false,{}],[0.016,[302,464],false,{}],[0.016,[302,464],false,{}],[0.016,[302,464],false,{}],[0.016,[302,464],false,{}],[0.016,[302,464],false,{}],[0.016,[301,464],false,{}],[0.016,[301,463],false,{}],[0.016,[301,463],false,{}],[0.017,[301,463],false,{}],[0.016,[301,462],false,{}],[0.016,[301,462],false,{}],[0.016,[301,462],false,{}],[0.016,[300,462],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.017,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,461],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.017,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[299,460],false,{}],[0.016,[299,460],false,{}],[0.016,[299,460],false,{}],[0.016,[299,460],false,{}],[0.016,[299,460],false,{}],[0.016,[299,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.017,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,460],false,{}],[0.017,[300,460],false,{}],[0.016,[300,460],false,{}],[0.016,[300,459],false,{}],[0.016,[300,459],false,{}],[0.017,[300,459],false,{}],[0.016,[300,459],false,{}],[0.016,[300,459],false,{}],[0.016,[301,459],false,{}],[0.016,[301,459],false,{}],[0.016,[301,459],false,{}],[0.016,[301,459],false,{}],[0.016,[301,458],false,{}],[0.016,[301,458],false,{}],[0.016,[301,458],false,{}],[0.016,[301,458],false,{}],[0.016,[301,458],false,{}],[0.017,[301,458],false,{}],[0.016,[301,458],false,{}],[0.016,[300,458],false,{}],[0.016,[300,458],false,{}],[0.016,[300,458],false,{}],[0.016,[300,458],false,{}],[0.016,[300,458],true,{}],[0.026000000000000002,[300,457],false,{}],[0.016,[300,457],false,{}],[0.016,[300,457],false,{}],[0.016,[300,457],false,{}],[0.016,[301,457],false,{}],[0.016,[301,457],false,{}],[0.016,[301,457],false,{}],[0.016,[301,457],false,{}],[0.016,[301,457],false,{}],[0.017,[301,457],false,{}],[0.016,[304,456],false,{}],[0.016,[312,455],false,{}],[0.016,[328,452],false,{}],[0.016,[378,443],false,{}],[0.016,[408,436],false,{}],[0.016,[475,415],false,{}],[0.016,[506,403],false,{}],[0.016,[536,392],false,{}],[0.016,[565,377],false,{}],[0.016,[572,374],false,{}],[0.016,[583,369],false,{}],[0.017,[596,365],false,{}],[0.016,[601,363],false,{}],[0.016,[603,363],false,{}],[0.016,[612,361],false,{}],[0.016,[619,360],false,{}],[0.016,[628,357],false,{}],[0.016,[637,353],false,{}],[0.016,[651,348],false,{}],[0.016,[656,346],false,{}],[0.016,[657,345],false,{}],[0.016,[658,345],false,{}],[0.017,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[657,345],false,{}],[0.016,[657,345],false,{}],[0.016,[657,345],false,{}],[0.017,[657,345],false,{}],[0.016,[657,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,345],false,{}],[0.016,[658,344],false,{}],[0.016,[659,344],false,{}],[0.016,[659,344],false,{}],[0.016,[660,344],false,{}],[0.016,[660,343],false,{}],[0.016,[661,343],false,{}],[0.017,[661,342],false,{}],[0.016,[661,342],false,{}],[0.016,[662,341],false,{}],[0.016,[663,341],false,{}],[0.016,[664,341],false,{}],[0.016,[666,341],false,{}],[0.016,[667,341],false,{}],[0.016,[668,341],false,{}],[0.016,[670,341],false,{}],[0.016,[670,341],false,{}],[0.016,[671,341],false,{}],[0.017,[671,340],false,{}],[0.016,[671,340],false,{}],[0.016,[671,340],false,{}],[0.016,[672,340],false,{}],[0.016,[672,340],false,{}],[0.016,[672,340],false,{}],[0.016,[673,339],false,{}],[0.016,[675,338],false,{}],[0.016,[676,338],false,{}],[0.016,[677,338],false,{}],[0.016,[678,337],false,{}],[0.016,[678,337],false,{}],[0.017,[678,337],false,{}],[0.016,[680,337],false,{}],[0.016,[681,337],false,{}],[0.016,[681,337],false,{}],[0.016,[689,337],false,{}],[0.016,[698,336],false,{}],[0.016,[705,336],false,{}],[0.016,[717,335],false,{}],[0.016,[721,334],false,{}],[0.016,[724,334],false,{}],[0.016,[727,334],false,{}],[0.017,[727,334],false,{}],[0.016,[727,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.019,[726,334],false,{}],[0.013000000000000001,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.017,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[726,334],false,{}],[0.016,[727,334],false,{}],[0.016,[727,333],false,{}],[0.016,[727,333],false,{}],[0.016,[727,333],false,{}],[0.016,[727,333],false,{}],[0.016,[728,333],false,{}],[0.017,[728,333],false,{}],[0.016,[728,332],false,{}],[0.016,[728,332],false,{}],[0.016,[729,332],false,{}],[0.016,[729,332],false,{}],[0.016,[729,331],false,{}],[0.016,[729,331],false,{}],[0.016,[729,331],false,{}],[0.016,[729,331],false,{}],[0.016,[729,331],false,{}],[0.016,[729,331],false,{}],[0.016,[729,331],false,{}],[0.017,[729,330],false,{}],[0.016,[729,330],false,{}],[0.016,[728,330],false,{}],[0.016,[728,330],false,{}],[0.016,[728,330],false,{}],[0.016,[728,330],false,{}],[0.016,[728,330],false,{}],[0.016,[728,330],false,{}],[0.017,[728,330],false,{}],[0.016,[728,330],false,{}]]]}],"nchapters":1,"t":1361405723439},"1":{"version":"","playername":"","name":"-1361405732068","chapters":[{"n":0,"t":1361405732069,"duration":7929,"state":[],"data":[[1361405732069,"think",[0.1,[728,330],false,{}],[0.016,[724,327],false,{}],[0.016,[723,327],false,{}],[0.018000000000000002,[723,326],false,{}],[0.016,[722,326],false,{}],[0.016,[722,325],false,{}],[0.016,[722,325],false,{}],[0.016,[722,325],false,{}],[0.016,[722,324],false,{}],[0.016,[723,324],false,{}],[0.016,[723,324],false,{}],[0.016,[723,324],false,{}],[0.017,[723,324],false,{}],[0.016,[723,324],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.017,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,323],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.017,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[723,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.017,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[724,322],false,{}],[0.016,[723,323],false,{}],[0.016,[715,324],false,{}],[0.016,[697,327],false,{}],[0.016,[668,330],false,{}],[0.016,[602,339],false,{}],[0.016,[566,346],false,{}],[0.016,[517,360],false,{}],[0.017,[458,383],false,{}],[0.016,[433,393],false,{}],[0.016,[421,397],false,{}],[0.016,[412,402],false,{}],[0.016,[408,403],false,{}],[0.016,[403,404],false,{}],[0.016,[396,405],false,{}],[0.016,[377,407],false,{}],[0.016,[369,407],false,{}],[0.016,[360,407],false,{}],[0.016,[356,407],false,{}],[0.017,[356,406],false,{}],[0.019,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.017,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[356,406],false,{}],[0.016,[355,407],false,{}],[0.017,[354,407],false,{}],[0.016,[353,407],false,{}],[0.016,[350,406],false,{}],[0.016,[347,406],false,{}],[0.016,[344,405],false,{}],[0.016,[340,403],false,{}],[0.016,[339,402],false,{}],[0.016,[339,402],false,{}],[0.016,[338,402],false,{}],[0.017,[338,402],false,{}],[0.016,[338,402],false,{}],[0.016,[338,402],false,{}],[0.016,[338,402],false,{}],[0.016,[338,402],false,{}],[0.016,[337,402],false,{}],[0.016,[336,402],false,{}],[0.016,[331,400],false,{}],[0.016,[328,400],false,{}],[0.016,[327,399],false,{}],[0.016,[326,399],false,{}],[0.017,[326,399],false,{}],[0.016,[326,399],false,{}],[0.016,[326,399],false,{}],[0.016,[327,399],false,{}],[0.016,[327,399],false,{}],[0.016,[327,400],false,{}],[0.016,[327,400],false,{}],[0.016,[327,400],false,{}],[0.016,[327,400],false,{}],[0.016,[327,400],false,{}],[0.016,[327,401],false,{}],[0.016,[327,401],false,{}],[0.016,[327,401],false,{}],[0.017,[327,401],false,{}],[0.016,[327,401],false,{}],[0.016,[327,401],false,{}],[0.016,[326,401],false,{}],[0.016,[326,401],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.021,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.017,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,402],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[326,403],false,{}],[0.016,[327,403],false,{}],[0.017,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.017,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[327,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[329,403],false,{}],[0.017,[329,403],false,{}],[0.016,[329,403],false,{}],[0.016,[329,403],false,{}],[0.016,[329,402],false,{}],[0.016,[330,402],false,{}],[0.016,[330,402],false,{}],[0.016,[330,402],false,{}],[0.016,[330,403],false,{}],[0.016,[330,403],false,{}],[0.016,[330,403],false,{}],[0.016,[330,403],false,{}],[0.016,[330,403],false,{}],[0.017,[330,403],false,{}],[0.016,[329,403],false,{}],[0.016,[329,403],false,{}],[0.016,[329,403],false,{}],[0.016,[329,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,403],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.017,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[328,402],false,{}],[0.016,[327,402],false,{}],[0.016,[327,402],false,{}],[0.016,[327,402],false,{}],[0.016,[327,402],false,{}],[0.016,[327,402],false,{}],[0.017,[327,402],false,{}],[0.016,[326,401],false,{}],[0.016,[325,401],false,{}],[0.016,[324,401],false,{}],[0.016,[324,401],false,{}],[0.016,[323,400],false,{}],[0.016,[323,400],false,{}],[0.016,[323,400],false,{}],[0.016,[323,400],false,{}],[0.016,[323,400],false,{}],[0.016,[322,400],false,{}],[0.017,[322,400],false,{}],[0.016,[322,399],false,{}],[0.016,[322,399],false,{}],[0.016,[321,399],false,{}],[0.016,[321,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.017,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[320,399],false,{}],[0.016,[319,399],false,{}],[0.016,[319,399],false,{}],[0.016,[319,398],false,{}],[0.016,[318,398],false,{}],[0.017,[318,398],false,{}],[0.016,[317,398],false,{}],[0.016,[317,398],false,{}],[0.016,[317,398],false,{}],[0.016,[316,398],false,{}],[0.016,[316,398],false,{}],[0.016,[316,398],false,{}],[0.016,[316,398],false,{}],[0.016,[315,398],false,{}],[0.016,[315,397],false,{}],[0.016,[315,397],false,{}],[0.017,[314,397],false,{}],[0.016,[314,397],false,{}],[0.016,[313,397],false,{}],[0.016,[313,396],false,{}],[0.019,[312,396],false,{}],[0.016,[312,396],false,{}],[0.016,[311,396],false,{}],[0.016,[310,396],false,{}],[0.016,[310,396],false,{}],[0.016,[310,396],false,{}],[0.016,[309,396],false,{}],[0.016,[309,396],false,{}],[0.016,[309,395],false,{}],[0.016,[308,395],false,{}],[0.016,[308,395],false,{}],[0.016,[308,395],false,{}],[0.017,[308,395],false,{}],[0.016,[308,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[309,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.017,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.017,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],true,{}],[0.021,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.017,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[310,395],false,{}],[0.016,[311,395],false,{}],[0.016,[311,395],false,{}],[0.016,[311,395],false,{}],[0.016,[312,395],false,{}],[0.016,[313,396],false,{}],[0.016,[314,396],false,{}],[0.016,[315,396],false,{}],[0.016,[317,396],false,{}],[0.016,[320,396],false,{}],[0.017,[327,394],false,{}],[0.016,[349,385],false,{}],[0.016,[407,359],false,{}],[0.016,[438,347],false,{}],[0.016,[469,335],false,{}],[0.016,[524,315],false,{}],[0.016,[549,307],false,{}],[0.016,[572,300],false,{}],[0.016,[589,295],false,{}],[0.016,[607,289],false,{}],[0.016,[613,286],false,{}],[0.016,[620,283],false,{}],[0.017,[645,279],false,{}],[0.016,[653,277],false,{}],[0.016,[667,275],false,{}],[0.016,[691,272],false,{}],[0.016,[699,271],false,{}],[0.016,[705,270],false,{}],[0.016,[712,270],false,{}],[0.016,[712,270],false,{}],[0.016,[714,270],false,{}],[0.016,[715,270],false,{}],[0.017,[715,271],false,{}],[0.016,[716,271],false,{}],[0.016,[716,271],false,{}],[0.016,[716,271],false,{}],[0.016,[716,271],false,{}],[0.016,[718,271],false,{}],[0.016,[722,271],false,{}],[0.016,[724,271],false,{}],[0.016,[725,272],false,{}],[0.016,[726,272],false,{}],[0.017,[726,272],false,{}],[0.016,[726,272],false,{}],[0.016,[726,272],false,{}],[0.016,[726,272],false,{}],[0.016,[727,272],false,{}],[0.016,[727,272],false,{}],[0.016,[727,272],false,{}],[0.016,[727,272],false,{}],[0.016,[727,271],false,{}],[0.016,[727,271],false,{}],[0.017,[727,271],false,{}],[0.016,[727,271],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.019,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.023,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.033,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}],[0.017,[726,270],false,{}],[0.016,[726,270],false,{}],[0.016,[726,270],false,{}]]]}],"nchapters":1,"t":1361405732068},"2":{"version":"","playername":"","name":"-1361405773493","chapters":[{"n":0,"t":1361405773493,"duration":11337,"state":[],"data":[[1361405773493,"think",[0.084,[327,339],false,{}],[0.017,[348,398],false,{}],[0.016,[349,402],false,{}],[0.016,[351,409],false,{}],[0.016,[352,411],false,{}],[0.016,[354,414],false,{}],[0.016,[355,418],false,{}],[0.016,[355,418],false,{}],[0.016,[355,419],false,{}],[0.016,[355,419],false,{}],[0.016,[355,419],false,{}],[0.016,[355,419],false,{}],[0.016,[357,419],false,{}],[0.017,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[358,419],false,{}],[0.017,[358,419],false,{}],[0.016,[358,419],false,{}],[0.016,[359,420],false,{}],[0.016,[361,422],false,{}],[0.016,[363,425],false,{}],[0.016,[365,429],false,{}],[0.016,[368,433],false,{}],[0.016,[372,443],false,{}],[0.016,[374,448],false,{}],[0.016,[375,455],false,{}],[0.016,[375,456],false,{}],[0.017,[375,456],false,{}],[0.016,[375,456],false,{}],[0.016,[374,456],false,{}],[0.016,[374,456],false,{}],[0.016,[373,456],false,{}],[0.016,[371,455],false,{}],[0.016,[370,455],false,{}],[0.016,[368,454],false,{}],[0.016,[367,453],false,{}],[0.016,[366,453],false,{}],[0.017,[365,452],false,{}],[0.016,[364,452],false,{}],[0.016,[363,451],false,{}],[0.016,[362,451],false,{}],[0.016,[360,450],false,{}],[0.016,[360,450],false,{}],[0.016,[359,450],false,{}],[0.016,[358,449],false,{}],[0.016,[358,449],false,{}],[0.016,[358,449],false,{}],[0.017,[357,449],false,{}],[0.016,[357,448],false,{}],[0.016,[357,448],false,{}],[0.016,[356,448],false,{}],[0.016,[356,448],false,{}],[0.016,[356,448],false,{}],[0.016,[356,448],false,{}],[0.016,[355,448],false,{}],[0.016,[355,448],false,{}],[0.016,[354,448],false,{}],[0.016,[354,448],false,{}],[0.016,[354,448],false,{}],[0.016,[353,448],false,{}],[0.017,[352,448],false,{}],[0.016,[352,448],false,{}],[0.016,[351,448],false,{}],[0.016,[351,448],false,{}],[0.016,[350,448],false,{}],[0.016,[350,448],false,{}],[0.016,[349,448],false,{}],[0.016,[349,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.017,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.017,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[348,448],false,{}],[0.016,[347,448],false,{}],[0.016,[347,448],false,{}],[0.016,[347,448],false,{}],[0.016,[347,448],false,{}],[0.016,[346,448],false,{}],[0.016,[346,448],false,{}],[0.017,[346,448],false,{}],[0.018000000000000002,[346,448],false,{}],[0.016,[346,448],false,{}],[0.016,[345,448],false,{}],[0.016,[345,448],false,{}],[0.016,[345,448],false,{}],[0.016,[344,448],false,{}],[0.016,[344,448],false,{}],[0.017,[344,448],false,{}],[0.016,[343,448],false,{}],[0.016,[343,448],false,{}],[0.016,[342,448],false,{}],[0.016,[342,448],false,{}],[0.016,[342,448],false,{}],[0.016,[341,448],false,{}],[0.016,[341,448],false,{}],[0.016,[340,448],false,{}],[0.016,[340,449],false,{}],[0.016,[339,449],false,{}],[0.016,[339,449],false,{}],[0.017,[338,449],false,{}],[0.016,[338,449],false,{}],[0.016,[338,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,449],false,{}],[0.017,[337,449],false,{}],[0.016,[337,449],false,{}],[0.016,[337,450],false,{}],[0.016,[337,450],false,{}],[0.016,[338,450],false,{}],[0.016,[338,450],false,{}],[0.016,[339,450],false,{}],[0.017,[339,451],false,{}],[0.016,[339,451],false,{}],[0.016,[340,451],false,{}],[0.016,[340,451],false,{}],[0.016,[341,451],false,{}],[0.016,[341,451],false,{}],[0.016,[341,452],false,{}],[0.016,[341,452],false,{}],[0.016,[342,452],false,{}],[0.016,[342,452],false,{}],[0.016,[342,452],false,{}],[0.016,[343,452],false,{}],[0.017,[343,452],false,{}],[0.016,[343,452],false,{}],[0.016,[343,452],false,{}],[0.016,[343,452],false,{}],[0.016,[343,452],false,{}],[0.016,[343,452],false,{}],[0.016,[344,452],false,{}],[0.016,[344,452],false,{}],[0.016,[344,452],false,{}],[0.016,[345,452],false,{}],[0.016,[345,452],false,{}],[0.016,[345,452],false,{}],[0.017,[346,452],false,{}],[0.016,[346,452],false,{}],[0.016,[346,452],false,{}],[0.016,[346,452],false,{}],[0.016,[348,452],false,{}],[0.016,[348,452],false,{}],[0.016,[348,452],false,{}],[0.016,[348,452],true,{}],[0.02,[349,452],false,{}],[0.017,[349,452],false,{}],[0.016,[349,451],false,{}],[0.016,[349,451],false,{}],[0.016,[350,449],false,{}],[0.016,[351,448],false,{}],[0.016,[351,447],false,{}],[0.016,[352,445],false,{}],[0.016,[352,441],false,{}],[0.016,[361,404],false,{}],[0.016,[374,360],false,{}],[0.016,[401,275],false,{}],[0.017,[409,251],false,{}],[0.016,[416,229],false,{}],[0.016,[422,210],false,{}],[0.016,[423,208],false,{}],[0.016,[424,207],false,{}],[0.016,[424,207],false,{}],[0.016,[424,207],false,{}],[0.016,[424,207],false,{}],[0.016,[425,207],false,{}],[0.016,[425,207],false,{}],[0.016,[425,207],false,{}],[0.016,[426,207],false,{}],[0.017,[426,207],false,{}],[0.016,[427,206],false,{}],[0.016,[429,203],false,{}],[0.016,[431,198],false,{}],[0.016,[433,193],false,{}],[0.016,[435,188],false,{}],[0.016,[435,187],false,{}],[0.016,[435,187],false,{}],[0.016,[434,186],false,{}],[0.016,[434,186],false,{}],[0.016,[433,186],false,{}],[0.016,[433,186],false,{}],[0.017,[431,186],false,{}],[0.016,[429,185],false,{}],[0.016,[425,183],false,{}],[0.016,[419,180],false,{}],[0.016,[400,170],false,{}],[0.016,[380,162],false,{}],[0.016,[340,147],false,{}],[0.016,[326,142],false,{}],[0.017,[317,140],false,{}],[0.016,[306,138],false,{}],[0.016,[304,138],false,{}],[0.016,[302,137],false,{}],[0.016,[302,138],false,{}],[0.016,[302,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.018000000000000002,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.022,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.021,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.034,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.033,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}]]]}],"nchapters":1,"t":1361405773493},"3":{"version":"","playername":"","name":"-1361405784913","chapters":[{"n":0,"t":1361405784913,"duration":10513,"state":[],"data":[[1361405784913,"think",[0.084,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.017,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,138],false,{}],[0.016,[303,137],false,{}],[0.016,[303,137],false,{}],[0.017,[304,137],false,{}],[0.016,[305,138],false,{}],[0.016,[305,138],false,{}],[0.016,[309,139],false,{}],[0.016,[313,142],false,{}],[0.016,[323,149],false,{}],[0.016,[327,153],false,{}],[0.016,[330,157],false,{}],[0.016,[334,167],false,{}],[0.017,[335,174],false,{}],[0.016,[335,185],false,{}],[0.016,[334,215],false,{}],[0.016,[334,234],false,{}],[0.016,[334,254],false,{}],[0.016,[336,303],false,{}],[0.016,[338,330],false,{}],[0.016,[341,358],false,{}],[0.016,[349,409],false,{}],[0.016,[353,432],false,{}],[0.016,[356,447],false,{}],[0.017,[358,458],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,459],false,{}],[0.017,[359,458],false,{}],[0.016,[359,458],false,{}],[0.016,[359,457],false,{}],[0.016,[359,456],false,{}],[0.016,[359,456],false,{}],[0.016,[359,454],false,{}],[0.016,[359,453],false,{}],[0.016,[359,452],false,{}],[0.016,[359,449],false,{}],[0.017,[359,441],false,{}],[0.016,[359,417],false,{}],[0.016,[358,408],false,{}],[0.016,[358,400],false,{}],[0.016,[357,392],false,{}],[0.016,[356,390],false,{}],[0.016,[356,389],false,{}],[0.016,[355,389],false,{}],[0.016,[355,389],false,{}],[0.016,[355,389],false,{}],[0.016,[354,389],false,{}],[0.017,[354,389],false,{}],[0.016,[354,389],false,{}],[0.016,[353,390],false,{}],[0.016,[352,390],false,{}],[0.016,[352,391],false,{}],[0.016,[351,392],false,{}],[0.016,[350,393],false,{}],[0.016,[350,394],false,{}],[0.016,[349,394],false,{}],[0.016,[349,395],false,{}],[0.016,[348,398],false,{}],[0.017,[347,399],false,{}],[0.016,[347,399],false,{}],[0.016,[347,400],false,{}],[0.016,[347,400],false,{}],[0.016,[347,400],false,{}],[0.016,[347,400],false,{}],[0.016,[347,400],false,{}],[0.016,[347,400],false,{}],[0.016,[348,400],false,{}],[0.017,[348,400],false,{}],[0.016,[349,399],false,{}],[0.016,[349,399],false,{}],[0.016,[349,399],false,{}],[0.016,[350,399],false,{}],[0.016,[350,399],false,{}],[0.016,[350,399],false,{}],[0.016,[351,400],false,{}],[0.016,[352,400],false,{}],[0.016,[353,400],false,{}],[0.016,[354,401],false,{}],[0.016,[355,401],false,{}],[0.017,[355,401],false,{}],[0.016,[355,401],false,{}],[0.016,[355,401],false,{}],[0.016,[355,401],false,{}],[0.016,[356,401],false,{}],[0.016,[356,402],false,{}],[0.016,[356,402],false,{}],[0.016,[356,402],false,{}],[0.016,[356,402],false,{}],[0.016,[356,402],false,{}],[0.018000000000000002,[357,402],false,{}],[0.017,[357,402],false,{}],[0.016,[357,402],false,{}],[0.016,[357,402],false,{}],[0.016,[357,402],false,{}],[0.016,[357,402],false,{}],[0.016,[358,402],false,{}],[0.016,[358,402],false,{}],[0.016,[358,403],false,{}],[0.016,[358,403],false,{}],[0.016,[358,403],false,{}],[0.016,[358,403],false,{}],[0.016,[358,403],false,{}],[0.016,[358,404],false,{}],[0.017,[358,404],false,{}],[0.016,[358,404],false,{}],[0.016,[358,404],false,{}],[0.016,[359,404],false,{}],[0.016,[359,404],false,{}],[0.016,[359,404],false,{}],[0.016,[359,404],false,{}],[0.016,[359,404],false,{}],[0.016,[358,404],false,{}],[0.016,[358,404],false,{}],[0.016,[358,404],false,{}],[0.017,[356,404],false,{}],[0.016,[356,404],false,{}],[0.016,[356,403],false,{}],[0.016,[356,403],false,{}],[0.016,[356,403],false,{}],[0.016,[356,403],false,{}],[0.016,[355,403],false,{}],[0.016,[355,403],false,{}],[0.016,[355,404],false,{}],[0.016,[355,404],false,{}],[0.016,[355,404],false,{}],[0.016,[354,404],false,{}],[0.017,[354,404],false,{}],[0.016,[354,404],false,{}],[0.016,[354,404],false,{}],[0.016,[354,404],false,{}],[0.016,[353,405],false,{}],[0.016,[353,405],false,{}],[0.016,[353,405],false,{}],[0.016,[353,405],false,{}],[0.016,[353,405],false,{}],[0.016,[354,405],false,{}],[0.016,[354,405],false,{}],[0.016,[354,405],false,{}],[0.017,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.016,[355,405],false,{}],[0.017,[355,405],false,{}],[0.02,[355,405],false,{}],[0.017,[355,405],true,{}],[0.02,[355,405],false,{}],[0.017,[355,405],false,{}],[0.016,[355,404],false,{}],[0.016,[355,404],false,{}],[0.016,[355,403],false,{}],[0.016,[355,403],false,{}],[0.016,[355,403],false,{}],[0.016,[356,402],false,{}],[0.017,[359,402],false,{}],[0.016,[368,403],false,{}],[0.016,[404,404],false,{}],[0.016,[429,404],false,{}],[0.016,[453,404],false,{}],[0.016,[496,402],false,{}],[0.016,[509,402],false,{}],[0.016,[523,402],false,{}],[0.016,[527,402],false,{}],[0.016,[530,402],false,{}],[0.016,[533,401],false,{}],[0.016,[534,401],false,{}],[0.017,[534,401],false,{}],[0.016,[535,401],false,{}],[0.016,[538,401],false,{}],[0.016,[542,401],false,{}],[0.016,[555,402],false,{}],[0.016,[559,402],false,{}],[0.016,[563,402],false,{}],[0.016,[567,402],false,{}],[0.017,[567,402],false,{}],[0.016,[568,402],false,{}],[0.016,[568,402],false,{}],[0.016,[568,401],false,{}],[0.016,[566,400],false,{}],[0.016,[565,400],false,{}],[0.016,[563,398],false,{}],[0.016,[563,398],false,{}],[0.016,[562,397],false,{}],[0.016,[561,397],false,{}],[0.017,[560,396],false,{}],[0.016,[559,396],false,{}],[0.016,[559,396],false,{}],[0.016,[558,396],false,{}],[0.016,[558,395],false,{}],[0.016,[558,395],false,{}],[0.016,[558,395],false,{}],[0.016,[558,395],false,{}],[0.016,[557,393],false,{}],[0.016,[556,391],false,{}],[0.016,[555,386],false,{}],[0.017,[551,373],false,{}],[0.016,[550,370],false,{}],[0.016,[550,368],false,{}],[0.016,[549,366],false,{}],[0.016,[549,366],false,{}],[0.016,[549,366],false,{}],[0.016,[549,365],false,{}],[0.016,[549,365],false,{}],[0.017,[549,365],false,{}],[0.016,[549,364],false,{}],[0.016,[549,364],false,{}],[0.016,[549,364],false,{}],[0.016,[549,364],false,{}],[0.016,[548,364],false,{}],[0.016,[548,364],false,{}],[0.016,[547,364],false,{}],[0.016,[547,363],false,{}],[0.016,[546,363],false,{}],[0.016,[546,363],false,{}],[0.017,[545,363],false,{}],[0.016,[545,363],false,{}],[0.016,[545,363],false,{}],[0.016,[544,363],false,{}],[0.016,[543,363],false,{}],[0.016,[543,363],false,{}],[0.016,[543,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.017,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.016,[542,364],false,{}],[0.017,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.017,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[542,363],false,{}],[0.016,[541,363],false,{}],[0.016,[541,363],false,{}],[0.016,[541,363],false,{}],[0.016,[541,363],false,{}],[0.016,[541,363],false,{}],[0.016,[541,363],false,{}],[0.016,[541,363],false,{}],[0.016,[540,363],false,{}],[0.017,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.019,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.017,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,363],false,{}],[0.016,[540,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.017,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.017,[538,362],false,{}],[0.016,[538,362],false,{}],[0.016,[539,362],false,{}],[0.016,[539,362],false,{}],[0.016,[538,362],false,{}],[0.018000000000000002,[538,362],false,{}],[0.017,[538,362],false,{}],[0.016,[537,362],false,{}],[0.018000000000000002,[536,362],false,{}],[0.016,[536,362],false,{}],[0.016,[536,362],false,{}],[0.018000000000000002,[535,362],false,{}],[0.016,[535,362],false,{}],[0.016,[535,362],false,{}],[0.018000000000000002,[534,362],false,{}],[0.016,[534,361],false,{}],[0.016,[533,361],false,{}],[0.016,[533,361],false,{}],[0.016,[533,361],false,{}],[0.016,[533,361],false,{}],[0.02,[532,361],false,{}],[0.016,[532,361],false,{}],[0.016,[532,361],false,{}],[0.018000000000000002,[532,361],false,{}],[0.016,[531,361],false,{}],[0.016,[531,361],false,{}],[0.016,[530,361],false,{}],[0.017,[530,361],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[529,362],false,{}],[0.016,[529,362],false,{}],[0.016,[529,362],false,{}],[0.016,[529,362],false,{}],[0.017,[529,362],false,{}],[0.016,[529,362],false,{}],[0.016,[529,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],false,{}],[0.016,[530,362],true,{}],[0.02,[530,362],false,{}],[0.017,[530,362],false,{}],[0.016,[531,361],false,{}],[0.016,[531,360],false,{}],[0.016,[532,360],false,{}],[0.016,[533,360],false,{}],[0.016,[533,360],false,{}],[0.016,[536,360],false,{}],[0.016,[538,360],false,{}],[0.016,[545,359],false,{}],[0.016,[565,356],false,{}],[0.016,[576,352],false,{}],[0.016,[589,348],false,{}],[0.017,[611,340],false,{}],[0.016,[620,336],false,{}],[0.016,[634,331],false,{}],[0.016,[639,328],false,{}],[0.016,[643,326],false,{}],[0.016,[649,325],false,{}],[0.016,[649,324],false,{}],[0.016,[650,324],false,{}],[0.016,[650,324],false,{}],[0.016,[652,323],false,{}],[0.016,[656,322],false,{}],[0.016,[669,318],false,{}],[0.017,[677,316],false,{}],[0.016,[684,313],false,{}],[0.016,[697,308],false,{}],[0.016,[701,306],false,{}],[0.016,[704,304],false,{}],[0.016,[707,303],false,{}],[0.016,[707,303],false,{}],[0.016,[707,302],false,{}],[0.016,[707,302],false,{}],[0.017,[707,302],false,{}],[0.016,[707,302],false,{}],[0.016,[706,302],false,{}],[0.016,[706,302],false,{}],[0.019,[706,302],false,{}],[0.016,[705,302],false,{}],[0.016,[705,302],false,{}],[0.017,[705,302],false,{}],[0.016,[705,302],false,{}],[0.017,[705,302],false,{}],[0.016,[705,302],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.02,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.018000000000000002,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.033,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}]]]}],"nchapters":1,"t":1361405784913},"4":{"version":"","playername":"","name":"-1361405795511","chapters":[{"n":0,"t":1361405795511,"duration":13423,"state":[],"data":[[1361405795512,"think",[0.08600000000000001,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.016,[705,301],false,{}],[0.017,[705,301],false,{}],[0.016,[696,303],false,{}],[0.016,[676,306],false,{}],[0.016,[651,311],false,{}],[0.016,[589,320],false,{}],[0.016,[556,323],false,{}],[0.016,[524,326],false,{}],[0.016,[457,327],false,{}],[0.016,[425,327],false,{}],[0.016,[365,324],false,{}],[0.016,[338,321],false,{}],[0.016,[326,320],false,{}],[0.016,[281,319],false,{}],[0.017,[262,320],false,{}],[0.016,[245,321],false,{}],[0.016,[226,325],false,{}],[0.016,[217,327],false,{}],[0.016,[208,329],false,{}],[0.016,[192,335],false,{}],[0.016,[186,337],false,{}],[0.016,[181,338],false,{}],[0.016,[179,339],false,{}],[0.016,[179,339],false,{}],[0.016,[179,339],false,{}],[0.016,[179,339],false,{}],[0.017,[180,339],false,{}],[0.016,[182,339],false,{}],[0.016,[189,341],false,{}],[0.016,[205,345],false,{}],[0.016,[239,355],false,{}],[0.016,[254,360],false,{}],[0.016,[266,363],false,{}],[0.016,[280,368],false,{}],[0.016,[286,369],false,{}],[0.016,[291,371],false,{}],[0.016,[298,374],false,{}],[0.016,[301,376],false,{}],[0.017,[304,377],false,{}],[0.016,[305,378],false,{}],[0.016,[305,378],false,{}],[0.016,[306,380],false,{}],[0.016,[306,381],false,{}],[0.016,[306,381],false,{}],[0.016,[306,381],false,{}],[0.016,[306,381],false,{}],[0.016,[306,382],false,{}],[0.016,[306,384],false,{}],[0.017,[305,385],false,{}],[0.016,[305,385],false,{}],[0.016,[304,387],false,{}],[0.016,[302,389],false,{}],[0.016,[298,391],false,{}],[0.016,[295,392],false,{}],[0.016,[291,393],false,{}],[0.016,[281,395],false,{}],[0.016,[276,396],false,{}],[0.016,[271,398],false,{}],[0.016,[262,400],false,{}],[0.017,[259,401],false,{}],[0.016,[257,402],false,{}],[0.016,[254,404],false,{}],[0.016,[252,406],false,{}],[0.016,[249,408],false,{}],[0.016,[249,408],false,{}],[0.016,[249,408],false,{}],[0.016,[249,409],false,{}],[0.016,[249,409],false,{}],[0.016,[249,409],false,{}],[0.017,[250,409],false,{}],[0.016,[250,408],false,{}],[0.016,[250,408],false,{}],[0.016,[250,409],false,{}],[0.016,[250,410],false,{}],[0.016,[250,412],false,{}],[0.016,[250,412],false,{}],[0.017,[251,413],false,{}],[0.016,[251,413],false,{}],[0.016,[251,413],false,{}],[0.016,[251,413],false,{}],[0.016,[251,413],false,{}],[0.016,[251,413],false,{}],[0.016,[251,413],false,{}],[0.016,[251,412],false,{}],[0.016,[251,412],false,{}],[0.017,[251,412],false,{}],[0.016,[250,412],false,{}],[0.016,[250,412],false,{}],[0.016,[250,412],false,{}],[0.016,[249,412],false,{}],[0.016,[249,412],false,{}],[0.016,[248,412],false,{}],[0.016,[248,412],false,{}],[0.016,[247,412],false,{}],[0.016,[247,412],false,{}],[0.016,[247,412],false,{}],[0.016,[246,413],false,{}],[0.016,[240,414],false,{}],[0.017,[238,415],false,{}],[0.016,[237,415],false,{}],[0.016,[237,415],false,{}],[0.016,[237,415],false,{}],[0.016,[237,415],false,{}],[0.016,[236,415],false,{}],[0.016,[236,415],false,{}],[0.016,[236,415],false,{}],[0.016,[236,415],false,{}],[0.016,[236,415],false,{}],[0.016,[236,415],false,{}],[0.016,[237,415],false,{}],[0.017,[237,415],false,{}],[0.016,[238,415],false,{}],[0.019,[238,415],false,{}],[0.016,[238,415],false,{}],[0.016,[238,415],false,{}],[0.016,[238,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.017,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.017,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[239,415],false,{}],[0.016,[240,415],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.017,[240,416],false,{}],[0.016,[240,416],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.017,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,417],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.017,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.017,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.017,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,419],false,{}],[0.016,[240,419],false,{}],[0.016,[240,419],false,{}],[0.016,[240,419],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],false,{}],[0.016,[240,418],true,{}],[0.023,[240,418],false,{}],[0.016,[240,417],false,{}],[0.016,[240,416],false,{}],[0.016,[240,416],false,{}],[0.017,[240,415],false,{}],[0.016,[240,415],false,{}],[0.016,[240,415],false,{}],[0.016,[240,414],false,{}],[0.016,[240,414],false,{}],[0.016,[240,414],false,{}],[0.016,[240,414],false,{}],[0.016,[240,414],false,{}],[0.016,[241,414],false,{}],[0.016,[241,414],false,{}],[0.016,[242,414],false,{}],[0.016,[242,414],false,{}],[0.016,[260,409],false,{}],[0.017,[289,402],false,{}],[0.016,[360,383],false,{}],[0.016,[413,365],false,{}],[0.016,[441,356],false,{}],[0.016,[479,343],false,{}],[0.016,[544,319],false,{}],[0.016,[566,311],false,{}],[0.016,[575,307],false,{}],[0.016,[582,305],false,{}],[0.016,[584,304],false,{}],[0.017,[584,304],false,{}],[0.016,[584,304],false,{}],[0.016,[584,304],false,{}],[0.016,[583,304],false,{}],[0.016,[583,305],false,{}],[0.016,[582,305],false,{}],[0.016,[573,308],false,{}],[0.016,[566,310],false,{}],[0.016,[552,312],false,{}],[0.016,[545,313],false,{}],[0.016,[544,313],false,{}],[0.016,[543,314],false,{}],[0.016,[542,314],false,{}],[0.017,[542,314],false,{}],[0.016,[542,314],false,{}],[0.016,[542,314],false,{}],[0.016,[541,314],false,{}],[0.016,[541,314],false,{}],[0.016,[541,314],false,{}],[0.016,[541,314],false,{}],[0.016,[540,314],false,{}],[0.016,[540,314],false,{}],[0.016,[540,313],false,{}],[0.016,[538,313],false,{}],[0.017,[537,313],false,{}],[0.016,[534,313],false,{}],[0.016,[528,313],false,{}],[0.016,[527,313],false,{}],[0.016,[526,313],false,{}],[0.016,[525,313],false,{}],[0.016,[525,313],false,{}],[0.016,[525,313],false,{}],[0.016,[524,313],false,{}],[0.016,[524,313],false,{}],[0.016,[524,313],false,{}],[0.016,[524,313],false,{}],[0.016,[524,313],false,{}],[0.017,[523,313],false,{}],[0.016,[523,313],false,{}],[0.016,[523,313],false,{}],[0.016,[523,312],false,{}],[0.016,[523,312],false,{}],[0.016,[523,312],false,{}],[0.016,[523,312],false,{}],[0.016,[522,312],false,{}],[0.016,[522,312],false,{}],[0.016,[522,312],false,{}],[0.016,[522,312],false,{}],[0.017,[522,312],false,{}],[0.016,[521,312],false,{}],[0.016,[521,312],false,{}],[0.016,[519,312],false,{}],[0.016,[517,313],false,{}],[0.016,[515,313],false,{}],[0.016,[508,314],false,{}],[0.016,[504,314],false,{}],[0.017,[503,314],false,{}],[0.017,[502,315],false,{}],[0.016,[501,315],false,{}],[0.016,[501,315],false,{}],[0.016,[501,315],false,{}],[0.016,[501,315],false,{}],[0.016,[501,315],false,{}],[0.016,[501,315],false,{}],[0.017,[500,315],false,{}],[0.016,[500,314],false,{}],[0.016,[500,314],false,{}],[0.016,[500,314],false,{}],[0.016,[500,314],false,{}],[0.016,[500,314],false,{}],[0.016,[500,314],false,{}],[0.016,[500,314],false,{}],[0.017,[500,314],false,{}],[0.016,[499,314],false,{}],[0.016,[499,314],false,{}],[0.016,[499,314],false,{}],[0.016,[499,314],false,{}],[0.016,[498,314],false,{}],[0.016,[498,314],false,{}],[0.016,[498,314],false,{}],[0.016,[498,314],false,{}],[0.016,[498,314],false,{}],[0.016,[497,314],false,{}],[0.017,[497,314],false,{}],[0.016,[496,314],false,{}],[0.016,[496,314],false,{}],[0.016,[496,314],false,{}],[0.016,[496,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.017,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.018000000000000002,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.017,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.017,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[495,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[494,314],false,{}],[0.016,[493,314],false,{}],[0.017,[493,314],false,{}],[0.016,[493,314],false,{}],[0.016,[493,314],false,{}],[0.016,[492,315],false,{}],[0.016,[492,315],false,{}],[0.016,[492,315],false,{}],[0.016,[491,315],false,{}],[0.016,[491,315],false,{}],[0.016,[491,316],false,{}],[0.016,[490,316],false,{}],[0.016,[490,316],false,{}],[0.017,[490,316],false,{}],[0.016,[490,316],false,{}],[0.016,[490,317],false,{}],[0.016,[489,317],false,{}],[0.016,[489,317],false,{}],[0.016,[489,317],false,{}],[0.016,[489,317],false,{}],[0.016,[489,318],false,{}],[0.016,[489,318],false,{}],[0.016,[489,318],false,{}],[0.016,[489,318],false,{}],[0.017,[489,318],false,{}],[0.016,[489,318],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.016,[489,319],false,{}],[0.017,[489,320],false,{}],[0.016,[489,320],false,{}],[0.016,[489,320],false,{}],[0.016,[489,320],false,{}],[0.016,[489,320],false,{}],[0.016,[489,320],false,{}],[0.016,[489,320],false,{}],[0.016,[490,320],false,{}],[0.016,[490,320],false,{}],[0.016,[490,319],false,{}],[0.016,[491,319],false,{}],[0.017,[491,319],false,{}],[0.016,[491,320],false,{}],[0.016,[491,320],false,{}],[0.016,[491,320],false,{}],[0.016,[491,320],false,{}],[0.016,[492,320],false,{}],[0.016,[492,320],false,{}],[0.016,[492,320],false,{}],[0.016,[493,320],false,{}],[0.016,[494,320],false,{}],[0.016,[494,320],false,{}],[0.016,[495,320],false,{}],[0.016,[496,320],true,{}],[0.022,[496,320],false,{}],[0.016,[496,319],false,{}],[0.017,[496,319],false,{}],[0.016,[497,319],false,{}],[0.016,[497,318],false,{}],[0.016,[498,318],false,{}],[0.016,[498,318],false,{}],[0.016,[499,318],false,{}],[0.016,[499,318],false,{}],[0.016,[499,318],false,{}],[0.016,[500,318],false,{}],[0.016,[500,318],false,{}],[0.016,[501,318],false,{}],[0.016,[501,318],false,{}],[0.017,[502,318],false,{}],[0.016,[503,318],false,{}],[0.016,[504,318],false,{}],[0.016,[505,318],false,{}],[0.016,[510,319],false,{}],[0.016,[516,320],false,{}],[0.016,[530,321],false,{}],[0.016,[547,321],false,{}],[0.016,[583,319],false,{}],[0.017,[601,315],false,{}],[0.016,[619,309],false,{}],[0.016,[655,286],false,{}],[0.016,[673,272],false,{}],[0.016,[690,256],false,{}],[0.016,[716,231],false,{}],[0.016,[723,223],false,{}],[0.016,[727,219],false,{}],[0.016,[730,216],false,{}],[0.016,[731,215],false,{}],[0.016,[731,214],false,{}],[0.016,[731,214],false,{}],[0.017,[731,214],false,{}],[0.016,[730,214],false,{}],[0.016,[730,213],false,{}],[0.016,[729,212],false,{}],[0.016,[728,212],false,{}],[0.016,[727,210],false,{}],[0.016,[726,209],false,{}],[0.016,[725,208],false,{}],[0.016,[724,207],false,{}],[0.016,[724,207],false,{}],[0.017,[724,206],false,{}],[0.016,[724,206],false,{}],[0.016,[724,205],false,{}],[0.016,[725,205],false,{}],[0.016,[725,205],false,{}],[0.016,[726,204],false,{}],[0.016,[726,204],false,{}],[0.016,[727,204],false,{}],[0.016,[727,204],false,{}],[0.016,[728,204],false,{}],[0.016,[729,204],false,{}],[0.016,[730,203],false,{}],[0.017,[733,202],false,{}],[0.016,[733,202],false,{}],[0.016,[734,202],false,{}],[0.016,[734,202],false,{}],[0.016,[735,202],false,{}],[0.016,[735,202],false,{}],[0.016,[735,202],false,{}],[0.016,[736,202],false,{}],[0.016,[736,202],false,{}],[0.016,[737,202],false,{}],[0.016,[737,202],false,{}],[0.016,[739,202],false,{}],[0.016,[742,201],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.021,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.034,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.025,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}]]]}],"nchapters":1,"t":1361405795511},"5":{"version":"","playername":"","name":"-1361405809022","chapters":[{"n":0,"t":1361405809022,"duration":14471,"state":[],"data":[[1361405809022,"think",[0.089,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.019,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.018000000000000002,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.018000000000000002,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.018000000000000002,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.018000000000000002,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.018000000000000002,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.02,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[749,198],false,{}],[0.016,[749,198],false,{}],[0.017,[749,198],false,{}],[0.016,[744,197],false,{}],[0.016,[734,197],false,{}],[0.018000000000000002,[715,198],false,{}],[0.016,[708,198],false,{}],[0.016,[703,198],false,{}],[0.018000000000000002,[699,199],false,{}],[0.016,[697,199],false,{}],[0.016,[694,199],false,{}],[0.018000000000000002,[684,199],false,{}],[0.016,[679,199],false,{}],[0.016,[673,199],false,{}],[0.016,[659,198],false,{}],[0.016,[650,198],false,{}],[0.016,[638,197],false,{}],[0.017,[603,197],false,{}],[0.016,[580,198],false,{}],[0.016,[556,200],false,{}],[0.016,[513,206],false,{}],[0.016,[496,209],false,{}],[0.016,[483,212],false,{}],[0.016,[469,218],false,{}],[0.016,[464,221],false,{}],[0.016,[458,230],false,{}],[0.016,[455,234],false,{}],[0.016,[454,238],false,{}],[0.016,[454,247],false,{}],[0.017,[455,252],false,{}],[0.016,[457,256],false,{}],[0.016,[459,263],false,{}],[0.016,[460,265],false,{}],[0.016,[460,266],false,{}],[0.016,[460,266],false,{}],[0.016,[461,266],false,{}],[0.016,[461,266],false,{}],[0.016,[463,265],false,{}],[0.016,[464,264],false,{}],[0.016,[469,261],false,{}],[0.016,[472,259],false,{}],[0.016,[474,258],false,{}],[0.017,[475,257],false,{}],[0.016,[476,257],false,{}],[0.016,[477,258],false,{}],[0.016,[483,260],false,{}],[0.016,[486,262],false,{}],[0.016,[488,263],false,{}],[0.016,[489,264],false,{}],[0.016,[489,264],false,{}],[0.016,[490,264],false,{}],[0.016,[490,265],false,{}],[0.016,[492,265],false,{}],[0.016,[494,266],false,{}],[0.016,[495,267],false,{}],[0.017,[495,267],false,{}],[0.016,[496,267],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.017,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[496,266],false,{}],[0.017,[496,266],false,{}],[0.016,[496,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,266],false,{}],[0.016,[495,265],false,{}],[0.016,[495,265],false,{}],[0.017,[495,265],false,{}],[0.016,[495,265],false,{}],[0.016,[495,265],false,{}],[0.016,[495,265],false,{}],[0.016,[495,265],false,{}],[0.016,[495,265],false,{}],[0.016,[495,264],false,{}],[0.016,[495,264],false,{}],[0.016,[495,264],false,{}],[0.016,[495,264],false,{}],[0.016,[495,264],false,{}],[0.016,[495,264],false,{}],[0.016,[495,264],false,{}],[0.017,[495,264],false,{}],[0.016,[495,264],false,{}],[0.016,[494,264],false,{}],[0.016,[494,264],false,{}],[0.016,[494,264],false,{}],[0.016,[493,264],false,{}],[0.016,[492,264],false,{}],[0.016,[492,264],false,{}],[0.016,[492,264],false,{}],[0.016,[492,264],false,{}],[0.016,[492,264],false,{}],[0.016,[492,264],false,{}],[0.017,[492,264],false,{}],[0.016,[493,264],false,{}],[0.016,[493,263],false,{}],[0.016,[493,263],false,{}],[0.016,[493,263],false,{}],[0.016,[493,262],false,{}],[0.016,[493,262],false,{}],[0.016,[493,261],false,{}],[0.016,[493,261],false,{}],[0.016,[493,260],false,{}],[0.016,[493,260],false,{}],[0.017,[493,260],false,{}],[0.016,[493,259],false,{}],[0.016,[492,259],false,{}],[0.016,[492,259],false,{}],[0.016,[490,259],false,{}],[0.016,[489,259],false,{}],[0.016,[489,259],false,{}],[0.016,[488,259],false,{}],[0.016,[487,259],false,{}],[0.016,[487,259],false,{}],[0.016,[486,258],false,{}],[0.016,[485,258],false,{}],[0.016,[485,258],false,{}],[0.017,[485,257],false,{}],[0.016,[485,257],false,{}],[0.016,[485,257],false,{}],[0.016,[485,257],false,{}],[0.016,[485,256],false,{}],[0.016,[485,256],false,{}],[0.016,[485,256],false,{}],[0.016,[485,256],false,{}],[0.016,[484,256],false,{}],[0.016,[484,256],false,{}],[0.016,[484,256],false,{}],[0.016,[484,256],false,{}],[0.017,[484,256],false,{}],[0.016,[484,256],false,{}],[0.022,[483,256],false,{}],[0.016,[483,256],false,{}],[0.016,[482,256],false,{}],[0.016,[482,255],false,{}],[0.016,[481,255],false,{}],[0.016,[480,255],false,{}],[0.016,[480,255],false,{}],[0.016,[480,255],false,{}],[0.016,[479,254],false,{}],[0.016,[479,254],false,{}],[0.016,[478,254],false,{}],[0.016,[478,254],false,{}],[0.017,[478,254],false,{}],[0.016,[477,253],false,{}],[0.016,[477,253],false,{}],[0.016,[477,253],false,{}],[0.016,[477,253],false,{}],[0.016,[476,253],false,{}],[0.016,[475,253],false,{}],[0.016,[475,253],false,{}],[0.016,[474,252],false,{}],[0.016,[474,252],false,{}],[0.016,[474,251],false,{}],[0.016,[474,251],false,{}],[0.017,[474,251],false,{}],[0.016,[474,250],false,{}],[0.016,[474,250],false,{}],[0.016,[474,250],false,{}],[0.016,[474,250],false,{}],[0.016,[474,250],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.017,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],true,{}],[0.024,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[473,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[474,249],false,{}],[0.016,[473,249],false,{}],[0.017,[470,249],false,{}],[0.016,[446,248],false,{}],[0.016,[423,245],false,{}],[0.016,[369,240],false,{}],[0.016,[341,238],false,{}],[0.016,[316,238],false,{}],[0.016,[293,238],false,{}],[0.016,[284,238],false,{}],[0.016,[277,238],false,{}],[0.016,[266,239],false,{}],[0.016,[263,240],false,{}],[0.017,[261,241],false,{}],[0.016,[260,242],false,{}],[0.016,[260,243],false,{}],[0.016,[259,244],false,{}],[0.016,[257,247],false,{}],[0.016,[257,248],false,{}],[0.016,[257,249],false,{}],[0.016,[257,251],false,{}],[0.016,[258,259],false,{}],[0.016,[259,264],false,{}],[0.016,[261,267],false,{}],[0.017,[263,274],false,{}],[0.016,[265,276],false,{}],[0.016,[267,278],false,{}],[0.016,[269,280],false,{}],[0.016,[270,280],false,{}],[0.016,[270,280],false,{}],[0.016,[270,280],false,{}],[0.016,[270,280],false,{}],[0.016,[271,280],false,{}],[0.016,[271,280],false,{}],[0.016,[272,279],false,{}],[0.017,[272,279],false,{}],[0.016,[272,279],false,{}],[0.016,[272,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[273,279],false,{}],[0.016,[274,279],false,{}],[0.017,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[274,279],false,{}],[0.016,[275,279],false,{}],[0.017,[275,279],false,{}],[0.016,[275,279],false,{}],[0.016,[275,279],false,{}],[0.016,[275,279],false,{}],[0.016,[276,279],false,{}],[0.021,[276,279],false,{}],[0.016,[276,279],false,{}],[0.016,[276,280],false,{}],[0.016,[276,280],false,{}],[0.016,[277,280],false,{}],[0.016,[277,280],false,{}],[0.016,[277,280],false,{}],[0.016,[277,280],false,{}],[0.017,[277,280],false,{}],[0.016,[277,280],false,{}],[0.016,[277,281],false,{}],[0.016,[277,281],false,{}],[0.016,[277,281],false,{}],[0.016,[278,281],false,{}],[0.016,[278,281],false,{}],[0.016,[278,281],false,{}],[0.016,[278,281],false,{}],[0.016,[278,281],false,{}],[0.016,[278,281],false,{}],[0.016,[279,281],false,{}],[0.017,[279,281],false,{}],[0.016,[279,281],false,{}],[0.016,[279,281],false,{}],[0.016,[279,281],false,{}],[0.016,[279,281],false,{}],[0.016,[279,281],false,{}],[0.016,[279,281],false,{}],[0.016,[280,281],false,{}],[0.016,[280,281],false,{}],[0.016,[280,281],false,{}],[0.016,[280,281],false,{}],[0.017,[281,281],false,{}],[0.016,[281,281],false,{}],[0.016,[281,281],false,{}],[0.016,[282,281],false,{}],[0.016,[283,281],false,{}],[0.016,[284,282],false,{}],[0.016,[285,282],false,{}],[0.016,[285,282],false,{}],[0.017,[286,283],false,{}],[0.016,[288,283],false,{}],[0.016,[291,283],false,{}],[0.016,[295,283],false,{}],[0.016,[296,284],false,{}],[0.017,[297,285],false,{}],[0.016,[298,285],false,{}],[0.016,[299,285],false,{}],[0.016,[299,285],false,{}],[0.016,[299,285],false,{}],[0.016,[299,286],false,{}],[0.016,[299,286],false,{}],[0.016,[299,286],false,{}],[0.016,[299,286],false,{}],[0.016,[299,286],false,{}],[0.016,[299,286],false,{}],[0.016,[299,286],false,{}],[0.016,[299,285],false,{}],[0.017,[299,285],false,{}],[0.016,[299,285],false,{}],[0.016,[298,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[297,285],false,{}],[0.017,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[296,285],false,{}],[0.016,[296,285],false,{}],[0.016,[296,286],false,{}],[0.016,[296,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.017,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[295,286],false,{}],[0.016,[294,286],false,{}],[0.016,[294,286],false,{}],[0.016,[294,286],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.017,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.016,[294,287],false,{}],[0.017,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.017,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,288],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.017,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[294,290],false,{}],[0.017,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[294,290],false,{}],[0.017,[294,290],false,{}],[0.016,[294,290],false,{}],[0.016,[293,290],false,{}],[0.016,[293,290],false,{}],[0.016,[292,290],false,{}],[0.016,[292,290],false,{}],[0.016,[292,290],false,{}],[0.016,[292,290],false,{}],[0.016,[292,290],false,{}],[0.016,[292,289],false,{}],[0.016,[292,289],false,{}],[0.016,[292,289],false,{}],[0.016,[292,289],false,{}],[0.017,[292,289],false,{}],[0.016,[292,289],false,{}],[0.016,[291,289],false,{}],[0.016,[291,289],false,{}],[0.016,[291,289],false,{}],[0.016,[290,289],false,{}],[0.016,[290,289],false,{}],[0.016,[290,289],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.017,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[290,288],false,{}],[0.016,[291,288],false,{}],[0.016,[291,288],false,{}],[0.016,[291,288],false,{}],[0.016,[291,288],false,{}],[0.016,[291,288],false,{}],[0.017,[291,288],false,{}],[0.016,[291,288],false,{}],[0.016,[291,288],false,{}],[0.016,[291,288],false,{}],[0.016,[292,288],false,{}],[0.016,[292,288],false,{}],[0.016,[292,288],false,{}],[0.016,[293,288],false,{}],[0.016,[293,288],false,{}],[0.016,[294,289],false,{}],[0.016,[294,289],false,{}],[0.016,[295,290],false,{}],[0.017,[295,290],false,{}],[0.016,[296,290],false,{}],[0.016,[296,290],false,{}],[0.016,[296,290],false,{}],[0.016,[297,290],false,{}],[0.016,[297,290],false,{}],[0.016,[299,290],false,{}],[0.016,[299,290],false,{}],[0.016,[300,291],false,{}],[0.016,[301,291],false,{}],[0.016,[301,291],false,{}],[0.016,[302,291],false,{}],[0.016,[302,291],false,{}],[0.017,[302,291],false,{}],[0.016,[303,291],false,{}],[0.016,[303,291],false,{}],[0.016,[304,291],false,{}],[0.016,[305,291],false,{}],[0.016,[307,291],false,{}],[0.016,[308,291],false,{}],[0.016,[309,291],false,{}],[0.016,[310,291],false,{}],[0.017,[311,291],false,{}],[0.016,[311,291],false,{}],[0.016,[311,291],false,{}],[0.016,[311,292],false,{}],[0.016,[311,292],false,{}],[0.016,[310,292],false,{}],[0.016,[309,291],false,{}],[0.016,[308,291],false,{}],[0.016,[307,291],true,{}],[0.021,[305,291],false,{}],[0.016,[305,290],false,{}],[0.016,[304,290],false,{}],[0.016,[302,288],false,{}],[0.016,[302,288],false,{}],[0.016,[301,287],false,{}],[0.016,[300,287],false,{}],[0.016,[300,286],false,{}],[0.016,[300,286],false,{}],[0.016,[298,286],false,{}],[0.017,[297,285],false,{}],[0.016,[297,285],false,{}],[0.016,[295,284],false,{}],[0.016,[294,284],false,{}],[0.016,[294,284],false,{}],[0.016,[294,283],false,{}],[0.016,[293,283],false,{}],[0.016,[293,283],false,{}],[0.016,[293,283],false,{}],[0.017,[293,283],false,{}],[0.017,[293,283],false,{}],[0.016,[293,283],false,{}],[0.016,[293,283],false,{}],[0.016,[292,283],false,{}],[0.016,[292,283],false,{}],[0.017,[291,284],false,{}],[0.016,[287,284],false,{}],[0.016,[281,284],false,{}],[0.016,[270,283],false,{}],[0.016,[244,281],false,{}],[0.016,[231,281],false,{}],[0.016,[221,282],false,{}],[0.016,[209,283],false,{}],[0.016,[206,283],false,{}],[0.016,[204,284],false,{}],[0.016,[204,284],false,{}],[0.016,[204,284],false,{}],[0.016,[204,284],false,{}],[0.016,[205,285],false,{}],[0.017,[205,285],false,{}],[0.016,[205,285],false,{}],[0.016,[206,285],false,{}],[0.016,[207,286],false,{}],[0.016,[208,286],false,{}],[0.016,[213,290],false,{}],[0.016,[217,293],false,{}],[0.016,[221,295],false,{}],[0.016,[225,296],false,{}],[0.016,[231,298],false,{}],[0.016,[233,299],false,{}],[0.016,[234,299],false,{}],[0.017,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[235,299],false,{}],[0.016,[234,299],false,{}],[0.016,[234,299],false,{}],[0.016,[233,299],false,{}],[0.016,[233,299],false,{}],[0.017,[233,299],false,{}],[0.016,[233,299],false,{}],[0.016,[233,299],false,{}],[0.016,[232,299],false,{}],[0.016,[232,300],false,{}],[0.016,[232,300],false,{}],[0.016,[232,300],false,{}],[0.016,[231,300],false,{}],[0.016,[231,300],false,{}],[0.016,[231,300],false,{}],[0.016,[231,300],false,{}],[0.016,[231,300],false,{}],[0.017,[231,300],false,{}],[0.016,[231,300],false,{}],[0.016,[231,300],false,{}],[0.016,[230,300],false,{}],[0.016,[230,300],false,{}],[0.016,[230,300],false,{}],[0.016,[230,300],false,{}],[0.019,[230,300],false,{}],[0.016,[230,300],false,{}],[0.016,[230,300],false,{}],[0.016,[230,300],false,{}],[0.016,[230,300],false,{}],[0.017,[230,300],false,{}],[0.016,[229,300],false,{}],[0.016,[229,300],false,{}],[0.016,[229,300],false,{}],[0.016,[229,300],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.017,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.016,[229,301],false,{}],[0.017,[229,301],false,{}],[0.016,[229,302],false,{}],[0.016,[229,302],false,{}],[0.016,[229,302],false,{}],[0.016,[229,302],false,{}],[0.016,[229,302],false,{}],[0.016,[229,302],false,{}],[0.016,[229,302],false,{}],[0.016,[228,303],false,{}],[0.017,[228,303],false,{}],[0.016,[228,303],false,{}],[0.016,[228,303],false,{}],[0.016,[228,303],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,304],false,{}],[0.016,[228,305],false,{}],[0.017,[227,305],false,{}],[0.016,[227,305],false,{}],[0.016,[227,305],false,{}],[0.016,[227,305],false,{}],[0.016,[227,306],false,{}],[0.016,[227,306],false,{}],[0.016,[227,306],false,{}],[0.016,[227,306],false,{}],[0.016,[227,307],false,{}],[0.016,[227,307],false,{}],[0.017,[227,307],false,{}],[0.016,[226,307],false,{}],[0.016,[226,307],false,{}],[0.016,[226,307],false,{}],[0.016,[225,308],false,{}],[0.017,[225,308],false,{}],[0.016,[225,308],false,{}],[0.016,[224,308],false,{}],[0.016,[223,308],false,{}],[0.016,[223,308],false,{}],[0.016,[223,308],false,{}],[0.016,[222,308],false,{}],[0.016,[221,308],false,{}],[0.016,[220,308],false,{}],[0.016,[220,308],false,{}],[0.016,[219,308],false,{}],[0.017,[218,308],false,{}],[0.016,[218,308],false,{}],[0.016,[217,308],false,{}],[0.016,[216,308],false,{}],[0.016,[216,307],false,{}],[0.016,[215,307],false,{}],[0.016,[212,306],false,{}],[0.016,[211,306],false,{}],[0.016,[211,306],false,{}],[0.016,[210,305],false,{}],[0.016,[209,305],false,{}],[0.017,[209,305],false,{}],[0.016,[208,305],false,{}],[0.016,[208,305],false,{}],[0.016,[208,305],false,{}],[0.016,[208,305],false,{}],[0.016,[209,305],false,{}],[0.016,[209,305],true,{}],[0.021,[210,305],false,{}],[0.016,[211,305],false,{}],[0.016,[211,305],false,{}],[0.016,[211,305],false,{}],[0.017,[212,305],false,{}],[0.016,[212,305],false,{}],[0.016,[212,305],false,{}],[0.016,[213,305],false,{}],[0.016,[214,305],false,{}],[0.016,[214,305],false,{}],[0.016,[215,305],false,{}],[0.016,[216,305],false,{}],[0.016,[218,305],false,{}],[0.016,[219,305],false,{}],[0.016,[220,305],false,{}],[0.016,[223,305],false,{}],[0.017,[225,305],false,{}],[0.016,[245,306],false,{}],[0.016,[269,306],false,{}],[0.016,[301,305],false,{}],[0.016,[326,301],false,{}],[0.016,[399,281],false,{}],[0.016,[437,266],false,{}],[0.016,[475,251],false,{}],[0.016,[539,227],false,{}],[0.016,[561,219],false,{}],[0.016,[572,216],false,{}],[0.017,[580,212],false,{}],[0.016,[582,210],false,{}],[0.016,[584,209],false,{}],[0.016,[592,204],false,{}],[0.016,[597,201],false,{}],[0.016,[602,198],false,{}],[0.016,[611,192],false,{}],[0.016,[616,189],false,{}],[0.016,[621,187],false,{}],[0.016,[638,180],false,{}],[0.016,[651,175],false,{}],[0.016,[665,170],false,{}],[0.017,[685,165],false,{}],[0.016,[695,163],false,{}],[0.016,[703,162],false,{}],[0.016,[708,161],false,{}],[0.016,[712,161],false,{}],[0.016,[715,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.017,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[716,160],false,{}],[0.016,[717,160],false,{}],[0.016,[719,160],false,{}],[0.016,[726,160],false,{}],[0.016,[739,159],false,{}],[0.017,[741,158],false,{}],[0.016,[743,158],false,{}],[0.016,[744,158],false,{}],[0.016,[744,158],false,{}],[0.016,[744,158],false,{}],[0.016,[744,158],false,{}],[0.016,[743,158],false,{}],[0.016,[743,158],false,{}],[0.016,[743,158],false,{}],[0.016,[742,157],false,{}],[0.017,[742,157],false,{}],[0.016,[742,156],false,{}],[0.016,[742,156],false,{}],[0.016,[741,156],false,{}],[0.016,[741,156],false,{}],[0.016,[741,156],false,{}],[0.016,[741,156],false,{}],[0.016,[741,155],false,{}],[0.016,[740,155],false,{}],[0.016,[740,155],false,{}],[0.016,[740,155],false,{}],[0.016,[740,155],false,{}],[0.017,[740,155],false,{}],[0.016,[740,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.017,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,154],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.017,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.017,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.017,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.017,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.033,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.017,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.017,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}]]]}],"nchapters":1,"t":1361405809022},"6":{"version":"","playername":"","name":"-1361405823577","chapters":[{"n":0,"t":1361405823577,"duration":9804,"state":[],"data":[[1361405823577,"think",[0.084,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[739,153],false,{}],[0.017,[739,153],false,{}],[0.016,[739,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.017,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.017,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[740,153],false,{}],[0.016,[739,153],false,{}],[0.016,[738,153],false,{}],[0.016,[736,154],false,{}],[0.016,[704,163],false,{}],[0.016,[680,168],false,{}],[0.016,[662,172],false,{}],[0.017,[650,173],false,{}],[0.016,[596,180],false,{}],[0.016,[563,182],false,{}],[0.016,[527,184],false,{}],[0.016,[489,184],false,{}],[0.016,[415,184],false,{}],[0.016,[385,183],false,{}],[0.016,[359,183],false,{}],[0.016,[335,183],false,{}],[0.016,[329,183],false,{}],[0.016,[323,184],false,{}],[0.016,[322,184],false,{}],[0.017,[322,185],false,{}],[0.016,[322,186],false,{}],[0.016,[322,186],false,{}],[0.016,[322,187],false,{}],[0.016,[322,192],false,{}],[0.016,[322,197],false,{}],[0.016,[322,201],false,{}],[0.016,[321,209],false,{}],[0.016,[321,213],false,{}],[0.016,[321,216],false,{}],[0.016,[321,221],false,{}],[0.017,[322,221],false,{}],[0.016,[323,221],false,{}],[0.016,[324,222],false,{}],[0.016,[331,222],false,{}],[0.016,[337,222],false,{}],[0.016,[344,221],false,{}],[0.016,[351,221],false,{}],[0.016,[363,220],false,{}],[0.016,[367,219],false,{}],[0.016,[370,219],false,{}],[0.016,[372,219],false,{}],[0.017,[374,218],false,{}],[0.016,[378,218],false,{}],[0.016,[386,217],false,{}],[0.016,[391,216],false,{}],[0.016,[396,216],false,{}],[0.016,[401,216],false,{}],[0.016,[403,216],false,{}],[0.016,[403,216],false,{}],[0.016,[404,217],false,{}],[0.016,[405,217],false,{}],[0.016,[407,217],false,{}],[0.016,[407,217],false,{}],[0.016,[408,217],false,{}],[0.017,[408,218],false,{}],[0.016,[408,218],false,{}],[0.016,[408,218],false,{}],[0.016,[408,218],false,{}],[0.016,[407,218],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.017,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[407,219],false,{}],[0.016,[406,220],false,{}],[0.016,[406,220],false,{}],[0.016,[406,220],false,{}],[0.016,[406,221],false,{}],[0.016,[406,221],false,{}],[0.016,[406,221],false,{}],[0.016,[408,223],false,{}],[0.016,[410,224],false,{}],[0.016,[412,226],false,{}],[0.017,[413,226],false,{}],[0.016,[414,226],false,{}],[0.016,[414,226],false,{}],[0.016,[414,226],false,{}],[0.016,[415,226],false,{}],[0.016,[415,226],false,{}],[0.016,[416,226],false,{}],[0.016,[418,226],false,{}],[0.016,[418,226],false,{}],[0.016,[419,226],false,{}],[0.016,[422,225],false,{}],[0.016,[423,225],false,{}],[0.017,[423,225],false,{}],[0.016,[423,225],false,{}],[0.016,[423,225],false,{}],[0.016,[423,225],false,{}],[0.016,[423,225],false,{}],[0.016,[423,225],false,{}],[0.016,[424,225],false,{}],[0.016,[424,225],false,{}],[0.016,[424,225],false,{}],[0.016,[424,225],false,{}],[0.016,[424,225],false,{}],[0.016,[424,225],false,{}],[0.017,[424,225],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.017,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,224],false,{}],[0.016,[424,223],false,{}],[0.016,[424,223],false,{}],[0.016,[424,223],false,{}],[0.016,[424,223],false,{}],[0.016,[424,223],false,{}],[0.016,[423,223],false,{}],[0.016,[423,223],false,{}],[0.016,[423,223],false,{}],[0.017,[423,223],false,{}],[0.016,[424,223],false,{}],[0.016,[424,223],false,{}],[0.016,[424,223],false,{}],[0.016,[425,223],false,{}],[0.016,[425,223],false,{}],[0.016,[427,223],false,{}],[0.016,[433,224],false,{}],[0.016,[447,227],false,{}],[0.016,[451,228],false,{}],[0.016,[453,229],false,{}],[0.016,[453,229],false,{}],[0.017,[453,229],false,{}],[0.016,[453,229],false,{}],[0.016,[453,229],false,{}],[0.016,[453,229],false,{}],[0.016,[453,229],false,{}],[0.016,[453,229],false,{}],[0.016,[452,229],false,{}],[0.016,[452,229],false,{}],[0.016,[451,229],false,{}],[0.016,[450,229],false,{}],[0.016,[450,228],false,{}],[0.017,[449,228],false,{}],[0.016,[447,227],false,{}],[0.016,[446,226],false,{}],[0.016,[445,225],false,{}],[0.016,[444,224],false,{}],[0.016,[444,223],false,{}],[0.016,[443,222],false,{}],[0.016,[442,221],false,{}],[0.016,[442,220],false,{}],[0.017,[442,220],false,{}],[0.016,[442,219],false,{}],[0.016,[441,219],false,{}],[0.016,[441,219],false,{}],[0.016,[441,218],false,{}],[0.016,[441,218],false,{}],[0.016,[441,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,218],false,{}],[0.017,[440,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,218],false,{}],[0.016,[440,219],false,{}],[0.016,[440,219],false,{}],[0.016,[440,219],false,{}],[0.016,[439,219],false,{}],[0.016,[439,219],false,{}],[0.016,[438,219],false,{}],[0.017,[438,219],false,{}],[0.016,[438,219],false,{}],[0.016,[438,219],false,{}],[0.016,[438,219],false,{}],[0.016,[437,219],false,{}],[0.016,[437,219],false,{}],[0.016,[436,219],false,{}],[0.016,[436,219],false,{}],[0.017,[435,219],false,{}],[0.016,[435,219],false,{}],[0.016,[435,219],false,{}],[0.016,[435,219],false,{}],[0.016,[435,219],false,{}],[0.016,[435,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.017,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,219],false,{}],[0.016,[434,220],false,{}],[0.016,[434,220],false,{}],[0.016,[434,220],false,{}],[0.016,[434,220],false,{}],[0.016,[434,220],false,{}],[0.016,[435,220],false,{}],[0.016,[435,220],false,{}],[0.016,[435,220],false,{}],[0.017,[436,220],false,{}],[0.016,[436,220],true,{}],[0.026000000000000002,[436,219],false,{}],[0.016,[436,219],false,{}],[0.016,[437,219],false,{}],[0.016,[437,219],false,{}],[0.017,[437,219],false,{}],[0.016,[437,219],false,{}],[0.016,[438,218],false,{}],[0.016,[438,218],false,{}],[0.016,[438,218],false,{}],[0.016,[439,219],false,{}],[0.016,[439,219],false,{}],[0.016,[441,220],false,{}],[0.016,[442,220],false,{}],[0.016,[443,221],false,{}],[0.016,[446,224],false,{}],[0.016,[450,226],false,{}],[0.017,[462,232],false,{}],[0.016,[502,260],false,{}],[0.016,[520,275],false,{}],[0.016,[535,288],false,{}],[0.016,[554,304],false,{}],[0.016,[561,308],false,{}],[0.016,[566,312],false,{}],[0.016,[575,317],false,{}],[0.016,[579,319],false,{}],[0.016,[583,321],false,{}],[0.016,[592,325],false,{}],[0.017,[597,326],false,{}],[0.016,[604,326],false,{}],[0.016,[630,321],false,{}],[0.016,[648,318],false,{}],[0.016,[665,314],false,{}],[0.016,[688,311],false,{}],[0.016,[688,311],false,{}],[0.016,[698,310],false,{}],[0.016,[700,310],false,{}],[0.017,[701,310],false,{}],[0.016,[701,310],false,{}],[0.016,[701,310],false,{}],[0.016,[701,310],false,{}],[0.016,[701,310],false,{}],[0.016,[700,310],false,{}],[0.016,[700,309],false,{}],[0.016,[699,309],false,{}],[0.016,[699,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.017,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.017,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.017,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.017,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,308],false,{}],[0.016,[698,309],false,{}],[0.016,[698,309],false,{}],[0.016,[698,309],false,{}],[0.016,[698,309],false,{}],[0.016,[698,309],false,{}],[0.017,[698,309],false,{}],[0.016,[698,309],false,{}],[0.016,[697,309],false,{}],[0.016,[697,309],false,{}],[0.016,[697,309],false,{}],[0.016,[697,308],false,{}],[0.016,[697,308],false,{}],[0.016,[697,308],false,{}],[0.016,[697,307],false,{}],[0.016,[698,307],false,{}],[0.016,[698,307],false,{}],[0.016,[698,307],false,{}],[0.016,[698,307],false,{}],[0.017,[699,307],false,{}],[0.016,[699,306],false,{}],[0.016,[699,306],false,{}],[0.016,[699,306],false,{}],[0.016,[699,306],false,{}],[0.016,[700,306],false,{}],[0.016,[700,306],false,{}],[0.016,[701,306],false,{}],[0.016,[701,306],false,{}],[0.016,[703,306],false,{}],[0.016,[707,306],false,{}],[0.016,[719,308],false,{}],[0.017,[724,309],false,{}],[0.016,[728,310],false,{}],[0.016,[730,311],false,{}],[0.016,[732,311],false,{}],[0.016,[732,311],false,{}],[0.016,[732,311],false,{}],[0.016,[732,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.017,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.017,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.027,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.033,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.016,[731,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}]]]}],"nchapters":1,"t":1361405823577},"7":{"version":"","playername":"","name":"-1361405833463","chapters":[{"n":0,"t":1361405833463,"duration":21932,"state":[],"data":[[1361405833463,"think",[0.082,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.017,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[732,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.017,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[733,312],false,{}],[0.016,[732,311],false,{}],[0.016,[732,311],false,{}],[0.016,[732,311],false,{}],[0.016,[732,311],false,{}],[0.016,[732,311],false,{}],[0.016,[731,311],false,{}],[0.017,[731,311],false,{}],[0.016,[731,310],false,{}],[0.016,[730,310],false,{}],[0.016,[730,310],false,{}],[0.016,[729,310],false,{}],[0.016,[728,309],false,{}],[0.016,[728,309],false,{}],[0.016,[727,309],false,{}],[0.016,[726,309],false,{}],[0.016,[726,309],false,{}],[0.016,[721,308],false,{}],[0.016,[705,303],false,{}],[0.017,[677,293],false,{}],[0.016,[615,267],false,{}],[0.016,[615,267],false,{}],[0.016,[563,237],false,{}],[0.02,[544,223],false,{}],[0.016,[542,221],false,{}],[0.016,[541,220],false,{}],[0.016,[542,219],false,{}],[0.016,[543,219],false,{}],[0.016,[544,219],false,{}],[0.016,[547,218],false,{}],[0.017,[553,217],false,{}],[0.016,[557,217],false,{}],[0.016,[563,217],false,{}],[0.016,[575,217],false,{}],[0.016,[580,217],false,{}],[0.016,[583,217],false,{}],[0.016,[585,217],false,{}],[0.016,[585,217],false,{}],[0.016,[585,217],false,{}],[0.016,[587,217],false,{}],[0.016,[591,214],false,{}],[0.016,[600,209],false,{}],[0.016,[615,203],false,{}],[0.017,[622,201],false,{}],[0.016,[638,198],false,{}],[0.016,[645,198],false,{}],[0.016,[651,198],false,{}],[0.016,[661,200],false,{}],[0.016,[663,200],false,{}],[0.016,[665,200],false,{}],[0.016,[666,200],false,{}],[0.016,[668,200],false,{}],[0.016,[674,201],false,{}],[0.016,[685,202],false,{}],[0.017,[695,203],false,{}],[0.016,[708,203],false,{}],[0.016,[711,203],false,{}],[0.016,[712,203],false,{}],[0.016,[713,203],false,{}],[0.016,[713,203],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.017,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.016,[714,202],false,{}],[0.017,[714,202],false,{}],[0.016,[715,202],false,{}],[0.016,[715,202],false,{}],[0.016,[715,201],false,{}],[0.016,[716,201],false,{}],[0.016,[716,201],false,{}],[0.016,[716,201],false,{}],[0.02,[716,201],false,{}],[0.016,[716,201],false,{}],[0.016,[716,201],false,{}],[0.017,[716,201],false,{}],[0.016,[716,201],false,{}],[0.016,[715,201],false,{}],[0.016,[715,201],false,{}],[0.016,[715,201],false,{}],[0.016,[714,201],false,{}],[0.016,[713,201],false,{}],[0.016,[713,201],false,{}],[0.016,[712,201],false,{}],[0.016,[711,201],false,{}],[0.016,[710,201],false,{}],[0.017,[710,201],false,{}],[0.016,[710,201],false,{}],[0.016,[709,201],false,{}],[0.016,[709,201],false,{}],[0.016,[708,201],false,{}],[0.016,[707,201],false,{}],[0.016,[704,201],false,{}],[0.016,[699,200],false,{}],[0.016,[698,200],false,{}],[0.016,[697,200],false,{}],[0.016,[697,200],false,{}],[0.017,[696,200],false,{}],[0.016,[696,200],false,{}],[0.016,[696,200],false,{}],[0.016,[697,200],false,{}],[0.016,[697,200],false,{}],[0.016,[697,200],false,{}],[0.016,[697,200],false,{}],[0.016,[698,200],false,{}],[0.016,[698,200],false,{}],[0.016,[699,200],false,{}],[0.016,[699,200],false,{}],[0.016,[699,199],false,{}],[0.017,[699,199],false,{}],[0.016,[700,199],false,{}],[0.016,[700,199],false,{}],[0.016,[700,199],false,{}],[0.016,[700,199],false,{}],[0.016,[700,199],false,{}],[0.016,[700,199],false,{}],[0.017,[700,199],false,{}],[0.016,[699,199],false,{}],[0.016,[699,199],false,{}],[0.016,[699,199],false,{}],[0.016,[699,200],false,{}],[0.016,[698,200],false,{}],[0.016,[697,200],false,{}],[0.016,[697,200],false,{}],[0.016,[695,201],false,{}],[0.016,[694,201],false,{}],[0.016,[694,201],false,{}],[0.016,[692,201],false,{}],[0.016,[691,201],false,{}],[0.017,[690,201],false,{}],[0.016,[688,201],false,{}],[0.016,[687,201],false,{}],[0.016,[686,201],false,{}],[0.016,[685,201],false,{}],[0.016,[684,201],false,{}],[0.016,[683,201],false,{}],[0.016,[681,200],false,{}],[0.016,[681,200],false,{}],[0.016,[680,200],false,{}],[0.016,[679,200],false,{}],[0.017,[679,200],false,{}],[0.016,[678,200],false,{}],[0.016,[678,200],false,{}],[0.016,[677,199],false,{}],[0.016,[677,199],false,{}],[0.016,[677,198],false,{}],[0.016,[677,198],false,{}],[0.016,[677,198],false,{}],[0.016,[677,198],false,{}],[0.016,[677,198],false,{}],[0.016,[677,197],false,{}],[0.016,[678,197],false,{}],[0.016,[678,197],false,{}],[0.017,[678,197],false,{}],[0.016,[678,197],false,{}],[0.016,[679,197],false,{}],[0.016,[679,197],false,{}],[0.016,[679,197],false,{}],[0.016,[680,197],false,{}],[0.016,[680,197],false,{}],[0.016,[680,197],false,{}],[0.016,[680,196],false,{}],[0.016,[680,196],false,{}],[0.016,[680,196],false,{}],[0.016,[680,196],false,{}],[0.017,[680,196],false,{}],[0.016,[680,196],false,{}],[0.016,[680,196],false,{}],[0.016,[679,196],false,{}],[0.016,[679,196],false,{}],[0.016,[679,196],false,{}],[0.016,[678,196],false,{}],[0.016,[678,196],false,{}],[0.016,[677,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[675,196],false,{}],[0.016,[674,196],false,{}],[0.017,[674,196],false,{}],[0.016,[673,197],false,{}],[0.016,[673,197],false,{}],[0.016,[673,197],false,{}],[0.016,[672,197],false,{}],[0.016,[672,197],false,{}],[0.016,[672,197],false,{}],[0.016,[672,197],false,{}],[0.016,[672,197],false,{}],[0.016,[672,197],false,{}],[0.016,[673,197],false,{}],[0.016,[673,197],false,{}],[0.016,[673,197],false,{}],[0.017,[673,197],false,{}],[0.016,[673,197],false,{}],[0.016,[673,197],false,{}],[0.016,[673,196],false,{}],[0.016,[674,196],false,{}],[0.016,[674,196],false,{}],[0.016,[674,196],false,{}],[0.016,[675,196],false,{}],[0.016,[675,196],false,{}],[0.016,[675,196],false,{}],[0.016,[675,196],false,{}],[0.016,[676,196],false,{}],[0.017,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.016,[676,196],false,{}],[0.017,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,195],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.017,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[678,196],false,{}],[0.016,[678,196],false,{}],[0.016,[678,196],false,{}],[0.016,[678,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,196],false,{}],[0.016,[677,195],false,{}],[0.016,[677,195],false,{}],[0.016,[677,195],false,{}],[0.016,[677,195],false,{}],[0.017,[677,195],false,{}],[0.016,[677,195],true,{}],[0.023,[677,195],false,{}],[0.016,[677,195],false,{}],[0.016,[678,195],false,{}],[0.016,[678,195],false,{}],[0.016,[678,195],false,{}],[0.017,[678,195],false,{}],[0.016,[678,195],false,{}],[0.016,[677,195],false,{}],[0.016,[676,195],false,{}],[0.016,[640,191],false,{}],[0.016,[603,186],false,{}],[0.016,[565,180],false,{}],[0.016,[492,169],false,{}],[0.016,[461,164],false,{}],[0.016,[428,158],false,{}],[0.017,[423,157],false,{}],[0.016,[421,157],false,{}],[0.016,[420,157],false,{}],[0.016,[420,157],false,{}],[0.016,[420,157],false,{}],[0.016,[420,158],false,{}],[0.016,[420,158],false,{}],[0.016,[420,159],false,{}],[0.016,[420,162],false,{}],[0.016,[419,165],false,{}],[0.016,[418,168],false,{}],[0.017,[418,170],false,{}],[0.016,[417,171],false,{}],[0.016,[417,173],false,{}],[0.016,[417,178],false,{}],[0.016,[417,179],false,{}],[0.016,[419,180],false,{}],[0.016,[425,185],false,{}],[0.016,[429,188],false,{}],[0.016,[434,189],false,{}],[0.017,[444,192],false,{}],[0.016,[448,192],false,{}],[0.016,[457,192],false,{}],[0.016,[461,192],false,{}],[0.016,[465,192],false,{}],[0.016,[469,192],false,{}],[0.016,[470,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.017,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[471,192],false,{}],[0.016,[470,192],false,{}],[0.016,[470,192],false,{}],[0.016,[470,192],false,{}],[0.017,[470,192],false,{}],[0.016,[470,192],false,{}],[0.016,[470,193],false,{}],[0.016,[469,193],false,{}],[0.016,[469,193],false,{}],[0.016,[469,193],false,{}],[0.016,[469,193],false,{}],[0.016,[469,193],false,{}],[0.017,[468,193],false,{}],[0.018000000000000002,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.017,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[467,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.017,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,193],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.017,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.017,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[468,192],false,{}],[0.016,[468,192],false,{}],[0.017,[468,192],false,{}],[0.016,[468,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[469,192],false,{}],[0.016,[470,192],false,{}],[0.017,[470,192],false,{}],[0.016,[470,191],false,{}],[0.02,[470,191],false,{}],[0.016,[470,191],false,{}],[0.016,[471,191],false,{}],[0.016,[471,191],false,{}],[0.016,[471,191],false,{}],[0.016,[471,191],false,{}],[0.016,[471,191],false,{}],[0.016,[472,191],false,{}],[0.016,[472,191],false,{}],[0.017,[473,191],false,{}],[0.016,[473,190],false,{}],[0.016,[473,190],false,{}],[0.016,[473,190],false,{}],[0.016,[474,190],false,{}],[0.016,[474,190],false,{}],[0.016,[474,190],false,{}],[0.016,[475,190],false,{}],[0.016,[475,190],false,{}],[0.016,[476,190],false,{}],[0.016,[476,190],false,{}],[0.017,[476,190],false,{}],[0.016,[476,190],false,{}],[0.016,[476,190],false,{}],[0.016,[476,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,190],false,{}],[0.016,[477,191],false,{}],[0.017,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.017,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[475,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[476,191],false,{}],[0.016,[477,191],false,{}],[0.016,[477,191],false,{}],[0.016,[477,191],false,{}],[0.016,[477,191],false,{}],[0.017,[478,191],false,{}],[0.016,[478,191],false,{}],[0.016,[478,191],false,{}],[0.016,[478,191],false,{}],[0.02,[478,191],false,{}],[0.016,[478,191],false,{}],[0.016,[478,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.017,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[480,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.017,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],true,{}],[0.024,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[480,192],false,{}],[0.017,[480,193],false,{}],[0.016,[479,195],false,{}],[0.016,[460,237],false,{}],[0.016,[441,282],false,{}],[0.016,[422,323],false,{}],[0.016,[388,385],false,{}],[0.016,[366,415],false,{}],[0.016,[344,439],false,{}],[0.016,[298,473],false,{}],[0.016,[277,487],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.017,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.016,[259,497],false,{}],[0.017,[258,497],false,{}],[0.016,[257,497],false,{}],[0.016,[254,498],false,{}],[0.016,[236,498],false,{}],[0.016,[224,498],false,{}],[0.016,[209,498],false,{}],[0.016,[176,497],false,{}],[0.016,[162,497],false,{}],[0.016,[153,496],false,{}],[0.016,[144,496],false,{}],[0.016,[143,496],false,{}],[0.017,[141,495],false,{}],[0.016,[141,495],false,{}],[0.016,[141,495],false,{}],[0.016,[140,495],false,{}],[0.016,[139,495],false,{}],[0.016,[138,495],false,{}],[0.016,[137,495],false,{}],[0.016,[129,495],false,{}],[0.016,[118,495],false,{}],[0.016,[105,495],false,{}],[0.016,[83,496],false,{}],[0.017,[77,496],false,{}],[0.016,[74,496],false,{}],[0.016,[71,497],false,{}],[0.016,[71,497],false,{}],[0.016,[70,497],false,{}],[0.016,[70,497],false,{}],[0.016,[70,498],false,{}],[0.016,[70,498],false,{}],[0.016,[70,498],false,{}],[0.016,[69,498],false,{}],[0.016,[69,498],false,{}],[0.016,[69,498],false,{}],[0.016,[67,498],false,{}],[0.017,[53,499],false,{}],[0.016,[47,499],false,{}],[0.016,[42,499],false,{}],[0.016,[42,499],false,{}],[0.016,[41,499],false,{}],[0.016,[41,498],false,{}],[0.016,[41,498],false,{}],[0.016,[41,498],false,{}],[0.016,[41,498],false,{}],[0.016,[41,498],false,{}],[0.016,[41,498],false,{}],[0.017,[41,498],false,{}],[0.016,[42,498],false,{}],[0.016,[42,498],false,{}],[0.016,[42,498],false,{}],[0.016,[43,498],false,{}],[0.016,[43,498],false,{}],[0.016,[44,498],false,{}],[0.016,[44,498],false,{}],[0.016,[44,498],false,{}],[0.016,[44,498],false,{}],[0.016,[45,498],false,{}],[0.016,[45,498],false,{}],[0.017,[45,498],false,{}],[0.016,[46,498],false,{}],[0.016,[46,498],false,{}],[0.016,[46,498],false,{}],[0.016,[47,498],false,{}],[0.016,[48,498],false,{}],[0.016,[48,498],false,{}],[0.016,[49,498],false,{}],[0.016,[51,498],false,{}],[0.016,[52,499],false,{}],[0.016,[54,499],false,{}],[0.016,[54,499],false,{}],[0.017,[55,499],false,{}],[0.016,[56,499],false,{}],[0.016,[57,499],false,{}],[0.016,[57,499],false,{}],[0.016,[61,499],false,{}],[0.016,[63,498],false,{}],[0.016,[64,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.017,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[65,498],false,{}],[0.016,[66,498],false,{}],[0.016,[66,498],false,{}],[0.017,[66,498],false,{}],[0.016,[66,498],false,{}],[0.016,[66,498],false,{}],[0.016,[67,498],false,{}],[0.016,[70,498],false,{}],[0.016,[74,498],false,{}],[0.016,[82,498],false,{}],[0.016,[84,498],false,{}],[0.016,[85,498],false,{}],[0.016,[85,498],false,{}],[0.017,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.017,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.017,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,498],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[85,499],false,{}],[0.017,[85,499],false,{}],[0.016,[85,499],false,{}],[0.016,[85,499],false,{}],[0.016,[85,499],false,{}],[0.016,[85,499],false,{}],[0.016,[85,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[86,499],false,{}],[0.016,[87,499],false,{}],[0.016,[87,499],false,{}],[0.016,[87,499],false,{}],[0.017,[88,499],false,{}],[0.016,[88,499],false,{}],[0.016,[88,499],false,{}],[0.016,[89,499],false,{}],[0.016,[89,499],false,{}],[0.016,[89,499],false,{}],[0.016,[90,499],false,{}],[0.016,[90,499],false,{}],[0.016,[90,499],false,{}],[0.016,[91,499],false,{}],[0.017,[91,499],false,{}],[0.016,[92,499],false,{}],[0.016,[92,499],false,{}],[0.016,[92,499],false,{}],[0.016,[93,499],false,{}],[0.016,[94,499],false,{}],[0.016,[94,499],false,{}],[0.016,[94,499],false,{}],[0.016,[94,499],false,{}],[0.016,[94,499],false,{}],[0.016,[95,499],false,{}],[0.016,[95,499],false,{}],[0.016,[95,498],false,{}],[0.017,[96,498],false,{}],[0.016,[96,498],false,{}],[0.016,[96,498],false,{}],[0.016,[97,498],false,{}],[0.016,[97,498],false,{}],[0.016,[97,498],false,{}],[0.016,[97,498],false,{}],[0.016,[98,498],false,{}],[0.016,[98,497],false,{}],[0.016,[99,497],false,{}],[0.016,[99,497],false,{}],[0.016,[99,496],false,{}],[0.017,[99,496],false,{}],[0.016,[99,496],false,{}],[0.016,[100,496],false,{}],[0.016,[100,496],false,{}],[0.016,[100,496],false,{}],[0.02,[100,496],false,{}],[0.016,[100,496],false,{}],[0.016,[100,496],false,{}],[0.017,[100,496],false,{}],[0.016,[100,496],false,{}],[0.016,[100,496],false,{}],[0.016,[100,496],false,{}],[0.016,[99,496],false,{}],[0.016,[99,496],false,{}],[0.016,[99,496],false,{}],[0.016,[99,496],true,{}],[0.021,[99,496],false,{}],[0.016,[99,496],false,{}],[0.017,[99,496],false,{}],[0.016,[99,496],false,{}],[0.016,[99,496],false,{}],[0.016,[99,496],false,{}],[0.016,[100,496],false,{}],[0.016,[100,496],false,{}],[0.016,[102,496],false,{}],[0.016,[105,497],false,{}],[0.016,[109,497],false,{}],[0.016,[120,497],false,{}],[0.016,[126,497],false,{}],[0.016,[133,496],false,{}],[0.017,[154,493],false,{}],[0.016,[172,489],false,{}],[0.016,[216,479],false,{}],[0.016,[235,475],false,{}],[0.016,[246,472],false,{}],[0.016,[258,469],false,{}],[0.016,[260,469],false,{}],[0.016,[262,468],false,{}],[0.016,[263,468],false,{}],[0.016,[265,468],false,{}],[0.016,[267,468],false,{}],[0.016,[271,468],false,{}],[0.017,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,469],false,{}],[0.016,[272,470],false,{}],[0.016,[271,470],false,{}],[0.017,[271,470],false,{}],[0.016,[271,470],false,{}],[0.016,[271,470],false,{}],[0.016,[271,470],false,{}],[0.016,[271,471],false,{}],[0.016,[270,471],false,{}],[0.017,[270,471],false,{}],[0.016,[270,472],false,{}],[0.016,[270,472],false,{}],[0.016,[270,472],false,{}],[0.016,[270,472],false,{}],[0.016,[270,472],false,{}],[0.016,[270,472],false,{}],[0.016,[270,472],false,{}],[0.016,[270,473],false,{}],[0.017,[270,473],false,{}],[0.016,[269,473],false,{}],[0.016,[269,473],false,{}],[0.016,[269,473],false,{}],[0.016,[269,474],false,{}],[0.016,[269,474],false,{}],[0.016,[269,474],false,{}],[0.016,[269,474],false,{}],[0.016,[269,474],false,{}],[0.016,[269,474],false,{}],[0.016,[269,474],false,{}],[0.016,[270,474],false,{}],[0.016,[273,475],false,{}],[0.017,[274,475],false,{}],[0.016,[274,475],false,{}],[0.016,[275,475],false,{}],[0.016,[275,476],false,{}],[0.016,[275,476],false,{}],[0.016,[275,476],false,{}],[0.016,[276,476],false,{}],[0.016,[276,476],false,{}],[0.016,[276,476],false,{}],[0.016,[278,476],false,{}],[0.016,[279,476],false,{}],[0.017,[279,476],false,{}],[0.016,[281,477],false,{}],[0.016,[283,477],false,{}],[0.016,[284,477],false,{}],[0.016,[285,478],false,{}],[0.016,[286,478],false,{}],[0.016,[287,478],false,{}],[0.016,[292,479],false,{}],[0.016,[295,479],false,{}],[0.016,[299,479],false,{}],[0.016,[304,479],false,{}],[0.016,[305,479],false,{}],[0.016,[305,479],false,{}],[0.017,[306,479],false,{}],[0.016,[306,479],false,{}],[0.016,[306,479],false,{}],[0.016,[307,479],false,{}],[0.016,[308,479],false,{}],[0.016,[308,479],false,{}],[0.016,[309,480],false,{}],[0.016,[310,480],false,{}],[0.016,[310,480],false,{}],[0.016,[310,480],false,{}],[0.017,[310,480],false,{}],[0.016,[310,480],false,{}],[0.016,[311,480],false,{}],[0.016,[311,480],false,{}],[0.016,[311,480],false,{}],[0.016,[312,480],false,{}],[0.016,[313,480],false,{}],[0.016,[315,480],false,{}],[0.016,[315,480],false,{}],[0.016,[315,480],false,{}],[0.016,[316,481],false,{}],[0.016,[316,481],false,{}],[0.017,[316,481],false,{}],[0.016,[316,481],false,{}],[0.016,[316,481],false,{}],[0.016,[316,481],false,{}],[0.016,[316,481],false,{}],[0.016,[315,482],false,{}],[0.016,[313,482],false,{}],[0.016,[312,483],false,{}],[0.017,[311,483],false,{}],[0.016,[311,483],false,{}],[0.016,[309,483],false,{}],[0.016,[308,483],false,{}],[0.016,[307,483],false,{}],[0.016,[306,483],false,{}],[0.016,[305,483],false,{}],[0.016,[305,483],false,{}],[0.016,[304,483],false,{}],[0.016,[304,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.017,[302,483],false,{}],[0.016,[302,483],false,{}],[0.016,[302,483],false,{}],[0.016,[302,482],false,{}],[0.016,[302,482],false,{}],[0.016,[302,482],false,{}],[0.016,[302,482],false,{}],[0.016,[303,482],false,{}],[0.016,[303,482],false,{}],[0.016,[303,482],false,{}],[0.016,[303,482],false,{}],[0.016,[303,482],false,{}],[0.016,[303,482],false,{}],[0.017,[304,483],false,{}],[0.016,[304,483],false,{}],[0.016,[305,483],false,{}],[0.016,[305,483],false,{}],[0.016,[305,483],false,{}],[0.016,[306,483],false,{}],[0.016,[306,482],false,{}],[0.016,[306,482],false,{}],[0.016,[307,482],false,{}],[0.016,[307,483],false,{}],[0.016,[307,483],false,{}],[0.016,[308,483],false,{}],[0.017,[308,483],false,{}],[0.016,[308,483],false,{}],[0.016,[308,483],false,{}],[0.016,[309,483],false,{}],[0.016,[309,483],false,{}],[0.016,[309,484],false,{}],[0.016,[309,484],false,{}],[0.016,[309,484],false,{}],[0.016,[309,484],false,{}],[0.016,[309,484],false,{}],[0.016,[309,484],false,{}],[0.017,[309,484],false,{}],[0.016,[309,484],false,{}],[0.016,[308,484],false,{}],[0.016,[308,484],false,{}],[0.016,[308,484],false,{}],[0.016,[308,484],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.017,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.017,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.016,[308,485],false,{}],[0.017,[308,485],false,{}],[0.016,[307,485],false,{}],[0.016,[307,485],false,{}],[0.016,[307,485],false,{}],[0.016,[307,485],false,{}],[0.016,[307,485],false,{}],[0.016,[307,485],false,{}],[0.016,[306,485],false,{}],[0.016,[306,485],false,{}],[0.016,[306,485],false,{}],[0.016,[306,485],false,{}],[0.016,[306,485],false,{}],[0.017,[305,485],false,{}],[0.016,[305,485],false,{}],[0.016,[305,485],false,{}],[0.016,[304,485],false,{}],[0.016,[304,485],false,{}],[0.016,[304,485],false,{}],[0.016,[304,485],false,{}],[0.016,[304,485],false,{}],[0.016,[303,485],false,{}],[0.016,[303,485],false,{}],[0.016,[303,485],false,{}],[0.017,[302,485],false,{}],[0.016,[302,485],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.017,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.017,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[302,484],false,{}],[0.016,[303,484],false,{}],[0.016,[303,484],true,{}],[0.024,[303,484],false,{}],[0.016,[303,484],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.017,[303,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,483],false,{}],[0.016,[303,482],false,{}],[0.016,[302,482],false,{}],[0.016,[301,482],false,{}],[0.016,[299,481],false,{}],[0.016,[298,481],false,{}],[0.017,[280,477],false,{}],[0.016,[254,472],false,{}],[0.016,[203,457],false,{}],[0.016,[188,451],false,{}],[0.016,[180,448],false,{}],[0.016,[175,446],false,{}],[0.016,[174,445],false,{}],[0.016,[174,445],false,{}],[0.016,[174,444],false,{}],[0.016,[174,443],false,{}],[0.016,[174,443],false,{}],[0.016,[174,442],false,{}],[0.016,[174,440],false,{}],[0.017,[175,436],false,{}],[0.016,[177,427],false,{}],[0.016,[183,407],false,{}],[0.016,[185,401],false,{}],[0.016,[185,399],false,{}],[0.016,[185,397],false,{}],[0.016,[185,397],false,{}],[0.016,[184,397],false,{}],[0.016,[184,396],false,{}],[0.016,[182,395],false,{}],[0.016,[179,390],false,{}],[0.016,[155,339],false,{}],[0.017,[136,307],false,{}],[0.016,[113,275],false,{}],[0.016,[72,221],false,{}],[0.016,[56,201],false,{}],[0.016,[46,187],false,{}],[0.016,[37,176],false,{}],[0.016,[35,174],false,{}],[0.016,[35,172],false,{}],[0.016,[36,171],false,{}],[0.016,[37,170],false,{}],[0.017,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.017,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.016,[37,170],false,{}],[0.017,[37,170],false,{}],[0.016,[38,171],false,{}],[0.016,[38,172],false,{}],[0.016,[39,174],false,{}],[0.016,[40,176],false,{}],[0.016,[46,190],false,{}],[0.016,[50,200],false,{}],[0.016,[56,212],false,{}],[0.016,[70,236],false,{}],[0.016,[78,247],false,{}],[0.016,[85,257],false,{}],[0.017,[93,267],false,{}],[0.016,[109,287],false,{}],[0.016,[116,297],false,{}],[0.016,[121,305],false,{}],[0.016,[128,315],false,{}],[0.016,[130,318],false,{}],[0.016,[131,319],false,{}],[0.016,[132,319],false,{}],[0.016,[132,319],false,{}],[0.016,[132,319],false,{}],[0.016,[133,320],false,{}],[0.016,[134,322],false,{}],[0.016,[137,325],false,{}],[0.017,[138,326],false,{}],[0.016,[138,326],false,{}],[0.016,[138,326],false,{}],[0.016,[138,326],false,{}],[0.016,[138,326],false,{}],[0.016,[139,325],false,{}],[0.016,[139,325],false,{}],[0.016,[139,324],false,{}],[0.016,[139,324],false,{}],[0.016,[139,324],false,{}],[0.017,[139,324],false,{}],[0.016,[139,323],false,{}],[0.016,[139,323],false,{}],[0.016,[140,323],false,{}],[0.016,[140,323],false,{}],[0.016,[140,322],false,{}],[0.016,[140,322],false,{}],[0.016,[140,322],false,{}],[0.016,[140,321],false,{}],[0.016,[140,321],false,{}],[0.016,[140,321],false,{}],[0.016,[140,320],false,{}],[0.017,[140,320],false,{}],[0.016,[140,320],false,{}],[0.016,[140,320],false,{}],[0.016,[140,320],false,{}],[0.016,[139,320],false,{}],[0.016,[139,320],false,{}],[0.016,[139,320],false,{}],[0.016,[139,320],false,{}],[0.016,[138,320],false,{}],[0.016,[138,321],false,{}],[0.016,[137,322],false,{}],[0.016,[136,324],false,{}],[0.017,[136,324],false,{}],[0.016,[135,324],false,{}],[0.016,[131,330],false,{}],[0.016,[126,335],false,{}],[0.016,[119,343],false,{}],[0.016,[118,345],false,{}],[0.016,[116,346],false,{}],[0.016,[116,346],false,{}],[0.016,[115,346],false,{}],[0.016,[115,346],false,{}],[0.016,[115,346],false,{}],[0.016,[115,346],false,{}],[0.017,[115,346],false,{}],[0.016,[115,346],false,{}],[0.016,[115,345],false,{}],[0.016,[115,345],false,{}],[0.016,[115,345],false,{}],[0.016,[115,345],false,{}],[0.016,[115,344],false,{}],[0.016,[115,344],false,{}],[0.016,[115,343],false,{}],[0.016,[115,343],false,{}],[0.016,[115,342],false,{}],[0.016,[115,342],false,{}],[0.017,[115,342],false,{}],[0.016,[115,342],false,{}],[0.016,[115,342],false,{}],[0.016,[116,342],false,{}],[0.016,[116,343],false,{}],[0.016,[116,343],false,{}],[0.016,[116,344],false,{}],[0.016,[116,345],false,{}],[0.016,[116,345],false,{}],[0.016,[116,346],false,{}],[0.016,[116,346],false,{}],[0.016,[116,347],false,{}],[0.017,[116,347],false,{}],[0.016,[116,347],false,{}],[0.016,[116,347],false,{}],[0.016,[116,347],false,{}],[0.016,[116,347],false,{}],[0.016,[117,347],false,{}],[0.016,[117,347],false,{}],[0.016,[118,347],false,{}],[0.016,[118,347],false,{}],[0.017,[118,347],false,{}],[0.016,[119,346],false,{}],[0.016,[122,346],false,{}],[0.016,[126,346],false,{}],[0.016,[136,346],false,{}],[0.016,[139,346],false,{}],[0.016,[143,346],false,{}],[0.016,[149,345],false,{}],[0.016,[160,343],false,{}],[0.017,[165,341],false,{}],[0.016,[172,340],false,{}],[0.016,[175,339],false,{}],[0.016,[186,336],false,{}],[0.016,[192,334],false,{}],[0.016,[197,332],false,{}],[0.016,[203,331],false,{}],[0.016,[205,330],false,{}],[0.016,[205,330],false,{}],[0.016,[206,330],false,{}],[0.016,[206,330],false,{}],[0.016,[206,330],false,{}],[0.017,[206,330],false,{}],[0.016,[206,330],false,{}],[0.016,[206,330],false,{}],[0.016,[206,330],false,{}],[0.016,[205,331],false,{}],[0.016,[205,331],false,{}],[0.016,[204,332],false,{}],[0.016,[204,333],false,{}],[0.016,[204,333],false,{}],[0.016,[204,332],false,{}],[0.016,[204,332],false,{}],[0.017,[205,331],false,{}],[0.016,[206,331],false,{}],[0.016,[222,323],false,{}],[0.016,[245,314],false,{}],[0.016,[268,305],false,{}],[0.016,[312,290],false,{}],[0.016,[327,285],false,{}],[0.016,[337,281],false,{}],[0.016,[349,276],false,{}],[0.016,[350,275],false,{}],[0.016,[351,275],false,{}],[0.016,[352,275],false,{}],[0.017,[352,275],false,{}],[0.016,[352,275],false,{}],[0.016,[352,275],false,{}],[0.016,[352,275],false,{}],[0.016,[352,275],false,{}],[0.016,[352,276],false,{}],[0.016,[351,276],false,{}],[0.016,[351,276],false,{}],[0.016,[349,277],false,{}],[0.016,[346,278],false,{}],[0.016,[340,279],false,{}],[0.016,[326,283],false,{}],[0.016,[292,292],false,{}],[0.017,[275,296],false,{}],[0.016,[257,301],false,{}],[0.016,[232,309],false,{}],[0.016,[226,311],false,{}],[0.016,[222,312],false,{}],[0.016,[219,312],false,{}],[0.016,[219,313],false,{}],[0.016,[219,313],false,{}],[0.016,[218,313],false,{}],[0.016,[218,313],false,{}],[0.016,[218,313],false,{}],[0.016,[218,313],false,{}],[0.017,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.016,[217,312],false,{}],[0.017,[217,312],false,{}],[0.016,[217,313],false,{}],[0.016,[217,313],false,{}],[0.016,[215,317],false,{}],[0.016,[208,325],false,{}],[0.016,[201,334],false,{}],[0.016,[194,343],false,{}],[0.016,[193,345],false,{}],[0.016,[189,349],false,{}],[0.016,[181,357],false,{}],[0.017,[179,360],false,{}],[0.016,[178,361],false,{}],[0.016,[177,361],false,{}],[0.016,[177,361],false,{}],[0.016,[177,361],false,{}],[0.016,[177,361],false,{}],[0.016,[177,360],false,{}],[0.016,[177,360],false,{}],[0.016,[177,360],false,{}],[0.016,[177,360],false,{}],[0.016,[177,360],false,{}],[0.016,[177,360],false,{}],[0.016,[177,360],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}]]]}],"nchapters":1,"t":1361405833463},"8":{"version":"","playername":"","name":"-1361405855481","chapters":[{"n":0,"t":1361405855481,"duration":9926,"state":[],"data":[[1361405855481,"think",[0.08700000000000001,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.017,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[177,359],false,{}],[0.016,[217,338],false,{}],[0.016,[245,320],false,{}],[0.016,[273,299],false,{}],[0.016,[300,278],false,{}],[0.016,[328,253],false,{}],[0.016,[379,203],false,{}],[0.016,[399,180],false,{}],[0.016,[416,159],false,{}],[0.017,[440,124],false,{}],[0.016,[445,115],false,{}],[0.016,[448,110],false,{}],[0.016,[451,104],false,{}],[0.016,[452,102],false,{}],[0.016,[453,100],false,{}],[0.016,[455,97],false,{}],[0.016,[456,94],false,{}],[0.016,[456,94],false,{}],[0.016,[455,94],false,{}],[0.016,[455,94],false,{}],[0.016,[455,93],false,{}],[0.017,[454,93],false,{}],[0.016,[454,93],false,{}],[0.016,[454,93],false,{}],[0.016,[454,94],false,{}],[0.016,[454,95],false,{}],[0.016,[453,97],false,{}],[0.016,[449,105],false,{}],[0.016,[445,114],false,{}],[0.016,[438,127],false,{}],[0.016,[424,154],false,{}],[0.016,[419,161],false,{}],[0.016,[418,163],false,{}],[0.017,[418,165],false,{}],[0.016,[418,165],false,{}],[0.016,[418,165],false,{}],[0.016,[418,165],false,{}],[0.016,[418,165],false,{}],[0.016,[418,164],false,{}],[0.016,[418,164],false,{}],[0.016,[418,164],false,{}],[0.016,[418,164],false,{}],[0.016,[418,164],false,{}],[0.016,[418,164],false,{}],[0.016,[419,164],false,{}],[0.017,[419,164],false,{}],[0.016,[419,164],false,{}],[0.016,[419,164],false,{}],[0.016,[419,164],false,{}],[0.016,[419,164],false,{}],[0.016,[419,164],false,{}],[0.016,[419,164],false,{}],[0.016,[420,164],false,{}],[0.016,[420,164],false,{}],[0.016,[421,164],false,{}],[0.016,[425,165],false,{}],[0.016,[426,165],false,{}],[0.017,[427,165],false,{}],[0.016,[427,166],false,{}],[0.016,[427,166],false,{}],[0.016,[427,166],false,{}],[0.016,[427,166],false,{}],[0.016,[428,166],false,{}],[0.016,[428,167],false,{}],[0.016,[429,168],false,{}],[0.018000000000000002,[430,170],false,{}],[0.016,[431,171],false,{}],[0.016,[432,172],false,{}],[0.016,[432,174],false,{}],[0.016,[432,174],false,{}],[0.017,[432,174],false,{}],[0.016,[432,174],false,{}],[0.016,[432,174],false,{}],[0.016,[432,175],false,{}],[0.016,[432,175],false,{}],[0.016,[432,175],false,{}],[0.016,[432,175],false,{}],[0.016,[432,175],false,{}],[0.016,[432,175],false,{}],[0.016,[433,175],false,{}],[0.016,[433,178],false,{}],[0.017,[435,180],false,{}],[0.016,[436,183],false,{}],[0.016,[436,183],false,{}],[0.016,[436,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.017,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[437,183],false,{}],[0.016,[438,183],false,{}],[0.016,[438,183],false,{}],[0.016,[438,183],false,{}],[0.016,[438,182],false,{}],[0.017,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.017,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.022,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.017,[439,182],false,{}],[0.016,[439,182],false,{}],[0.016,[439,182],false,{}],[0.016,[439,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,182],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.017,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],true,{}],[0.026000000000000002,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.017,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[438,181],false,{}],[0.016,[437,184],false,{}],[0.016,[433,200],false,{}],[0.016,[426,225],false,{}],[0.016,[405,276],false,{}],[0.017,[394,303],false,{}],[0.016,[382,329],false,{}],[0.016,[371,353],false,{}],[0.016,[356,400],false,{}],[0.016,[351,422],false,{}],[0.016,[347,443],false,{}],[0.016,[345,457],false,{}],[0.016,[346,469],false,{}],[0.016,[346,472],false,{}],[0.016,[347,474],false,{}],[0.016,[347,475],false,{}],[0.017,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.016,[348,476],false,{}],[0.018000000000000002,[348,474],false,{}],[0.016,[348,474],false,{}],[0.016,[349,472],false,{}],[0.016,[349,472],false,{}],[0.016,[349,472],false,{}],[0.016,[349,472],false,{}],[0.017,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[349,471],false,{}],[0.016,[350,470],false,{}],[0.016,[350,470],false,{}],[0.016,[350,470],false,{}],[0.016,[350,470],false,{}],[0.016,[351,470],false,{}],[0.017,[351,469],false,{}],[0.016,[351,469],false,{}],[0.016,[351,469],false,{}],[0.016,[352,469],false,{}],[0.016,[352,469],false,{}],[0.016,[352,468],false,{}],[0.016,[352,468],false,{}],[0.016,[353,468],false,{}],[0.016,[353,467],false,{}],[0.016,[354,467],false,{}],[0.016,[354,467],false,{}],[0.016,[354,466],false,{}],[0.016,[355,465],false,{}],[0.017,[355,465],false,{}],[0.016,[355,464],false,{}],[0.016,[356,464],false,{}],[0.016,[356,464],false,{}],[0.016,[356,463],false,{}],[0.016,[357,463],false,{}],[0.016,[357,462],false,{}],[0.016,[357,462],false,{}],[0.016,[357,462],false,{}],[0.016,[359,461],false,{}],[0.016,[361,460],false,{}],[0.017,[365,457],false,{}],[0.016,[367,456],false,{}],[0.016,[368,456],false,{}],[0.016,[368,456],false,{}],[0.016,[368,456],false,{}],[0.016,[368,456],false,{}],[0.016,[368,456],false,{}],[0.016,[368,456],false,{}],[0.016,[367,456],false,{}],[0.016,[366,457],false,{}],[0.016,[365,458],false,{}],[0.017,[364,458],false,{}],[0.016,[364,459],false,{}],[0.016,[363,459],false,{}],[0.016,[363,460],false,{}],[0.016,[362,460],false,{}],[0.016,[361,461],false,{}],[0.016,[361,461],false,{}],[0.016,[361,461],false,{}],[0.016,[361,461],false,{}],[0.016,[361,461],false,{}],[0.016,[361,461],false,{}],[0.017,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.017,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.017,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[360,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,461],false,{}],[0.016,[359,460],false,{}],[0.017,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.016,[359,460],false,{}],[0.018000000000000002,[359,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,459],false,{}],[0.016,[358,459],false,{}],[0.016,[358,460],false,{}],[0.017,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,460],false,{}],[0.016,[358,459],false,{}],[0.016,[359,459],false,{}],[0.016,[359,459],false,{}],[0.016,[360,459],false,{}],[0.016,[360,458],false,{}],[0.016,[360,458],false,{}],[0.016,[360,458],false,{}],[0.017,[360,457],false,{}],[0.016,[360,457],false,{}],[0.016,[360,456],false,{}],[0.016,[360,456],false,{}],[0.016,[360,456],false,{}],[0.016,[360,455],false,{}],[0.016,[360,455],false,{}],[0.016,[360,455],false,{}],[0.016,[360,455],false,{}],[0.016,[360,454],false,{}],[0.017,[360,454],false,{}],[0.016,[360,454],false,{}],[0.016,[360,454],false,{}],[0.016,[360,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.017,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.017,[359,454],false,{}],[0.016,[359,453],false,{}],[0.016,[359,453],false,{}],[0.016,[359,453],false,{}],[0.016,[359,453],false,{}],[0.016,[359,453],false,{}],[0.016,[359,453],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.016,[359,454],false,{}],[0.017,[359,454],true,{}],[0.026000000000000002,[359,453],false,{}],[0.017,[359,453],false,{}],[0.016,[359,452],false,{}],[0.016,[359,452],false,{}],[0.016,[359,452],false,{}],[0.016,[359,452],false,{}],[0.016,[358,452],false,{}],[0.016,[358,452],false,{}],[0.016,[358,452],false,{}],[0.016,[358,452],false,{}],[0.016,[358,453],false,{}],[0.017,[358,453],false,{}],[0.016,[357,454],false,{}],[0.016,[357,454],false,{}],[0.016,[357,455],false,{}],[0.016,[356,456],false,{}],[0.016,[355,456],false,{}],[0.016,[354,457],false,{}],[0.017,[345,459],false,{}],[0.016,[337,460],false,{}],[0.016,[327,461],false,{}],[0.016,[316,462],false,{}],[0.016,[296,462],false,{}],[0.016,[288,462],false,{}],[0.016,[280,462],false,{}],[0.016,[271,462],false,{}],[0.016,[269,462],false,{}],[0.017,[269,462],false,{}],[0.016,[268,461],false,{}],[0.016,[268,461],false,{}],[0.016,[268,461],false,{}],[0.016,[268,461],false,{}],[0.016,[268,461],false,{}],[0.016,[268,460],false,{}],[0.016,[267,460],false,{}],[0.016,[267,460],false,{}],[0.016,[267,459],false,{}],[0.017,[266,459],false,{}],[0.016,[266,459],false,{}],[0.016,[266,458],false,{}],[0.016,[265,458],false,{}],[0.016,[263,457],false,{}],[0.016,[258,454],false,{}],[0.016,[221,437],false,{}],[0.016,[202,428],false,{}],[0.016,[185,422],false,{}],[0.017,[163,414],false,{}],[0.016,[156,412],false,{}],[0.016,[152,411],false,{}],[0.016,[147,410],false,{}],[0.016,[146,409],false,{}],[0.016,[145,409],false,{}],[0.016,[144,409],false,{}],[0.016,[144,409],false,{}],[0.016,[141,410],false,{}],[0.016,[135,410],false,{}],[0.016,[111,412],false,{}],[0.016,[104,413],false,{}],[0.017,[98,413],false,{}],[0.016,[92,414],false,{}],[0.016,[92,414],false,{}],[0.016,[92,414],false,{}],[0.016,[92,414],false,{}],[0.016,[92,414],false,{}],[0.016,[92,414],false,{}],[0.016,[94,414],false,{}],[0.016,[94,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}]]]}],"nchapters":1,"t":1361405855481},"9":{"version":"","playername":"","name":"-1361405865490","chapters":[{"n":0,"t":1361405865490,"duration":18332,"state":[],"data":[[1361405865491,"think",[0.084,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.016,[95,414],false,{}],[0.017,[95,414],false,{}],[0.016,[95,413],false,{}],[0.016,[96,413],false,{}],[0.016,[96,413],false,{}],[0.016,[96,413],false,{}],[0.016,[96,413],false,{}],[0.016,[96,413],false,{}],[0.016,[96,413],false,{}],[0.016,[96,413],false,{}],[0.016,[97,413],false,{}],[0.016,[98,413],false,{}],[0.017,[99,414],false,{}],[0.016,[101,414],false,{}],[0.016,[104,415],false,{}],[0.016,[106,416],false,{}],[0.016,[109,417],false,{}],[0.016,[119,419],false,{}],[0.016,[126,421],false,{}],[0.016,[135,422],false,{}],[0.016,[162,426],false,{}],[0.016,[181,427],false,{}],[0.017,[202,427],false,{}],[0.016,[248,428],false,{}],[0.016,[269,428],false,{}],[0.016,[288,429],false,{}],[0.016,[331,431],false,{}],[0.016,[355,432],false,{}],[0.016,[378,433],false,{}],[0.017,[425,435],false,{}],[0.016,[448,435],false,{}],[0.016,[470,436],false,{}],[0.016,[508,439],false,{}],[0.016,[522,441],false,{}],[0.016,[528,442],false,{}],[0.016,[543,445],false,{}],[0.016,[549,446],false,{}],[0.016,[554,447],false,{}],[0.016,[561,449],false,{}],[0.017,[563,450],false,{}],[0.016,[565,451],false,{}],[0.016,[565,451],false,{}],[0.016,[565,452],false,{}],[0.016,[565,452],false,{}],[0.016,[567,452],false,{}],[0.016,[569,454],false,{}],[0.016,[573,456],false,{}],[0.016,[581,461],false,{}],[0.016,[585,463],false,{}],[0.017,[588,465],false,{}],[0.016,[591,466],false,{}],[0.016,[596,470],false,{}],[0.016,[598,472],false,{}],[0.016,[600,474],false,{}],[0.016,[603,477],false,{}],[0.016,[603,477],false,{}],[0.016,[603,477],false,{}],[0.016,[603,479],false,{}],[0.016,[604,480],false,{}],[0.016,[605,482],false,{}],[0.017,[612,490],false,{}],[0.016,[617,493],false,{}],[0.016,[621,497],false,{}],[0.016,[626,500],false,{}],[0.016,[626,500],false,{}],[0.016,[627,501],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.017,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.017,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.017,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[627,499],false,{}],[0.016,[628,499],false,{}],[0.016,[630,500],false,{}],[0.016,[640,501],false,{}],[0.017,[646,502],false,{}],[0.016,[659,503],false,{}],[0.016,[667,504],false,{}],[0.016,[676,504],false,{}],[0.016,[685,504],false,{}],[0.017,[697,504],false,{}],[0.016,[700,504],false,{}],[0.016,[702,504],false,{}],[0.016,[703,504],false,{}],[0.016,[703,504],false,{}],[0.016,[704,504],false,{}],[0.016,[710,504],false,{}],[0.016,[718,504],false,{}],[0.016,[725,504],false,{}],[0.016,[733,504],false,{}],[0.016,[736,504],false,{}],[0.016,[736,504],false,{}],[0.016,[737,504],false,{}],[0.017,[737,504],false,{}],[0.016,[736,504],false,{}],[0.016,[736,504],false,{}],[0.016,[735,504],false,{}],[0.016,[733,505],false,{}],[0.016,[731,505],false,{}],[0.016,[721,506],false,{}],[0.016,[712,508],false,{}],[0.016,[703,508],false,{}],[0.016,[698,509],false,{}],[0.017,[694,509],false,{}],[0.016,[691,510],false,{}],[0.016,[686,510],false,{}],[0.016,[679,510],false,{}],[0.016,[676,510],false,{}],[0.016,[668,511],false,{}],[0.016,[666,512],false,{}],[0.016,[664,512],false,{}],[0.016,[664,513],false,{}],[0.016,[663,513],false,{}],[0.016,[663,513],false,{}],[0.016,[663,512],false,{}],[0.017,[663,512],false,{}],[0.016,[663,512],false,{}],[0.016,[663,512],false,{}],[0.016,[663,512],false,{}],[0.016,[663,512],false,{}],[0.016,[663,512],false,{}],[0.016,[662,513],false,{}],[0.017,[662,513],false,{}],[0.016,[662,513],false,{}],[0.016,[662,513],false,{}],[0.016,[662,513],false,{}],[0.016,[661,513],false,{}],[0.016,[661,513],false,{}],[0.016,[660,513],false,{}],[0.016,[660,513],false,{}],[0.016,[660,513],false,{}],[0.016,[660,513],false,{}],[0.016,[660,513],false,{}],[0.016,[660,513],false,{}],[0.017,[660,513],false,{}],[0.016,[660,513],false,{}],[0.016,[660,513],false,{}],[0.016,[661,513],false,{}],[0.016,[661,513],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.016,[661,512],false,{}],[0.017,[661,511],false,{}],[0.016,[662,511],false,{}],[0.016,[663,510],false,{}],[0.016,[663,510],false,{}],[0.016,[664,510],false,{}],[0.016,[664,509],false,{}],[0.016,[665,509],false,{}],[0.016,[666,509],false,{}],[0.016,[667,509],false,{}],[0.016,[667,509],false,{}],[0.016,[668,509],false,{}],[0.016,[668,509],false,{}],[0.017,[668,509],false,{}],[0.016,[669,509],false,{}],[0.016,[669,509],false,{}],[0.016,[669,509],false,{}],[0.016,[669,509],false,{}],[0.016,[670,509],false,{}],[0.018000000000000002,[670,508],false,{}],[0.017,[670,508],false,{}],[0.016,[671,508],false,{}],[0.016,[672,508],false,{}],[0.016,[672,508],false,{}],[0.016,[673,508],false,{}],[0.016,[673,508],false,{}],[0.016,[673,508],false,{}],[0.016,[673,508],false,{}],[0.016,[674,508],false,{}],[0.017,[674,508],false,{}],[0.016,[674,508],false,{}],[0.016,[674,508],false,{}],[0.016,[675,508],false,{}],[0.016,[675,508],false,{}],[0.016,[675,508],false,{}],[0.016,[676,508],false,{}],[0.016,[676,508],false,{}],[0.016,[677,508],false,{}],[0.016,[678,508],false,{}],[0.017,[679,508],false,{}],[0.016,[679,508],false,{}],[0.016,[679,508],false,{}],[0.016,[679,508],false,{}],[0.016,[679,508],false,{}],[0.016,[680,508],false,{}],[0.016,[680,509],false,{}],[0.016,[680,509],false,{}],[0.016,[680,510],false,{}],[0.016,[680,510],false,{}],[0.016,[680,511],false,{}],[0.016,[680,511],false,{}],[0.017,[680,511],false,{}],[0.016,[680,511],false,{}],[0.016,[680,511],false,{}],[0.016,[680,511],false,{}],[0.016,[680,510],true,{}],[0.024,[679,510],false,{}],[0.016,[679,509],false,{}],[0.016,[679,508],false,{}],[0.016,[679,507],false,{}],[0.016,[679,507],false,{}],[0.016,[679,507],false,{}],[0.017,[679,507],false,{}],[0.016,[679,508],false,{}],[0.016,[679,509],false,{}],[0.016,[678,511],false,{}],[0.016,[677,512],false,{}],[0.016,[676,517],false,{}],[0.016,[671,530],false,{}],[0.016,[669,534],false,{}],[0.016,[668,537],false,{}],[0.017,[667,544],false,{}],[0.016,[667,548],false,{}],[0.016,[666,550],false,{}],[0.016,[666,551],false,{}],[0.016,[666,551],false,{}],[0.016,[666,551],false,{}],[0.016,[666,551],false,{}],[0.016,[665,550],false,{}],[0.016,[665,550],false,{}],[0.016,[665,549],false,{}],[0.016,[664,547],false,{}],[0.017,[663,546],false,{}],[0.016,[663,546],false,{}],[0.016,[662,545],false,{}],[0.016,[661,544],false,{}],[0.016,[661,543],false,{}],[0.016,[660,543],false,{}],[0.016,[660,542],false,{}],[0.016,[660,542],false,{}],[0.016,[660,541],false,{}],[0.016,[660,541],false,{}],[0.016,[660,541],false,{}],[0.016,[660,540],false,{}],[0.017,[660,540],false,{}],[0.016,[660,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[661,540],false,{}],[0.016,[660,540],false,{}],[0.017,[659,540],false,{}],[0.016,[658,541],false,{}],[0.016,[658,541],false,{}],[0.016,[657,541],false,{}],[0.016,[657,540],false,{}],[0.016,[657,540],false,{}],[0.016,[658,540],false,{}],[0.016,[658,540],false,{}],[0.016,[658,540],false,{}],[0.016,[659,540],false,{}],[0.016,[659,540],false,{}],[0.016,[659,540],false,{}],[0.017,[659,540],false,{}],[0.016,[659,540],false,{}],[0.016,[659,540],false,{}],[0.016,[659,540],false,{}],[0.016,[659,541],false,{}],[0.016,[659,541],false,{}],[0.016,[658,542],false,{}],[0.016,[656,542],false,{}],[0.016,[655,542],false,{}],[0.016,[654,543],false,{}],[0.016,[652,543],false,{}],[0.016,[652,543],false,{}],[0.017,[651,543],false,{}],[0.016,[651,543],false,{}],[0.016,[650,543],false,{}],[0.016,[650,543],false,{}],[0.016,[650,543],false,{}],[0.016,[650,543],false,{}],[0.016,[650,543],false,{}],[0.016,[650,544],false,{}],[0.016,[649,544],false,{}],[0.016,[648,544],false,{}],[0.016,[647,544],false,{}],[0.016,[646,544],false,{}],[0.017,[645,544],false,{}],[0.016,[644,544],false,{}],[0.016,[644,544],false,{}],[0.016,[644,545],false,{}],[0.016,[643,545],false,{}],[0.016,[643,545],false,{}],[0.016,[643,545],false,{}],[0.016,[642,545],false,{}],[0.016,[641,545],false,{}],[0.016,[640,545],false,{}],[0.016,[640,545],false,{}],[0.016,[638,545],false,{}],[0.016,[637,544],false,{}],[0.017,[636,544],false,{}],[0.016,[635,544],false,{}],[0.016,[633,544],false,{}],[0.016,[632,543],false,{}],[0.016,[632,543],false,{}],[0.016,[632,542],false,{}],[0.016,[632,542],false,{}],[0.02,[631,542],false,{}],[0.016,[631,541],false,{}],[0.016,[630,541],false,{}],[0.016,[630,540],false,{}],[0.016,[628,540],false,{}],[0.016,[627,539],false,{}],[0.016,[627,539],false,{}],[0.016,[625,539],false,{}],[0.016,[624,539],false,{}],[0.016,[624,539],false,{}],[0.016,[623,538],false,{}],[0.016,[623,538],false,{}],[0.017,[623,537],false,{}],[0.016,[623,537],false,{}],[0.016,[623,537],false,{}],[0.016,[622,537],false,{}],[0.016,[622,536],false,{}],[0.016,[622,536],false,{}],[0.016,[621,536],false,{}],[0.016,[621,536],false,{}],[0.016,[620,536],false,{}],[0.017,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.016,[619,537],false,{}],[0.017,[619,537],false,{}],[0.016,[620,537],false,{}],[0.016,[620,537],false,{}],[0.016,[620,537],false,{}],[0.016,[620,537],false,{}],[0.016,[620,537],false,{}],[0.016,[620,537],false,{}],[0.016,[621,537],false,{}],[0.016,[621,537],false,{}],[0.016,[621,536],false,{}],[0.016,[621,536],false,{}],[0.017,[621,536],false,{}],[0.016,[621,536],false,{}],[0.016,[621,537],false,{}],[0.016,[621,537],false,{}],[0.016,[622,537],false,{}],[0.016,[622,537],false,{}],[0.016,[622,537],false,{}],[0.016,[622,538],false,{}],[0.016,[622,538],false,{}],[0.016,[622,540],false,{}],[0.017,[622,541],false,{}],[0.016,[621,541],false,{}],[0.016,[621,541],false,{}],[0.016,[621,541],false,{}],[0.016,[621,541],true,{}],[0.023,[621,536],false,{}],[0.016,[621,534],false,{}],[0.016,[621,533],false,{}],[0.016,[622,533],false,{}],[0.017,[622,533],false,{}],[0.016,[622,533],false,{}],[0.016,[622,532],false,{}],[0.016,[622,532],false,{}],[0.016,[623,532],false,{}],[0.016,[623,532],false,{}],[0.016,[623,532],false,{}],[0.016,[623,532],false,{}],[0.016,[623,532],false,{}],[0.017,[624,531],false,{}],[0.016,[624,531],false,{}],[0.016,[625,530],false,{}],[0.016,[627,523],false,{}],[0.016,[629,512],false,{}],[0.016,[632,495],false,{}],[0.016,[640,466],false,{}],[0.016,[645,456],false,{}],[0.016,[650,448],false,{}],[0.016,[656,431],false,{}],[0.016,[659,423],false,{}],[0.017,[661,414],false,{}],[0.016,[662,398],false,{}],[0.016,[661,390],false,{}],[0.016,[661,383],false,{}],[0.016,[660,371],false,{}],[0.016,[660,366],false,{}],[0.016,[659,364],false,{}],[0.016,[659,362],false,{}],[0.016,[659,362],false,{}],[0.016,[659,361],false,{}],[0.016,[659,361],false,{}],[0.016,[659,361],false,{}],[0.016,[659,360],false,{}],[0.017,[659,360],false,{}],[0.016,[659,360],false,{}],[0.016,[659,360],false,{}],[0.016,[659,354],false,{}],[0.016,[659,349],false,{}],[0.016,[660,346],false,{}],[0.016,[660,344],false,{}],[0.016,[660,343],false,{}],[0.017,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,344],false,{}],[0.016,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,343],false,{}],[0.016,[660,342],false,{}],[0.016,[660,342],false,{}],[0.017,[661,342],false,{}],[0.016,[661,342],false,{}],[0.016,[661,342],false,{}],[0.016,[661,342],false,{}],[0.016,[661,342],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.017,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[661,343],false,{}],[0.016,[662,342],false,{}],[0.016,[662,342],false,{}],[0.016,[662,342],false,{}],[0.016,[662,343],false,{}],[0.016,[662,343],false,{}],[0.016,[662,343],false,{}],[0.016,[662,343],false,{}],[0.016,[662,343],false,{}],[0.016,[662,342],false,{}],[0.016,[663,342],false,{}],[0.017,[663,342],false,{}],[0.016,[663,340],false,{}],[0.016,[670,324],false,{}],[0.016,[675,315],false,{}],[0.016,[679,306],false,{}],[0.016,[685,292],false,{}],[0.016,[687,289],false,{}],[0.017,[687,288],false,{}],[0.016,[687,287],false,{}],[0.016,[687,287],false,{}],[0.016,[687,287],false,{}],[0.016,[687,287],false,{}],[0.016,[687,287],false,{}],[0.016,[687,287],false,{}],[0.016,[688,287],false,{}],[0.016,[688,287],false,{}],[0.016,[688,287],false,{}],[0.017,[690,284],false,{}],[0.016,[698,272],false,{}],[0.016,[711,253],false,{}],[0.016,[713,250],false,{}],[0.016,[714,249],false,{}],[0.016,[714,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.018000000000000002,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.018000000000000002,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.021,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.022,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.017,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}],[0.016,[715,249],false,{}]]]}],"nchapters":1,"t":1361405865490},"10":{"version":"","playername":"","name":"-1361405891798","chapters":[{"n":0,"t":1361405891798,"duration":16368,"state":[],"data":[[1361405891798,"think",[0.092,[384,269],false,{}],[0.016,[384,269],false,{}],[0.016,[384,269],false,{}],[0.017,[384,269],false,{}],[0.016,[384,269],false,{}],[0.016,[384,269],false,{}],[0.016,[385,268],false,{}],[0.016,[385,268],false,{}],[0.016,[385,267],false,{}],[0.016,[385,266],false,{}],[0.016,[385,265],false,{}],[0.016,[384,256],false,{}],[0.016,[384,246],false,{}],[0.016,[385,208],false,{}],[0.016,[389,181],false,{}],[0.016,[394,150],false,{}],[0.017,[401,85],false,{}],[0.016,[405,56],false,{}],[0.016,[407,31],false,{}],[0.016,[407,20],false,{}],[0.016,[407,16],false,{}],[0.016,[406,15],false,{}],[0.016,[406,14],false,{}],[0.017,[406,14],false,{}],[0.016,[406,14],false,{}],[0.016,[406,14],false,{}],[0.016,[406,14],false,{}],[0.016,[406,14],false,{}],[0.016,[407,15],false,{}],[0.016,[409,17],false,{}],[0.016,[412,18],false,{}],[0.016,[418,20],false,{}],[0.017,[430,26],false,{}],[0.016,[436,29],false,{}],[0.016,[441,32],false,{}],[0.016,[444,35],false,{}],[0.016,[450,44],false,{}],[0.016,[451,50],false,{}],[0.016,[451,57],false,{}],[0.016,[451,74],false,{}],[0.016,[449,81],false,{}],[0.016,[448,85],false,{}],[0.017,[446,89],false,{}],[0.016,[446,90],false,{}],[0.016,[446,90],false,{}],[0.016,[445,90],false,{}],[0.016,[445,90],false,{}],[0.016,[445,91],false,{}],[0.016,[445,91],false,{}],[0.017,[445,91],false,{}],[0.016,[445,91],false,{}],[0.016,[445,91],false,{}],[0.016,[445,91],false,{}],[0.016,[445,91],false,{}],[0.016,[445,91],false,{}],[0.016,[445,91],false,{}],[0.016,[445,92],false,{}],[0.017,[445,92],false,{}],[0.015,[446,92],false,{}],[0.016,[446,93],false,{}],[0.016,[447,94],false,{}],[0.017,[448,95],false,{}],[0.016,[448,95],false,{}],[0.016,[448,96],false,{}],[0.016,[447,96],false,{}],[0.016,[447,96],false,{}],[0.016,[446,96],false,{}],[0.016,[446,97],false,{}],[0.016,[446,97],false,{}],[0.016,[445,97],false,{}],[0.016,[444,97],false,{}],[0.016,[444,97],false,{}],[0.016,[443,97],false,{}],[0.016,[442,97],false,{}],[0.017,[441,97],false,{}],[0.016,[440,97],false,{}],[0.016,[439,97],false,{}],[0.016,[439,97],false,{}],[0.016,[439,97],false,{}],[0.016,[438,97],false,{}],[0.016,[438,97],false,{}],[0.016,[437,97],false,{}],[0.016,[437,97],false,{}],[0.016,[437,97],false,{}],[0.016,[437,97],false,{}],[0.016,[437,97],false,{}],[0.017,[436,97],false,{}],[0.016,[436,97],false,{}],[0.016,[436,97],false,{}],[0.016,[436,98],false,{}],[0.016,[436,98],false,{}],[0.016,[436,98],false,{}],[0.016,[436,98],false,{}],[0.016,[436,98],false,{}],[0.016,[435,98],false,{}],[0.016,[435,98],false,{}],[0.016,[435,98],false,{}],[0.017,[435,98],false,{}],[0.016,[435,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.017,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.016,[434,97],false,{}],[0.017,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.017,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],true,{}],[0.024,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.016,[434,98],false,{}],[0.017,[434,98],false,{}],[0.016,[432,100],false,{}],[0.016,[420,114],false,{}],[0.016,[383,165],false,{}],[0.016,[355,209],false,{}],[0.016,[327,254],false,{}],[0.016,[288,320],false,{}],[0.016,[273,351],false,{}],[0.024,[251,413],false,{}],[0.016,[244,437],false,{}],[0.016,[241,453],false,{}],[0.016,[239,463],false,{}],[0.017,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[239,463],false,{}],[0.017,[239,463],false,{}],[0.016,[239,463],false,{}],[0.016,[240,464],false,{}],[0.016,[243,467],false,{}],[0.016,[248,471],false,{}],[0.016,[259,480],false,{}],[0.016,[266,487],false,{}],[0.016,[275,497],false,{}],[0.016,[296,524],false,{}],[0.016,[306,538],false,{}],[0.016,[320,554],false,{}],[0.017,[325,558],false,{}],[0.016,[330,559],false,{}],[0.016,[335,560],false,{}],[0.016,[347,560],false,{}],[0.016,[352,560],false,{}],[0.016,[357,560],false,{}],[0.016,[358,560],false,{}],[0.016,[359,560],false,{}],[0.016,[359,560],false,{}],[0.016,[359,560],false,{}],[0.016,[359,560],false,{}],[0.016,[359,560],false,{}],[0.017,[359,560],false,{}],[0.016,[359,560],false,{}],[0.016,[359,558],false,{}],[0.016,[359,558],false,{}],[0.016,[357,546],false,{}],[0.016,[348,527],false,{}],[0.016,[348,527],false,{}],[0.016,[338,514],false,{}],[0.016,[334,510],false,{}],[0.016,[332,508],false,{}],[0.017,[329,505],false,{}],[0.016,[329,505],false,{}],[0.016,[329,505],false,{}],[0.016,[328,505],false,{}],[0.016,[328,505],false,{}],[0.016,[328,505],false,{}],[0.016,[328,505],false,{}],[0.016,[327,505],false,{}],[0.016,[327,505],false,{}],[0.016,[326,505],false,{}],[0.016,[326,504],false,{}],[0.016,[325,504],false,{}],[0.017,[324,504],false,{}],[0.016,[323,504],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.016,[321,503],false,{}],[0.017,[321,503],false,{}],[0.016,[321,504],false,{}],[0.016,[321,504],false,{}],[0.016,[321,504],false,{}],[0.016,[322,504],false,{}],[0.016,[323,504],false,{}],[0.016,[324,504],false,{}],[0.016,[324,504],false,{}],[0.016,[325,504],false,{}],[0.016,[326,504],false,{}],[0.017,[326,504],false,{}],[0.016,[326,505],false,{}],[0.016,[327,505],false,{}],[0.016,[328,505],false,{}],[0.016,[329,506],false,{}],[0.016,[329,506],false,{}],[0.016,[330,506],false,{}],[0.016,[331,506],false,{}],[0.016,[332,506],false,{}],[0.016,[332,506],false,{}],[0.016,[332,506],false,{}],[0.017,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[332,507],false,{}],[0.016,[333,507],false,{}],[0.016,[333,507],false,{}],[0.016,[333,507],false,{}],[0.016,[333,507],false,{}],[0.017,[333,507],false,{}],[0.016,[333,507],false,{}],[0.016,[333,507],false,{}],[0.016,[334,507],false,{}],[0.016,[335,507],false,{}],[0.016,[335,507],false,{}],[0.016,[335,507],false,{}],[0.016,[335,507],false,{}],[0.016,[336,507],false,{}],[0.016,[337,507],false,{}],[0.016,[337,506],false,{}],[0.016,[337,506],false,{}],[0.017,[338,506],false,{}],[0.016,[338,506],false,{}],[0.016,[339,506],false,{}],[0.016,[339,506],false,{}],[0.016,[339,507],false,{}],[0.016,[339,507],false,{}],[0.016,[340,507],false,{}],[0.016,[340,507],false,{}],[0.018000000000000002,[341,507],false,{}],[0.016,[341,507],false,{}],[0.017,[341,507],false,{}],[0.016,[341,507],false,{}],[0.016,[341,507],false,{}],[0.016,[341,507],false,{}],[0.016,[341,507],false,{}],[0.016,[341,507],false,{}],[0.016,[342,507],false,{}],[0.016,[342,507],false,{}],[0.016,[342,507],false,{}],[0.016,[342,507],false,{}],[0.016,[343,507],false,{}],[0.016,[343,507],false,{}],[0.017,[343,508],false,{}],[0.016,[343,509],false,{}],[0.016,[343,509],false,{}],[0.016,[344,510],false,{}],[0.016,[344,510],false,{}],[0.016,[345,511],false,{}],[0.016,[345,511],false,{}],[0.016,[346,512],false,{}],[0.016,[346,512],true,{}],[0.025,[347,512],false,{}],[0.016,[347,512],false,{}],[0.016,[347,512],false,{}],[0.016,[348,512],false,{}],[0.016,[348,512],false,{}],[0.016,[350,514],false,{}],[0.016,[351,516],false,{}],[0.016,[354,519],false,{}],[0.016,[360,526],false,{}],[0.016,[364,529],false,{}],[0.017,[373,532],false,{}],[0.016,[382,532],false,{}],[0.016,[387,532],false,{}],[0.016,[406,530],false,{}],[0.016,[422,527],false,{}],[0.016,[442,523],false,{}],[0.016,[494,509],false,{}],[0.016,[525,499],false,{}],[0.016,[557,490],false,{}],[0.017,[623,473],false,{}],[0.016,[654,467],false,{}],[0.016,[681,461],false,{}],[0.016,[712,456],false,{}],[0.016,[726,454],false,{}],[0.016,[735,453],false,{}],[0.016,[742,453],false,{}],[0.016,[747,452],false,{}],[0.016,[751,452],false,{}],[0.016,[751,452],false,{}],[0.016,[752,451],false,{}],[0.016,[752,451],false,{}],[0.017,[751,451],false,{}],[0.016,[751,450],false,{}],[0.016,[751,450],false,{}],[0.016,[751,450],false,{}],[0.016,[751,449],false,{}],[0.016,[750,449],false,{}],[0.016,[750,448],false,{}],[0.016,[749,447],false,{}],[0.016,[748,446],false,{}],[0.016,[748,446],false,{}],[0.016,[747,444],false,{}],[0.017,[746,444],false,{}],[0.016,[746,444],false,{}],[0.016,[745,443],false,{}],[0.016,[745,443],false,{}],[0.016,[745,443],false,{}],[0.016,[745,443],false,{}],[0.016,[745,443],false,{}],[0.016,[745,442],false,{}],[0.016,[745,442],false,{}],[0.016,[745,442],false,{}],[0.017,[744,442],false,{}],[0.016,[744,442],false,{}],[0.016,[744,442],false,{}],[0.016,[744,442],false,{}],[0.016,[744,442],false,{}],[0.016,[744,442],false,{}],[0.016,[744,441],false,{}],[0.017,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[744,441],false,{}],[0.016,[743,441],false,{}],[0.017,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.017,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.017,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.017,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[743,441],false,{}],[0.016,[744,441],false,{}],[0.016,[745,440],false,{}],[0.017,[745,440],false,{}],[0.016,[745,440],false,{}],[0.016,[746,439],false,{}],[0.016,[746,439],false,{}],[0.016,[746,439],false,{}],[0.016,[746,439],false,{}],[0.016,[746,439],false,{}],[0.016,[747,439],false,{}],[0.016,[747,439],false,{}],[0.016,[747,439],false,{}],[0.016,[747,439],false,{}],[0.016,[747,439],false,{}],[0.016,[747,439],false,{}],[0.017,[747,439],false,{}],[0.016,[747,439],false,{}],[0.016,[746,440],false,{}],[0.016,[746,440],false,{}],[0.016,[746,440],false,{}],[0.016,[746,440],false,{}],[0.016,[746,440],false,{}],[0.016,[746,440],false,{}],[0.016,[746,440],false,{}],[0.017,[746,440],false,{}],[0.016,[747,441],false,{}],[0.016,[749,442],false,{}],[0.016,[752,443],false,{}],[0.016,[759,445],false,{}],[0.016,[782,451],false,{}],[0.016,[801,457],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.019,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.017,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.019,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.023,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.018000000000000002,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.019,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}]]]}],"nchapters":1,"t":1361405891798},"11":{"version":"","playername":"","name":"-1361405908265","chapters":[{"n":0,"t":1361405908265,"duration":15059,"state":[],"data":[[1361405908265,"think",[0.099,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[805,463],false,{}],[0.017,[805,463],false,{}],[0.016,[805,463],false,{}],[0.016,[800,474],false,{}],[0.016,[789,473],false,{}],[0.016,[743,468],false,{}],[0.016,[709,465],false,{}],[0.016,[661,461],false,{}],[0.016,[635,460],false,{}],[0.016,[561,465],false,{}],[0.016,[526,472],false,{}],[0.016,[494,480],false,{}],[0.016,[430,505],false,{}],[0.016,[399,521],false,{}],[0.017,[370,539],false,{}],[0.016,[344,557],false,{}],[0.016,[302,591],false,{}],[0.016,[286,608],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.017,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.017,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[269,628],false,{}],[0.016,[244,630],false,{}],[0.016,[266,586],false,{}],[0.016,[280,564],false,{}],[0.016,[293,547],false,{}],[0.016,[310,530],false,{}],[0.016,[316,526],false,{}],[0.016,[321,523],false,{}],[0.016,[332,518],false,{}],[0.016,[336,516],false,{}],[0.016,[340,515],false,{}],[0.017,[345,513],false,{}],[0.016,[345,513],false,{}],[0.016,[346,513],false,{}],[0.016,[346,513],false,{}],[0.016,[345,513],false,{}],[0.016,[344,514],false,{}],[0.016,[343,514],false,{}],[0.016,[340,514],false,{}],[0.016,[337,514],false,{}],[0.016,[332,515],false,{}],[0.016,[319,517],false,{}],[0.016,[310,518],false,{}],[0.016,[298,519],false,{}],[0.017,[281,522],false,{}],[0.016,[270,523],false,{}],[0.016,[262,525],false,{}],[0.016,[253,526],false,{}],[0.016,[250,526],false,{}],[0.016,[249,526],false,{}],[0.016,[249,526],false,{}],[0.017,[249,526],false,{}],[0.016,[249,526],false,{}],[0.016,[250,526],false,{}],[0.016,[250,526],false,{}],[0.016,[251,526],false,{}],[0.017,[252,526],false,{}],[0.016,[255,525],false,{}],[0.016,[257,525],false,{}],[0.016,[258,525],false,{}],[0.016,[259,525],false,{}],[0.016,[259,524],false,{}],[0.016,[259,524],false,{}],[0.016,[259,524],false,{}],[0.016,[259,524],false,{}],[0.017,[259,524],false,{}],[0.016,[259,524],false,{}],[0.016,[258,523],false,{}],[0.016,[258,523],false,{}],[0.016,[258,523],false,{}],[0.016,[258,523],false,{}],[0.016,[258,523],false,{}],[0.016,[261,522],false,{}],[0.016,[262,522],false,{}],[0.016,[262,522],false,{}],[0.016,[263,522],false,{}],[0.017,[264,522],false,{}],[0.016,[264,521],false,{}],[0.016,[264,521],false,{}],[0.016,[264,521],false,{}],[0.016,[264,521],false,{}],[0.016,[264,521],false,{}],[0.016,[264,521],false,{}],[0.016,[264,521],false,{}],[0.016,[265,520],false,{}],[0.016,[265,520],false,{}],[0.016,[265,519],false,{}],[0.017,[265,519],false,{}],[0.016,[265,519],false,{}],[0.016,[265,519],false,{}],[0.016,[266,519],false,{}],[0.016,[266,519],false,{}],[0.016,[266,519],false,{}],[0.016,[266,519],false,{}],[0.016,[266,519],false,{}],[0.016,[267,519],false,{}],[0.016,[267,519],false,{}],[0.016,[268,519],false,{}],[0.016,[268,519],false,{}],[0.017,[269,519],false,{}],[0.016,[269,519],false,{}],[0.016,[269,518],false,{}],[0.016,[270,518],false,{}],[0.016,[270,518],false,{}],[0.016,[270,518],false,{}],[0.016,[270,517],false,{}],[0.016,[270,517],false,{}],[0.016,[270,517],false,{}],[0.016,[269,517],false,{}],[0.016,[269,517],false,{}],[0.016,[268,517],false,{}],[0.016,[267,517],false,{}],[0.017,[267,517],false,{}],[0.016,[266,517],false,{}],[0.016,[266,516],false,{}],[0.016,[266,516],false,{}],[0.016,[266,516],false,{}],[0.016,[266,516],false,{}],[0.016,[266,516],false,{}],[0.016,[267,516],false,{}],[0.016,[267,516],false,{}],[0.016,[267,516],false,{}],[0.016,[267,516],false,{}],[0.017,[267,516],false,{}],[0.016,[267,516],false,{}],[0.016,[268,516],false,{}],[0.016,[268,516],false,{}],[0.016,[268,516],false,{}],[0.016,[268,516],false,{}],[0.016,[269,516],false,{}],[0.016,[269,516],false,{}],[0.016,[270,516],false,{}],[0.016,[270,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.017,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[271,516],false,{}],[0.016,[270,516],false,{}],[0.016,[270,516],false,{}],[0.016,[270,516],false,{}],[0.016,[270,516],false,{}],[0.017,[270,516],false,{}],[0.016,[270,516],false,{}],[0.016,[270,516],false,{}],[0.016,[269,516],false,{}],[0.016,[269,516],false,{}],[0.016,[269,516],false,{}],[0.016,[269,516],false,{}],[0.016,[269,515],false,{}],[0.016,[269,515],false,{}],[0.016,[269,515],false,{}],[0.016,[269,515],false,{}],[0.016,[269,515],false,{}],[0.016,[269,515],false,{}],[0.017,[269,515],false,{}],[0.016,[269,515],false,{}],[0.016,[270,515],false,{}],[0.016,[270,515],false,{}],[0.016,[270,515],false,{}],[0.016,[270,515],false,{}],[0.016,[270,515],false,{}],[0.016,[271,515],false,{}],[0.016,[271,515],false,{}],[0.017,[271,515],false,{}],[0.016,[272,515],false,{}],[0.016,[272,515],false,{}],[0.016,[272,515],false,{}],[0.016,[272,515],false,{}],[0.016,[272,515],false,{}],[0.016,[272,515],false,{}],[0.016,[272,515],false,{}],[0.016,[271,515],false,{}],[0.016,[271,515],false,{}],[0.016,[271,515],false,{}],[0.016,[270,515],false,{}],[0.016,[270,515],false,{}],[0.016,[269,514],false,{}],[0.017,[269,514],false,{}],[0.016,[268,514],false,{}],[0.016,[268,514],false,{}],[0.016,[268,514],false,{}],[0.016,[268,514],false,{}],[0.016,[268,514],false,{}],[0.016,[267,514],false,{}],[0.021,[267,514],true,{}],[0.023,[267,514],false,{}],[0.016,[267,514],false,{}],[0.016,[267,514],false,{}],[0.016,[267,514],false,{}],[0.016,[268,514],false,{}],[0.016,[268,514],false,{}],[0.016,[269,515],false,{}],[0.016,[269,515],false,{}],[0.016,[270,516],false,{}],[0.016,[275,517],false,{}],[0.016,[283,518],false,{}],[0.017,[296,519],false,{}],[0.016,[315,520],false,{}],[0.016,[356,519],false,{}],[0.016,[372,518],false,{}],[0.016,[391,517],false,{}],[0.016,[391,517],false,{}],[0.016,[401,517],false,{}],[0.016,[403,517],false,{}],[0.016,[404,517],false,{}],[0.016,[404,518],false,{}],[0.016,[404,518],false,{}],[0.016,[404,519],false,{}],[0.016,[401,522],false,{}],[0.017,[397,525],false,{}],[0.016,[392,528],false,{}],[0.016,[388,531],false,{}],[0.016,[381,536],false,{}],[0.016,[379,539],false,{}],[0.016,[377,540],false,{}],[0.016,[376,540],false,{}],[0.016,[376,540],false,{}],[0.016,[377,540],false,{}],[0.016,[378,541],false,{}],[0.016,[382,541],false,{}],[0.016,[383,541],false,{}],[0.016,[384,541],false,{}],[0.017,[387,541],false,{}],[0.016,[390,541],false,{}],[0.016,[391,541],false,{}],[0.016,[394,541],false,{}],[0.016,[399,541],false,{}],[0.016,[400,542],false,{}],[0.016,[401,542],false,{}],[0.016,[401,542],false,{}],[0.016,[401,542],false,{}],[0.016,[401,542],false,{}],[0.016,[401,542],false,{}],[0.017,[401,542],false,{}],[0.016,[401,542],false,{}],[0.016,[401,542],false,{}],[0.016,[400,542],false,{}],[0.016,[400,542],false,{}],[0.016,[399,542],false,{}],[0.016,[399,542],false,{}],[0.016,[399,542],false,{}],[0.016,[399,542],false,{}],[0.016,[398,542],false,{}],[0.016,[398,542],false,{}],[0.016,[398,542],false,{}],[0.016,[397,542],false,{}],[0.017,[397,541],false,{}],[0.016,[397,541],false,{}],[0.016,[396,541],false,{}],[0.016,[396,541],false,{}],[0.016,[396,541],false,{}],[0.016,[396,541],false,{}],[0.016,[396,540],false,{}],[0.016,[396,540],false,{}],[0.016,[395,540],false,{}],[0.016,[395,540],false,{}],[0.016,[395,539],false,{}],[0.016,[396,539],false,{}],[0.017,[396,538],false,{}],[0.016,[396,538],false,{}],[0.016,[396,538],false,{}],[0.016,[396,538],false,{}],[0.016,[396,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.017,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[397,538],false,{}],[0.016,[396,538],false,{}],[0.016,[396,538],false,{}],[0.017,[396,538],false,{}],[0.016,[395,538],false,{}],[0.016,[395,538],false,{}],[0.016,[395,538],false,{}],[0.016,[395,538],false,{}],[0.016,[395,539],false,{}],[0.016,[394,539],false,{}],[0.016,[394,539],false,{}],[0.016,[394,539],false,{}],[0.016,[393,539],false,{}],[0.017,[393,539],false,{}],[0.016,[393,539],false,{}],[0.016,[393,539],false,{}],[0.016,[393,539],false,{}],[0.016,[393,539],false,{}],[0.016,[392,539],false,{}],[0.016,[391,539],false,{}],[0.016,[391,539],false,{}],[0.016,[390,539],false,{}],[0.016,[389,539],false,{}],[0.016,[388,539],false,{}],[0.016,[387,539],false,{}],[0.017,[384,539],false,{}],[0.016,[380,539],false,{}],[0.016,[376,539],false,{}],[0.016,[370,540],false,{}],[0.017,[368,540],false,{}],[0.016,[367,540],false,{}],[0.016,[367,540],false,{}],[0.016,[367,540],false,{}],[0.016,[367,540],false,{}],[0.016,[367,540],false,{}],[0.016,[367,540],false,{}],[0.016,[368,540],false,{}],[0.016,[368,540],false,{}],[0.016,[369,540],false,{}],[0.016,[370,540],false,{}],[0.017,[370,540],false,{}],[0.016,[370,540],false,{}],[0.016,[371,540],false,{}],[0.016,[371,540],false,{}],[0.016,[371,540],false,{}],[0.016,[372,540],false,{}],[0.016,[372,540],false,{}],[0.016,[372,540],false,{}],[0.016,[372,540],false,{}],[0.016,[372,540],false,{}],[0.016,[372,540],false,{}],[0.016,[373,540],false,{}],[0.016,[373,540],false,{}],[0.017,[373,540],false,{}],[0.016,[373,540],false,{}],[0.016,[373,540],false,{}],[0.016,[373,540],false,{}],[0.016,[373,539],false,{}],[0.016,[373,539],false,{}],[0.016,[373,539],false,{}],[0.016,[373,539],false,{}],[0.016,[373,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.017,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.017,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.019,[375,539],false,{}],[0.016,[375,539],false,{}],[0.018000000000000002,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[375,539],false,{}],[0.016,[374,539],false,{}],[0.017,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.016,[374,539],false,{}],[0.017,[374,539],false,{}],[0.015,[373,539],false,{}],[0.016,[373,539],false,{}],[0.017,[373,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],true,{}],[0.021,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.016,[372,539],false,{}],[0.017,[373,539],false,{}],[0.016,[374,539],false,{}],[0.016,[375,540],false,{}],[0.016,[382,543],false,{}],[0.016,[387,545],false,{}],[0.016,[394,548],false,{}],[0.016,[407,553],false,{}],[0.016,[415,556],false,{}],[0.017,[418,557],false,{}],[0.016,[425,560],false,{}],[0.016,[428,561],false,{}],[0.016,[431,562],false,{}],[0.016,[434,562],false,{}],[0.016,[440,564],false,{}],[0.016,[442,565],false,{}],[0.016,[444,565],false,{}],[0.016,[446,565],false,{}],[0.016,[446,565],false,{}],[0.017,[446,565],false,{}],[0.016,[446,565],false,{}],[0.016,[446,565],false,{}],[0.016,[446,565],false,{}],[0.016,[447,565],false,{}],[0.016,[447,565],false,{}],[0.016,[447,565],false,{}],[0.016,[448,564],false,{}],[0.016,[451,564],false,{}],[0.017,[455,562],false,{}],[0.016,[463,560],false,{}],[0.016,[466,559],false,{}],[0.016,[467,559],false,{}],[0.016,[467,559],false,{}],[0.016,[467,559],false,{}],[0.016,[468,559],false,{}],[0.016,[468,559],false,{}],[0.016,[470,559],false,{}],[0.016,[473,559],false,{}],[0.017,[478,559],false,{}],[0.016,[480,559],false,{}],[0.016,[481,559],false,{}],[0.016,[483,559],false,{}],[0.016,[486,560],false,{}],[0.016,[488,560],false,{}],[0.016,[488,560],false,{}],[0.016,[489,560],false,{}],[0.016,[489,560],false,{}],[0.016,[489,560],false,{}],[0.017,[489,561],false,{}],[0.016,[489,561],false,{}],[0.016,[488,561],false,{}],[0.016,[488,561],false,{}],[0.016,[488,561],false,{}],[0.016,[488,561],false,{}],[0.016,[488,561],false,{}],[0.016,[488,561],false,{}],[0.016,[488,561],false,{}],[0.016,[487,561],false,{}],[0.016,[487,561],false,{}],[0.016,[487,561],false,{}],[0.016,[486,561],false,{}],[0.017,[486,561],false,{}],[0.016,[485,561],false,{}],[0.016,[484,561],false,{}],[0.016,[484,562],false,{}],[0.016,[482,562],false,{}],[0.016,[481,562],false,{}],[0.016,[481,562],false,{}],[0.016,[481,562],false,{}],[0.016,[481,562],false,{}],[0.016,[480,561],false,{}],[0.017,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.017,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[480,561],false,{}],[0.016,[481,561],false,{}],[0.016,[481,561],false,{}],[0.016,[482,561],false,{}],[0.016,[482,560],false,{}],[0.016,[482,560],false,{}],[0.016,[482,560],false,{}],[0.017,[483,560],false,{}],[0.015,[483,560],false,{}],[0.017,[483,560],false,{}],[0.016,[483,560],false,{}],[0.016,[483,560],false,{}],[0.016,[483,560],false,{}],[0.016,[483,560],false,{}],[0.016,[482,560],false,{}],[0.016,[482,560],false,{}],[0.016,[481,561],false,{}],[0.016,[479,561],false,{}],[0.016,[478,561],false,{}],[0.016,[477,561],false,{}],[0.016,[476,561],false,{}],[0.016,[475,561],false,{}],[0.017,[475,561],false,{}],[0.016,[473,561],false,{}],[0.016,[473,561],false,{}],[0.016,[472,561],false,{}],[0.016,[472,561],false,{}],[0.016,[472,561],false,{}],[0.016,[472,561],false,{}],[0.016,[472,561],false,{}],[0.016,[471,561],false,{}],[0.016,[471,561],false,{}],[0.016,[471,561],false,{}],[0.017,[471,561],false,{}],[0.016,[470,561],false,{}],[0.016,[470,561],false,{}],[0.016,[471,561],false,{}],[0.016,[471,560],false,{}],[0.016,[471,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[473,560],false,{}],[0.016,[473,560],false,{}],[0.017,[473,560],false,{}],[0.016,[473,559],false,{}],[0.016,[473,559],false,{}],[0.016,[473,559],false,{}],[0.016,[473,560],false,{}],[0.016,[473,560],false,{}],[0.016,[473,560],false,{}],[0.016,[473,560],false,{}],[0.016,[473,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.017,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[471,560],false,{}],[0.016,[471,560],false,{}],[0.016,[470,560],false,{}],[0.016,[470,560],false,{}],[0.016,[470,560],true,{}],[0.02,[470,560],false,{}],[0.016,[470,560],false,{}],[0.016,[471,560],false,{}],[0.016,[471,560],false,{}],[0.016,[471,560],false,{}],[0.017,[472,560],false,{}],[0.016,[472,560],false,{}],[0.016,[473,559],false,{}],[0.016,[474,559],false,{}],[0.016,[474,559],false,{}],[0.016,[474,559],false,{}],[0.016,[481,553],false,{}],[0.016,[493,542],false,{}],[0.016,[515,516],false,{}],[0.016,[527,500],false,{}],[0.017,[540,482],false,{}],[0.016,[557,455],false,{}],[0.016,[562,446],false,{}],[0.016,[566,441],false,{}],[0.016,[570,432],false,{}],[0.016,[572,430],false,{}],[0.016,[573,429],false,{}],[0.016,[580,419],false,{}],[0.016,[593,400],false,{}],[0.016,[609,378],false,{}],[0.016,[626,358],false,{}],[0.016,[643,338],false,{}],[0.016,[677,307],false,{}],[0.017,[691,300],false,{}],[0.016,[714,292],false,{}],[0.016,[724,290],false,{}],[0.016,[734,289],false,{}],[0.016,[743,288],false,{}],[0.016,[758,288],false,{}],[0.016,[764,288],false,{}],[0.016,[770,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.018000000000000002,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.02,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.017,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}],[0.016,[780,288],false,{}]]]}],"nchapters":1,"t":1361405908265},"12":{"version":"","playername":"","name":"-1361405940120","chapters":[{"n":0,"t":1361405940120,"duration":14317,"state":[],"data":[[1361405940120,"think",[0.085,[710,492],false,{}],[0.016,[670,478],false,{}],[0.016,[643,467],false,{}],[0.016,[634,462],false,{}],[0.017,[627,458],false,{}],[0.016,[614,449],false,{}],[0.016,[608,443],false,{}],[0.016,[603,436],false,{}],[0.016,[589,404],false,{}],[0.016,[581,383],false,{}],[0.016,[574,362],false,{}],[0.016,[563,325],false,{}],[0.016,[561,308],false,{}],[0.017,[563,285],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,238],false,{}],[0.017,[579,238],false,{}],[0.016,[579,238],false,{}],[0.016,[579,236],false,{}],[0.016,[579,234],false,{}],[0.016,[579,229],false,{}],[0.016,[579,217],false,{}],[0.016,[580,213],false,{}],[0.016,[580,212],false,{}],[0.016,[580,212],false,{}],[0.016,[580,211],false,{}],[0.016,[580,211],false,{}],[0.017,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,211],false,{}],[0.016,[581,210],false,{}],[0.016,[581,210],false,{}],[0.017,[581,209],false,{}],[0.016,[581,209],false,{}],[0.016,[581,209],false,{}],[0.016,[581,209],false,{}],[0.016,[582,209],false,{}],[0.016,[582,208],false,{}],[0.016,[583,208],false,{}],[0.016,[584,208],false,{}],[0.016,[584,208],false,{}],[0.016,[584,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,207],false,{}],[0.017,[585,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,207],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.017,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[585,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.017,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[584,206],false,{}],[0.016,[583,206],false,{}],[0.017,[583,206],false,{}],[0.016,[583,206],false,{}],[0.016,[582,206],false,{}],[0.016,[582,206],false,{}],[0.016,[582,206],false,{}],[0.016,[582,206],false,{}],[0.016,[582,206],false,{}],[0.016,[582,206],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.017,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.017,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,205],false,{}],[0.017,[582,205],false,{}],[0.016,[582,205],false,{}],[0.016,[582,204],false,{}],[0.016,[582,204],false,{}],[0.016,[582,204],false,{}],[0.016,[581,204],false,{}],[0.017,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[581,204],false,{}],[0.017,[581,204],false,{}],[0.016,[581,204],false,{}],[0.016,[580,204],false,{}],[0.016,[580,204],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.017,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[581,203],false,{}],[0.016,[581,203],false,{}],[0.016,[581,203],false,{}],[0.016,[581,203],false,{}],[0.016,[581,203],false,{}],[0.016,[581,203],true,{}],[0.019,[580,203],false,{}],[0.017,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.016,[580,203],false,{}],[0.017,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[579,203],false,{}],[0.016,[578,204],false,{}],[0.016,[570,206],false,{}],[0.017,[558,208],false,{}],[0.016,[548,209],false,{}],[0.016,[500,210],false,{}],[0.016,[473,209],false,{}],[0.016,[447,206],false,{}],[0.016,[409,198],false,{}],[0.016,[399,195],false,{}],[0.016,[393,192],false,{}],[0.016,[388,189],false,{}],[0.016,[388,188],false,{}],[0.016,[388,188],false,{}],[0.017,[389,187],false,{}],[0.016,[390,187],false,{}],[0.016,[391,186],false,{}],[0.016,[399,185],false,{}],[0.016,[404,183],false,{}],[0.016,[409,182],false,{}],[0.016,[421,179],false,{}],[0.016,[426,178],false,{}],[0.016,[429,177],false,{}],[0.016,[433,176],false,{}],[0.016,[433,176],false,{}],[0.016,[433,176],false,{}],[0.017,[433,176],false,{}],[0.016,[432,176],false,{}],[0.016,[432,176],false,{}],[0.016,[432,176],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.017,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[431,177],false,{}],[0.016,[432,177],false,{}],[0.016,[432,177],false,{}],[0.016,[432,177],false,{}],[0.016,[434,177],false,{}],[0.016,[446,178],false,{}],[0.017,[452,178],false,{}],[0.016,[456,178],false,{}],[0.016,[460,178],false,{}],[0.016,[465,178],false,{}],[0.016,[465,178],false,{}],[0.016,[466,178],false,{}],[0.016,[466,178],false,{}],[0.016,[467,179],false,{}],[0.016,[469,179],false,{}],[0.017,[477,180],false,{}],[0.016,[480,180],false,{}],[0.016,[482,180],false,{}],[0.016,[485,181],false,{}],[0.016,[485,181],false,{}],[0.016,[486,181],false,{}],[0.016,[486,181],false,{}],[0.016,[486,181],false,{}],[0.016,[486,182],false,{}],[0.016,[485,182],false,{}],[0.016,[485,182],false,{}],[0.016,[485,182],false,{}],[0.017,[485,183],false,{}],[0.016,[485,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.017,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[484,183],false,{}],[0.016,[483,183],false,{}],[0.016,[483,183],false,{}],[0.016,[483,183],false,{}],[0.016,[483,183],false,{}],[0.016,[483,183],false,{}],[0.017,[483,183],false,{}],[0.016,[482,184],false,{}],[0.016,[482,184],false,{}],[0.016,[481,185],false,{}],[0.016,[481,185],false,{}],[0.016,[481,186],false,{}],[0.016,[481,186],false,{}],[0.016,[480,186],false,{}],[0.016,[480,186],false,{}],[0.016,[480,186],false,{}],[0.016,[480,186],false,{}],[0.016,[480,187],false,{}],[0.017,[480,187],false,{}],[0.016,[480,187],false,{}],[0.016,[480,187],false,{}],[0.016,[480,187],false,{}],[0.016,[480,187],false,{}],[0.016,[480,187],false,{}],[0.016,[480,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.017,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.016,[481,188],false,{}],[0.017,[481,188],false,{}],[0.016,[481,189],false,{}],[0.016,[481,189],false,{}],[0.016,[481,189],false,{}],[0.016,[481,189],false,{}],[0.016,[482,189],false,{}],[0.016,[482,189],false,{}],[0.016,[482,189],false,{}],[0.016,[482,189],false,{}],[0.016,[482,189],false,{}],[0.016,[482,189],false,{}],[0.016,[482,189],false,{}],[0.017,[482,189],false,{}],[0.016,[482,190],false,{}],[0.016,[482,190],false,{}],[0.016,[482,191],false,{}],[0.017,[483,191],false,{}],[0.016,[483,191],false,{}],[0.017,[483,191],false,{}],[0.016,[483,191],false,{}],[0.016,[483,191],false,{}],[0.016,[483,191],false,{}],[0.016,[484,191],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.017,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.017,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.016,[485,192],false,{}],[0.017,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[484,192],false,{}],[0.016,[483,192],false,{}],[0.016,[483,192],false,{}],[0.016,[483,192],false,{}],[0.016,[483,191],false,{}],[0.016,[483,191],false,{}],[0.017,[483,191],false,{}],[0.016,[483,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[482,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],false,{}],[0.016,[481,191],true,{}],[0.021,[481,191],false,{}],[0.016,[481,191],false,{}],[0.021,[481,191],false,{}],[0.016,[479,191],false,{}],[0.016,[479,191],false,{}],[0.016,[471,192],false,{}],[0.016,[460,193],false,{}],[0.016,[447,194],false,{}],[0.016,[424,197],false,{}],[0.016,[414,197],false,{}],[0.016,[404,198],false,{}],[0.016,[391,199],false,{}],[0.016,[386,199],false,{}],[0.016,[383,199],false,{}],[0.016,[380,198],false,{}],[0.017,[380,198],false,{}],[0.016,[380,198],false,{}],[0.016,[380,197],false,{}],[0.016,[381,197],false,{}],[0.016,[381,197],false,{}],[0.016,[382,197],false,{}],[0.016,[382,197],false,{}],[0.016,[383,197],false,{}],[0.016,[383,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.017,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.017,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[384,197],false,{}],[0.016,[383,197],false,{}],[0.016,[383,197],false,{}],[0.016,[383,198],false,{}],[0.016,[383,198],false,{}],[0.016,[383,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.017,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.017,[382,198],false,{}],[0.016,[382,198],false,{}],[0.02,[382,198],false,{}],[0.017,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,198],false,{}],[0.016,[382,199],false,{}],[0.016,[382,199],false,{}],[0.017,[382,199],false,{}],[0.016,[382,199],false,{}],[0.016,[382,199],false,{}],[0.016,[382,199],false,{}],[0.016,[382,199],false,{}],[0.016,[382,199],false,{}],[0.016,[381,199],false,{}],[0.016,[381,199],false,{}],[0.016,[381,199],false,{}],[0.016,[381,199],false,{}],[0.016,[381,199],false,{}],[0.016,[380,200],false,{}],[0.016,[378,201],false,{}],[0.017,[375,202],false,{}],[0.016,[369,203],false,{}],[0.016,[349,207],false,{}],[0.016,[341,210],false,{}],[0.016,[335,211],false,{}],[0.016,[329,213],false,{}],[0.016,[328,213],false,{}],[0.016,[328,213],false,{}],[0.016,[328,212],false,{}],[0.016,[329,212],false,{}],[0.016,[330,212],false,{}],[0.016,[331,211],false,{}],[0.017,[332,211],false,{}],[0.016,[333,211],false,{}],[0.016,[336,210],false,{}],[0.016,[340,210],false,{}],[0.016,[346,209],false,{}],[0.016,[358,208],false,{}],[0.016,[358,208],false,{}],[0.016,[367,208],false,{}],[0.016,[369,208],false,{}],[0.016,[371,208],false,{}],[0.016,[371,208],false,{}],[0.016,[372,208],false,{}],[0.016,[372,208],false,{}],[0.017,[372,208],false,{}],[0.016,[372,208],false,{}],[0.016,[371,208],false,{}],[0.016,[371,208],false,{}],[0.016,[371,208],false,{}],[0.016,[369,209],false,{}],[0.016,[369,209],false,{}],[0.016,[368,209],false,{}],[0.016,[367,209],false,{}],[0.016,[366,209],false,{}],[0.016,[366,209],false,{}],[0.016,[365,210],false,{}],[0.017,[364,210],false,{}],[0.016,[364,210],false,{}],[0.016,[363,210],false,{}],[0.016,[363,210],false,{}],[0.016,[363,210],false,{}],[0.016,[363,210],false,{}],[0.016,[363,209],false,{}],[0.016,[363,209],false,{}],[0.016,[363,209],false,{}],[0.016,[363,209],false,{}],[0.016,[362,209],false,{}],[0.017,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[362,209],false,{}],[0.016,[363,209],false,{}],[0.016,[363,209],false,{}],[0.017,[363,208],false,{}],[0.017,[363,208],false,{}],[0.017,[363,208],false,{}],[0.017,[363,208],false,{}],[0.016,[363,208],false,{}],[0.017,[363,208],false,{}],[0.017,[363,208],false,{}],[0.017,[363,208],false,{}],[0.017,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.017,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.022,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.016,[364,208],false,{}],[0.017,[364,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[363,208],false,{}],[0.017,[363,208],false,{}],[0.016,[363,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[362,208],false,{}],[0.016,[361,208],false,{}],[0.017,[361,208],false,{}],[0.016,[360,208],false,{}],[0.016,[360,208],false,{}],[0.016,[359,208],false,{}],[0.016,[358,208],false,{}],[0.016,[357,208],false,{}],[0.016,[355,208],false,{}],[0.016,[355,208],false,{}],[0.016,[355,208],false,{}],[0.016,[354,208],false,{}],[0.016,[354,208],false,{}],[0.016,[353,208],false,{}],[0.017,[353,208],false,{}],[0.016,[353,208],false,{}],[0.016,[352,208],false,{}],[0.016,[352,208],false,{}],[0.016,[352,208],false,{}],[0.016,[352,208],false,{}],[0.017,[352,208],false,{}],[0.016,[352,208],false,{}],[0.016,[351,208],false,{}],[0.016,[351,208],false,{}],[0.016,[351,208],false,{}],[0.016,[351,208],false,{}],[0.016,[351,208],false,{}],[0.016,[351,208],true,{}],[0.024,[352,208],false,{}],[0.016,[352,208],false,{}],[0.017,[352,208],false,{}],[0.016,[353,208],false,{}],[0.016,[353,208],false,{}],[0.016,[353,208],false,{}],[0.016,[353,208],false,{}],[0.016,[354,209],false,{}],[0.016,[355,209],false,{}],[0.016,[356,212],false,{}],[0.016,[358,217],false,{}],[0.016,[359,226],false,{}],[0.016,[369,256],false,{}],[0.016,[377,275],false,{}],[0.017,[388,297],false,{}],[0.016,[419,348],false,{}],[0.016,[436,375],false,{}],[0.016,[453,400],false,{}],[0.016,[486,439],false,{}],[0.016,[502,451],false,{}],[0.016,[517,461],false,{}],[0.016,[537,470],false,{}],[0.016,[583,488],false,{}],[0.017,[608,497],false,{}],[0.016,[633,505],false,{}],[0.016,[683,516],false,{}],[0.016,[710,518],false,{}],[0.016,[738,520],false,{}],[0.017,[797,525],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[805,530],false,{}],[0.017,[805,530],false,{}],[0.016,[805,530],false,{}],[0.016,[803,572],false,{}],[0.016,[800,571],false,{}],[0.016,[795,569],false,{}],[0.016,[785,567],false,{}],[0.016,[766,562],false,{}],[0.016,[750,559],false,{}],[0.016,[730,557],false,{}],[0.016,[710,554],false,{}],[0.016,[685,550],false,{}],[0.017,[679,548],false,{}],[0.016,[676,547],false,{}],[0.016,[673,546],false,{}],[0.016,[673,546],false,{}],[0.016,[672,546],false,{}],[0.016,[672,546],false,{}],[0.016,[672,546],false,{}],[0.016,[673,545],false,{}],[0.016,[673,545],false,{}],[0.016,[673,544],false,{}],[0.017,[673,543],false,{}],[0.016,[674,542],false,{}],[0.016,[674,541],false,{}],[0.016,[675,541],false,{}],[0.016,[675,540],false,{}],[0.016,[675,539],false,{}],[0.016,[677,537],false,{}],[0.016,[682,530],false,{}],[0.016,[695,514],false,{}],[0.016,[724,475],false,{}],[0.016,[753,423],false,{}],[0.016,[764,393],false,{}],[0.016,[772,361],false,{}],[0.017,[777,264],false,{}],[0.016,[776,207],false,{}],[0.016,[775,162],false,{}],[0.016,[772,90],false,{}],[0.017,[771,59],false,{}],[0.016,[771,34],false,{}],[0.016,[771,21],false,{}],[0.016,[770,13],false,{}],[0.016,[770,11],false,{}],[0.016,[770,11],false,{}],[0.016,[770,11],false,{}],[0.016,[770,11],false,{}],[0.02,[770,11],false,{}],[0.016,[770,11],false,{}],[0.016,[770,11],false,{}],[0.016,[769,11],false,{}],[0.016,[769,11],false,{}],[0.016,[769,11],false,{}],[0.016,[769,11],false,{}],[0.016,[769,11],false,{}],[0.016,[769,11],false,{}],[0.016,[769,11],false,{}],[0.017,[769,11],false,{}],[0.016,[768,13],false,{}],[0.016,[767,14],false,{}],[0.016,[767,14],false,{}],[0.016,[766,16],false,{}],[0.016,[766,17],false,{}],[0.016,[766,17],false,{}],[0.016,[766,18],false,{}],[0.017,[766,18],false,{}],[0.016,[766,18],false,{}],[0.016,[766,18],false,{}],[0.016,[766,18],false,{}],[0.016,[766,18],false,{}],[0.016,[766,18],false,{}],[0.016,[766,18],false,{}],[0.016,[766,19],false,{}],[0.016,[766,19],true,{}],[0.016,[766,19],false,{}],[0.016,[767,19],false,{}],[0.016,[767,19],false,{}],[0.016,[768,20],false,{}],[0.017,[779,51],false,{}],[0.016,[787,78],false,{}],[0.016,[795,109],false,{}],[0.016,[804,142],false,{}],[0.016,[804,142],false,{}],[0.016,[804,142],false,{}],[0.016,[804,142],false,{}],[0.016,[804,142],false,{}],[0.016,[804,142],false,{}],[0.016,[801,357],false,{}],[0.016,[798,369],false,{}],[0.016,[792,383],false,{}],[0.017,[789,388],false,{}],[0.016,[786,393],false,{}],[0.016,[777,406],false,{}],[0.016,[770,415],false,{}],[0.016,[756,437],false,{}],[0.016,[748,448],false,{}],[0.016,[743,457],false,{}],[0.016,[736,468],false,{}],[0.016,[733,471],false,{}],[0.016,[732,474],false,{}],[0.016,[730,477],false,{}],[0.016,[730,478],false,{}],[0.017,[730,478],false,{}],[0.016,[730,477],false,{}],[0.016,[730,477],false,{}],[0.016,[730,477],false,{}],[0.016,[730,477],false,{}],[0.016,[730,477],false,{}],[0.016,[731,478],false,{}],[0.016,[732,480],false,{}],[0.016,[734,487],false,{}],[0.016,[734,490],false,{}],[0.016,[735,491],false,{}],[0.017,[735,492],false,{}],[0.016,[736,494],false,{}],[0.016,[737,495],false,{}],[0.016,[737,496],false,{}],[0.016,[738,496],false,{}],[0.016,[738,496],false,{}],[0.016,[738,497],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.017,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}],[0.016,[739,498],false,{}]]]}],"nchapters":1,"t":1361405940120},"13":{"version":"","playername":"","name":"-1361406057483","chapters":[{"n":0,"t":1361406057483,"duration":5856,"state":[],"data":[[1361406057483,"think",[0.08,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.017,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[163,374],false,{}],[0.016,[162,374],false,{}],[0.017,[162,374],false,{}],[0.016,[162,374],false,{}],[0.016,[162,374],false,{}],[0.016,[162,374],false,{}],[0.016,[162,374],false,{}],[0.016,[162,374],false,{}],[0.016,[162,374],false,{}],[0.016,[162,375],false,{}],[0.016,[162,375],false,{}],[0.017,[162,375],false,{}],[0.016,[162,375],false,{}],[0.016,[161,375],false,{}],[0.016,[161,375],false,{}],[0.016,[161,375],false,{}],[0.016,[161,376],false,{}],[0.016,[161,376],false,{}],[0.016,[161,376],false,{}],[0.016,[161,376],false,{}],[0.016,[161,376],false,{}],[0.016,[161,376],false,{}],[0.017,[161,376],false,{}],[0.016,[161,376],false,{}],[0.016,[162,376],false,{}],[0.016,[162,376],false,{}],[0.016,[162,376],false,{}],[0.016,[162,376],false,{}],[0.016,[162,376],false,{}],[0.016,[162,375],false,{}],[0.016,[163,375],false,{}],[0.016,[163,375],false,{}],[0.016,[163,375],false,{}],[0.016,[163,375],false,{}],[0.017,[163,375],false,{}],[0.016,[163,375],false,{}],[0.016,[163,375],false,{}],[0.016,[163,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,375],false,{}],[0.017,[164,375],false,{}],[0.016,[164,375],false,{}],[0.016,[164,376],false,{}],[0.016,[165,376],false,{}],[0.016,[165,376],false,{}],[0.016,[165,376],false,{}],[0.016,[165,376],false,{}],[0.016,[166,376],false,{}],[0.016,[166,376],false,{}],[0.016,[167,376],false,{}],[0.017,[167,376],false,{}],[0.016,[167,376],false,{}],[0.016,[167,376],false,{}],[0.016,[167,376],false,{}],[0.016,[167,376],false,{}],[0.016,[168,376],false,{}],[0.016,[168,376],false,{}],[0.016,[168,376],false,{}],[0.016,[169,376],false,{}],[0.016,[169,376],false,{}],[0.016,[169,376],false,{}],[0.016,[169,376],false,{}],[0.017,[169,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.017,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.017,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,377],false,{}],[0.016,[170,377],false,{}],[0.016,[170,377],false,{}],[0.016,[170,377],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.016,[170,376],false,{}],[0.017,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.017,[171,376],false,{}],[0.017,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[171,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.017,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,376],false,{}],[0.017,[172,376],false,{}],[0.016,[172,376],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],true,{}],[0.02,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.016,[172,375],false,{}],[0.017,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.017,[172,374],false,{}],[0.017,[172,374],false,{}],[0.016,[172,374],false,{}],[0.016,[172,374],false,{}],[0.017,[173,373],false,{}],[0.016,[173,373],false,{}],[0.016,[173,373],false,{}],[0.016,[181,370],false,{}],[0.016,[199,361],false,{}],[0.016,[221,352],false,{}],[0.016,[244,343],false,{}],[0.016,[251,342],false,{}],[0.016,[255,341],false,{}],[0.016,[259,340],false,{}],[0.016,[259,340],false,{}],[0.016,[259,340],false,{}],[0.017,[259,340],false,{}],[0.016,[259,340],false,{}],[0.016,[259,340],false,{}],[0.016,[259,340],false,{}],[0.016,[259,340],false,{}],[0.016,[258,340],false,{}],[0.016,[258,340],false,{}],[0.016,[257,341],false,{}],[0.016,[255,341],false,{}],[0.016,[255,341],false,{}],[0.016,[254,341],false,{}],[0.017,[254,341],false,{}],[0.016,[253,341],false,{}],[0.016,[253,341],false,{}],[0.016,[252,341],false,{}],[0.016,[252,341],false,{}],[0.016,[252,341],false,{}],[0.016,[252,341],false,{}],[0.016,[253,341],false,{}],[0.016,[253,341],false,{}],[0.016,[255,341],false,{}],[0.016,[262,341],false,{}],[0.017,[311,341],false,{}],[0.016,[336,341],false,{}],[0.016,[357,341],false,{}],[0.016,[375,341],false,{}],[0.016,[396,340],false,{}],[0.016,[401,339],false,{}],[0.016,[405,339],false,{}],[0.016,[406,339],false,{}],[0.016,[408,339],false,{}],[0.017,[408,339],false,{}],[0.016,[408,339],false,{}],[0.016,[409,339],false,{}],[0.016,[411,339],false,{}],[0.016,[414,339],false,{}],[0.016,[416,339],false,{}],[0.016,[416,339],false,{}],[0.016,[416,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.017,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,339],false,{}],[0.016,[417,338],false,{}],[0.017,[417,338],false,{}],[0.016,[417,338],false,{}],[0.017,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.017,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.017,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,338],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.02,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.016,[417,337],false,{}],[0.017,[417,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.021,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,337],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.017,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[416,336],false,{}],[0.016,[415,336],false,{}],[0.016,[415,336],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.017,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[415,335],false,{}],[0.016,[416,334],false,{}],[0.016,[416,334],false,{}],[0.016,[416,334],false,{}],[0.016,[416,334],false,{}],[0.017,[416,334],false,{}],[0.016,[416,334],false,{}],[0.016,[416,334],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.017,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.017,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,333],false,{}],[0.016,[416,332],false,{}],[0.016,[415,332],false,{}],[0.016,[415,332],false,{}],[0.016,[415,332],false,{}],[0.016,[415,332],false,{}],[0.016,[415,332],false,{}],[0.016,[415,332],false,{}],[0.017,[415,332],false,{}],[0.016,[415,332],false,{}]]]}],"nchapters":1,"t":1361406057483}}
var settings = {
    sx: 800,
    sy: 600,
    showpoints: false,  // show collision points (for debugging)
    savewalkthrough: false,
    psep: 4,     // point separation
    tstep: 0.002,
    font1: "48px Slackey",
    timefont: "48px 'Kameron'",
    titlefont: "160px Slackey",
    walkfont: "80px Slackey",
    buttonfont: "48px Slackey",
}

var mechanics = {
    ballR: 25,
    g: 300,
    elasticity: 0.4,
    friction: 0.996,
    apgrate: 40,  // aperture growth rate
    amax: 160,     // max aperture size
}

if (window.location.href.indexOf("DEBUG") > -1) {
    settings.showpoints = true
}
if (window.location.href.indexOf("RECORD") > -1) {
    settings.savewalkthrough = true
}


function Level(startx, endx, preptime, goalwidth) {
    this.startx = startx
    this.endx = endx
    this.preptime = preptime
    this.goalwidth = goalwidth
    this.blocks = []
    for (var j = 4 ; j < arguments.length ; ++j) {
        this.blocks.push(arguments[j])
    }
}
Level.prototype = {
    points: function () {
        var ps = []
        for (var j = 0 ; j < this.blocks.length ; ++j) {
            var block = this.blocks[j]
            for (var k = 0 ; k < block.length ; ++k) {
                var k2 = (k + 1) % block.length
                var x0 = block[k][0], y0 = block[k][1]
                var x1 = block[k2][0], y1 = block[k2][1]
                var dx = x1 - x0, dy = y1 - y0
                var d = Math.sqrt(dx * dx + dy * dy)
                var n = Math.floor(d / settings.psep) + 1
                for (var h = 0 ; h < n ; ++h) {
                    ps.push([x0 + h * dx / n, y0 + h * dy / n])
                }
            }
        }
        return ps
    },
    trace: function (context) {
        UFX.draw(context, "b")
        for (var j = 0 ; j < this.blocks.length ; ++j) {
            var block = this.blocks[j]
            UFX.draw(context, "m", block[block.length - 1])
            for (var k = 0 ; k < block.length ; ++k) {
                UFX.draw(context, "l", block[k])
            }
            UFX.draw(context, "l", block[0])
        }
    },
}

var levels = [
    new Level(300, 600, 6, 100,  // triangle you have to reverse
        [[400, 350], [400, 550], [200, 550]]
    ),

    new Level(400, 400, 6, 100,  // Diamond in the way
        [[400, 300], [500, 400], [400, 500], [300, 400]]
    ),

    new Level(700, 100, 6, 100,  // ramp you have to reverse
        [[750, 300], [750,500], [200, 500], [200, 450], [250, 450], [300, 400], [360, 400], [360, 450], [600, 450], [650,430], [700,400]]
    ),

    new Level(200, 540, 8, 100,  // two opposing triangles - move the one on the right
        [[100, 220], [300, 360], [100, 360]],
        [[500, 320], [300, 460], [500, 460]]
    ),

    new Level(300, 500, 10, 100,  // oddly shaped triangle
        [[100, 400], [500, 300], [220, 600]]
    ),

    new Level(200, 530, 12, 100,  // Diamond you have to place correctly
        [[600, 250], [700, 350], [600, 450], [500, 350]]
    ),

    new Level(300, 440, 6, 100,  // square you have to carve a ramp out of 
        [[200, 200], [400, 200], [400, 400], [200, 400]]
    ),

    new Level(400, 400, 20, 100,  // two long rectangles - make a hole in each
        [[40, 160], [760, 160], [760, 240], [40, 240]],
        [[40, 460], [760, 460], [760, 540], [40, 540]]
    ),

    new Level(400, 400, 8, 100,  // two jagged concave hexagons
        [[20, 120], [440, 120], [440, 300], [280, 260], [280, 500], [20, 500]],
        [[780, 120], [520, 120], [520, 360], [360, 320], [360, 500], [780, 500]]
    ),

    new Level(100, 700, 10, 100,  // long triangle to tunnel through
        [[20, 350], [20, 550], [780, 550]]
    ),

    new Level(400, 400, 5, 100,  // slopes back and forth between two large blocks
        [[20, 120], [440, 120], [120, 240], [440, 360], [120, 480], [20, 480]],
        [[780, 120], [640, 120], [320, 240], [640, 360], [320, 480], [780, 480]]
    ),

    new Level(200, 600, 12, 100,  // pyramid you have to split in two ways
        [[400, 480], [560, 580], [240, 580]]
    ),

    new Level(650, 100, 14, 150,  // downward facing triangle
        [[550, 200], [750, 200], [650, 370]]
    ),

    new Level(150, 700, 3, 150,  // triangle you really have to launch way to the right from
        [[250, 350], [250, 550], [50, 550]]
    ),

    new Level(-1000, 99999, 10000, 100,  // the end
[[250, 70], [302, 177], [421, 194], [335, 277], [355, 395], [250, 340], [144, 395], [164, 277], [78, 194], [197, 177]],
[[550, 220], [602, 327], [721, 344], [635, 427], [655, 545], [550, 490], [444, 545], [464, 427], [378, 344], [497, 327]]
    ),
]


var GameScene = UFX.scenes.game = {}

var levelnumber = 0

GameScene.start = function () {
    this.level = levels[levelnumber]
    this.balls = []
    this.addball(this.level.startx, -mechanics.ballR, mechanics.ballR)
    this.setblocks()
    
    this.mode = "prepare"
    this.preptime = this.level.preptime
    
    this.titlex = 1000
    this.fadealpha = 1
    this.winmode = levelnumber === levels.length - 1
    this.tpool = 0
    this.skipclicks = 2
    this.csize = 1
    this.nexttick = 3
    
    this.playback = null
    if (settings.savewalkthrough) {
        if (this.winmode) {
            window.location = "data:text/plain,var walkthrough = " + JSON.stringify(walkthrough)
        } else {
            this.recorder = UFX.Recorder()
        }
    }
}

GameScene.addball = function (x, y, R) {
    this.balls.push({
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        R: R,
        oldx: x,
        oldy: y,
        omega: 1,
        theta: 3.5,
        tstill: 0,
        alive: true,
    })
}

GameScene.setblocks = function () {
    this.points = this.level.points()
    this.drawbuffer()
}


GameScene.drawbuffer = function () {
    UFX.random.seed = levelnumber * 14045
    var noisecanvas = document.createElement("canvas")
    var w = settings.sx / 2, h = settings.sy / 2
    noisecanvas.width = w ; noisecanvas.height = h
    var noisecontext = noisecanvas.getContext("2d")
    var idata = noisecontext.createImageData(w, h)
    var data = idata.data
    var ndata = UFX.noise.wrap2d([256, 256])
    for (var j = 0 ; j < ndata.length ; ++j) ndata[j] = Math.sin(20 * ndata[j])
//    UFX.noise.fractalize(ndata, [256, 256], 2)
    var r0 = UFX.random(30, 50), g0 = UFX.random(40, 80), b0 = UFX.random(80, 160)
    var dr = UFX.random(-40, 40), dg = UFX.random(-60, 60), db = UFX.random(70, 100)
    for (var y = 0, j = 0, k = 0 ; y < h ; ++y) {
        for (var x = 0 ; x < w ; ++x, ++k, j += 4) {
            var v = ndata[x % 256 + y % 256 * 256]
            data[j] = r0 + dr * v
            data[j+1] = g0 + dg * v
            data[j+2] = b0 + db * v
            data[j+3] = 255
        }
    }
    noisecontext.putImageData(idata, 0, 0)

    this.backdrop = document.createElement("canvas")
    this.backcon = this.backdrop.getContext("2d")
    this.backdrop.width = settings.sx
    this.backdrop.height = settings.sy
    var grad = context.createLinearGradient(0, 0, settings.sx, settings.sy)
    var color0 = "rgb(" + UFX.random.rand(40) + "," + UFX.random.rand(80) + "," + UFX.random.rand(120) + ")"
    var color1 = "rgb(" + UFX.random.rand(40) + "," + UFX.random.rand(80) + "," + UFX.random.rand(120) + ")"
    var color2 = "rgb(" + UFX.random.rand(40) + "," + UFX.random.rand(80) + "," + UFX.random.rand(120) + ")"
    grad.addColorStop(0, color0)
    grad.addColorStop(0.5, color1)
    grad.addColorStop(1, color2)
    this.backgrad = grad
    UFX.draw(this.backcon, "fs", grad, "fr 0 0", settings.sx, settings.sy)
    this.backtheta = 0

    this.buffer = document.createElement("canvas")
    this.buffercon = this.buffer.getContext("2d")
    this.buffer.width = settings.sx
    this.buffer.height = settings.sy

    UFX.draw(this.buffercon, "fs rgba(0,0,0,0) fr", 0, 0, settings.sx, settings.sy)
    UFX.draw(this.buffercon, "[")
    this.level.trace(this.buffercon)
    UFX.draw(this.buffercon, "clip [ z 2 2")
    this.buffercon.drawImage(noisecanvas, 0, 0)
    UFX.draw(this.buffercon, "] ss white lw 8 s ]")
}

GameScene.thinkargs = function (dt) {
    var clicked = false
    UFX.mouse.events().forEach(function (event) {
        if (event.type === "up") clicked = true
    })
    var mpos = UFX.mouse.pos && [UFX.mouse.pos[0], UFX.mouse.pos[1]]
    var kdown = UFX.key.state().down
    if (!settings.DEBUG) kdown = false
    return [dt, mpos, clicked, kdown]
}
GameScene.think = function (dt, mpos, clicked, kdown) {
    if (!dt) return
    if (this.playback) {
        var args = this.thinkargs(0)
        if (args[2] || (args[3] && args[3].F3)) {
            this.playback.stop()
            this.playback = null
            this.start()
            return
        }
    }
    if (kdown && kdown.F1) {
        levelnumber = Math.max(0, levelnumber - 1)
        this.start()
        return
    } else if (kdown && kdown.F2) {
        levelnumber = Math.min(levelnumber + 1, levels.length - 1)
        this.start()
        return
    } else if (kdown && kdown.F3) {
        if (walkthrough[levelnumber]) {
            this.start()
            this.playback = UFX.Playback(walkthrough[levelnumber])
            this.playback.playraw()
            return
        }
    }


    if (this.winmode || this.mode === "prepare") {
        this.csize = Math.min(this.csize + mechanics.apgrate * dt, mechanics.amax)
        this.preptime -= dt
        if (this.winmode && this.preptime < 1) this.preptime += 10
        if (this.preptime < 0) {
            this.mode = "act"
            this.skipclicks = 2
        } else if (this.preptime < this.nexttick) {
            playsound("tick")
            this.nexttick -= 1
        }
    }
    if (this.winmode) {
        while (this.balls.length < 10) {
            this.addball(UFX.random(settings.sx), UFX.random(-200, -100), UFX.random(15, 40))
        }
    }
    if (this.winmode || this.mode === "act") {
        this.tpool += dt
        var ntick = 0
        while (this.tpool > settings.tstep) {
            ntick += 1
            this.tpool -= settings.tstep
        }
        for (var jball = 0 ; jball < this.balls.length ; ++jball) {
            var ball = this.balls[jball]
        
            var oldx = ball.x, oldy = ball.y
            if (ball.tstill > 0.5 || oldy > settings.sy + 100 || (!this.winmode && this.skipclicks <= 0)) {
                ball.alive = false
            }

            var x = ball.x, y = ball.y
            var v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
            var Rplus = 1 + ball.R + 1.2 * dt * v
            var Rplus2 = Rplus * Rplus
            
            var closepoints = this.points.filter(function(p) {
                return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) < Rplus2
            })
            
            for (var jtick = 0 ; jtick < ntick ; ++jtick) {
                ball.vy += mechanics.g * settings.tstep
                ball.x += ball.vx * settings.tstep
                ball.y += ball.vy * settings.tstep
                
                closepoints.forEach(function (point) {
                    var x0 = point[0], y0 = point[1]
                    var dx = x0 - ball.x, dy = y0 - ball.y
                    if (dx * dx + dy * dy > ball.R * ball.R) return
                    if (dx * ball.vx + dy * ball.vy <= 0) return
                    var p = -(1 + mechanics.elasticity) * (ball.vx * dx + ball.vy * dy) / (dx * dx + dy * dy)
                    ball.vx += p * dx
                    ball.vy += p * dy
                    ball.vx *= mechanics.friction
                    ball.vy *= mechanics.friction
                    var df = ball.R / Math.sqrt(dx * dx + dy * dy) - 1
                    if (df > 0) {
                        ball.x -= df * dx
                        ball.y -= df * dy
                    }
                })
                if (ball.y > settings.sy - 10 && ball.y < settings.sy &&
                    Math.abs(this.level.endx - ball.x) < this.level.goalwidth / 2) {
                    playsound("success")
                    if (this.recorder) {
                        walkthrough[levelnumber] = this.recorder.stop()
                    }
                    if (!this.playback) {
                        levelnumber += 1
                        if (levelnumber >= levels.length) {
                            alert("you beat the game!")
                            levelnumber = 0
                        }
                    }
                    this.start()
                    return
                }
            }
            ball.omega = ball.vx * 0.05
            ball.theta += ball.omega * dt

            
            var dx = ball.x - oldx, dy = ball.y - oldy
            if (dx * dx + dy * dy < 0.01) {
                ball.tstill += dt
            } else {
                ball.tstill = 0
            }
        }
        this.balls = this.balls.filter(function (ball) { return ball.alive })
        if (this.balls.length == 0) {
            playsound("fail")
            if (this.recorder) {
            	this.recorder.stop()
            	delete this.recorder
        	}
            this.start()
            return
        }

        if (clicked) this.skipclicks -= 1
    }

    context.drawImage(this.backdrop, 0, 0, settings.sx, settings.sy)
    context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)

    if (mpos) {
        // pointing to the timer?
        var x = mpos[0], y = mpos[1]
        function pcheck (x0, y0, value) { return (x0-x)*(x0-x) + (y0-y)*(y0-y) < 40*40 && value }
        var pointat = pcheck(settings.sx - 40, 40, "time")
                   || pcheck(40, 40, "next")
                   || pcheck(40, 110, "previous")
                   || pcheck(40, 180, "walkthrough")
        // visible aperture?
        var vaper = !pointat && x >= 0 && x < settings.sx && y >= 0 && y < settings.sy
    } else {
        var pointtime = null, vaper = false
    }
    canvas.style.cursor = vaper && this.mode === "prepare" && !this.playback ? "none" : "default"

    if ((this.winmode || this.mode === "prepare") && vaper) {
        UFX.draw("[ b o", mpos, this.csize, "clip")
        context.drawImage(this.backdrop, 0, 0, settings.sx, settings.sy)
        UFX.draw("t", mpos[0], 0, "z -1 1 t", -mpos[0], 0)
        context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
        UFX.draw("]")
        
        if (clicked) {
            playsound("click")
            var c = this.csize
            this.points.forEach(function (point) {
                var dx = point[0] - mpos[0], dy = point[1] - mpos[1]
                if (dx * dx + dy * dy > c * c) return
                point[0] -= 2 * dx
            })
            var idata = this.buffercon.getImageData(0, 0, settings.sx, settings.sy)
            var data = idata.data
            var n = Math.floor(this.csize * 6.3 / settings.psep) + 10
            for (var j = 0 ; j < n ; ++j) {
                var theta = 2 * Math.PI * j / n
                var x0 = Math.floor(mpos[0] + this.csize * Math.cos(theta) + 0.5)
                var x1 = Math.floor(mpos[0] - this.csize * Math.cos(theta) + 0.5)
                var y = Math.floor(mpos[1] + this.csize * Math.sin(theta) + 0.5)
                var g0 = 0 <= x0 && x0 < settings.sx && data[(settings.sx * y + x0) * 4 + 1]
                var g1 = 0 <= x1 && x1 < settings.sx && data[(settings.sx * y + x1) * 4 + 1]
                if (g0 && !g1) {
                    this.points.push([x0, y])
                    this.points.push([x1, y])
                }
            }
            this.points = this.points.filter(function (point) { return point[0] >= 0 && point[0] < settings.sx })
            


            this.buffer2 = document.createElement("canvas")
            this.buffer2.width = settings.sx ; this.buffer2.height = settings.sy
            this.bcon2 = this.buffer2.getContext("2d")
            this.bcon2.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
            UFX.draw(this.bcon2, "[ b o", mpos, this.csize, "clip")
            this.bcon2.clearRect(0, 0, settings.sx, settings.sy)
            UFX.draw(this.bcon2, "t", mpos[0], 0, "z -1 1 t", -mpos[0], 0)
            this.bcon2.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
            UFX.draw(this.bcon2, "]")
            
            this.buffer = this.buffer2 ; this.buffercon = this.bcon2


            this.csize = 1
        }
        // Draw aperture
        UFX.draw("[ t", mpos, "b o 0 0", this.csize)
        UFX.draw("m", 0, this.csize + 8, "l", 0, -this.csize - 8)
        UFX.draw("m -20 0 l 20 0 m -10 3 l -20 0 l -10 -3 m 10 3 l 20 0 l 10 -3")
        
        UFX.draw("ss rgb(255,255,128) lw 2 s ]")
    } else if (this.winmode && pointat == "time") {
        if (clicked) {
            this.setblocks()
        }
    } else if (this.mode == "prepare") {
        if (pointat == "time") {
            var text = "click to begin"
            if (clicked) this.preptime = 0
        } else if (pointat == "next") {
            var text = "jump to next level"
            if (clicked) {
                levelnumber = Math.min(levelnumber + 1, levels.length - 1)
                this.start()
                return
            }
        } else if (pointat == "previous") {
            var text = "jump to previous level"
            if (clicked) {
                levelnumber = Math.max(0, levelnumber - 1)
                this.start()
                return
            }
        } else if (pointat == "walkthrough") {
            var text = "view solution"
            if (clicked && walkthrough[levelnumber]) {
                this.start()
                this.playback = UFX.Playback(walkthrough[levelnumber], { sync: true })
                this.playback.playraw()
                return
            }
        }
        if (!this.playback && text) {
            var x = settings.sx / 2, y = settings.sy / 2
            drawwords(text, x, y, settings.font1, "white", "black")
        }
    }
    
    if (settings.showpoints) {
        UFX.draw("b")
        this.points.forEach(function (point) {
            UFX.draw("o", point[0], point[1], 2)
        })
        UFX.draw("fs red f")
    }
    // Draw start and goal arrows
    UFX.draw("[ t", this.level.startx, 0,
        "( m 0 6 l 8 4 l 4 40 l 16 36 l 0 60 l -16 36 l -4 40 l -8 4 ) lw 2 fs red ss orange f s ]")
    UFX.draw("[ t", this.level.endx, settings.sy - 70,
        "( m 0 6 l 8 4 l 4 40 l 16 36 l 0 60 l -16 36 l -4 40 l -8 4 ) lw 2 fs red ss orange f s ]")
//    var x1 = this.level.endx, w = this.level.goalwidth, y = settings.sy
//    UFX.draw("b fs red fr", x1 - w/2, y - 20, w, 20)
    
    if (this.winmode || this.mode === "act") {
        // Draw balls
        this.balls.forEach(function (ball) {
            UFX.draw("[ t", ball.x, ball.y, "r", ball.theta, "b o 0 0", ball.R,
                "fs rgb(128,0,0) f ss rgb(255,128,128) lw 1.5 s",
                "[ z", ball.R/25., 2*ball.R/25., "b o 7 2 4 o -7 2 4 fs black f ]",
                "]")
        })
    }
    if (!this.winmode && !this.playback && this.mode === "act") {
        // Draw click to restart dialogue
        var text = this.skipclicks == 2 ? "click twice to restart" : "click to restart"
        var x = settings.sx / 2, y = 40
        drawwords(text, x, y, settings.font1, "white", "black", 1)
    }
    if (this.winmode || this.mode === "prepare") {
        // Draw remaining time meter
        var text = "" + Math.floor(this.preptime + 1), x = settings.sx - 40, y = 40
        if (this.winmode) text = "R"
        var d = (this.preptime - Math.floor(this.preptime)) * 6.28
        UFX.draw("b o", x, y, 30, "fs rgb(0,128,0) f")
        UFX.draw("( m", x, y, "a", x, y, 30, -1.57, -1.57-d, "fs rgb(128,0,0) ) f")
        UFX.draw("b o", x, y, 30, "m", x, y - 35, "l", x, y + 35, "m", x-35, y, "l", x + 35, y, "ss gray lw 2 s")
        context.font = settings.timefont
        UFX.draw("b textalign center textbaseline middle fs white ss black lw 1")
        context.fillText(text, x, y)
        context.strokeText(text, x, y)
        // Draw controls
        context.font = settings.buttonfont
        UFX.draw("fs #844 ss gray [ t 40 40 b o 0 0 30 f s fs white ss black fst0 \u21B7 ]")
        UFX.draw("fs #484 ss gray [ t 40 110 b o 0 0 30 f s fs white ss black fst0 \u21B6 ]")
        UFX.draw("fs #448 ss gray [ t 40 180 b o 0 0 30 f s fs white ss black fst0 ? ]")
    }
        
    // dream sequence
    if (this.playback) {
        if (!this.walkgrad) {
            this.walkgrad = UFX.draw.radgrad(settings.sx/2, settings.sy/2, 0,
                settings.sx/2, settings.sy/2, Math.sqrt(settings.sx*settings.sx + settings.sy*settings.sy)/2,
                0, "rgba(255,255,255,0)", 0.6, "rgba(255,255,255,0.2)", 1, "rgba(255,255,255,0.7)")
        }
        UFX.draw("fs", this.walkgrad, "fr 0 0", settings.sx, settings.sy)
    }

    // Draw scrolling title
    if (this.titlex > -1000) {
        this.titlex -= (Math.abs(this.titlex) < 100 ? 200 : 2000) * dt
        var text = "Level " + (levelnumber + 1), x = settings.sx / 2 + this.titlex, y = settings.sy / 2
        context.font = settings.titlefont
        if (this.winmode) text = "You win!"
        if (this.playback) {
            text = "Walkthrough"
            context.font = settings.walkfont
        }
        if (levelnumber == 0) {
            UFX.draw("b textalign center textbaseline middle fs orange ss yellow lw 3")
            context.fillText(text, x, y)
            context.strokeText(text, x, y)
        } else {
            drawwords(text, x, y, context.font, "orange", "yellow", 4)
        }
    }

    // Fade from white
    if (this.fadealpha > 0) {
        UFX.draw("[ alpha", this.fadealpha, "fs white fr 0 0", settings.sx, settings.sy, "]")
        this.fadealpha -= 2 * dt
    }

}


var wordcache = {}
function drawwords (text, x, y, font, color0, color1, lw) {
    lw = lw || 1
    var key = JSON.stringify([text, font, color0, color1, lw])
    if (!wordcache[key]) {
        var c = document.createElement("canvas")
        var con = c.getContext("2d")
        con.font = font
        var m = con.measureText(text)
        c.width = m.width
        c.height = 300
        con.font = font
        UFX.draw(con, "b textalign left textbaseline middle fs", color0, "ss", color1, "lw", lw)
        con.fillText(text, 0, 150)
        con.strokeText(text, 0, 150)
        wordcache[key] = c
    }
    var c = wordcache[key]
    context.drawImage(c, x - c.width/2, y - c.height/2)
//    context.drawImage(c, 0, 0)
}

