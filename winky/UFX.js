// UFX.ticker module - frame handling
// Register two callbacks, think() and draw(), and determine how they'll be called.

// think(dt) can take a single argument dt, which is the game time (in seconds) since the previous
//   call. This may be smaller than the actual (wall) time since the previous call, if the game is
//   lagging.
// If you're using a fixed update rate, feel free to ignore this value.

// draw(f) can take a single argument f, which is the current tweening factor. This value is
//   within the interval (0,1], where 0 represents the previous update and 1 represents the
//   current update. If tweening is not enabled, this value will always be 1.
// If you're not accounting for tweening, feel free to ignore this value.

// NOTE: tweening mode is not currently implemented, so there's no point calling draw more than
//   once between successive think calls


// How to divide the labor between think and draw?

// Generally think should do the minimum amount necessary to keep the "simulation" running,
//   and draw should handle all non-essential functions. If you skip one or more draw calls, the
//   game should continue on in a consistent state. The idea is that if the game starts to lag,
//   draw calls can be skipped to keep the updates per second up.

// If performance is not a concern for you, you can feel free to not define draw, and handle both
//   simulation updates and drawing to the screen in the think function.


if (typeof UFX == "undefined") UFX = {}
UFX.ticker = {}

// Every time the think function is called, 

// There are a lot of options involved, and you can set them manually if you like, but it's
//   recommended that you use one of a few patterns (below). A little simpler that way.

// ups (updates per second) is the number of times think should be called per second
// fps (frames per second) is the number of times draw should be called per second
// The HTML5 spec prevents setTimeout from executing recursively with a timeout of less than 4ms,
//   which makes the theoretical maximum rate 250ups/fps.

// Game will not provide more than this ups, even if possible
UFX.ticker.maxups = 30
// minups - If unable to provide this many ups, the game will lag
UFX.ticker.minups = 30
// Note: for a fixed timestep, set maxups and minups to the same value

// Number of updates per frame
UFX.ticker.upf = 1

// Minimum delay in ms between successive update runs.
UFX.ticker.delay = 0

// Use requestAnimationFrame rather than setTimeout
// This is used to throttle the framerate to the screen update frequency
// (probably?) only makes sense if you're getting more than 60ups
UFX.ticker.animsync = false





// The most basic registration function
UFX.ticker.register = function (tcallback, dcallback, opts) {
    UFX.ticker._tcallback = tcallback
    UFX.ticker._dcallback = dcallback
    UFX.ticker.setoptions(opts)
    UFX.ticker.resume()
}

// For use when you want think and draw synched
UFX.ticker.registersync = function (tcallback, dcallback, maxups, minups) {
    var opts = { upf: 1, animsync: true }
    if (maxups) {
        opts.maxups = maxups
        opts.minups = minups || maxups
    }
    UFX.ticker.register(tcallback, dcallback, opts)
}


// Update all options
UFX.ticker.setoptions = function (opts) {
    if (!opts) return
    var copykeys = ["maxups", "minups", "maxupf", "animsync", "delay"]

    for (var j = 0 ; j < copykeys.length ; ++j) {
        var key = copykeys[j]
        if (typeof opts[key] !== "undefined") UFX.ticker[key] = opts[key]
    }
}

// Stop and resume. Safe to call multiple times.
// Will automatically resume if register is called.
UFX.ticker.stop = function () {
    if (UFX.ticker._rafhandle) {
        window.cancelRequestAnimationFrame(UFX.ticker._rafhandle)
        UFX.ticker._rafhandle = null
    }
    if (UFX.ticker._sthandle) {
        clearTimeout(UFX.ticker._sthandle)
        UFX.ticker._sthandle = null
    }
    delete UFX.ticker._avgdtu, UFX.ticker._avgdtf
    delete UFX.ticker._lastthink, UFX.ticker._lastdraw
}
UFX.ticker.resume = function () {
    UFX.ticker.stop()
    UFX.ticker._think()
}


// Returns a string with a manageable number of digits
UFX.ticker.getfpsstr = function () {
    return UFX.ticker._3digits(UFX.ticker.fps) + "fps"
}
UFX.ticker.getupsstr = function () {
    return UFX.ticker._3digits(UFX.ticker.ups) + "ups"
}
UFX.ticker._3digits = function (f) {
    if (!f) return "???"
    var ndig = f >= 100 ? 0 : f >= 10 ? 1 : f >= 1 ? 2 : 3
    return f.toFixed(ndig)
}



// Called repeatedly, and calls either the _tcallback, or _dcallback, or both,
//   depending on the current options.
// Also updates the FPS and UPS counters.
UFX.ticker._think = function () {

    // Determine which of the callbacks will be called this round
    var now = (new Date()).getTime()
    var dothink = true, dodraw = true
    // Simple case - call think and draw every time
    if (UFX.ticker.upf == 1) {
    } else {
        // TODO: handle this!
    }

    // Call the callbacks if necessary
    if (dothink && UFX.ticker._tcallback) {
        var truedt = UFX.ticker._lastthink ? (now - UFX.ticker._lastthink) * 0.001 : 0
        UFX.ticker._lastthink = now
        var dt = truedt
        if (UFX.ticker.minups) {
            dt = Math.min(1. / UFX.ticker.minups, dt)
        }
        UFX.ticker._tcallback(dt)
        
        // FPS smoothing algorithm
        // http://stackoverflow.com/questions/87304/calculating-frames-per-second-in-a-game
        if (typeof UFX.ticker._avgdtu != "number") {
            UFX.ticker._avgdtu = truedt
        } else {
            UFX.ticker._avgdtu = 0.95 * UFX.ticker._avgdtu + 0.05 * truedt
        }
        UFX.ticker.ups = 1. / UFX.ticker._avgdtu
    }
    if (dodraw && UFX.ticker._dcallback) {
        var dt = UFX.ticker._lastdraw ? (now - UFX.ticker._lastdraw) * 0.001 : 0
        UFX.ticker._lastdraw = now
        UFX.ticker._dcallback(1.0)
        
        if (typeof UFX.ticker._avgdtf != "number") {
            UFX.ticker._avgdtf = dt
        } else {
            UFX.ticker._avgdtf = 0.95 * UFX.ticker._avgdtf + 0.05 * dt
        }
        UFX.ticker.fps = 1. / UFX.ticker._avgdtf
    }
    
    // No draw function registered, use ups as fps
    if (!UFX.ticker._dcallback) {
        UFX.ticker._avgdtf = UFX.ticker._avgdtu
        UFX.ticker.fps = UFX.ticker.ups
    }

    // Set up the next round
    UFX.ticker._rafhandle = UFX.ticker._sthandle = null
    if (UFX.ticker.animsync) {
        UFX.ticker._rafhandle = window.requestAnimationFrame(UFX.ticker._think)
    } else {
        var dtnext = UFX.ticker.maxups ? Math.floor(1000.0 / UFX.ticker.maxups) : 0
        dtnext -= (new Date()).getTime() - now
        var delay = Math.max(dtnext, UFX.ticker.delay)
        UFX.ticker._sthandle = window.setTimeout(UFX.ticker._think, delay)
    }
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

// The scene module - keeps track of the scene stack

if (typeof UFX == "undefined") UFX = {}
UFX.scene = {}

UFX.scene.recording = false
UFX.scene.replaying = false

UFX.scene.init = function (maxups, minups) {
    maxups = maxups || 300
    minups = minups || 10
    UFX.ticker.registersync(UFX.scene.think, UFX.scene.draw, maxups, minups)
    UFX.scene.record = []
    UFX.scene.jrecord = 0
}

UFX.scene.top = function () {
    var n = UFX.scene._stack.length
    return n ? UFX.scene._stack[n-1] : null
}
UFX.scene.push = function (c) {
    var old = UFX.scene.top()
    if (old) old.suspend()
    UFX.scene._stack.push(c)
    c.start()
}
UFX.scene.pop = function () {
    var c = UFX.scene._stack.pop()
    c.stop()
    var n = UFX.scene.top()
    if (n) n.resume()
    return c
}
UFX.scene.think = function (dt) {
    var c = UFX.scene.top()
    UFX.scene._lastthinker = c
    if (c) {
        if (UFX.scene.replaying) {
            var args = UFX.scene.record[UFX.scene.jrecord]
//            UFX.scene.record = UFX.scene.record.splice(1)
            UFX.scene.jrecord++
            if (UFX.scene.jrecord >= UFX.scene.record.length) {
                UFX.scene.replaying = false
            }
        } else {
            var args = c.thinkargs(dt)
            if (UFX.scene.recording) {
                UFX.scene.record.push(args)
            }
        }
        c.think.apply(c, args)
    }
}
UFX.scene.draw = function (f) {
    if (UFX.scene._lastthinker) {
        UFX.scene._lastthinker.draw(f)
    }
}

// Use this as a prototype for your own scenes
UFX.scene.Scene = {
    thinkargs: function (dt) {
        return [dt]
    },
    think: function (dt) {
    },
    draw: function (f) {
    },
    start: function () { }, // called when the scene is pushed onto the stack
    suspend: function () { }, // called when another scene is pushed onto this one
    resume: function () { },  // called when another scene is popped off of this one
    stop: function () { }, // called when this scene is popped off the stack
}

UFX.scene._stack = []



// UFX.key module: functions and constants related to key presses

// Generally for games you want to know:
//   - when a key is pressed
//   - when a key is released
//   - how long the key was held down for
//   - what keys are currently being pressed
// And you want to prevent key events (eg arrow keys) from being interpreted by the browser

// For games with frame-based updates, I don't generally like callback-based key handling, so this
//   module will enqueue all the key events so they can be handled at the appropriate place in the
//   main game loop.


if (typeof UFX == "undefined") UFX = {}
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
UFX.key.clearcombos = function () {
    UFX.key._combos = []
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
    UFX.key.remap({ A: "left", S: "down", D: "left", W: "up", })
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
    // TODO: use addEventListener for all event types
    element.addEventListener("blur", UFX.key._onblur, true)
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
            case "o": case "circle":
                this.arc(+t[++j], +t[++j], +t[++j], 0, 2*Math.PI)
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
                this.fillRect(+t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "cr": case "clearrect":
                this.fillRect(+t[++j], +t[++j], +t[++j], +t[++j])
                break
            case "fs": case "fillstyle":
                this.fillStyle = t[++j]
                break
            case "ss": case "strokestyle":
                this.strokeStyle = t[++j]
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
    var grad = this.createLinearGradient(x0, y0, x1, y1)
    for (var j = 4 ; j < arguments.length ; j += 2) {
        grad.addColorStop(arguments[j], arguments[j+1])
    }
    return grad
}
UFX._draw.radgrad = function (x0, y0, r0, x1, y1, r1) {
    var grad = this.createRadialGradient(x0, y0, r0, x1, y1, r1)
    for (var j = 6 ; j < arguments.length ; j += 2) {
        grad.addColorStop(arguments[j], arguments[j+1])
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
            } else if (UFX.draw._context) {
                return method.apply(UFX.draw._context, arguments)
            } else {
                throw "UFX.draw." + mname + " must be called with context as first argument"
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





// UFX.rand module: random number generation

// Using a quick-and-easy LCG. Good enough for games, not for simulations.
// The only reason for using this instead of Math.random is so I can seed the RNG and make it
//   deterministic.
// If you don't seed it, it's automatically seeded with Math.random

// Also includes a number of handy functions I always wanted.

if (typeof UFX == "undefined") UFX = {}
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
    return UFX.random.rand() * (b - a) / 4294967296.0 + a
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

// You don't have to call this, you can just assign to UFX.random.seed
UFX.random.setseed = function (n) {
    if (typeof n == "undefined") {
        n = Math.floor(Math.random() * 4294967296)
    }
    UFX.random.seed = Math.floor(n) % 4294967296
    return UFX.random.seed
}

UFX.random.choice = function (arr) {
    return arr[UFX.random.rand(arr.length)]
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
            x /= w
            y /= w
        } catch (err) {
            x = y = 0
        }
        UFX.random.normal._y = y
    }
    return x * sigma + mu
}



