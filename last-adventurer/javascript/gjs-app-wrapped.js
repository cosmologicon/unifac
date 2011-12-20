 /*
  * Copyright (c) 2010 James Brantly
  *
  * Permission is hereby granted, free of charge, to any person
  * obtaining a copy of this software and associated documentation
  * files (the "Software"), to deal in the Software without
  * restriction, including without limitation the rights to use,
  * copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the
  * Software is furnished to do so, subject to the following
  * conditions:
  *
  * The above copyright notice and this permission notice shall be
  * included in all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  * OTHER DEALINGS IN THE SOFTWARE.
  */

(function(globalEval) {

	var Yabble = function() {
		throw "Synchronous require() is not supported.";
	};

	Yabble.unit = {};

	var _moduleRoot = '',
		_modules,
		_callbacks,
		_fetchFunc,
		_timeoutLength = 20000,
		_mainProgram;


	var head = document.getElementsByTagName('head')[0];

	// Shortcut to native hasOwnProperty
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	// A for..in implementation which uses hasOwnProperty and fixes IE non-enumerable issues
	if ((function() {for (var prop in {hasOwnProperty: true}) { return prop; }})() == 'hasOwnProperty') {
		var forIn = function(obj, func, ctx) {
			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					func.call(ctx, prop);
				}
			}
		};
	}
	else {
		var ieBadProps = [
	      'isPrototypeOf',
	      'hasOwnProperty',
	      'toLocaleString',
	      'toString',
	      'valueOf'
		];

		var forIn = function(obj, func, ctx) {
			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					func.call(ctx, prop);
				}
			}

			for (var i = ieBadProps.length; i--;) {
				var prop = ieBadProps[i];
				if (hasOwnProperty.call(obj, prop)) {
					func.call(ctx, prop);
				}
			}
		};
	}

	// Array convenience functions
	var indexOf = function(arr, val) {
		for (var i = arr.length; i--;) {
			if (arr[i] == val) { return i; }
		}
		return -1;
	};

	var removeWhere = function(arr, func) {
		var i = 0;
		while (i < arr.length) {
			if (func.call(null, arr[i], i) === true) {
				arr.splice(i, 1);
			}
			else {
				i++;
			}
		}
	};

	var combinePaths = function(relPath, refPath) {
		var relPathParts = relPath.split('/');
		refPath = refPath || '';
		if (refPath.length && refPath.charAt(refPath.length-1) != '/') {
			refPath += '/';
		}
		var refPathParts = refPath.split('/');
		refPathParts.pop();
		var part;
		while (part = relPathParts.shift()) {
			if (part == '.') { continue; }
			else if (part == '..'
				&& refPathParts.length
				&& refPathParts[refPathParts.length-1] != '..') { refPathParts.pop(); }
			else { refPathParts.push(part); }
		}
		return refPathParts.join('/');
	};

	// Takes a relative path to a module and resolves it according to the reference path
	var resolveModuleId = Yabble.unit.resolveModuleId = function(relModuleId, refPath) {
		if (relModuleId.charAt(0) != '.') {
			return relModuleId;
		}
		else {
			return combinePaths(relModuleId, refPath);
		}
	};

	// Takes a module's ID and resolves a URI according to the module root path
	var resolveModuleUri = function(moduleId) {
		if (moduleId.charAt(0) != '.') {
			return _moduleRoot+moduleId+'.js';
		}
		else {
			return this._resolveModuleId(moduleId, _moduleRoot)+'.js';
		}
	};

	// Returns a module object from the module ID
	var getModule = function(moduleId) {
		if (!hasOwnProperty.call(_modules, moduleId)) {
			return null;
		}
		return _modules[moduleId];
	};

	// Adds a callback which is executed when all deep dependencies are loaded
	var addCallback = function(deps, cb) {
		_callbacks.push([deps.slice(0), cb]);
	};

	// Generic implementation of require.ensure() which takes a reference path to
	// use when resolving relative module IDs
	var ensureImpl = function(deps, cb, refPath) {
		var unreadyModules = [];

		for (var i = deps.length; i--;) {
			var moduleId = resolveModuleId(deps[i], refPath),
				module = getModule(moduleId);

			if (!areDeepDepsDefined(moduleId)) {
				unreadyModules.push(moduleId);
			}
		}

		if (unreadyModules.length) {
			addCallback(unreadyModules, function() {
				cb(createRequireFunc(refPath));
			});
			queueModules(unreadyModules);
		}
		else {
			setTimeout(function() {
				cb(createRequireFunc(refPath));
			}, 0);
		}
	};

	// Creates a require function that is passed into module factory functions
	// and require.ensure() callbacks. It is bound to a reference path for
	// relative require()s
	var createRequireFunc = function(refPath) {
		var require = function(relModuleId) {
			var moduleId = resolveModuleId(relModuleId, refPath),
				module = getModule(moduleId);

			if (!module) {
				throw "Module not loaded";
			}
			else if (module.error) {
				throw "Error loading module";
			}

			if (!module.exports) {
				module.exports = {};
				var moduleDir = moduleId.substring(0, moduleId.lastIndexOf('/')+1),
					injects = module.injects,
					args = [];

				for (var i = 0, n = injects.length; i<n; i++) {
					if (injects[i] == 'require') {
						args.push(createRequireFunc(moduleDir));
					}
					else if (injects[i] == 'exports') {
						args.push(module.exports);
					}
					else if (injects[i] == 'module') {
						args.push(module.module);
					}
				}

				module.factory.apply(null, args);
			}
			return module.exports;
		};

		require.ensure = function(deps, cb) {
			ensureImpl(deps, cb, refPath);
		};

		if (_mainProgram != null) {
			require.main = getModule(_mainProgram).module;
		}

		return require;
	};

	// Begins loading modules asynchronously
	var queueModules = function(moduleIds) {
		for (var i = moduleIds.length; i--;) {
			var moduleId = moduleIds[i],
				module = getModule(moduleId);

			if (module == null) {
				module = _modules[moduleId] = {};
				_fetchFunc(moduleId);
			}
		}
	};

	// Returns true if all deep dependencies are satisfied (in other words,
	// can more or less safely run the module factory function)
	var areDeepDepsDefined = function(moduleId) {
		var visitedModules = {};
		var recurse = function(moduleId) {
			if (visitedModules[moduleId] == true) { return true; }
			visitedModules[moduleId] = true;
			var module = getModule(moduleId);
			if (!module || !module.defined) { return false; }
			else {
				var deps = module.deps || [];
				for (var i = deps.length; i--;) {
					if (!recurse(deps[i])) {
						return false;
					}
				}
				return true;
			}
		};
		return recurse(moduleId);
	};

	// Checks dependency callbacks and fires as necessary
	var fireCallbacks = function() {
		var i = 0;
		while (i<_callbacks.length) {
			var deps = _callbacks[i][0],
				func = _callbacks[i][1],
				n = 0;
			while (n<deps.length) {
				if (areDeepDepsDefined(deps[n])) {
					deps.splice(n, 1);
				}
				else {
					n++;
				}
			}
			if (!deps.length) {
				_callbacks.splice(i, 1);
				if (func != null) {
					setTimeout(func, 0);
				}
			}
			else {
				i++;
			}
		}
	};

	// Load an unwrapped module using XHR and eval()
	var loadModuleByEval = _fetchFunc = function(moduleId) {
		var timeoutHandle;

		var errorFunc = function() {
			var module = getModule(moduleId);
			if (!module.defined) {
				module.defined = module.error = true;
				fireCallbacks();
			}
		};

		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		var moduleUri = resolveModuleUri(moduleId);
		xhr.open('GET', moduleUri, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				clearTimeout(timeoutHandle);
				if (xhr.status == 200 || xhr.status === 0) {
					var moduleCode = xhr.responseText,
						deps = determineShallowDependencies(moduleCode),
						moduleDir = moduleId.substring(0, moduleId.lastIndexOf('/')+1),
						moduleDefs = {};
					for (var i = deps.length; i--;) {
						deps[i] = resolveModuleId(deps[i], moduleDir);
					}
					try {
						moduleDefs[moduleId] = globalEval('({fn: function(require, exports, module) {\r\n' + moduleCode + '\r\n}})').fn;
					} catch (e) {
						if (e instanceof SyntaxError) {
							var msg = 'Syntax Error: ';
							if (e.lineNumber) {
								msg += 'line ' + (e.lineNumber - 581);
							} else {
								console.log('GameJs tip: use Firefox to see line numbers in Syntax Errors.');
							}
							msg += ' in file ' + moduleUri;
							console.log(msg);
						}
						throw e;
					}

					Yabble.define(moduleDefs, deps);
				}
				else {
					errorFunc();
				}
			}
		};

		timeoutHandle = setTimeout(errorFunc, _timeoutLength);

		xhr.send(null);
	};

	// Used by loadModuleByEval and by the packager. Determines shallow dependencies of
	// a module via static analysis. This can currently break with require.ensure().
	var determineShallowDependencies = Yabble.unit.determineShallowDependencies = function(moduleCode) {
		// TODO: account for comments
		var deps = {}, match, unique = {};

		var requireRegex = /(?:^|[^\w\$_.])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
		while (match = requireRegex.exec(moduleCode)) {
			var module = eval(match[1]);
			if (!hasOwnProperty.call(deps, module)) {
				deps[module] = true;
			}
		}

		var ensureRegex = /(?:^|[^\w\$_.])require.ensure\s*\(\s*(\[("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|\s*|,)*\])/g;
		while (match = ensureRegex.exec(moduleCode)) {
			var moduleArray = eval(match[1]);
			for (var i = moduleArray.length; i--;) {
				var module = moduleArray[i];
				delete deps[module];
			}
		}

		var depsArray = [];
		forIn(deps, function(module) {
			depsArray.push(module);
		});

		return depsArray;
	};

	// Load a wrapped module via script tags
	var loadModuleByScript = function(moduleId) {
		var scriptEl = document.createElement('script');
		scriptEl.type = 'text/javascript';
		scriptEl.src = resolveModuleUri(moduleId);

		var useStandard = !!scriptEl.addEventListener,
			timeoutHandle;

		var errorFunc = function() {
			postLoadFunc(false);
		};

		var loadFunc = function() {
			if (useStandard || (scriptEl.readyState == 'complete' || scriptEl.readyState == 'loaded')) {
				postLoadFunc(getModule(moduleId).defined);
			}
		};

		var postLoadFunc = function(loaded) {
			clearTimeout(timeoutHandle);

			if (useStandard) {
				scriptEl.removeEventListener('load', loadFunc, false);
				scriptEl.removeEventListener('error', errorFunc, false);
			}
			else {
				scriptEl.detachEvent('onreadystatechange', loadFunc);
			}

			if (!loaded) {
				var module = getModule(moduleId);
				if (!module.defined) {
					module.defined = module.error = true;
					fireCallbacks();
				}
			}
		};

		if (useStandard) {
			scriptEl.addEventListener('load', loadFunc, false);
			scriptEl.addEventListener('error', errorFunc, false);
		}
		else {
			scriptEl.attachEvent('onreadystatechange', loadFunc);
		}

		timeoutHandle = setTimeout(errorFunc, _timeoutLength);

		head.appendChild(scriptEl);
	};

	var normalizeTransport = function() {
		var transport = {modules: []};
		var standardInjects = ['require', 'exports', 'module'];
		if (typeof arguments[0] == 'object') { // Transport/D
			transport.deps = arguments[1] || [];
			var moduleDefs = arguments[0];
			forIn(moduleDefs, function(moduleId) {
				var module = {
					id: moduleId
				};

				if (typeof moduleDefs[moduleId] == 'function') {
					module.factory = moduleDefs[moduleId];
					module.injects = standardInjects;
				}
				else {
					module.factory = moduleDefs[moduleId].factory;
					module.injects = moduleDefs[moduleId].injects || standardInjects;
				}
				transport.modules.push(module);
			});
		}
		else { // Transport/C
			transport.deps = arguments[1].slice(0);
			removeWhere(transport.deps, function(dep) {
				return indexOf(standardInjects, dep) >= 0;
			});

			transport.modules.push({
				id: arguments[0],
				factory: arguments[2],
				injects: arguments[1]
			});
		}
		return transport;
	};

	// Set the uri which forms the conceptual module namespace root
	Yabble.setModuleRoot = function(path) {
		if (!(/^http(s?):\/\//.test(path))) {
			var href = window.location.href;
			href = href.substr(0, href.lastIndexOf('/')+1);
			path = combinePaths(path, href);
		}

		if (path.length && path.charAt(path.length-1) != '/') {
			path += '/';
		}

		_moduleRoot = path;
	};

	// Set a timeout period for async module loading
	Yabble.setTimeoutLength = function(milliseconds) {
		_timeoutLength = milliseconds;
	};

	// Use script tags with wrapped code instead of XHR+eval()
	Yabble.useScriptTags = function() {
		_fetchFunc = loadModuleByScript;
	};

	// Define a module per various transport specifications
	Yabble.def = Yabble.define = function() {
		var transport = normalizeTransport.apply(null, arguments);

		var unreadyModules = [],
			definedModules = [];

		var deps = transport.deps;

		for (var i = transport.modules.length; i--;) {
			var moduleDef = transport.modules[i],
				moduleId = moduleDef.id,
				module = getModule(moduleId);

			if (!module) {
				module = _modules[moduleId] = {};
			}
			module.module = {
				id: moduleId,
				uri: resolveModuleUri(moduleId)
			};

			module.defined = true;
			module.deps = deps.slice(0);
			module.injects = moduleDef.injects;
			module.factory = moduleDef.factory;
			definedModules.push(module);
		}

		for (var i = deps.length; i--;) {
			var moduleId = deps[i],
				module = getModule(moduleId);

			if (!module || !areDeepDepsDefined(moduleId)) {
				unreadyModules.push(moduleId);
			}
		}

		if (unreadyModules.length) {
			setTimeout(function() {
				queueModules(unreadyModules);
			}, 0);
		}

		fireCallbacks();
	};

	Yabble.isKnown = function(moduleId) {
		return getModule(moduleId) != null;
	};

	Yabble.isDefined = function(moduleId) {
		var module = getModule(moduleId);
		return !!(module && module.defined);
	};

	// Do an async lazy-load of modules
	Yabble.ensure = function(deps, cb) {
		ensureImpl(deps, cb, '');
	};

	// Start an application via a main program module
	Yabble.run = function(program, cb) {
		program = _mainProgram = resolveModuleId(program, '');
		Yabble.ensure([program], function(require) {
			require(program);
			if (cb != null) { cb(); }
		});
	};

	// Reset internal state. Used mostly for unit tests.
	Yabble.reset = function() {
		_mainProgram = null;
		_modules = {};
		_callbacks = [];

		// Built-in system module
		Yabble.define({
			'system': function(require, exports, module) {}
		});
	};

	Yabble.reset();

	// Export to the require global
	window.require = Yabble;
})(function(code) {
   with (window) {
      return eval(code);
   };
});
/* This file has been generated by yabbler.js */
require.define({
"ShopThing": function(require, exports, module) {
var gamejs = require('gamejs')
var Thing = require('./Thing')
var Images = require('./Images')
var state = require('./state')


BankBox = function() {
    Thing.TextBox.apply(this, ["To spend: ???XP", [120,40]])
    this.font = new gamejs.font.Font("24px sans-serif")
    this.centered = true
}
gamejs.utils.objects.extend(BankBox, Thing.TextBox)
BankBox.prototype.think = function (dt) {
    this.update("To spend: " + state.xp + "XP")
    TextBox.prototype.think.call(this, dt)
}

Greeting = function() {
    Thing.TextBox.apply(this, ["Please select an adventurer to upgrade", [427,240]])
    this.font = new gamejs.font.Font("24px sans-serif")
    this.update("Please select an adventurer to upgrade")
    this.centered = true
}
gamejs.utils.objects.extend(Greeting, Thing.TextBox)


UpgradeMenu = function(player, pstates, index) {
    Thing.Thing.apply(this)
    this.player = player
    this.index = index
    this.pstates = pstates
    this.pstate = pstates[index]
    this.font = new gamejs.font.Font("24px sans-serif")
    this.centered = true
    this.image = null
}
gamejs.utils.objects.extend(UpgradeMenu, Thing.Thing)
UpgradeMenu.prototype.build = function () {
    this.image = new gamejs.Surface([300, 240])
    this.image.fill("#000044")
    while (this.children.length) this.children[0].die()
    this.setpos([427, 200])
    var namebox = new Thing.TextBox("Adventurer: " + this.pstate.name)
    namebox.attachto(this).setpos([-130, -110])
    var s = new Thing.TextBox("Skill: " + this.pstate.skill)
    s.attachto(this).setpos([-120, -80]);
    (new Thing.TextBox("" + this.pstate.xpspent, [0, 0], "12px sans-serif", "blue")).attachto(this).setpos([120, 80]);
    (new Thing.TextBox(this.pstate.hp0 + "HP")).attachto(this).setpos([-30, -44]);
    (new Thing.TextBox(this.pstate.mp0 + "MP")).attachto(this).setpos([-30, -12]);
    (new Thing.TextBox(this.pstate.strength + " strength")).attachto(this).setpos([-30, 20]);
    (new Thing.TextBox(Math.floor(this.pstate.speed/10) + " speed")).attachto(this).setpos([-30, 52]);
    (new Thing.TextBox(Math.floor(this.pstate.range/20) + " range")).attachto(this).setpos([-30, 84]);

    var i = this.index;
    (new Thing.Button("-" + state.upgradeamt(0, i) + "XP", null, function () { state.upgrade(0, i) })).attachto(this).setpos([-80,-32]);
    (new Thing.Button("-" + state.upgradeamt(1, i) + "XP", null, function () { state.upgrade(1, i) })).attachto(this).setpos([-80,0]);
    (new Thing.Button("-" + state.upgradeamt(2, i) + "XP", null, function () { state.upgrade(2, i) })).attachto(this).setpos([-80,32]);
    (new Thing.Button("-" + state.upgradeamt(3, i) + "XP", null, function () { state.upgrade(3, i) })).attachto(this).setpos([-80,64]);
    (new Thing.Button("-" + state.upgradeamt(4, i) + "XP", null, function () { state.upgrade(4, i) })).attachto(this).setpos([-80,96]);


/*    hp0: 200,
    mp0: 200,
    speed: 100,
    range: 100,
    xpspent: 0,
    deserted: 0,*/

}
UpgradeMenu.prototype.think = function (dt) {
    if (!this.image) this.build()
    Thing.Thing.prototype.think(dt)
}



exports.BankBox = BankBox
exports.Greeting = Greeting
exports.UpgradeMenu = UpgradeMenu


}}, ["gamejs", "Thing", "Images", "state"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs": function(require, exports, module) {
var matrix = require('./gamejs/utils/matrix');
var objects = require('./gamejs/utils/objects');

/**
 * @fileoverview This module holds the essential `Rect` and `Surface` classes as
 * well as static methods for preloading assets. `gamejs.ready()` is maybe
 * the most important as it kickstarts your app.
 *
 */

var DEBUG_LEVELS = ['info', 'warn', 'error', 'fatal'];
var debugLevel = 2;

/**
 * set logLevel as string or number
 *   * 0 = info
 *   * 1 = warn
 *   * 2 = error
 *   * 3 = fatal
 *
 * @example
 * gamejs.setLogLevel(0); // debug
 * gamejs.setLogLevel('error'); // equal to setLogLevel(2)
 */
exports.setLogLevel = function(logLevel) {
   if (typeof logLevel === 'string' && DEBUG_LEVELS.indexOf(logLevel)) {
      debugLevel = DEBUG_LEVELS.indexOf(logLevel);
   } else if (typeof logLevel === 'number') {
      debugLevel = logLevel;
   } else {
      throw new Error('invalid logLevel ', logLevel, ' Must be one of: ', DEBUG_LEVELS);
   }
   return debugLevel;
};
/**
 * Log a msg to the console if console is enable
 * @param {String} msg the msg to log
 */
var log = exports.log = function() {
   // IEFIX can't call apply on console
   var args = Array.prototype.slice.apply(arguments, [0]);
   args.unshift(Date.now());
   if (window.console !== undefined && console.log.apply) {
      console.log.apply(console, args);
   }
};
exports.info = function() {
   if (debugLevel <= DEBUG_LEVELS.indexOf('info')) {
      log.apply(this, arguments);
   }
};
exports.warn = function() {
   if (debugLevel <= DEBUG_LEVELS.indexOf('warn')) {
      log.apply(this, arguments);
   }
};
exports.error = function() {
   if (debugLevel <= DEBUG_LEVELS.indexOf('error')) {
      log.apply(this, arguments);
   }
};
exports.fatal = function() {
   if (debugLevel <= DEBUG_LEVELS.indexOf('fatal')) {
      log.apply(this, arguments);
   }
};

/**
 * Normalize various ways to specify a Rect into {left, top, width, height} form.
 *
 */
function normalizeRectArguments() {
   var left = 0;
   var top = 0;
   var width = 0;
   var height = 0;

   if (arguments.length === 2) {
      if (arguments[0] instanceof Array && arguments[1] instanceof Array) {
         left = arguments[0][0];
         top = arguments[0][1];
         width = arguments[1][0];
         height = arguments[1][1];
      } else {
         left = arguments[0];
         top = arguments[1];
      }
   } else if (arguments.length === 1 && arguments[0] instanceof Array) {
      left = arguments[0][0];
      top = arguments[0][1];
      width = arguments[0][2];
      height = arguments[0][3];
   } else if (arguments.length === 1 && arguments[0] instanceof Rect) {
      left = arguments[0].left;
      top = arguments[0].top;
      width = arguments[0].width;
      height = arguments[0].height;
   } else if (arguments.length === 4) {
      left = arguments[0];
      top = arguments[1];
      width = arguments[2];
      height = arguments[3];
   } else {
      throw new Error('not a valid rectangle specification');
   }
   return {left: left || 0, top: top || 0, width: width || 0, height: height || 0};
}

/**
 * Creates a Rect. Rects are used to hold rectangular areas. There are a couple
 * of convinient ways to create Rects with different arguments and defaults.
 *
 * Any function that requires a `gamejs.Rect` argument also accepts any of the
 * constructor value combinations `Rect` accepts.
 *
 * Rects are used a lot. They are good for collision detection, specifying
 * an area on the screen (for blitting) or just to hold an objects position.
 *
 * The Rect object has several virtual attributes which can be used to move and align the Rect:
 *
 *   top, left, bottom, right
 *   topleft, bottomleft, topright, bottomright
 *   center
 *   width, height
 *   w,h
 *
 * All of these attributes can be assigned to.
 * Assigning to width or height changes the dimensions of the rectangle; all other
 * assignments move the rectangle without resizing it. Notice that some attributes
 * are Numbers and others are pairs of Numbers.
 *
 * @example
 * new Rect([left, top]) width & height default to 0
 * new Rect(left, top) width & height default to 0
 * new Rect(left, top, width, height)
 * new Rect([left, top], [width, height])
 * new Rect(oldRect) clone of oldRect is created
 *
 * @property {Number} right
 * @property {Number} bottom
 * @property {Number} center
 *
 * @param {Array|gamejs.Rect} position Array holding left and top coordinates
 * @param {Array} dimensions Array holding width and height
 */
var Rect = exports.Rect = function() {

   var args = normalizeRectArguments.apply(this, arguments);

   /**
    * Left, X coordinate
    * @type Number
    */
   this.left = args.left;

   /**
    * Top, Y coordinate
    * @type Number
    */
   this.top = args.top;

   /**
    * Width of rectangle
    * @type Number
    */
   this.width = args.width;

   /**
    * Height of rectangle
    * @type Number
    */
   this.height = args.height;

   return this;
};

objects.accessors(Rect.prototype, {
   /**
    * Bottom, Y coordinate
    * @name Rect.prototype.bottom
    * @type Number
    */
   'bottom': {
      get: function() {
         return this.top + this.height;
      },
      set: function(newValue) {
         this.top = newValue - this.height;
         return;
      }
   },
   /**
    * Right, X coordinate
    * @name Rect.prototype.right
    * @type Number
    */
   'right': {
      get: function() {
         return this.left + this.width;
      },
      set: function(newValue) {
         this.left = newValue - this.width;
      }
   },
   /**
    * Center Position. You can assign a rectangle form.
    * @name Rect.prototype.center
    * @type Array
    */
   'center': {
      get: function() {
         return [this.left + (this.width / 2),
                 this.top + (this.height / 2)
                ];
      },
      set: function() {
         var args = normalizeRectArguments.apply(this, arguments);
         this.left = args.left - (this.width / 2);
         this.top = args.top - (this.height / 2);
         return;
      }
   },
   /**
    * Top-left Position. You can assign a rectangle form.
    * @name Rect.prototype.topleft
    * @type Array
    */
   'topleft': {
      get: function() {
         return [this.left, this.top];
      },
      set: function() {
         var args = normalizeRectArguments.apply(this, arguments);
         this.left = args.left;
         this.top = args.top;
         return;
      }
   },
   /**
    * Bottom-left Position. You can assign a rectangle form.
    * @name Rect.prototype.bottomleft
    * @type Array
    */
   'bottomleft': {
      get: function() {
         return [this.left, this.bottom];
      },
      set: function() {
         var args = normalizeRectArguments.apply(this, arguments);
         this.left = args.left;
         this.bottom = args.bottom;
         return;
      }
   },
   /**
    * Top-right Position. You can assign a rectangle form.
    * @name Rect.prototype.topright
    * @type Array
    */
   'topright': {
      get: function() {
         return [this.right, this.top];
      },
      set: function() {
         var args = normalizeRectArguments.apply(this, arguments);
         this.right = args.right;
         this.top = args.top;
         return;
      }
   },
   /**
    * Bottom-right Position. You can assign a rectangle form.
    * @name Rect.prototype.bottomright
    * @type Array
    */
   'bottomright': {
      get: function() {
         return [this.right, this.bottom];
      },
      set: function() {
         var args = normalizeRectArguments.apply(this, arguments);
         this.right = args.right;
         this.bottom = args.bottom;
         return;
      }
   },
   /**
    * Position x value, alias for `left`.
    * @name Rect.prototype.y
    * @type Array
    */
   'x': {
      get: function() {
         return this.left;
      },
      set: function(newValue) {
         this.left = newValue;
         return;
      }
   },
   /**
    * Position y value, alias for `top`.
    * @name Rect.prototype.y
    * @type Array
    */
   'y': {
      get: function() {
         return this.top;
      },
      set: function(newValue) {
         this.top = newValue;
         return;
      }
   }
});

/**
 * Move returns a new Rect, which is a version of this Rect
 * moved by the given amounts. Accepts any rectangle form.
 * as argument.
 *
 * @param {Number|gamejs.Rect} x amount to move on x axis
 * @param {Number} y amount to move on y axis
 */
Rect.prototype.move = function() {
   var args = normalizeRectArguments.apply(this, arguments);
   return new Rect(this.left + args.left, this.top + args.top, this.width, this.height);
};

/**
 * Move this Rect in place - not returning a new Rect like `move(x, y)` would.
 *
 * `moveIp(x,y)` or `moveIp([x,y])`
 *
 * @param {Number|gamejs.Rect} x amount to move on x axis
 * @param {Number} y amount to move on y axis
 */
Rect.prototype.moveIp = function() {
   var args = normalizeRectArguments.apply(this, arguments);
   this.left += args.left;
   this.top += args.top;
   return;
};

/**
 * Return the area in which this Rect and argument Rect overlap.
 *
 * @param {gamejs.Rect} Rect to clip this one into
 * @returns {gamejs.Rect} new Rect which is completely inside the argument Rect,
 * zero sized Rect if the two rectangles do not overlap
 */
Rect.prototype.clip = function(rect) {
   if(!this.collideRect(rect)) {
      return new Rect(0,0,0,0);
   }

   var x, y, width, height;

   // Left
   if ((this.left >= rect.left) && (this.left < rect.right)) {
      x = this.left;
   } else if ((rect.left >= this.left) && (rect.left < this.right)) {
      x = rect.left;
   }

   // Right
   if ((this.right > rect.left) && (this.right <= rect.right)) {
      width = this.right - x;
   } else if ((rect.right > this.left) && (rect.right <= this.right)) {
      width = rect.right - x;
   }

   // Top
   if ((this.top >= rect.top) && (this.top < rect.bottom)) {
      y = this.top;
   } else if ((rect.top >= this.top) && (rect.top < this.bottom)) {
      y = rect.top;
   }

   // Bottom
   if ((this.bottom > rect.top) && (this.bottom <= rect.bottom)) {
     height = this.bottom - y;
   } else if ((rect.bottom > this.top) && (rect.bottom <= this.bottom)) {
     height = rect.bottom - y;
   }
   return new Rect(x, y, width, height);
};

/**
 * Join two rectangles
 *
 * @param {gamejs.Rect} union with this rectangle
 * @returns {gamejs.Rect} rectangle containing area of both rectangles
 */
Rect.prototype.union = function(rect) {
   var x, y, width, height;

   x = Math.min(this.left, rect.left);
   y = Math.min(this.top, rect.top);
   width = Math.max(this.right, rect.right) - x;
   height = Math.max(this.bottom, rect.bottom) - y;
   return new Rect(x, y, width, height);
};

/**
 * Check for collision with a point.
 *
 * `collidePoint(x,y)` or `collidePoint([x,y])` or `collidePoint(new Rect(x,y))`
 *
 * @param {Array|gamejs.Rect} point the x and y coordinates of the point to test for collision
 * @returns {Boolean} true if the point collides with this Rect
 */
Rect.prototype.collidePoint = function() {
   var args = normalizeRectArguments.apply(this, arguments);
   return (this.left <= args.left && args.left <= this.right) &&
       (this.top <= args.top && args.top <= this.bottom);
};

/**
 * Check for collision with a Rect.
 * @param {gamejs.Rect} rect the Rect to test check for collision
 * @returns {Boolean} true if the given Rect collides with this Rect
 */
Rect.prototype.collideRect = function(rect) {
   return !(this.left > rect.right || this.right < rect.left ||
      this.top > rect.bottom || this.bottom < rect.top);
};

/**
 * @param {Array} pointA start point of the line
 * @param {Array} pointB end point of the line
 * @returns true if the line intersects with the rectangle
 * @see http://stackoverflow.com/questions/99353/how-to-test-if-a-line-segment-intersects-an-axis-aligned-rectange-in-2d/293052#293052
 *
 */
Rect.prototype.collideLine = function(p1, p2) {
   var x1 = p1[0];
   var y1 = p1[1];
   var x2 = p2[0];
   var y2 = p2[1];

   function linePosition(point) {
      var x = point[0];
      var y = point[1];
      return (y2 - y1) * x + (x1 - x2) * y + (x2 * y1 - x1 * y2);
   }

   var relPoses = [[this.left, this.top],
                   [this.left, this.bottom],
                   [this.right, this.top],
                   [this.right, this.bottom]
                  ].map(linePosition);

   var noNegative = true;
   var noPositive = true;
   var noZero = true;
   relPoses.forEach(function(relPos) {
      if (relPos > 0) {
         noPositive = false;
      } else if (relPos < 0) {
         noNegative = false;
      } else if (relPos === 0) {
         noZero = false;
      }
   }, this);

   if ( (noNegative || noPositive) && noZero) {
      return false;
   }
   return !((x1 > this.right && x2 > this.right) ||
            (x1 < this.left && x2 < this.left) ||
            (y1 < this.top && y2 < this.top) ||
            (y1 > this.bottom && y2 > this.bottom)
            );
};

/**
 * @returns {String} Like "[x, y][w, h]"
 */
Rect.prototype.toString = function() {
   return ["[", this.left, ",", this.top, "]"," [",this.width, ",", this.height, "]"].join("");
};

/**
 * @returns {gamejs.Rect} A new copy of this rect
 */
Rect.prototype.clone = function() {
   return new Rect(this);
};

/**
 * A Surface represents a bitmap image with a fixed width and height. The
 * most important feature of a Surface is that they can be `blitted`
 * onto each other.
 *
 * @example
 * new gamejs.Surface([width, height]);
 * new gamejs.Surface(width, height);
 * new gamejs.Surface(rect);
 * @constructor
 *
 * @param {Array} dimensions Array holding width and height
 */
var Surface = exports.Surface = function() {
   var args = normalizeRectArguments.apply(this, arguments);
   var width = args.left;
   var height = args.top;
   // unless argument is rect:
   if (arguments.length == 1 && arguments[0] instanceof Rect) {
      width = args.width;
      height = args.height;
   }
   // only for rotatation & scale
   /** @ignore */
   this._matrix = matrix.identity();
   /** @ignore */
	this._canvas = document.createElement("canvas");
	this._canvas.width = width;
	this._canvas.height = height;
	/** @ignore */
	this._blitAlpha = 1.0;

   /** @ignore */
   this._context = this._canvas.getContext('2d')
   this._smooth();
   return this;
};

/** @ignore */
Surface.prototype._noSmooth = function() {
	// disable image scaling
	// see https://developer.mozilla.org/en/Canvas_tutorial/Using_images#Controlling_image_scaling_behavior
	// and https://github.com/jbuck/processing-js/commit/65de16a8340c694cee471a2db7634733370b941c
	this.context.mozImageSmoothingEnabled = false;
   this.canvas.style.setProperty("image-rendering", "optimizeSpeed", "important");
   this.canvas.style.setProperty("image-rendering", "-moz-crisp-edges", "important");
   this.canvas.style.setProperty("image-rendering", "-webkit-optimize-contrast", "important");
   this.canvas.style.setProperty("image-rendering", "optimize-contrast", "important");
   this.canvas.style.setProperty("-ms-interpolation-mode", "nearest-neighbor", "important");
   return;
};
/** @ignore */
Surface.prototype._smooth = function() {
   this.canvas.style.setProperty("image-rendering", "optimizeQuality", "important");
   this.canvas.style.setProperty("-ms-interpolation-mode", "bicubic", "important");
   this.context.mozImageSmoothingEnabled = true;
};

/**
 * Blits another Surface on this Surface. The destination where to blit to
 * can be given (or it defaults to the top left corner) as well as the
 * Area from the Surface which should be blitted (e.g., for cutting out parts of
 * a Surface).
 *
 * @example
 * // blit flower in top left corner of display
 * displaySurface.blit(flowerSurface);
 *
 * // position flower at 10/10 of display
 * displaySurface.blit(flowerSurface, [10, 10])
 *
 * // ... `dest` can also be a rect whose topleft position is taken:
 * displaySurface.blit(flowerSurface, new gamejs.Rect([10, 10]);
 *
 * // only blit half of the flower onto the display
 * var flowerRect = flowerSurface.rect;
 * flowerRect = new gamejs.Rect([0,0], [flowerRect.width/2, flowerRect.height/2])
 * displaySurface.blit(flowerSurface, [0,0], flowerRect);
 *
 * @param {gamejs.Surface} src The Surface which will be blitted onto this one
 * @param {gamejs.Rect|Array} dst the Destination x, y position in this Surface.
 *            If a Rect is given, it's top and left values are taken. If this argument
 *            is not supplied the blit happens at [0,0].
 * @param {gamesjs.Rect|Array} area the Area from the passed Surface which
 *            should be blitted onto this Surface.
 * @param {Number} [special_flags] FIXME add special flags for composite operations
 * @returns {gamejs.Rect} Rect actually repainted
 */
Surface.prototype.blit = function(src, dest, area, special_flags) {

   var rDest, rArea;

   if (dest instanceof Rect) {
      rDest = dest.clone();
      var srcSize = src.getSize();
      if (!rDest.width) {
         rDest.width = srcSize[0];
      }
      if (!rDest.height) {
         rDest.height = srcSize[1];
      }
    } else if (dest && dest instanceof Array && dest.length == 2) {
      rDest = new Rect(dest, src.getSize());
    } else {
      rDest = new Rect([0,0], src.getSize());
    }

   // area within src to be drawn
   if (area instanceof Rect) {
      rArea = area;
   } else if (area && area instanceof Array && area.length == 2) {
      var size = src.getSize();
      rArea = new Rect(area, [size[0] - area[0], size[1] - area[1]]);
   } else {
      rArea = new Rect([0,0], src.getSize());
   }

   if (isNaN(rDest.left) || isNaN(rDest.top) || isNaN(rDest.width) || isNaN(rDest.height)) {
      throw new Error('[blit] bad parameters, destination is ' + rDest);
   }

   this.context.save();
   // first translate, then rotate
   var m = matrix.translate(matrix.identity(), rDest.left, rDest.top);
   m = matrix.multiply(m, src._matrix);
   this.context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
   var srcRect = src.getRect();
   // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
   this.context.globalAlpha = src._blitAlpha;
   this.context.drawImage(src.canvas, rArea.left, rArea.top, rArea.width, rArea.height, 0, 0, rDest.width, rDest.height);
   this.context.restore();
   return;
};

/**
 * @returns {Number[]} the width and height of the Surface
 */
Surface.prototype.getSize = function() {
   return [this.canvas.width, this.canvas.height];
};

/**
 * Obsolte, only here for compatibility.
 * @deprecated
 * @ignore
 * @returns {gamejs.Rect} a Rect of the size of this Surface
 */
Surface.prototype.getRect = function() {
   return new Rect([0,0], this.getSize());
};

/**
 * Fills the whole Surface with a color. Usefull for erasing a Surface.
 * @param {String} CSS color string, e.g. '#0d120a' or '#0f0' or 'rgba(255, 0, 0, 0.5)'
 */
Surface.prototype.fill = function(color) {
   this.context.save();
   this.context.fillStyle = color || "#000000";
   this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
   this.context.restore();
   return;
};

/**
 * Clear the surface.
 */
Surface.prototype.clear = function() {
   var size = this.getSize();
   this.context.clearRect(0, 0, size[0], size[1]);
   return;
};

objects.accessors(Surface.prototype, {
   /**
    * @type gamejs.Rect
    */
   'rect': {
      get: function() {
         return this.getRect();
      }
   },
   /**
    * @ignore
    */
   'context': {
      get: function() {
         return this._context;
      }
   },
   'canvas': {
      get: function() {
         return this._canvas;
      }
   }
});

/**
 * @returns {gamejs.Surface} a clone of this surface
 */
Surface.prototype.clone = function() {
  var newSurface = new Surface(this.getRect());
  newSurface.blit(this);
  return newSurface;
};

/**
 * @returns {Number} current alpha value
 */
Surface.prototype.getAlpha = function() {
   return (1 - this._blitAlpha);
};

/**
 * Set the alpha value for the whole Surface. When blitting the Surface on
 * a destination, the pixels will be drawn slightly transparent.
 * @param {Number} alpha value in range 0.0 - 1.0
 * @returns {Number} current alpha value
 */
Surface.prototype.setAlpha = function(alpha) {
   if (isNaN(alpha) || alpha < 0 || alpha > 1) {
      return;
   }

   this._blitAlpha = (1 - alpha);
   return (1 - this._blitAlpha);
};

/**
 * The data must be represented in left-to-right order, row by row top to bottom,
 * starting with the top left, with each pixel's red, green, blue, and alpha components
 * being given in that order for each pixel.
 * @see http://dev.w3.org/html5/2dcontext/#canvaspixelarray
 * @returns {ImageData} an object holding the pixel image data {data, width, height}
 */
Surface.prototype.getImageData = function() {
   var size = this.getSize();
   return this.context.getImageData(0, 0, size[0], size[1]);
};

/**
 * @ignore
 */
exports.display = require('./gamejs/display');
/**
 * @ignore
 */
exports.draw = require('./gamejs/draw');
/**
 * @ignore
 */
exports.event = require('./gamejs/event');
/**
 * @ignore
 */
exports.font = require('./gamejs/font');
/**
 * @ignore
 */
exports.http = require('./gamejs/http');
/**
 * @ignore
 */
exports.image = require('./gamejs/image');
/**
 * @ignore
 */
exports.mask = require('./gamejs/mask');
/**
 * @ignore
 */
exports.mixer = require('./gamejs/mixer');
/**
 * @ignore
 */
exports.sprite = require('./gamejs/sprite');
/**
 * @ignore
 */
exports.surfacearray = require('./gamejs/surfacearray');
/**
 * @ignore
 */
exports.time = require('./gamejs/time');
/**
 * @ignore
 */
exports.transform = require('./gamejs/transform');

/**
 * @ignore
 */
exports.utils = {
   arrays: require('./gamejs/utils/arrays'),
   objects: require('./gamejs/utils/objects'),
   matrix: require('./gamejs/utils/matrix'),
   vectors: require('./gamejs/utils/vectors'),
   math: require('./gamejs/utils/math')
};

/**
 * @ignore
 */
exports.pathfinding = {
   astar: require('./gamejs/pathfinding/astar')
};

// preloading stuff
var gamejs = exports;
var RESOURCES = {};

/**
 * ReadyFn is called once all modules and assets are loaded.
 * @param {Function} readyFn the function to be called once gamejs finished loading
 * @name ready
 */
exports.ready = function(readyFn) {

   var getMixerProgress = null;
   var getImageProgress = null;

   // init time instantly - we need it for preloaders
   gamejs.time.init();


   // 2.
   function _ready() {
      if (!document.body) {
         return window.setTimeout(_ready, 50);
      }
      getImageProgress = gamejs.image.preload(RESOURCES);
      try {
         getMixerProgress = gamejs.mixer.preload(RESOURCES);
      } catch (e) {
         gamejs.debug('Error loading audio files ', e);
      }
      window.setTimeout(_readyResources, 50);
   }

   // 3.
   function _readyResources() {
      if (getImageProgress() < 1 || getMixerProgress() < 1) {
         return window.setTimeout(_readyResources, 100);
      }
      gamejs.display.init();
      gamejs.image.init();
      gamejs.mixer.init();
      gamejs.event.init();
      readyFn();
   }

   // 1.
   window.setTimeout(_ready, 13);

   function getLoadProgress() {
      if (getImageProgress) {
         return (0.5 * getImageProgress()) + (0.5 * getMixerProgress());
      }
      return 0.1;
   }

   return getLoadProgress;
};

function resourceBaseHref() {
    return (window.$g && window.$g.resourceBaseHref) || '.';
}

/**
 * Preload resources.
 * @param {Array} resources list of resources paths
 * @name preload
 */
var preload = exports.preload = function(resources) {
   var basehref = resourceBaseHref();
   if(basehref.slice(-1) == '/') {
      basehref = basehref.slice(0, basehref.length-1);
   }
   // attach appBaseUrl to resources
   resources.forEach(function(res) {
      // normalize slashses
      RESOURCES[res] = resourceBaseHref() + ('/' + res).replace(/\/+/g, '/');
   }, this);
   return;
};

}}, ["gamejs/utils/matrix", "gamejs/utils/objects", "gamejs/display", "gamejs/draw", "gamejs/event", "gamejs/font", "gamejs/http", "gamejs/image", "gamejs/mask", "gamejs/mixer", "gamejs/sprite", "gamejs/surfacearray", "gamejs/time", "gamejs/transform", "gamejs/utils/arrays", "gamejs/utils/vectors", "gamejs/utils/math", "gamejs/pathfinding/astar"]);/* This file has been generated by yabbler.js */
require.define({
"Images": function(require, exports, module) {
// Loading images is a bit complicated when there are so darn many

var gamejs = require('gamejs')

// Get a piece of something (possibly filtered or flipped
var pieces = {}
function getpiece(name, filter, hflip) {
    var key = name + "|" + (filter || "") + "|" + (hflip ? "y" : "n")
    if (pieces[key]) return pieces[key]
    if (hflip) {
        var img = gamejs.transform.flip(getpiece(name, filter), true, false)
    } else {
        // TODO: figure out how to get this working with trusted domain and all that
        if (filter) {
            var img = getpiece(name).clone()
            var arr = new gamejs.surfacearray.SurfaceArray(img)
            var s = img.getSize()
            for (var x = 0 ; x < s[0] ; ++x) {
                for (var y = 0 ; y < s[1] ; ++y) {
                    var color = arr.get(x, y)
                    var a = color[3], b = color[2]  // images are blue by default
                    arr.set(x, y, [b*filter[0], b*filter[1], b*filter[2], 255])
                }
            }
            img = new gamejs.Surface(s)
            gamejs.surfacearray.blitArray(img, arr)
        } else {
            var img = gamejs.image.load("img/" + name + ".png")
        }
    }    
    pieces[key] = img
    return img
}

// Get an adventurer image
function getadvimage(spec) {
    var img = new gamejs.Surface([600, 600])

    var flipped = true
    
//    img.blit(getpiece("foots-0", null, flipped))
    img.blit(getpiece("noggin-0", null, flipped))
    img.blit(getpiece("peepers-0", null, flipped))
    return gamejs.transform.scale(img, [100, 100])
}


function getimage(name) {
    switch (name) {
        case "adv": // generic adventurer
            var img = new gamejs.Surface([600, 600])
            img.blit(getpiece("noggin-0"))
            img.blit(getpiece("peepers-0"))
            return gamejs.transform.scale(img, [100, 100])

        case "dana": return gamejs.transform.scale(getpiece("dana-0"), [100, 100])
        case "lisa": return gamejs.transform.scale(getpiece("lisa-0"), [100, 100])
        case "theo": return gamejs.transform.scale(getpiece("theo-0"), [100, 100])
        case "rosa": return gamejs.transform.scale(getpiece("rosa-0"), [100, 100])
        case "mort": return gamejs.transform.scale(getpiece("mort-0"), [100, 100])


        case "monster":
            var img = new gamejs.Surface([100, 100])
            gamejs.draw.circle(img, "green", [50, 25], 25)
            return img
        case "bomb0":
            var img = new gamejs.Surface([60, 60])
            gamejs.draw.circle(img, "#440000", [30, 16], 16)
            return img
        case "bomb1":
            var img = new gamejs.Surface([60, 60])
            gamejs.draw.circle(img, "#AAAA00", [30, 16], 16)
            return img

        case "lump": return gamejs.transform.scale(getpiece("lump-0"), [100, 100])
        case "largelump": return gamejs.transform.scale(getpiece("lump-0"), [180, 180])
        case "hugelump": return gamejs.transform.scale(getpiece("lump-0"), [240, 240])
        case "spike": return gamejs.transform.scale(getpiece("spike-0"), [100, 100])
        case "largespike": return gamejs.transform.scale(getpiece("spike-0"), [180, 180])
        case "hugespike": return gamejs.transform.scale(getpiece("spike-0"), [240, 240])

        case "crystal-0":
            return gamejs.transform.scale(getpiece("crystal-0"), [400, 400])

        case "zoltar-4":
            return gamejs.transform.scale(getpiece("zoltar-1"), [300, 300])
        case "zoltar-3":
            return gamejs.transform.scale(getpiece("zoltar-1"), [200, 200])
        case "zoltar-2":
            return gamejs.transform.scale(getpiece("zoltar-1"), [150, 150])
        case "zoltar-1":
            return gamejs.transform.scale(getpiece("zoltar-0"), [120, 120])

        case "skull":
            return gamejs.transform.scale(getpiece("skull-0"), [300, 300])

        case "birdy-0":
            return gamejs.transform.scale(getpiece("birdy-0"), [300, 300])
        case "birdy-1":
            return gamejs.transform.scale(getpiece("birdy-1"), [300, 300])
        case "birdy-2":
            return gamejs.transform.scale(getpiece("birdy-2"), [300, 300])
        case "birdy-3":
            return gamejs.transform.scale(getpiece("birdy-3"), [300, 300])

    }
}


exports.getadvimage = getadvimage
exports.getimage = getimage


}}, ["gamejs"]);/* This file has been generated by yabbler.js */
require.define({
"state": function(require, exports, module) {
var Thing = require('./Thing')
var sound = require('./sound')
var ShopThing = require('./ShopThing')
var gamejs = require('gamejs')

var HUD, gameplay, stage, indicators, critters
var statusbox

// Sprite groups
function creategroups() {
    exports.tokens = new Array()
    exports.players = new Array()
    exports.hazards = new Array()
    exports.mhazards = new Array()
    exports.monsters = new Array()
    exports.selected = new Array()
}

// Remove dead members - should be called periodically
exports.filtergroups = function() {
    exports.tokens = exports.tokens.filter(function (t) { return t.parent })
    exports.players = exports.players.filter(function (t) { return t.parent })
    exports.hazards = exports.hazards.filter(function (t) { return t.parent })
    exports.mhazards = exports.mhazards.filter(function (t) { return t.parent })
    exports.selected = exports.selected.filter(function (t) { return t.parent })
    exports.monsters = exports.monsters.filter(function (t) { return t.parent })
}

// Select new players
var sindicators = []
exports.applyselection = function(newselected) {
    if (newselected && newselected.length) sound.play("select-0")
    for (var j in sindicators) {
        sindicators[j].die()
    }
    sindicators = []
    exports.selected = newselected || []
    for (var j in exports.selected) {
        var i = (new Thing.Indicator(exports.selected[j], 20, null, "yellow")).attachto(exports.indicators)
        sindicators.push(i)
    }
}



// Layers during gameplay:

// - gameplay
//    - stage
//      - indicators (things on the ground)
//      - critters
// - HUD

makelayers = function() {
    HUD = new Thing.Thing()
    gameplay = new Thing.Thing()
    var fps = (new Thing.FPSCounter()).attachto(HUD)
    statusbox = (new Thing.TextBox()).attachto(HUD).setpos([10, 440])

    stage = (new Thing.Stage()).attachto(gameplay)
    indicators = (new Thing.StagedThing()).attachto(stage)
    critters = (new Thing.StagedThing()).attachto(stage)

    exports.HUD = HUD
    exports.gameplay = gameplay
    exports.stage = stage
    exports.indicators = indicators
    exports.critters = critters
    exports.statusbox = statusbox

}

makeshoplayers = function() {
    HUD = new Thing.Thing()
    gameplay = new Thing.Thing()
    var fps = (new Thing.FPSCounter()).attachto(HUD)
    statusbox = (new Thing.TextBox()).attachto(HUD).setpos([10, 440])

    stage = (new Thing.Stage()).attachto(gameplay)
    indicators = (new Thing.StagedThing()).attachto(stage)
    critters = (new Thing.StagedThing()).attachto(stage)

    exports.HUD = HUD
    exports.gameplay = gameplay
    exports.stage = stage
    exports.indicators = indicators
    exports.critters = critters
    exports.statusbox = statusbox

}

var mtypes = {
    lump: Thing.Lump,
    largelump: Thing.LargeLump,
    spike: Thing.Spike,
    largespike: Thing.LargeSpike,
    skull: Thing.Skull,
    zoltar: Thing.Zoltar,
    birdy: Thing.Birdy,
}

exports.gameevents = function(dt) {
    gamet += dt

    if (exports.currentlevel < 10) {
        while (monsterq.length && monsterq[0][0] >= exports.monsters.length) {
            var wave = monsterq.splice(0, 1)[0]
            var theta = Math.random() * 1000, r = 600
            for (var j = 1 ; j < wave.length ; ++j) {
                theta += 0.3
                r += 100
                var pos = [r * Math.cos(theta), r * Math.sin(theta)]
                var type = mtypes[wave[j]]
                if (wave[j] == "zoltar") pos = [0,0,600]
                if (wave[j] == "birdy") pos = [pos[0],pos[1],120]
                var m = (new type()).attachto(exports.critters).setstagepos(pos)
                exports.monsters.push(m)
                m.castshadow()
            }
        }
        if (!exports.players.length) {
            loselevel()
        }
        if (exitportal.parent) {
            checkexitportal()
        }

        if (exports.currentlevel == 2) {
            if (Math.random() * 2 < dt) {
                var n = Math.floor(Math.sqrt(Math.sqrt(gamet))) + 1
                var mons = [n]
                for (var j = 0 ; j < n ; ++j) mons.push("lump") //Math.random() < 0.3 ? "largelump" : "lump")
                monsterq = [mons]
            }
        }

        
        // End conditions
        if (exports.currentlevel == 1 || exports.currentlevel == 3 || exports.currentlevel == 4 || exports.currentlevel == 5) {  // Kill all monsters
            if (!monsterq.length && !exports.monsters.length) {
                placeexitportal()
            }
        } else if (exports.currentlevel == 2) {  // Kill the crystal
            if (!crystal.parent) {
                placeexitportal()
            }
        }
    }
}

placeexitportal = function() {
    if (exitportal.parent) return
    sound.play("portal-0")
    exitportal.attachto(exports.indicators)
    exitportal.reposition()
    exitportal.r *= 2
    while (exports.players.length && exitportal.contains(exports.players[0])) {
        exitportal.reposition()
    }
    exitportal.r /= 2
}
checkexitportal = function () {
    var n = 0
    for (var j = 0 ; j < exports.players.length ; ++j) {
        if (exitportal.contains(exports.players[j])) n += 1
    }
    if (n >= exports.players.length) beatlevel()
}

beatlevel = function() {
    completedlevel = exports.currentlevel
    if (exports.currentlevel == 1) {
        for (var j in playerstates) {
            playerstates[j].mp0 = 10
        }
    }

    // Desertion
    var n = 0, xpmax = -1
    deserted = null
    for (var j in playerstates) {
        if (playerstates[j].deserted) continue
        if (playerstates[j].xpspent > xpmax) {
            deserted = j
            n = 1
            xpmax = playerstates[j].xpspent
        } else if (playerstates[j].xpspent == xpmax) {
            if (Math.random() * (n + 1) < 1) {
                deserted = j
                n += 1
            }
        }
    }
    if (deserted !== null) {
        playerstates[deserted].deserted = true
    }
    exports.savestate()

    exports.loadlevel(completedlevel < 5 ? 71 : 26)
}
loselevel = function() {
    exports.savestate()
    exports.loadlevel(72)
}
exports.beatlevel = beatlevel

var musics = {
    1: "happy-0",
    2: "happy-1",
    3: "happy-2",
    4: "happy-0",
    5: "happy-1",
    10: "fast-0",
}



exports.currentlevel = 0
exports.loadlevel = function(level) {
    gamet = 0
    if (!level) {
        if (exports.currentlevel == 0) {  // start -> first title
            level = 21 + completedlevel
        } else if (exports.currentlevel > 20 && exports.currentlevel < 30) {  // title ->  gameplay
            level = exports.currentlevel - 20
        } else if (exports.currentlevel == 1) {   // gameplay -> shop. shouldn't be here.
            level = 10
        } else if (exports.currentlevel == 10) {  // shop -> title
            level = 21 + completedlevel
        } else if (exports.currentlevel == 71) {  // end title -> cutscene
            // TODO: should be cutscene
            level = 10
        } else if (exports.currentlevel == 72) {  // end title -> shop
            level = 10
        }
    }
//    alert([exports.currentlevel, level])
    exports.currentlevel = level

    if (musics[level]) sound.playmusic(musics[level])

    creategroups()

    if (exports.currentlevel == 21) {
        exports.title = "Quest for the Lost Spells"
        exports.subtitle = "Five adventurers remain"
    }
    if (exports.currentlevel == 22) {
        exports.title = "Quest for the Crystal Key"
        exports.subtitle = "Four adventurers remain"
    }
    if (exports.currentlevel == 23) {
        exports.title = "The Cavern of Ryor"
        exports.subtitle = "Three adventurers remain"
    }
    if (exports.currentlevel == 24) {
        exports.title = "Zoltar's Lair"
        exports.subtitle = "Two adventurers remain"
    }
    if (exports.currentlevel == 25) {
        exports.title = "The Last Adventure"
        exports.subtitle = "One adventurer remains"
    }


    if (exports.currentlevel == 71) {
        exports.title = "Quest completed"
        exports.subtitle = "But one adventurer could not continue..."
    }
    if (exports.currentlevel == 72) {
        exports.title = "Quest failed"
        exports.subtitle = "Try again"
    }
    if (exports.currentlevel == 26) {
        exports.title = "The adventure is over"
        exports.subtitle = "Thanks for playing"
    }



    if (exports.currentlevel < 10) {
        makelayers()
        for (var j = 0 ; j < playerstates.length ; ++j) {
            if (playerstates[j].deserted) continue
            var player = new Thing.Adventurer(playerstates[j])
            var pos = [Math.random() * 400 - 200, Math.random() * 400 - 200]
            player.attachto(exports.critters).setstagepos(pos)
            exports.players.push(player);
            player.castshadow()
        }
        exitportal = new Thing.ExitPortal()
        monsterq = new Array()
    }

    if (exports.currentlevel == 1) {  // Fixed monster queue
        monsterq = [[0,"lump","lump","lump"], [1,"lump","lump","lump"], [2,"lump","lump","lump"],
            [3,"lump","lump","lump","lump"],
            [4,"lump","lump","lump","lump","largelump"],
            [5,"lump","lump","lump","lump","lump","largelump"],
        ]
    } else if (exports.currentlevel == 2) {
        crystal = (new Thing.Crystal()).attachto(exports.critters)
        exports.monsters.push(crystal)
    } else if (exports.currentlevel == 3) {
        monsterq = [[0,"lump","spike","lump"], [1,"spike","spike","spike"],
            [2,"spike", "spike", "spike"],
            [3,"largespike"],
            [0,"largelump", "largelump", "largelump", "lump","spike","largelump","lump","lump", "largespike", "spike"],
            [0,"skull"], [2,"skull"], [2,"skull"],
        ]
    } else if (exports.currentlevel == 4) {
        monsterq = [[0,"largelump","largelump","largelump"],
            [1,"largespike", "largespike", "largespike"],
            [2,"largelump", "largespike", "largespike", "largespike", "largespike"],
            [0,"zoltar"],
        ]
//        monsterq =[[0,"zoltar"]]
    } else if (exports.currentlevel == 5) {
        monsterq = [[0,"largelump", "largespike", "largespike", "largespike", "largespike"],
            [2,"largelump", "largespike", "largespike", "largespike", "largespike", "largespike", "largespike", "largespike", "largespike"],
            [10,"largelump", "largespike", "largespike", "largespike", "largespike", "largespike", "largespike", "largespike", "largespike"],
            [0,"birdy"],[2,"birdy"],[2,"birdy"],
        ]

    }
    if (exports.currentlevel == 10) {
        makeshoplayers()
        upgrademenu = new Array()
        var theta0 = Math.random() * 1000
        for (var j = 0 ; j < playerstates.length ; ++j) {
            if (playerstates[j].deserted) continue
            var player = new Thing.Adventurer(playerstates[j])
            var theta = 2 * Math.PI * j / playerstates.length + theta0
            var pos = [360 * Math.sin(theta), 360 * Math.cos(theta)]
            player.attachto(exports.critters).setstagepos(pos)
            exports.players.push(player);
            player.castshadow()
            player.hp = player.hp0  // Gotta look your best for the shop
            player.mp = player.mp0
            upgrademenu[j] = new ShopThing.UpgradeMenu(player, playerstates, j)
        }
        var bbox = new ShopThing.BankBox()
        bbox.attachto(exports.HUD)
        greeting = new ShopThing.Greeting()
        greeting.attachto(exports.HUD)
        var button = new Thing.Button("DONE", [800, 400], exports.loadlevel)
        button.attachto(exports.HUD)
    }
}

exports.setshopvisibility = function() {
    greeting.attachto(exports.selected.length == 0 ? exports.HUD : null)
    for (var j = 0 ; j < upgrademenu.length ; ++j) {
        if (!upgrademenu[j]) continue
        var sel = exports.selected.indexOf(upgrademenu[j].player) > -1
        upgrademenu[j].attachto(sel ? exports.HUD : null)
    }
}

exports.upgradeamt = function(type, who) {
    return 1 + playerstates[who].upgrades[type]
}
exports.upgrade = function(type, who) {
    var amt = exports.upgradeamt(type, who)
    if (exports.xp < amt) {
        sound.play("no-0")
        return
    }
    sound.play("powerup-0")
    exports.xp -= amt
    switch (type) {
        case 0:
            playerstates[who].hp0 += 5
            break
        case 1:
            playerstates[who].mp0 += 5
            break
        case 2:
            playerstates[who].strength += 1
            break
        case 3:
            playerstates[who].speed += 10
            break
        case 4:
            playerstates[who].range += 20
            break
    }
    playerstates[who].xpspent += amt
    playerstates[who].upgrades[type] += 1
    for (var j in upgrademenu) {
        if (upgrademenu[j]) {
            upgrademenu[j].image = null
        }
    }
    exports.savestate()
}


var playerstates = [
  { name: "dana", size: 28, skill: "quake", hp0: 20, mp0: 0, speed: 90,  range: 100, strength: 3, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "lisa", size: 28, skill: "bolt",  hp0: 40, mp0: 0, speed: 60,  range: 100, strength: 2, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "theo", size: 28, skill: "quake", hp0: 20, mp0: 0, speed: 80,  range:  60, strength: 2, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "rosa", size: 28, skill: "bolt",  hp0: 20, mp0: 0, speed: 120, range:  60, strength: 2, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "mort", size: 28, skill: "drain", hp0: 40, mp0: 0, speed: 50,  range: 140, strength: 1, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
]
var completedlevel = 0
exports.xp = 0


// The state is the overall quest state, doesn't include things that reset
// when you start a level over
exports.savestate = function() {
    var obj = [exports.xp, completedlevel, playerstates]
    localStorage.lastadvstate = JSON.stringify(obj)
}

exports.loadstate = function() {
    if (localStorage.lastadvstate) {
        var obj = JSON.parse(localStorage.lastadvstate)
        exports.xp = obj[0]
        completedlevel = obj[1]
        playerstates = obj[2]
    }
    exports.savestate()
}

//delete localStorage.lastadvstate  // TODO: remove
exports.loadstate()

exports.resetstate = function() {
    delete localStorage.lastadvstate
    window.location.reload()
}
document.getElementById("resetstate").onclick = exports.resetstate



if (false) { // TODO: remove
    for (var j in playerstates) playerstates[j].mp0 = 100
    completedlevel = 1
    exports.xp = 1000
}






}}, ["Thing", "sound", "ShopThing", "gamejs"]);/* This file has been generated by yabbler.js */
require.define({
"sound": function(require, exports, module) {

var volume = 0.5
var sounds = {}

function play(name, delay) {
    if (!volume) return
    if (!sounds[name]) {
        sounds[name] = new Array(10)
        // if there's a sound you need to play more than 10 of at a time, cry me a river
        for (var j = 0 ; j < 10 ; ++j) sounds[name][j] = new Audio("sound/" + name + ".ogg")
        sounds[name].next = 0
    }
    var sound = sounds[name][sounds[name].next]
    sounds[name].next = (sounds[name].next + 1) % 10
    sound.volume = volume
    if (delay) {
        setTimeout(sound.play, delay)
    } else {
        sound.play()
    }
}

var musicvolume = 0.3
var music = null
var musicname = null
function playmusic(name) {
    if (musicname == name) return // already playing
    musicname = name
    if (music) music.pause()
    music = new Audio("music/" + name + ".ogg")
    music.loop = true
    music.volume = musicvolume
    music.play()
}


exports.setvolumes = function (svol, mvol) {
    volume = svol
    musicvolume = mvol
    if (music) music.volume = musicvolume
}


exports.play = play
exports.playmusic = playmusic



}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/http": function(require, exports, module) {
/**
 * @fileoverview Make synchronous http requests to your game's serverside component.
 *
 * If you configure a ajax base URL you can make http requests to your
 * server using those functions.

 * The most high-level functions are `load()` and `save()` which take
 * and return a JavaScript object, which they will send to / recieve from
 * the server-side in JSON format.
 *
 *     <script>
 *     // Same Origin policy applies! You can only make requests
 *     // to the server from which the html page is served.
 *      var $g = {
 *         ajaxBaseHref: "http://the-same-server.com/ajax/"
 *      };
 *      </script>
 *      <script src="./public/gamejs-wrapped.js"></script>
 *      ....
 *      typeof gamejs.load('userdata/') === 'object'
 *      typeof gamejs.get('userdata/') === 'string'
 *      ...
 *
 */

/**
 * Response object returned by http functions `get` and `post`. This
 * class is not instantiable.
 *
 * @param{String} responseText
 * @param {String} responseXML
 * @param {Number} status
 * @param {String} statusText
 */
exports.Response = function() {
   /**
    * @param {String} header
    */
   this.getResponseHeader = function(header)  {
   };
   throw new Error('response class not instantiable');
};

/**
 * Make http request to server-side
 * @param {String} method http method
 * @param {String} url
 * @param {String|Object} data
 * @param {String|Object} type "Accept" header value
 * @return {Response} response
 */
var ajax = exports.ajax = function(method, url, data, type) {
   data = data || null;
   var response = new XMLHttpRequest();
   response.open(method, url, false);
   if (type) {
      response.setRequestHeader("Accept", type);
   }
   if (data instanceof Object) {
      data = JSON.stringify(data);
      response.setRequestHeader('Content-Type', 'application/json');
   }
   response.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
   response.send(data);
   return response;
};

/**
 * Make http GET request to server-side
 * @param {String} url
 */
var get = exports.get = function(url) {
   return ajax('GET', url);
};

/**
 * Make http POST request to server-side
 * @param {String} url
 * @param {String|Object} data
 * @param {String|Object} type "Accept" header value
 * @returns {Response}
 */
var post = exports.post = function(url, data, type) {
   return ajax('POST', url, data, type);
};

function stringify(response) {
   // eval is evil
   return eval('(' + response.responseText + ')');
}

function ajaxBaseHref() {
    return (window.$g && window.$g.ajaxBaseHref) || './';
}

/**
 * Load an object from the server-side.
 * @param {String} url
 * @return {Object} the object loaded from the server
 */
exports.load = function(url) {
   return stringify(get(ajaxBaseHref() + url));
};

/**
 * Send an object to a server-side function.
 * @param {String} url
 * @param {String|Object} data
 * @param {String|Object} type "Accept" header value
 * @returns {Object} the response object
 */
exports.save = function(url, data, type) {
   return stringify(post(ajaxBaseHref() + url, {payload: data}, type));
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/time": function(require, exports, module) {
/**
 * @fileoverview
 * Provides tools for game time managment.
 *
 * This is very different from how PyGame works. We can not
 * pause the execution of the script in Browser JavaScript, so what
 * we do you do is write a main function which contains the code
 * you would put into your main loop and pass that to `fpsCallback()`:
 *
 * @example
 *     function main() {
 *         // update models
 *         // draw to screen
 *      };
 *      gamejs.time.fpsCallback(main, this, 30);
 *      ;
 *      function aiUpdate() {
 *         // do stuff that needs low update rates
 *      }
 *      gamejs.time.fpsCallback(aiUpdate, this, 10);
 *
 * You are encouraged to use multiple `fpsCallbacks()` for the different
 * kind of update rates you need, e.g. one at 30 fps for rendering and
 * another at 10 fps for the AI updates.
 *
 */


var TIMER_LASTCALL = null;
var CALLBACKS = {};
var CALLBACKS_LASTCALL = {};
var TIMER = null;
var STARTTIME = null;

/**
 * @ignore
 */
exports.init = function() {
   STARTTIME = Date.now();
   TIMER = setInterval(perInterval, 10);
   return;
};

/**
 * @param {Function} fn the function to call back
 * @param {Object} thisObj `this` will be set to that object when executing the function
 * @param {Number} fps specify the framerate by which you want the callback to be called. (e.g. 30 = 30 times per seconds). default: 30
 */
exports.fpsCallback = function(fn, thisObj, fps) {
   fps = parseInt(1000/fps, 10);
   CALLBACKS[fps] = CALLBACKS[fps] || [];
   CALLBACKS_LASTCALL[fps] = CALLBACKS_LASTCALL[fps] || 0;

   CALLBACKS[fps].push({
      'rawFn': fn,
      'callback': function(msWaited) {
         fn.apply(thisObj, [msWaited]);
      }
   });
   return;
};

/**
 * @param {Function} callback the function delete
 * @param {Number} fps
 */
exports.deleteCallback = function(callback, fps) {
   fps = parseInt(1000/fps, 10);
   var callbacks = CALLBACKS[fps];
   if (!callbacks) {
      return;
   }

   CALLBACKS[fps] = callbacks.filter(function(fnInfo, idx) {
      if (fnInfo.rawFn !== callback) {
         return true;
      }
      return false;
   });
   return;
};

var perInterval = function() {
   var msNow = Date.now();
   var lastCalls = CALLBACKS_LASTCALL;
   function callbackWrapper(fnInfo) {
      fnInfo.callback(msWaited);
   }
   for (var fpsKey in lastCalls) {
      if (!lastCalls[fpsKey]) {
         CALLBACKS_LASTCALL[fpsKey] = msNow;
      }
      var msWaited = msNow - lastCalls[fpsKey];
      if (fpsKey <= msWaited) {
         CALLBACKS_LASTCALL[fpsKey] = msNow;
         CALLBACKS[fpsKey].forEach(callbackWrapper, this);
      }
   }
   return;
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/pathfinding/astar": function(require, exports, module) {
/**
 * @fileoverview
 * AStar Path finding algorithm
 *
 * Use the `findRoute(map, from, to, [timeout])` function to get the linked list
 * leading `from` a point `to` another on the given `map`.
 *
 * The map must implement interface `gamejs.pathfinding.Map`. This
 * class really holds an example implementation & data for you to study. If you
 * understand what this calls provides, you understand this module.
 *
 * Optionally, the search is canceld after `timeout` in millseconds.
 *
 * If there is no route `null` is returned.
 *
 * @see http://eloquentjavascript.net/chapter7.html
 */
var BinaryHeap = require('../utils/binaryheap').BinaryHeap;

/**
 * helper function for A*
 */
function ReachedList(hashFn) {
   var list = {};

   this.store = function(point, route) {
      list[hashFn(point)] = route;
      return;
   };

   this.find = function(point) {
      return list[hashFn(point)];
   };
   return this;
}


/** A* search function.
 *
 * This function expects a `Map` implementation and the origin and destination
 * points given. If there is a path between the two it will return the optimal
 * path as a linked list. If there is no path it will return null.
 *
 * The linked list is in reverse order: the first item is the destination and
 * the path to the origin follows.
 *
 * @param {Map} map map instance, must follow interface defined in {Map}
 * @param {Array} origin
 * @param {Array} destination
 * @param {Number} timeout milliseconds after which search should be canceled
 * @returns {Object} the linked list leading from `to` to `from` (sic!).
 **/
exports.findRoute = function(map, from, to, timeout) {
   var open = new BinaryHeap(routeScore);
   var hashFn = typeof map.hash === 'function' ? map.hash : defaultHash;
   var reached = new ReachedList(hashFn);

   function routeScore(route) {
      if (route.score === undefined) {
         route.score = map.estimatedDistance(route.point, to) + route.length;
      }
      return route.score;
   }
   function addOpenRoute(route) {
      open.push(route);
      reached.store(route.point, route);
   }

   function processNewPoints(direction) {
      var known = reached.find(direction);
      var newLength = route.length + map.actualDistance(route.point, direction);
      if (!known || known.length > newLength){
         if (known) {
            open.remove(known);
         }
         addOpenRoute({
            point: direction,
            from: route,
            length: newLength
         });
      }
   }
   var startMs = Date.now();
   var route = null;
   addOpenRoute({
      point: from,
      from: null,
      length: 0
   });
   var equalsFn = typeof map.equals === 'function' ? map.equals : defaultEquals;
   while (open.size() > 0 && (!timeout || Date.now() - startMs < timeout)) {
      route = open.pop();
      if (equalsFn(to, route.point)) {
         return route;
      }
      map.adjacent(route.point).forEach(processNewPoints);
   } // end while
   return null;
};

var defaultEquals = function(a, b) {
   return a[0] === b[0] && a[1] === b[1];
};

var defaultHash = function(a) {
   return a[0] + '-' + a[1];
};

/**
 * This is the interface for a Map that can be passed to the `findRoute()`
 * function. `Map` is not instantiable - see the unit tests for an example
 * implementation of Map.
 */
var Map = exports.Map = function() {
   throw new Error('not instantiable, this is an interface');
};

/**
 * @param {Array} origin
 * @returns {Array} list of points accessible from given Point
 */
Map.prototype.adjacent = function(origin) {
};

/**
 * @param {Object} a one of the points ot test for equality
 * @param {Object} b ... the other point
 * @returns Wheter the two points are equal.
 */
Map.prototype.equals = defaultEquals;

/**
 * @param {Object} a point
 * @returns {String} hash for the point
 */
Map.prototype.hash = defaultHash;

/**
 * Estimated lower bound distance between two, adjacent points.
 * @param {Object} pointA
 * @param {Object} pointB
 * @returns {Number} the estimated distance between two points
 */
Map.prototype.estimatedDistance = function(pointA, pointB) {
   return 1;
};

/**
 * Actual distance between the two given points.
 * @param {Object} pointA
 * @param {Object} pointB
 * @returns {Number} the actual distance between two points
 */
Map.prototype.actualDistance = function(pointA, pointB) {
   return 1;
};

}}, ["gamejs/utils/binaryheap"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/mixer": function(require, exports, module) {
var gamejs = require('../gamejs');

/**
 * @fileoverview Playing sounds with the html5 audio tag. Audio files must be preloaded
 * with the usual `gamejs.preload()` function. Ogg, wav and webm supported.
 *
 * Sounds & Images are loaded relative to './'. You can change that, by setting
 * $g.resourceBaseHref in your page *before* loading the GameJs modules:
 *
 *     <script>
 *     var $g = {
 *        resourceBaseHref: 'http://example.com/resources/'
 *     }
 *     </script>
 *     <script src="./gamejs-wrapped.js"></script>
 *     ....
 *
 * **Note**: sound doesn't work very well across browsers yet. Firefox is best, but all still have
 * bugs.
 */

var CACHE = {};

/**
 * need to export preloading status for require
 * @ignore
 */
var _PRELOADING = false;

/**
 * @ignore
 */
var NUM_CHANNELS = 8;

/**
 * Sets the number of available channels for the mixer. The default value is 8.
 */
exports.setNumChannels = function(count) {
   NUM_CHANNELS = parseInt(count, 10) || NUM_CHANNELS;
};

exports.getNumChannels = function() {
   return NUM_CHANNELS;
};

/**
 * put all audios on page in cache
 * if same domain as current page, remove common href-prefix
 * @ignore
 */
exports.init = function() {
   var audios = Array.prototype.slice.call(document.getElementsByTagName("audio"), 0);
   addToCache(audios);
   return;
};

/**
 * Preload the audios into cache
 * @param {String[]} List of audio URIs to load
 * @returns {Function} which returns 0-1 for preload progress
 * @ignore
 */
exports.preload = function(audioUrls, showProgressOrImage) {
   var countTotal = 0;
   var countLoaded = 0;

   function incrementLoaded() {
      countLoaded++;
      if (countLoaded == countTotal) {
         _PRELOADING = false;
      }
   }

   function getProgress() {
      return countTotal > 0 ? countLoaded / countTotal : 1;
   }

   function successHandler() {
      addToCache(this);
      incrementLoaded();
   }
   function errorHandler() {
      incrementLoaded();
      throw new Error('Error loading ' + this.src);
   }

   for (var key in audioUrls) {
      if (key.indexOf('wav') == -1 && key.indexOf('ogg') == -1 && key.indexOf('webm') == -1) {
         continue;
      }
      countTotal++;
      var audio = new Audio();
      audio.addEventListener('canplay', successHandler, true);
      audio.addEventListener('error', errorHandler, true);
      audio.src = audioUrls[key];
      audio.gamejsKey = key;
      audio.load();
   }
   if (countTotal > 0) {
      _PRELOADING = true;
   }
   return getProgress;
};

/**
 * @ignore
 */
exports.isPreloading = function() {
   return _PRELOADING;
};

/**
 * @param {dom.ImgElement} audios the <audio> elements to put into cache
 * @ignore
 */
function addToCache(audios) {
   if (!(audios instanceof Array)) {
      audios = [audios];
   }

   var docLoc = document.location.href;
   audios.forEach(function(audio) {
      CACHE[audio.gamejsKey] = audio;
   });
   return;
}

/**
 * Sounds can be played back.
 * @constructor
 * @param {String|dom.AudioElement} uriOrAudio the uri of <audio> dom element
 *                of the sound
 */
exports.Sound = function Sound(uriOrAudio) {
   var cachedAudio;
   if (typeof uriOrAudio === 'string') {
      cachedAudio = CACHE[uriOrAudio];
   } else {
      cachedAudio = uriOrAudio;
   }
   if (!cachedAudio) {
      // TODO sync audio loading
      throw new Error('Missing "' + uriOrAudio + '", gamejs.preload() all audio files before loading');
   }

   var channels = [];
   var i = NUM_CHANNELS;
   while (i-->0) {
      var audio = new Audio();
      audio.preload = "auto";
      audio.loop = false;
      audio.src = cachedAudio.src;
      channels.push(audio);
   }
   /**
    * start the sound
    * @param {Boolean} loop whether the audio should loop for ever or not
    */
   this.play = function(loop) {
      audio.loop = !!loop;
      channels.some(function(audio) {
         if (audio.ended || audio.paused) {
            audio.play();
            return true;
         }
         return false;
      });
   };

   /**
    * Stop the sound.
    * This will stop the playback of this Sound on any active Channels.
    */
   this.stop = function() {
      channels.forEach(function(audio) {
         audio.stop();
      });
   };

   /**
    * Set volume of this sound
    * @param {Number} value volume from 0 to 1
    */
   this.setVolume = function(value) {
      channels.forEach(function(audio) {
         audio.volume = value;
      });
   };

   /**
    * @returns {Number} the sound's volume from 0 to 1
    */
   this.getVolume = function() {
      return channels[0].volume;
   };

   /**
    * @returns {Number} Duration of this sound in seconds
    */
   this.getLength = function() {
      return channels[0].duration;
   };

   return this;
};

}}, ["gamejs"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/transform": function(require, exports, module) {
var Surface = require('../gamejs').Surface;
var matrix = require('./utils/matrix');
var math = require('./utils/math');
var vectors = require('./utils/vectors');

/**
 * @fileoverview Rotate and scale Surfaces.
 */

/**
 * Returns a new surface which holds the original surface rotate by angle degrees.
 * @param {Surface} surface
 * @param {angel} angle Clockwise angle by which to rotate
 * @returns {Surface} new, rotated surface
 */
exports.rotate = function (surface, angle) {
   var origSize = surface.getSize();
   var radians = (angle * Math.PI / 180);
   var newSize = origSize;
   // find new bounding box
   if (angle % 360 !== 0) {
      var rect = surface.getRect();
      var points = [
         [-rect.width/2, rect.height/2],
         [rect.width/2, rect.height/2],
         [-rect.width/2, -rect.height/2],
         [rect.width/2, -rect.height/2]
      ];
      var rotPoints = points.map(function(p) {
         return vectors.rotate(p, radians);
      });
      var xs = rotPoints.map(function(p) { return p[0]; });
      var ys = rotPoints.map(function(p) { return p[1]; });
      var left = Math.min.apply(Math, xs);
      var right = Math.max.apply(Math, xs);
      var bottom = Math.min.apply(Math, ys);
      var top = Math.max.apply(Math, ys);
      newSize = [right-left, top-bottom];
   }
   var newSurface = new Surface(newSize);
   var oldMatrix = surface._matrix;
   surface._matrix = matrix.translate(surface._matrix, origSize[0]/2, origSize[1]/2);
   surface._matrix = matrix.rotate(surface._matrix, radians);
   surface._matrix = matrix.translate(surface._matrix, -origSize[0]/2, -origSize[1]/2);
   var offset = [(newSize[0] - origSize[0]) / 2, (newSize[1] - origSize[1]) / 2];
   newSurface.blit(surface, offset);
   surface._matrix = oldMatrix;
   return newSurface;
};

/**
 * Returns a new surface holding the scaled surface.
 * @param {Surface} surface
 * @param {Array} dimensions new [width, height] of surface after scaling
 * @returns {Surface} new, scaled surface
 */
exports.scale = function(surface, dims) {
   var width = dims[0];
   var height = dims[1];
   if (width <= 0 || height <= 0) {
      throw new Error('[gamejs.transform.scale] Invalid arguments for height and width', [width, height]);
   }
   var oldDims = surface.getSize();
   var ws = width / oldDims[0];
   var hs = height / oldDims[1];
   var newSurface = new Surface([width, height]);
   var originalMatrix = surface._matrix.slice(0);
   surface._matrix = matrix.scale(surface._matrix, [ws, hs]);
   newSurface.blit(surface);
   surface._matrix = originalMatrix;
   return newSurface;
};

/**
 * Flip a Surface either vertically, horizontally or both. This returns
 * a new Surface (i.e: nondestructive).
 * @param {gamejs.Surface} surface
 * @param {Boolean} flipHorizontal
 * @param {Boolean} flipVertical
 * @returns {Surface} new, flipped surface
 */
exports.flip = function(surface, flipHorizontal, flipVertical) {
   var dims = surface.getSize();
   var newSurface = new Surface(dims);
   var scaleX = 1;
   var scaleY = 1;
   var xPos = 0;
   var yPos = 0;
   if (flipHorizontal === true) {
      scaleX = -1;
      xPos = -dims[0];
   }
   if (flipVertical === true) {
      scaleY = -1;
      yPos = -dims[1];
   }
   newSurface.context.save();
   newSurface.context.scale(scaleX, scaleY);
   newSurface.context.drawImage(surface.canvas, xPos, yPos);
   newSurface.context.restore();
   return newSurface;
};

}}, ["gamejs", "gamejs/utils/matrix", "gamejs/utils/math", "gamejs/utils/vectors"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/mask": function(require, exports, module) {
var gamejs = require('../gamejs');
var objects = require('./utils/objects');

/**
 * @fileoverview Image masks. Usefull for pixel perfect collision detection.
 */

/**
 * Creates an image mask from the given Surface. The alpha of each pixel is checked
 * to see if it is greater than the given threshold. If it is greater then
 * that pixel is set as non-colliding.
 *
 * @param {gamejs.Surface} surface
 * @param {Number} threshold 0 to 255. defaults to: 255, fully transparent
 */
exports.fromSurface = function(surface, threshold) {
   threshold = threshold && (255 - threshold) || 255;
   var imgData = surface.getImageData().data;
   var dims = surface.getSize();
   var mask = new Mask(dims);
   for (var i=0;i<imgData.length;i += 4) {
      // y: pixel # / width
      var y = parseInt((i / 4) / dims[0], 10);
      // x: pixel # % width
      var x = parseInt((i / 4) % dims[0], 10);
      var alpha = imgData[i+3];
      if (alpha >= threshold) {
         mask.setAt(x, y);
      }
   }
   return mask;
};

/**
 * Image Mask
 * @param {Array} dimensions [width, height]
 *
 */
var Mask = exports.Mask = function(dims) {
   /**
    * @ignore
    */
   this.width = dims[0];
   /**
    * @ignore
    */
   this.height = dims[1];
   /**
    * @ignore
    */
   this._bits = [];
   for (var i=0;i<this.width;i++) {
      this._bits[i] = [];
      for (var j=0;j<this.height;j++) {
         this._bits[i][j] = false;
      }
   }
   return;
};

/**
 * @param {gamejs.mask.Mask} otherMask
 * @param {Array} offset [x,y]
 * @returns the overlapping rectangle or null if there is no overlap;
 */
Mask.prototype.overlapRect = function(otherMask, offset) {
   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }
   // bounding box intersect
   if (!brect.collideRect(arect)) {
      return null;
   }
   var xStart = Math.max(arect.left, brect.left);
   var xEnd = Math.min(arect.right, brect.right);

   var yStart = Math.max(arect.top, brect.top);
   var yEnd = Math.min(arect.bottom, brect.bottom);

   return new gamejs.Rect([xStart, yStart], [xEnd - xStart, yEnd - yStart]);
};

/**
 *
 * @returns True if the otherMask overlaps with this map.
 * @param {Mask} otherMask
 * @param {Array} offset
 */
Mask.prototype.overlap = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return false;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   for (var y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (var x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             return true;
         }
      }
   }
   // NOTE this should not happen because either we bailed out
   // long ago because the rects do not overlap or there is an
   // overlap and we should not have gotten this far.
   // throw new Error("Maks.overlap: overlap detected but could not create mask for it.");
   return false;
};

/**
 * @param {gamejs.mask.Mask} otherMask
 * @param {Array} offset [x,y]
 * @returns the number of overlapping pixels
 */
Mask.prototype.overlapArea = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return 0;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var count = 0;
   for (var y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (var x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             count++;
         }
      }
   }
   return count;
};

/**
 * @param {gamejs.mask.Mask} otherMask
 * @param {Array} offset [x,y]
 * @returns a mask of the overlapping pixels
 */
Mask.prototype.overlapMask = function(otherMask, offset) {
   var overlapRect = this.overlapRect(otherMask, offset);
   if (overlapRect === null) {
      return 0;
   }

   var arect = this.rect;
   var brect = otherMask.rect;
   if (offset) {
      brect.moveIp(offset);
   }

   var mask = new Mask([overlapRect.width, overlapRect.height]);
   for (var y=overlapRect.top; y<=overlapRect.bottom; y++) {
      for (var x=overlapRect.left; x<=overlapRect.right; x++) {
         if (this.getAt(x - arect.left, y - arect.top) &&
             otherMask.getAt(x - brect.left, y - brect.top)) {
             mask.setAt(x, y);
         }
      }
   }
   return mask;
};

/**
 * Set bit at position.
 * @param {Number} x
 * @param {Number} y
 */
Mask.prototype.setAt = function(x, y) {
   this._bits[x][y] = true;
};

/**
 * Get bit at position.
 *
 * @param {Number} x
 * @param {Number} y
 */
Mask.prototype.getAt = function(x, y) {
   x = parseInt(x, 10);
   y = parseInt(y, 10);
   if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return false;
   }
   return this._bits[x][y];
};


/**
 * Flip the bits in this map.
 */
Mask.prototype.invert = function() {
   this._bits = this._bits.map(function(row) {
      return row.map(function(b) {
         return !b;
      });
   });
};

/**
 * @returns {Array} the dimensions of the map
 */
Mask.prototype.getSize = function() {
   return [this.width, this.height];
};

objects.accessors(Mask.prototype, {
   /**
    * Rect of this Mask.
    */
   'rect': {
      get: function() {
         return new gamejs.Rect([0, 0], [this.width, this.height]);
      }
   },
   /**
    * @returns {Number} number of set pixels in this mask.
    */
   'length': {
      get: function() {
         var c = 0;
         this._bits.forEach(function(row) {
            row.forEach(function(b) {
               if (b) {
                  c++;
               }
            });
         });
         return c;
      }
   }
});

}}, ["gamejs", "gamejs/utils/objects"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/font": function(require, exports, module) {
var Surface = require('../gamejs').Surface;
var objects = require('./utils/objects');

/**
 * @fileoverview Methods for creating Font objects which can render text
 * to a Surface.
 *
 * Example:
 *     // create a font
 *     var font = new Font('20px monospace');
 *     // render text - this returns a surface with the text written on it.
 *     var helloSurface = font.render('Hello World')
 */

/**
 * Create a Font to draw on the screen. The Font allows you to
 * `render()` text. Rendering text returns a Surface which
 * in turn can be put on screen.
 *
 * @constructor
 * @property {Number} fontHeight the line height of this Font
 *
 * @param {String} fontSettings a css font definition, e.g., "20px monospace"
 * @param {STring} backgroundColor valid #rgb string, "#ff00cc"
 */
var Font = exports.Font = function(fontSettings, backgroundColor) {
    /**
     * @ignore
     */
   this.sampleSurface = new Surface([10,10]);
   this.sampleSurface.context.font = fontSettings;
   this.sampleSurface.context.textAlign = 'start';
   // http://diveintohtml5.org/canvas.html#text
   this.sampleSurface.context.textBaseline = 'bottom';
   return this;
};

/**
 * Returns a Surface with the given text on it.
 * @param {String} text the text to render
 * @param {String} color a valid #RGB String, "#ffcc00"
 * @returns {gamejs.Surface} Surface with the rendered text on it.
 */
Font.prototype.render = function(text, color) {
   var dims = this.size(text);
   var surface = new Surface(dims);
   var ctx = surface.context;
   ctx.save();
   ctx.font = this.sampleSurface.context.font;
   ctx.textBaseline = this.sampleSurface.context.textBaseline;
   ctx.textAlign = this.sampleSurface.context.textAlign;
   ctx.fillStyle = ctx.strokeStyle = color || "#000000";
   ctx.fillText(text, 0, surface.rect.height, surface.rect.width);
   ctx.restore();
   return surface;
};

/**
 * Determine the width and height of the given text if rendered
 * with this Font.
 * @param {String} text the text to measure
 * @returns {Array} the [width, height] of the text if rendered with this Font
 */
Font.prototype.size = function(text) {
   var metrics = this.sampleSurface.context.measureText(text);
   // FIXME measuretext is buggy, make extra wide
   return [metrics.width, this.fontHeight];
};

/**
 * Height of the font in pixels.
 */
objects.accessors(Font.prototype, {
   'fontHeight': {
      get: function() {
         // Returns an approximate line height of the text
         // »This version of the specification does not provide a way to obtain
         // the bounding box dimensions of the text.«
         // see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-measuretext
         return this.sampleSurface.context.measureText('M').width * 1.5;
      }
   }

});

}}, ["gamejs", "gamejs/utils/objects"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/draw": function(require, exports, module) {
/**
 * @fileoverview Utilities for drawing geometrical objects to Surfaces. If you want to put images on
 * the screen see `gamejs.image`.
 *
 * ### Colors
 * There are several ways to specify colors. Whenever the docs says "valid #RGB string"
 * you can pass in any of those formats:
 *
 *     "#ff00ff"
 *     "rgb(255, 0, 255)"
 *     "rgba(255,0, 255, 1)"
 */

// FIXME all draw functions must return a minimal rect containing the drawn shape

/**
 * @param {gamejs.Surface} surface the Surface to draw on
 * @param {String} color valid #RGB string, e.g., "#ff0000"
 * @param {Array} startPos [x, y] position of line start
 * @param {Array} endPos [x, y] position of line end
 * @param {Number} width of the line, defaults to 1
 */
exports.line = function(surface, color, startPos, endPos, width) {
   var ctx = surface.context;
   ctx.save();
   ctx.beginPath();
   ctx.strokeStyle = color;
   ctx.lineWidth = width || 1;
   ctx.moveTo(startPos[0], startPos[1]);
   ctx.lineTo(endPos[0], endPos[1]);
   ctx.stroke();
   ctx.restore();
   return;
};

/**
 * Draw connected lines. Use this instead of indiviudal line() calls for
 * better performance
 *
 * @param {gamejs.Surface} surface the Surface to draw on
 * @param {String} color a valid #RGB string, "#ff0000"
 * @param {Boolean} closed if true the last and first point are connected
 * @param {Array} pointlist holding array [x,y] arrays of points
 * @param {Number} width width of the lines, defaults to 1
 */
exports.lines = function(surface, color, closed, pointlist, width) {
   closed = closed || false;
   var ctx = surface.context;
   ctx.save();
   ctx.beginPath();
   ctx.strokeStyle = ctx.fillStyle = color;
   ctx.lineWidth = width || 1;
   pointlist.forEach(function(point, idx) {
      if (idx === 0) {
         ctx.moveTo(point[0], point[1]);
      } else {
         ctx.lineTo(point[0], point[1]);
      }
   });
   if (closed) {
      ctx.lineTo(pointlist[0][0], pointlist[0][1]);
   }
   ctx.stroke();
   ctx.restore();
   return;
};

/**
 * Draw a circle on Surface
 *
 * @param {gamejs.Surface} surface the Surface to draw on
 * @param {String} color a valid #RGB String, #ff00cc
 * @param {Array} pos [x, y] position of the circle center
 * @param {Number} radius of the circle
 * @param {Number} width width of the circle, if not given or 0 the circle is filled
 */
exports.circle = function(surface, color, pos, radius, width) {
   if (!radius) {
      throw new Error('[circle] radius required argument');
   }
   if (!pos || !(pos instanceof Array)) {
      throw new Error('[circle] pos must be given & array' + pos);
   }

   var ctx = surface.context;
   ctx.save();
   ctx.beginPath();
   ctx.strokeStyle = ctx.fillStyle = color;
   ctx.lineWidth = width || 1;
   ctx.arc(pos[0], pos[1], radius, 0, 2*Math.PI, true);
   if (width === undefined || width === 0) {
      ctx.fill();
   } else {
      ctx.stroke();
   }
   ctx.restore();
   return;
};

/**
 * @param {gamejs.Surface} surface the Surface to draw on
 * @param {String} color a valid #RGB String, #ff00cc
 * @param {gamejs.Rect} rect the position and dimension attributes of this Rect will be used
 * @param {Number} width the width of line drawing the Rect, if 0 or not given the Rect is filled.
 */
exports.rect = function(surface, color, rect, width) {
   var ctx =surface.context;
   ctx.save();
   ctx.beginPath();
   ctx.strokeStyle = ctx.fillStyle = color;
   if (isNaN(width) || width === 0) {
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
   } else {
      ctx.lineWidth = width || 1;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
   }
   ctx.restore();
};

/**
 * @param {gamejs.Surface} surface the Surface to draw on
 * @param {String} color a valid #RGB String, #ff00cc
 * @param {gamejs.Rect} rect the position and dimension attributes of this Rect will be used
 * @param {Number} startAngle
 * @param {Number} stopAngle
 * @param {Number} width the width of line, if 0 or not given the arc is filled.
 */
exports.arc= function(surface, color, rect, startAngle, stopAngle, width) {
   var ctx = surface.context;
   ctx.save();
   ctx.beginPath();
   ctx.strokeStyle = ctx.fillStyle = color;
   ctx.arc(rect.center[0], rect.center[1],
            rect.width/2,
            startAngle * (Math.PI/180), stopAngle * (Math.PI/180),
            false
         );
   if (isNaN(width) || width === 0) {
      ctx.fill();
   } else {
      ctx.lineWidth = width || 1;
      ctx.stroke();
   }
   ctx.restore();
};

/**
 * Draw a polygon on the surface. The pointlist argument are the vertices
 * for the polygon.
 *
 * @param {gamejs.Surface} surface the Surface to draw on
 * @param {String} color a valid #RGB String, #ff00cc
 * @param {Array} pointlist array of vertices [x, y] of the polygon
 * @param {Number} width the width of line, if 0 or not given the polygon is filled.
 */
exports.polygon = function(surface, color, pointlist, width) {
   var ctx = surface.context;
   ctx.save();
   ctx.fillStyle = ctx.strokeStyle = color;
   ctx.beginPath();
   pointlist.forEach(function(point, idx) {
      if (idx == 0) {
         ctx.moveTo(point[0], point[1]);
      } else {
         ctx.lineTo(point[0], point[1]);
      }
   });
   ctx.closePath();
   if (isNaN(width) || width === 0) {
      ctx.fill();
   } else {
      ctx.lineWidth = width || 1;
      ctx.stroke();
   }
   ctx.restore();
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/surfacearray": function(require, exports, module) {
var gamejs = require('../gamejs');
var accessors = require('./utils/objects').accessors;
/**
 * @fileoverview Fast pixel access.
 *
 * @example
 *
 *   // create array from display surface
 *   var srfArray = new SurfaceArray(display);
 *   // direct pixel access
 *   srfArray.set(50, 100, [255, 0, 0, 100]);
 *   console.log(srfArray.get(30, 50));
 *   // blit modified array back to display surface
 *   blitArray(display, srfArray);
 */

/**
 * Directly copy values from an array into a Surface.
 *
 * This is faster than blitting the `surface` property on a SurfaceArray
 *
 * The array must be the same dimensions as the Surface and will completely
 * replace all pixel values.
 * @param {gamejs.Surface} surface
 * @param {gamejs.surfacearray.SurfaceArray} surfaceArray
 */
exports.blitArray = function(surface, surfaceArray) {
   surface.context.putImageData(surfaceArray.imageData, 0, 0);
   return;
};

/**
 * The SurfaceArray can be constructed with a surface whose values
 * are then used to initialize the pixel array.
 *
 * The surface passed as argument is not modified by the SurfaceArray.
 *
 * If an array is used to construct SurfaceArray, the array must describe
 * the dimensions of the SurfaceArray [width, height].
 *
 * @param {gamejs.Surface|Array} surfaceOrDimensions
 * @see http://dev.w3.org/html5/2dcontext/#pixel-manipulation
 */
var SurfaceArray = exports.SurfaceArray = function(surfaceOrDimensions) {
   var size = null;
   var data = null;
   var imageData = null;

   /**
    * Set rgba value at position x, y.
    *
    * For performance reasons this function has only one signature
    * being Number, Number, Array[4].
    *
    * @param {Number} x x position of pixel
    * @param {Number} y y position of pixel
    * @param {Array} rgba [red, green, blue, alpha] values [255, 255, 255, 255] (alpha, the last argument defaults to 255)
    * @throws Error if x, y out of range
    */
   this.set = function(x, y, rgba) {
      var offset = (x * 4) + (y * size[0] * 4);
      /** faster without
      if (offset + 3 >= data.length || x < 0 || y < 0) {
         throw new Error('x, y out of range', x, y);
      }
      **/
      data[offset] = rgba[0];
      data[offset+1] = rgba[1];
      data[offset+2] = rgba[2];
      data[offset+3] = rgba[3] === undefined ? 255 : rgba[3];
      return;
   };

   /**
    * Get rgba value at position xy,
    * @param {Number} x
    * @param {Number} y
    * @returns {Array} [red, green, blue, alpha]
    */
   this.get = function(x, y) {
      var offset = (x * 4) + (y * size[0] * 4);
      return [
         data[offset],
         data[offset+1],
         data[offset+2],
         data[offset+3]
      ];
   };

   /**
    * a new gamejs.Surface on every access, representing
    * the current state of the SurfaceArray.
    * @type {gamejs.Surface}
    */
   // for jsdoc only
   this.surface = null;

   accessors(this, {
      surface: {
         get: function() {
            var s = new gamejs.Surface(size);
            s.context.putImageData(imageData, 0, 0);
            return s;
         }
      },
      imageData: {
         get: function() {
            return imageData;
         }
      }
   });

   this.getSize = function() {
      return size;
   };

   /**
    * constructor
    */
   if (surfaceOrDimensions instanceof Array) {
      size = surfaceOrDimensions;
      imageData = gamejs.display.getSurface().context.createImageData(size[0], size[1]);
      data = imageData.data;
   } else {
      size = surfaceOrDimensions.getSize();
      imageData = surfaceOrDimensions.getImageData(0, 0, size[0], size[1]);
      data = imageData.data;
   }
   return this;
};

}}, ["gamejs", "gamejs/utils/objects"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/utils/vectors": function(require, exports, module) {
var math=require('./math');

/**
 * @param {Array} origin point [b0, b1]
 * @param {Array} target point [b0, b1]
 * @returns {Number} distance between two points
 */
exports.distance = function(a, b) {
   return len(subtract(a, b));
};

/**
 * subtracts vectors [a0, a1] - [a0, a1]
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} vector
 */
var subtract = exports.subtract = function(a, b) {
   return [a[0] - b[0], a[1] - b[1]];
};

/**
 * adds vectors [a0, a1] - [a0, a1]
 * @param {Array} a vector
 * @param {Array} b vector
 * @returns {Array} vector
 */
var add = exports.add = function(a, b) {
   return [a[0] + b[0], a[1] + b[1]];
};

/**
 * multiply vector with scalar or other vector
 * @param {Array} vector [v0, v1]
 * @param {Number|Array} vector or number
 * @returns {Number|Array} result
 */
var multiply = exports.multiply = function(a, s) {
   if (typeof s === 'number') {
      return [a[0] * s, a[1] * s];
   }

   return [a[0] * s[0], a[1] * s[1]];
};

/**
 * @param {Array} a vector
 * @param {Number} s
 */
exports.divide = function(a, s) {
   if (typeof s === 'number') {
      return [a[0] / s, a[1] / s];
   }
   throw new Error('only divide by scalar supported');
};

/**
 * @param {Array} vector [v0, v1]
 * @returns {Number} length of vector
 */
var len = exports.len = function(v) {
   return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
};

/**
 *
 * normalize vector to unit vector
 * @param {Array} vector [v0, v1]
 * @returns {Array} unit vector [v0, v1]
 */
var unit = exports.unit = function(v) {
   var l = len(v);
   if(l) return [v[0] / l, v[1] / l];
   return [0, 0];
};

/**
 *
 * rotate vector
 * @param {Array} vector [v0, v1]
 * @param {Number} angle to rotate vector by, radians. can be negative
 * @returns {Array} rotated vector [v0, v1]
 */
exports.rotate=function(v, angle){
   angle=math.normaliseRadians(angle);
   return [v[0]* Math.cos(angle)-v[1]*Math.sin(angle),
           v[0]* Math.sin(angle)+v[1]*Math.cos(angle)];

};

/**
 *
 * calculate vector dot product
 * @param {Array} vector [v0, v1]
 * @param {Array} vector [v0, v1]
 * @returns {Number} dot product of v1 and v2
 */
var dot = exports.dot=function(v1, v2){
   return (v1[0] * v2[0]) + (v1[1] * v2[1]);
};

/**
 *
 * calculate angle between vectors
 * @param {Array} vector [v0, v1]
 * @param {Array} vector [v0, v1]
 * @returns {Number} angle between v1 and v2 in radians
 */
exports.angle=function(v1, v2){
   var a1 = Math.atan2(v1[0], v1[1]);
   var a2 = Math.atan2(v2[0], v2[1]);
   var rel = a1 - a2;
   return rel - Math.floor((rel + Math.PI) / (2 * Math.PI)) * (2 * Math.PI) - (2 * Math.PI);
};

/**
 * @returns {Array} vector with max length as specified.
 */
exports.truncate = function(v, maxLength) {
   if (len(v) > maxLength) {
      return multiply(unit(v), maxLength);
   };
   return v;
};

}}, ["gamejs/utils/math"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/utils/binaryheap": function(require, exports, module) {
/**
 * Binary Heap
 *
 * @see http://eloquentjavascript.net/appendix2.html
 */
var BinaryHeap = exports.BinaryHeap = function(scoreFunction){
   /**
    * @ignore
    */
   this.content = [];
   /**
    * @ignore
    */
   this.scoreFunction = scoreFunction;
   return this;
};

/**
 * Add element to heap.
 * @param {Object} element
 */
BinaryHeap.prototype.push = function(element) {
   this.content.push(element);
   this.sinkDown(this.content.length - 1);
   return;
};

/**
 * Return first element from heap.
 * @param {Object} element
 * @returns {Object} element
 */
BinaryHeap.prototype.pop = function() {
   // Store the first element so we can return it later.
   var result = this.content[0];
   // Get the element at the end of the array.
   var end = this.content.pop();
   // If there are any elements left, put the end element at the
   // start, and let it bubble up.
   if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
   }
   return result;
};

/**
 * Remove the given element from the heap.
 * @param {Object} element
 * @throws {Error} if node not found
 */
BinaryHeap.prototype.remove = function(node) {
   // To remove a value, we must search through the array to find
   // it.
   var isFound = this.content.some(function(cNode, idx) {
      if (cNode == node) {
         var end = this.content.pop();
         if (idx != this.content.length) {
            this.content[idx] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node)) {
               this.sinkDown(idx);
            } else {
               this.bubbleUp(idx);
            }
         }
         return true;
      }
      return false;
   }, this);
   if (!isFound) {
      throw new Error("Node not found.");
   }
   return;
};

/**
 * Number of elements in heap.
 */
BinaryHeap.prototype.size = function() {
   return this.content.length;
};

/**
 * @ignore
 */
BinaryHeap.prototype.sinkDown = function(idx) {
   // Fetch the element that has to be sunk
   var element = this.content[idx];
   // When at 0, an element can not sink any further.
   while (idx > 0) {
      // Compute the parent element's index, and fetch it.
      var parentIdx = Math.floor((idx + 1) / 2) - 1;
      var parent = this.content[parentIdx];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
         this.content[parentIdx] = element;
         this.content[idx] = parent;
         // Update 'n' to continue at the new position.
         idx = parentIdx;
      // Found a parent that is less, no need to sink any further.
      } else {
         break;
      }
   }
   return;
};

/**
 * @ignore
 */
BinaryHeap.prototype.bubbleUp = function(idx) {
   // Look up the target element and its score.
   var length = this.content.length;
   var element = this.content[idx];
   var elemScore = this.scoreFunction(element);

   while(true) {
      // Compute the indices of the child elements.
      var child2Idx = (idx + 1) * 2;
      var child1Idx= child2Idx - 1;
      // This is used to store the new position of the element,
      // if any.
      var swapIdx = null;
      // If the first child exists (is inside the array)...
      if (child1Idx < length) {
         // Look it up and compute its score.
         var child1 = this.content[child1Idx];
         var child1Score = this.scoreFunction(child1);
         // If the score is less than our element's, we need to swap.
         if (child1Score < elemScore) {
            swapIdx = child1Idx;
         }
      }
      // Do the same checks for the other child.
      if (child2Idx < length) {
         var child2 = this.content[child2Idx];
         var child2Score = this.scoreFunction(child2);
         if (child2Score < (swapIdx === null ? elemScore : child1Score)) {
            swapIdx = child2Idx;
         }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swapIdx !== null) {
         this.content[idx] = this.content[swapIdx];
         this.content[swapIdx] = element;
         idx = swapIdx;
      // Otherwise, we are done.
      } else {
         break;
      }
   }
   return;
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/utils/matrix": function(require, exports, module) {
/**
 * @fileoverview Matrix manipulation, used by GameJs itself. You
 * probably do not need this unless you manipulate a Context's transformation
 * matrix yourself.
 */

// correct way to do scale, rotate, translate
// *  gamejs.utils.matrix will be used in gamejs.transforms, modifing the surfaces.matrix
// * this matrix must be applied to the context in Surface.draw()

/**
 * @returns {Array} [1, 0, 0, 1, 0, 0]
 */
var identiy = exports.identity = function () {
   return [1, 0, 0, 1, 0, 0];
};

/**
 * @param {Array} matrix
 * @param {Array} matrix
 * @returns {Array} matrix sum
 */
var add = exports.add = function(m1, m2) {
   return [
      m1[0] + m2[0],
      m1[1] + m2[1],
      m1[2] + m2[2],
      m1[3] + m2[3],
      m1[4] + m2[4],
      m1[5] + m2[5],
      m1[6] + m2[6]
   ];
};

/**
 * @param {Array} matrix A
 * @param {Array} matrix B
 * @returns {Array} matrix product
 */
var multiply = exports.multiply = function(m1, m2) {
   return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
   ];
};

/**
 * @param {Array} matrix
 * @param {Number} dx
 * @param {Number} dy
 * @returns {Array} translated matrix
 */
var translate = exports.translate = function(m1, dx, dy) {
   return multiply(m1, [1, 0, 0, 1, dx, dy]);
};

/**
 * @param {Array} matrix
 * @param {Number} angle in radians
 * @returns {Array} rotated matrix
 */
var rotate = exports.rotate = function(m1, angle) {
   // radians
   var sin = Math.sin(angle);
   var cos = Math.cos(angle);
   return multiply(m1, [cos, sin, -sin, cos, 0, 0]);
};

/**
 * @param {Array} matrix
 * @returns {Number} rotation in radians
 */
var rotation = exports.rotation = function(m1) {
      return Math.atan2(m1[1], m1[0]);
};

/**
 * @param {Array} matrix
 * @param {Array} vector [a, b]
 * @returns {Array} scaled matrix
 */
var scale = exports.scale = function(m1, svec) {
   var sx = svec[0];
   var sy = svec[1];
   return multiply(m1, [sx, 0, 0, sy, 0, 0]);
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/utils/math": function(require, exports, module) {
/**
 *
 * absolute angle to relative angle, in degrees
 * @param {Number} absolute angle in degrees
 * @returns {Number} relative angle in degrees
 */
exports.normaliseDegrees=function(degrees){
    degrees=degrees % 360;
    if(degrees<0) {
        degrees+=360;
    }
    return degrees;
};

/**
 *
 * absolute angle to relative angle, in radians
 * @param {Number} absolute angle in radians
 * @returns {Number} relative angle in radians
 */
exports.normaliseRadians=function(radians){
    radians=radians % (2*Math.PI);
    if(radians<0) {
        radians+=(2*Math.PI);
    }
    return radians;
};

/**
 *
 * convert radians to degrees
 * @param {Number} radians
 * @returns {Number} degrees
 */
exports.degrees=function(radians) {
    return radians*(180/Math.PI);
};

/**
 *
 * convert degrees to radians
 * @param {Number} degrees
 * @returns {Number} radians
 */
exports.radians=function(degrees) {
    return degrees*(Math.PI/180);
};

/**
 * @returns the center of multipled 2d points
 * @param {Array} first point
 * @param {Array} second point
 * @param {Array} ...
 */
exports.centroid = function() {
   var args = Array.prototype.slice.apply(arguments, [0]);
   var c = [0,0];
   args.forEach(function(p) {
      c[0] += parseInt(p[0], 10);
      c[1] += parseInt(p[1], 10);
   });
   var len = args.length;
   return [
      c[0] / len,
      c[1] / len
   ];
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/utils/arrays": function(require, exports, module) {
/**
 * @fileoverview Utility functions for working with Obiects
 * @param {Obiect} item
 * @param {Array} array
 */

exports.remove = function(item, array) {
   return array.splice(array.indexOf(item), 1);
};

/**
 * Shuffles the array *in place*.
 * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
exports.shuffle = function(array) {
    var len = array.length -1;
    for (i = len; i > 0; i--) {
        var idx = parseInt(Math.random() * (i + 1));
        var item = array[i];
        array[i] = array[idx];
        array[idx] = item;
    }
    return array;
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/utils/objects": function(require, exports, module) {
/**
 * @fileoverview Utility functions for working with Objects
 */

/**
 * Put a prototype into the prototype chain of another prototype.
 * @param {Object} subClass
 * @param {Object} superClass
 */
exports.extend = function(subClass, superClass) {
   if (subClass === undefined) {
      throw new Error('unknown subClass');
   }
   if (superClass === undefined) {
      throw new Error('unknown superClass');
   }
   // new Function() is evil
   var f = new Function();
   f.prototype = superClass.prototype;

   subClass.prototype = new f();
   subClass.prototype.constructor = subClass;
   subClass.superClass = superClass.prototype;
   subClass.superConstructor = superClass;
   return;
};

/**
 * Creates a new object as the as the keywise union of the provided objects.
 * Whenever a key exists in a later object that already existed in an earlier
 * object, the according value of the earlier object takes precedence.
 * @param {Object} obj... The objects to merge
 */
exports.merge = function() {
   var result = {};
      for (var i = arguments.length; i > 0; --i) {
         var obj = arguments[i - 1];
         for (var property in obj) {
            result[property] = obj[property];
         }
      }
   return result;
};

/**
 * fallback for Object.keys
 * @param {Object} obj
 * @returns {Array} list of own properties
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
 */
var keys = exports.keys = function(obj) {
   if (Object.keys) {
      return Object.keys(obj);
   }

   var ret=[],p;
   for (p in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, p)) {
         ret.push(p);
      }
   }
   return ret;
};

/**
 * Create object accessors
 * @param {Object} object The object on which to define the property
 * @param {String} name name of the property
 * @param {Function} get
 * @param {Function} set
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty
 */
var accessor = exports.accessor = function(object, name, get, set) {
   // ECMA5
   if (Object.defineProperty !== undefined) {
      Object.defineProperty(object, name, {
         get: get,
         set: set
      });
   // non-standard
   } else if (Object.prototype.__defineGetter__ !== undefined) {
      object.__defineGetter__(name, get);
      if (set) {
         object.__defineSetter__(name, set);
      }
   }
	return;
};

/**
 * @param {Object} object The object on which to define or modify properties.
 * @param {Object} props An object whose own enumerable properties constitute descriptors for the properties to be defined or modified.
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperties
 */
exports.accessors = function(object, props) {
   keys(props).forEach(function(propKey) {
      accessor(object, propKey, props[propKey].get, props[propKey].set);
   });
   return;
};

}}, []);/* This file has been generated by yabbler.js */
require.define({
"gamejs/image": function(require, exports, module) {
var gamejs = require('../gamejs');

/**
 * @fileoverview Load images as Surfaces.
 *
 * Sounds & Images are loaded relative to './'. You can change that, by setting
 * $g.resourceBaseHref in your page *before* loading the GameJs modules:
 *
 *     <script>
 *     var $g = {
 *        resourceBaseHref: 'http://example.com/resources/'
 *     }
 *     </script>
 *     <script src="./gamejs-wrapped.js"></script>
 *     ....
 *
 */

var CACHE = {};

/**
 * need to export preloading status for require
 * @ignore
 */
var _PRELOADING = false;

/**
 * Load image and return it on a Surface.
 *
 * **Preloading**
 *
 * All images must be preloaded:
 *
 *     gamejs.preload(["./images/ship.png", "./images/sunflower.png"]);
 *
 * before they can be used:
 *
 *     display.blit(gamejs.load('images/ship.png'))
 *
 * @param {String|dom.Image} uriOrImage resource uri for image
 * @returns {gamejs.Surface} surface with the image on it.
 */
exports.load = function(key) {
   var img;
   if (typeof key === 'string') {
      img = CACHE[key];
      if (!img) {
         // TODO sync image loading
			throw new Error('Missing "' + key + '", gamejs.preload() all images before trying to load them.');
      }
   } else {
      img = key;
   }
   var canvas = document.createElement('canvas');
   // IEFIX missing html5 feature naturalWidth/Height
   canvas.width = img.naturalWidth || img.width;
   canvas.height = img.naturalHeight || img.height;
   var context = canvas.getContext('2d');
   context.drawImage(img, 0, 0);
   img.getSize = function() { return [img.naturalWidth, img.naturalHeight]; };
   var surface = new gamejs.Surface(img.getSize());
   // NOTE hack setting protected _canvas directly
   surface._canvas = canvas;
   return surface;
};


/**
 * add all images on the currrent page into cache
 * @ignore
 */
exports.init = function() {
   return;
};

/**
 * preload the given img URIs
 * @returns {Function} which returns 0-1 for preload progress
 * @ignore
 */
exports.preload = function(imgIdents) {

   var countLoaded = 0;
   var countTotal = 0;

   function incrementLoaded() {
      countLoaded++;
      if (countLoaded == countTotal) {
         _PRELOADING = false;
      }
      if (countLoaded % 10 === 0) {
         gamejs.log('gamejs.image: preloaded  ' + countLoaded + ' of ' + countTotal);
      }
   }

   function getProgress() {
      return countTotal > 0 ? countLoaded / countTotal : 1;
   }

   function successHandler() {
      addToCache(this);
      incrementLoaded();
   }
   function errorHandler() {
      incrementLoaded();
      throw new Error('Error loading ' + this.src);
   }

   for (var key in imgIdents) {
      if (key.indexOf('png') == -1 &&
            key.indexOf('jpg') == -1 &&
            key.indexOf('gif') == -1) {
         continue;
      }
      var img = new Image();
      img.addEventListener('load', successHandler, true);
      img.addEventListener('error', errorHandler, true);
      img.src = imgIdents[key];
      img.gamejsKey = key;
      countTotal++;
   }
   if (countTotal > 0) {
      _PRELOADING = true;
   }
   return getProgress;
};

/**
 * add the given <img> dom elements into the cache.
 * @private
 */
var addToCache = function(img) {
   CACHE[img.gamejsKey] = img;
   return;
};

}}, ["gamejs"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/display": function(require, exports, module) {
var Surface = require('../gamejs').Surface;

/**
 * @fileoverview Methods to create, access and manipulate the display Surface.
 *
 * @example
 * var display = gamejs.display.setMode([800, 600]);
 * // blit sunflower picture in top left corner of display
 * var sunflower = gamejs.image.load("images/sunflower");
 * display.blit(sunflower);
 *
 */

var CANVAS_ID = "gjs-canvas";
var LOADER_ID = "gjs-loader";
var SURFACE = null;

/**
 * @returns {document.Element} the canvas dom element
 */
var getCanvas = function() {
   var jsGameCanvas = null;
   var canvasList = Array.prototype.slice.call(document.getElementsByTagName("canvas"));
   canvasList.every(function(canvas) {
      if (canvas.getAttribute("id") == CANVAS_ID) {
         jsGameCanvas = canvas;
         return false;
      }
      return true;
   });
   return jsGameCanvas;
};

/**
 * Create the master Canvas plane.
 * @ignore
 */
exports.init = function() {
   // create canvas element if not yet present
   var jsGameCanvas = null;
   if ((jsGameCanvas = getCanvas()) === null) {
      jsGameCanvas = document.createElement("canvas");
      jsGameCanvas.setAttribute("id", CANVAS_ID);
      document.body.appendChild(jsGameCanvas);
   }
   // remove loader if any;
   var $loader = document.getElementById('gjs-loader');
   if ($loader) {
       $loader.parentNode.removeChild($loader);
   }
   return;
};

/**
 * Set the width and height of the Display. Conviniently this will
 * return the actual display Surface - the same as calling [gamejs.display.getSurface()](#getSurface))
 * later on.
 * @param {Array} dimensions [width, height] of the display surface
 */
exports.setMode = function(dimensions) {
   var canvas = getCanvas();
   canvas.width = dimensions[0];
   canvas.height = dimensions[1];
   return getSurface();
};

/**
 * Set the Caption of the Display (document.title)
 * @param {String} title the title of the app
 * @param {gamejs.Image} icon FIXME implement favicon support
 */
exports.setCaption = function(title, icon) {
   document.title = title;
};


/**
 * The Display (the canvas element) is most likely not in the top left corner
 * of the browser due to CSS styling. To calculate the mouseposition within the
 * canvas we need this offset.
 * @see {gamejs.event}
 * @ignore
 *
 * @returns {Array} [x, y] offset of the canvas
 */

exports._getCanvasOffset = function() {
   var boundRect = getCanvas().getBoundingClientRect();
   return [boundRect.left, boundRect.top];
};

/**
 * Drawing on the Surface returned by `getSurface()` will draw on the screen.
 * @returns {gamejs.Surface} the display Surface
 */
var getSurface = exports.getSurface = function() {
   if (SURFACE === null) {
      var canvas = getCanvas();
      SURFACE = new Surface([canvas.clientWidth, canvas.clientHeight]);
      SURFACE._canvas = canvas;
      SURFACE._context = canvas.getContext('2d');
      SURFACE._smooth();
   }
   return SURFACE;
};

}}, ["gamejs"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/sprite": function(require, exports, module) {
var gamejs = require('../gamejs');
var arrays = require('./utils/arrays');
var $o = require('./utils/objects');
var $v = require('./utils/vectors');

/**
 * @fileoverview Provides `Sprite` the basic building block for any game and
 * `SpriteGroups`, which are an efficient
 * way for doing collision detection between groups as well as drawing layered
 * groups of objects on the screen.
 *
 */

/**
 * Your visible game objects will typically subclass Sprite. By setting it's image
 * and rect attributes you can control its appeareance. Those attributes control
 * where and what `Sprite.draw(surface)` will blit on the the surface.
 *
 * Your subclass should overwrite `update(msDuration)` with its own implementation.
 * This function is called once every game tick, it is typically used to update
 * the status of that object.
 * @constructor
 */
var Sprite = exports.Sprite = function() {
   /** @ignore */
   this._groups = [];
   /** @ignore */
   this._alive = true;

   /**
    * Image to be rendered for this Sprite.
    * @type gamejs.Surface
    */
   this.image = null;
   /**
    * Rect describing the position of this sprite on the display.
    * @type gamejs.Rect
    */
   this.rect = null;

   /**
    * List of all groups that contain this sprite.
    */
   $o.accessor(this, 'groups', function() {
      return this._groups;
   });

   return this;
};

/**
 * Kill this sprite. This removes the sprite from all associated groups and
 * makes future calls to `Sprite.isDead()` return `false`
 */
Sprite.prototype.kill = function() {
   this._alive = false;
   this._groups.forEach(function(group) {
      group.remove(this);
   }, this);
   return;
};

/**
 * Remove the sprite from the passed groups
 * @param {Array|gamejs.sprite.Group} groups One or more `gamejs.Group`
 * instances
 */
Sprite.prototype.remove = function(groups) {
   if (!(groups instanceof Array)) {
      groups = [groups];
   }

   groups.forEach(function(group) {
      group.remove(this);
   }, this);
   return;
};

/**
 * Add the sprite to the passed groups
 * @param {Array|gamejs.sprite.Group} groups One or more `gamejs.sprite.Group`
 * instances
 */
Sprite.prototype.add = function(groups) {
   if (!(groups instanceof Array)) {
      groups = [groups];
   }

   groups.forEach(function(group) {
      group.add(this);
   }, this);
   return;
};

/**
 * Draw this sprite onto the given surface. The position is defined by this
 * sprite's rect.
 * @param {gamejs.Surface} surface The surface to draw on
 */
Sprite.prototype.draw = function(surface) {
   surface.blit(this.image, this.rect);
   return;
};

/**
 * Update this sprite. You **should** override this method with your own to
 * update the position, status, etc.
 */
Sprite.prototype.update = function() {};

/**
 * @returns {Boolean} True if this sprite has had `Sprite.kill()` called on it
 * previously, otherwise false
 */
Sprite.prototype.isDead = function() {
   return !this._alive;
};

/**
 * Sprites are often grouped. That makes collision detection more efficient and
 * improves rendering performance. It also allows you to easly keep track of layers
 * of objects which are rendered to the screen in a particular order.
 *
 * `Group.update()` calls `update()` on all the contained sprites; the same is true for `draw()`.
 * @constructor
 */
var Group = exports.Group = function() {
   /** @ignore */
   this._sprites = [];


   if (arguments[0] instanceof Sprite ||
      (arguments[0] instanceof Array &&
       arguments[0].length &&
       arguments[0][0] instanceof Sprite
   )) {
      this.add(arguments[0]);
   }
   return this;
};

/**
 * Update all the sprites in this group. This is equivalent to calling the
 * update method on each sprite in this group.
 */
Group.prototype.update = function() {
   var updateArgs = arguments;

   this._sprites.forEach(function(sp) {
      sp.update.apply(sp, updateArgs);
   }, this);
   return;
};

/**
 * Add one or more sprites to this group
 * @param {Array|gamejs.sprite.Sprite} sprites One or more
 * `gamejs.sprite.Sprite` instances
 */
Group.prototype.add = function(sprites) {
   if (!(sprites instanceof Array)) {
      sprites = [sprites];
   }

   sprites.forEach(function(sprite) {
      this._sprites.push(sprite);
      sprite._groups.push(this);
   }, this);
   return;
};

/**
 * Remove one or more sprites from this group
 * @param {Array|gamejs.sprite.Sprite} sprites One or more
 * `gamejs.sprite.Sprite` instances
 */
Group.prototype.remove = function(sprites) {
   if (!(sprites instanceof Array)) {
      sprites = [sprites];
   }

   sprites.forEach(function(sp) {
      arrays.remove(sp, this._sprites);
      arrays.remove(this, sp._groups);
   }, this);
   return;
};

/**
 * Check for the existence of one or more sprites within a group
 * @param {Array|gamejs.sprite.Sprite} sprites One or more
 * `gamejs.sprite.Sprite` instances
 * @returns {Boolean} True if every sprite is in this group, false otherwise
 */
Group.prototype.has = function(sprites) {
   if (!(sprites instanceof Array)) {
      sprites = [sprites];
   }

   return sprites.every(function(sp) {
      return this._sprites.indexOf(sp) !== -1;
   }, this);
};

/**
 * Get the sprites in this group
 * @returns {Array} An array of `gamejs.sprite.Sprite` instances
 */
Group.prototype.sprites = function() {
   return this._sprites;
};

/**
 * Draw all the sprites in this group. This is equivalent to calling each
 * sprite's draw method.
 */
Group.prototype.draw = function() {
   var args = arguments;
   this._sprites.forEach(function(sprite) {
      sprite.draw.apply(sprite, args);
   }, this);
   return;
};

/**
 * Draw background (`source` argument) over each sprite in the group
 * on the `destination` surface.
 *
 * This can, for example, be used to clear the
 * display surface to a a static background image in all the places
 * occupied by the sprites of all group.
 *
 * @param {gamejs.Surface} destination the surface to draw on
 * @param {gamejs.Surface} source surface
 */
Group.prototype.clear = function(destination, source) {
   this._sprites.forEach(function(sprite) {
      destination.blit(source, sprite.rect);
   }, this);
};

/**
 * Remove all sprites from this group
 */
Group.prototype.empty = function() {
   this._sprites = [];
   return;
};

/**
 * @returns {Array} of sprites colliding with the point
 */
Group.prototype.collidePoint = function() {
   var args = Array.prototype.slice.apply(arguments);
   return this._sprites.filter(function(sprite) {
      return sprite.rect.collidePoint.apply(sprite.rect, args);
   }, this);
};

/**
 * Loop over each sprite in this group. This is a shortcut for
 * `group.sprites().forEach(...)`.
 */
Group.prototype.forEach = function() {
   Array.prototype.forEach.apply(this._sprites, arguments);
};

/**
 * Check whether some sprite in this group passes a test. This is a shortcut
 * for `group.sprites().some(...)`.
 */
Group.prototype.some = function() {
   return Array.prototype.some.apply(this._sprites, arguments);
};

/**
 * Find sprites in a group that intersect another sprite
 * @param {gamejs.sprite.Sprite} sprite The sprite to check
 * @param {gamejs.sprite.Group} group The group to check
 * @param {Boolean} doKill If true, kill sprites in the group when collided
 * @param {function} collided Collision function to use, defaults to `gamejs.sprite.collideRect`
 * @returns {Array} An array of `gamejs.sprite.Sprite` instances that collided
 */
exports.spriteCollide = function(sprite, group, doKill, collided) {
   collided = collided || collideRect;
   doKill = doKill || false;

   var collidingSprites = [];
   group.sprites().forEach(function(groupSprite) {
      if (collided(sprite, groupSprite)) {
         if (doKill) {
            groupSprite.kill();
         }
         collidingSprites.push(groupSprite);
      }
   });
   return collidingSprites;
};

/**
 * Find all Sprites that collide between two Groups.
 *
 * @example
 * groupCollide(group1, group2).forEach(function (collision) {
 *    var group1Sprite = collision.a;
 *    var group2Sprite = collision.b;
 *    // Do processing here!
 * });
 *
 * @param {gamejs.sprite.Group} groupA First group to check
 * @param {gamejs.sprite.Group} groupB Second group to check
 * @param {Boolean} doKillA If true, kill sprites in the first group when
 * collided
 * @param {Boolean} doKillB If true, kill sprites in the second group when
 * collided
 * @param {function} collided Collision function to use, defaults to `gamejs.sprite.collideRect`
 * @returns {Array} A list of objects where properties 'a' and 'b' that
 * correspond with objects from the first and second groups
 */
exports.groupCollide = function(groupA, groupB, doKillA, doKillB, collided) {
   doKillA = doKillA || false;
   doKillB = doKillB || false;

   var collideList = [];
   var collideFn = collided || collideRect;
   groupA.sprites().forEach(function(groupSpriteA) {
      groupB.sprites().forEach(function(groupSpriteB) {
         if (collideFn(groupSpriteA, groupSpriteB)) {
            if (doKillA) {
               groupSpriteA.kill();
            }
            if (doKillB) {
               groupSpriteB.kill();
            }

            collideList.push({
               'a': groupSpriteA,
               'b': groupSpriteB
            });
         }
      });
   });

   return collideList;
};

/**
 * Check for collisions between two sprites using their rects.
 *
 * @param {gamejs.sprite.Sprite} spriteA First sprite to check
 * @param {gamejs.sprite.Sprite} spriteB Second sprite to check
 * @returns {Boolean} True if they collide, false otherwise
 */
var collideRect = exports.collideRect = function (spriteA, spriteB) {
   return spriteA.rect.collideRect(spriteB.rect);
};

/**
 * Collision detection between two sprites utilizing the optional `mask`
 * attribute on the sprites. Beware: expensive operation.
 *
 * @param {gamejs.sprite.Sprite} spriteA Sprite with 'mask' property set to a `gamejs.mask.Mask`
 * @param {gamejs.sprite.Sprite} spriteB Sprite with 'mask' property set to a `gamejs.mask.Mask`
 * @returns {Boolean} True if any mask pixels collide, false otherwise
 */
exports.collideMask = function(spriteA, spriteB) {
   if (!spriteA.mask || !spriteB.mask) {
      throw new Error("Both sprites must have 'mask' attribute set to an gamejs.mask.Mask");
   }
   var offset = [
      spriteB.rect.left - spriteA.rect.left,
      spriteB.rect.top - spriteA.rect.top
   ];
   return spriteA.mask.overlap(spriteB.mask, offset);
};

/**
 * Collision detection between two sprites using circles at centers.
 * There sprite property `radius` is used if present, otherwise derived from bounding rect.
 * @param {gamejs.sprite.Sprite} spriteA First sprite to check
 * @param {gamejs.sprite.Sprite} spriteB Second sprite to check
 * @returns {Boolean} True if they collide, false otherwise
 */
exports.collideCircle = function(spriteA, spriteB) {
   var rA = spriteA.radius || Math.max(spriteA.rect.width, spriteA.rect.height);
   var rB = spriteB.radius || Math.max(spriteB.rect.width, spriteB.rect.height);
   return $v.len(spriteA.rect.center, spriteB.rect.center) <= rA + rB;
};

}}, ["gamejs", "gamejs/utils/arrays", "gamejs/utils/objects", "gamejs/utils/vectors"]);/* This file has been generated by yabbler.js */
require.define({
"gamejs/event": function(require, exports, module) {
var display = require('./display');
var gamejs = require('../gamejs');

/**
 * @fileoverview Methods for polling mouse and keyboard.
 *
 * Call get() in your main loop to get a list of events that happend since you last called.
 *
 * A pattern for using the event loop : your main game function (tick in this example)
 * is being called by [gamejs.time.fpsCallback()](../time/#fpsCallback) 25 times per second.
 * Inside tick we call [gamejs.event.get()](#get) for a list of events that happened since the last
 * tick and we loop over each event and act on the event properties.
 *
 *     var events = gamejs.event.get()
 *     events.forEach(function(event) {
 *        if (event.type === gamejs.event.MOUSE_UP) {
 *          gamejs.log(event.pos, event.button);
 *        } else if (event.type === gamejs.event.KEY_UP) {
 *          gamejs.log(event.key);
 *        }
 *     });
 *
 * Note that some events, which would trigger a default browser action, are prevented
 * from triggering their default behaviour; i.e. event.preventDefault() is called
 * on those specific events, not on all events.
 *
 * All events have a type identifier. This event type is in between the values
 * of NOEVENT and NUMEVENTS. All user defined events can have the value of
 * USEREVENT or higher. It is recommended make sure your event id's follow this system.
 *
 */
// key constants
exports.K_UP = 38;
exports.K_DOWN = 40;
exports.K_RIGHT = 39;
exports.K_LEFT = 37;

exports.K_SPACE = 32;
exports.K_BACKSPACE = 8;
exports.K_TAB = 9;
exports.K_ENTER = 13;
exports.K_SHIFT = 16;
exports.K_CTRL = 17;
exports.K_ALT = 18;
exports.K_ESC = 27;

exports.K_0 = 48;
exports.K_1 = 49;
exports.K_2 = 50;
exports.K_3 = 51;
exports.K_4 = 52;
exports.K_5 = 53;
exports.K_6 = 54;
exports.K_7 = 55;
exports.K_8 = 56;
exports.K_9 = 57;
exports.K_a = 65;
exports.K_b = 66;
exports.K_c = 67;
exports.K_d = 68;
exports.K_e = 69;
exports.K_f = 70;
exports.K_g = 71;
exports.K_h = 72;
exports.K_i = 73;
exports.K_j = 74;
exports.K_k = 75;
exports.K_l = 76;
exports.K_m = 77;
exports.K_n = 78;
exports.K_o = 79;
exports.K_p = 80;
exports.K_q = 81;
exports.K_r = 82;
exports.K_s = 83;
exports.K_t = 84;
exports.K_u = 85;
exports.K_v = 86;
exports.K_w = 87;
exports.K_x = 88;
exports.K_y = 89;
exports.K_z = 90;

exports.K_KP1 = 97;
exports.K_KP2 = 98;
exports.K_KP3 = 99;
exports.K_KP4 = 100;
exports.K_KP5 = 101;
exports.K_KP6 = 102;
exports.K_KP7 = 103;
exports.K_KP8 = 104;
exports.K_KP9 = 105;

// event type constants
exports.NOEVENT = 0
exports.NUMEVENTS = 32000

exports.QUIT = 0;
exports.KEY_DOWN = 1;
exports.KEY_UP = 2;
exports.MOUSE_MOTION = 3;
exports.MOUSE_UP = 4;
exports.MOUSE_DOWN = 5;
exports.MOUSE_WHEEL = 6;
exports.USEREVENT = 24;

var QUEUE = [];

/**
 * Get all events from the event queue
 * @returns {Array}
 */
exports.get = function() {
   return QUEUE.splice(0, QUEUE.length);
};

/**
 * Get the newest event of the event queue
 * @returns {gamejs.event.Event}
 */
exports.poll = function() {
   return QUEUE.pop();
};

/**
 * Post an event to the event queue.
 * @param {gamejs.event.Event} userEvent the event to post to the queue
 */
exports.post = function(userEvent) {
   QUEUE.push(userEvent);
   return;
};

/**
 * Remove all events from the queue
 */
exports.clear = function() {
   QUEUE = [];
};

/**
 * Holds all information about an event.
 * @class
 */

exports.Event = function() {
    /**
     * The type of the event. e.g., gamejs.event.QUIT, KEYDOWN, MOUSEUP.
     */
    this.type = null;
    /**
     * key the keyCode of the key. compare with gamejs.event.K_a, gamejs.event.K_b,...
     */
    this.key = null;
    /**
     * relative movement for a mousemove event
     */
    this.rel = null;
    /**
     * the number of the mousebutton pressed
     */
    this.button = null;
    /**
     * pos the position of the event for mouse events
     */
    this.pos = null;
};

/**
 * @ignore
 */
exports.init = function() {

   var lastPos = [];

   // anonymous functions as event handlers = memory leak, see MDC:elementAddEventListener

   function onMouseDown (ev) {
      var canvasOffset = display._getCanvasOffset();
      QUEUE.push({
         'type': gamejs.event.MOUSE_DOWN,
         'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
         'button': ev.button,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });
   }

   function onMouseUp (ev) {
      var canvasOffset = display._getCanvasOffset();
      QUEUE.push({
         'type':gamejs.event.MOUSE_UP,
         'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
         'button': ev.button,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });
   }

   function onKeyDown (ev) {
      var key = ev.keyCode || ev.which;
      QUEUE.push({
         'type': gamejs.event.KEY_DOWN,
         'key': key,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });

      if ((!ev.ctrlKey && !ev.metaKey &&
         ((key >= exports.K_LEFT && key <= exports.K_DOWN) ||
         (key >= exports.K_0    && key <= exports.K_z) ||
         (key >= exports.K_KP1  && key <= exports.K_KP9) ||
         key === exports.K_SPACE ||
         key === exports.K_TAB ||
         key === exports.K_ENTER)) ||
         key === exports.K_ALT ||
         key === exports.K_BACKSPACE) {
        ev.preventDefault();
      }
   }

   function onKeyUp (ev) {
      QUEUE.push({
         'type': gamejs.event.KEY_UP,
         'key': ev.keyCode,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });
   }

   function onMouseMove (ev) {
      var canvasOffset = display._getCanvasOffset();
      var currentPos = [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]];
      var relativePos = [];
      if (lastPos.length) {
         relativePos = [
            lastPos[0] - currentPos[0],
            lastPos[1] - currentPos[1]
         ];
      }
      QUEUE.push({
         'type': gamejs.event.MOUSE_MOTION,
         'pos': currentPos,
         'rel': relativePos,
         'buttons': null, // FIXME, fixable?
         'timestamp': ev.timeStamp
      });
      lastPos = currentPos;
      return;
   }

   function onMouseScroll(ev) {
      var canvasOffset = display._getCanvasOffset();
      var currentPos = [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]];
      QUEUE.push({
         type: gamejs.event.MOUSE_WHEEL,
         pos: currentPos,
         delta: ev.detail || (- ev.wheelDeltaY / 40)
      });
      return;
   }

   function onBeforeUnload (ev) {
      QUEUE.push({
         'type': gamejs.event.QUIT
      });
      return;
   }

   // IEFIX does not support addEventListener on document itself
   // MOZFIX but in moz & opera events don't reach body if mouse outside window or on menubar
   // hook onto document.body not canvas to avoid dependancy into gamejs.display
   document.addEventListener('mousedown', onMouseDown, false);
   document.addEventListener('mouseup', onMouseUp, false);
   document.addEventListener('keydown', onKeyDown, false);
   document.addEventListener('keyup', onKeyUp, false);
   document.addEventListener('mousemove', onMouseMove, false);
   document.addEventListener('mousewheel', onMouseScroll, false);
   // MOZFIX
   // https://developer.mozilla.org/en/Code_snippets/Miscellaneous#Detecting_mouse_wheel_events
   document.addEventListener('DOMMouseScroll', onMouseScroll, false);
   document.addEventListener('beforeunload', onBeforeUnload, false);

};

}}, ["gamejs/display", "gamejs"]);/* This file has been generated by yabbler.js */
require.define({
"Thing": function(require, exports, module) {
var gamejs = require('gamejs')
var Images = require('./Images')
var state = require('./state')
var sound = require('./sound')


// Base class for entities, arranged into a tree
Thing = function() {
    Thing.superConstructor.apply(this, arguments)
    this.parent = null
    this.x = 0
    this.y = 0
    this.z = 0  // Sorting for thinking and drawing - higher z means on top
    this.children = new Array()
    this.image = null
    this.centered = true  // By default this.image is drawn centered on [this.x, this.y].
                          // If this is false, the top-left corner will be at [this.x, this.y].
                          // If you need finer-grained control, override Thing.draw
    return this
}
gamejs.utils.objects.extend(Thing, gamejs.sprite.Sprite)
// A thing's position [this.x, this.y] is with respect to its parent
// This is automatically updated when it's attached to a parent, so that its worldpos remains the same
// If you want to specify an object's relative position, call setpos after attaching it
Thing.prototype.setpos = function (pos) {
    this.x = pos ? pos[0] : 0
    this.y = pos ? pos[1] : 0
    return this
}
// The thing's position with respect to the root of its entity tree
Thing.prototype.worldpos = function() {
    var pos = this.parent ? this.parent.worldpos() : [0, 0]
    return [pos[0] + this.x, pos[1] + this.y]
}
// Convert a given position to a position relative to this thing
Thing.prototype.tolocalpos = function(pos) {
    var wpos = this.worldpos()
    return [pos[0] - wpos[0], pos[1] - wpos[1]]
}
// Attach to a given parent (or detach from the tree, if no parent is specified)
// The parent's children array will be automatically updated, and this's position will be updated
//   so that its world position remains the same
Thing.prototype.attachto = function (parent) {
    if (this.parent) {
        checkthing = function(tocheck) { return function(thing) { return thing !== tocheck } }
        this.parent.children = this.parent.children.filter(checkthing(this))
        var p0 = this.parent.worldpos()
        this.x += p0[0]
        this.y += p0[1]
    }
    this.parent = parent
    if (this.parent) {
        this.parent.children.push(this)
        this.parent.children.sort(function(a,b) { return a.z - b.z })
        var p0 = this.parent.worldpos()
        this.x -= p0[0]
        this.y -= p0[1]
    }
    return this
}
Thing.prototype.detach = function() {
    return this.attachto(null)
}
// Call once per frame with argument equal to the number of seconds since the last call
// Recursively calls think on all children (after updating self)
Thing.prototype.think0 = function (dt) {
    this.think(dt)
    for (var j = 0 ; j < this.children.length ; ++j) {
        this.children[j].think0(dt)
    }
}
Thing.prototype.think = function (dt) {
}
// Call once per frame with argument of the gamejs.Surface to draw on
// Recursively calls draw on all children (after drawing self)
Thing.prototype.draw0 = function (screen) {
    var trans = this.x || this.y
    if (trans) {
        screen._context.save()
        screen._context.translate(this.x, this.y)
    }
    this.draw(screen)
    for (var j = 0 ; j < this.children.length ; ++j) {
        this.children[j].draw0(screen)
    }
    if (trans) {
        screen._context.restore()
    }
}
// The default draw behavior is to place this.image at given coordinates
Thing.prototype.draw = function (screen) {
    if (this.image) {
        var rect = this.image.getRect()
        if (this.centered) {
            rect.center = [0, 0]
        } else {
            rect.topleft = [0, 0]
        }
        screen.blit(this.image, rect)
    }
}
// Call to detach this thing (and all its existing children) from the tree
// If you just want to detach and be able to reattach it later, call detach instead
Thing.prototype.die = function() {
    for (var j = 0 ; j < this.children.length; ++j) {
        this.children[j].die()
    }
    return this.detach()
}
// Does the thing contain the position (in the thing's local coordinates)?
// Should be overriden for anything that can participate in collision detection or be clicked on
Thing.prototype.localcontains = function(pos) {
    return false
}
// Choose the topmost (highest-z) descendent of this thing
Thing.prototype.topcontains = function(pos) {
    var npos = [pos[0] - this.x, pos[1] - this.y]
    for (var j = this.children.length - 1 ; j >= 0 ; --j) {
        var c = this.children[j].topcontains(npos)
        if (c) return c
    }
    return this.localcontains(npos) ? this : null
}

// A humble text box. Call update with new text!
TextBox = function(text, pos, fontname, color) {
    Thing.apply(this)
    this.font = new gamejs.font.Font(fontname || "20px sans-serif")
    this.color = color || "white"
    this.centered = false
    this.update(text)
    this.setpos(pos)
    return this
}
gamejs.utils.objects.extend(TextBox, Thing)
TextBox.prototype.update = function(text, color) {
    this.text = text || " "
    this.color = color || this.color
    this.image = this.font.render(this.text, this.color)
}

Button = function(text, pos, callback) {
    TextBox.apply(this, [text, pos])
    this.callback = callback
    this.font = new gamejs.font.Font("20px sans-serif")
    this.centered = true
    this.update(text)
    this.setpos(pos)
}
gamejs.utils.objects.extend(Button, TextBox)
Button.prototype.update = function(text) {
    this.text = text || " "
    var timg = this.font.render(this.text, "white")
    this.image = timg.clone()
    this.image.fill("gray")
    this.image.blit(timg, [0,0])
}
Button.prototype.localcontains = function(pos) {
    var r = this.image.getRect()
    r.center = [0, 0]
    return r.collidePoint(pos)
}



// FPS counter. automatically updates
FPSCounter = function() {
    TextBox.apply(this, ["???fps", [740, 10]])
    this.t0 = 0
    this.dtsum = 0
    this.dtj = 0
    return this
}
gamejs.utils.objects.extend(FPSCounter, TextBox)
FPSCounter.prototype.think = function (dt) {
    var t = (new Date()).getTime()
    dt = this.t0 ? t - this.t0 : 0
    this.t0 = t
    this.dtsum += dt
    this.dtj++
    if (this.dtj == 20) {
        var fps = Math.round(20 * 1000. / this.dtsum * 10.) / 10.
        this.update(fps + "fps")
        this.dtsum = 0
        this.dtj = 0
    }
}



Stage = function() {
    Thing.apply(this)
    this.t = 0
    this.x = 427
    this.y = 267
    this.image0 = new gamejs.Surface([854, 854])
    this.image0.fill("#444444")
    for (var j = 0 ; j < 100 ; ++j) {
        color = "rgba(" + Math.floor(Math.random() * 128) + "," + Math.floor(Math.random() * 128) + "," + Math.floor(Math.random() * 128) + ",0.2)"
        gamejs.draw.circle(this.image0, color, [Math.random() * 854, Math.random() * 854], 100)
    }
//    this.image = gamejs.transform.scale(this.image0, [854, 427])
    this.image = this.image0
    this.setalpha()
    this.targetalpha = this.alpha
    return this
}
gamejs.utils.objects.extend(Stage, Thing)
Stage.prototype.turn = function (dalpha) {
    this.targetalpha += (dalpha || 0)
}
Stage.prototype.setalpha = function (alpha) {
    this.alpha = alpha || 0
    this.S = Math.sin(this.alpha)
    this.C = Math.cos(this.alpha)
}
Stage.prototype.think = function(dt) {
    Thing.prototype.think.call(this, dt)
    var dalpha = this.targetalpha - this.alpha
    if (Math.abs(dalpha) < 0.01) {
        this.setalpha(this.targetalpha)
    } else {
        var f = 1 - Math.exp(-6 * dt)
        this.setalpha(this.alpha + (this.targetalpha - this.alpha) * f)
    }
}
Stage.prototype.draw = function(screen) {
    screen._context.save()
    screen._context.scale(1, 0.5)
    screen._context.rotate(this.alpha)

    screen._context.beginPath()
    screen._context.arc(0,0,426,0,Math.PI*2,true);  
    screen._context.clip()
    Thing.prototype.draw.call(this, screen)
    gamejs.draw.circle(screen, "#FFFFFF", [0, 0], 426, 4)
    screen._context.restore()
}
// Convert gamepos (gx, gy, gz) into stagepos (x, y, z)
// TODO: handle rotation?
Stage.prototype.stageposof = function(pos) {
    var gx = pos[0], gy = pos[1], gz = pos[2]
    return [gx * this.C - gy * this.S, (gy * this.C + gx * this.S)/2 - 0.866*gz, (gy * this.C + gx * this.S)]
}
Stage.prototype.gamepos = function(pos) {
    return pos
}
Stage.prototype.stagepos = function(pos) {
    return this.stageposof(pos)
}
Stage.prototype.togamepos = function(pos) {
    var wpos = this.worldpos()
    var x = pos[0] - wpos[0], y = 2 * (pos[1] - wpos[1])
    return [x * this.C + y * this.S, y * this.C - x * this.S]
}


// These all need to be attached to a stage one way or another
StagedThing = function() {
    Thing.apply(this)
    this.gx = 0
    this.gy = 0
    this.gz = 0
}
gamejs.utils.objects.extend(StagedThing, Thing)
StagedThing.prototype.setstagepos = function (pos) {
    if (pos) {
        this.gx = pos[0]
        this.gy = pos[1]
        this.gz = pos.length > 2 ? pos[2] : 0
    } else {
        this.gx = this.gy = this.gz = 0
    }
    this.think(0)
    return this
}
// TODO - clean up this mess maybe?
StagedThing.prototype.stageposof = function(pos) {
    return this.parent ? this.parent.stageposof(pos) : pos
}
StagedThing.prototype.stagepos = function(pos) {
    return this.stageposof(this.gamepos(pos))
}
StagedThing.prototype.gamepos = function(pos) {
    if (pos) {
        return this.parent ? this.parent.gamepos([pos[0] + this.gx, pos[1] + this.gy, pos[2] + this.gz]) : pos
    } else {
        return this.parent ? this.parent.gamepos([this.gx, this.gy, this.gz]) : pos
    }
}
StagedThing.prototype.draw = function(screen) {
    var d2 = this.gx * this.gx + this.gy * this.gy
    if (d2 > 427 * 427) {
        // TODO: find some way to fade
        //screen._context.globalAlpha *= 0.5
    }
    Thing.prototype.draw.call(this, screen)
}
StagedThing.prototype.think = function(dt) {
    if (!this.parent) return
    var p = this.parent.stageposof([this.gx, this.gy, this.gz])
    this.x = p[0]
    this.y = p[1]
    this.z = p[2]
}
StagedThing.prototype.think0 = function(dt) {
    Thing.prototype.think0.call(this, dt)
    this.children.sort(function(a,b) { return a.z - b.z })
}

Effect = function(text, color) {
    StagedThing.apply(this)
    this.t = 0
    this.text = text || " "
    this.color = color || "yellow"
    // TODO: use a stroke-able font because it looks cooler
    this.font = new gamejs.font.Font("bold 16px sans-serif")
    this.image = this.font.render(this.text, this.color)
    return this
}
gamejs.utils.objects.extend(Effect, StagedThing)
Effect.prototype.think = function(dt) {
    this.gz += 50 * dt
    StagedThing.prototype.think.call(this, dt)
    this.t += dt
    if (this.t > 0.8) this.die()
}
// TODO: fade away
/*Effect.prototype.draw = function(screen) {
    screen._context.scale(1, 0.5)
    gamejs.draw.circle(screen, "rgba(80,80,80,0.25)", [0, 0], this.t * 50)
    gamejs.draw.circle(screen, "#FF0000", [0, 0], this.t * 50, 2)
}*/




// A circle that sits on the ground beneath a critter
Indicator = function(caster, r, color0, color1) {
    StagedThing.apply(this)
    this.caster = caster
    this.r = r
    this.color0 = color0  // fill color
    this.color1 = color1  // color of the ring (if any)
}
gamejs.utils.objects.extend(Indicator, StagedThing)
Indicator.prototype.think = function(dt) {
    if (!this.caster.parent) this.die()
    this.gx = this.caster.gx
    this.gy = this.caster.gy
    this.gz = 0
    StagedThing.prototype.think.call(this, dt)
}
// TODO: make it an image
Indicator.prototype.draw = function(screen) {
    screen._context.save()
    screen._context.scale(1, 0.5)
    if (this.color0)
        gamejs.draw.circle(screen, this.color0, [0, 0], this.r)
    if (this.color1)
        gamejs.draw.circle(screen, this.color1, [0, 0], this.r, 2)
    screen._context.restore()
}

// Like an indicator but it doesn't follow anything around
Puddle = function(tmax, rmax, color0, color1) {
    StagedThing.apply(this)
    this.t = 0
    this.tmax = tmax || 0.5
    this.rmax = rmax || 30
    this.color0 = color0 || "rgba(80, 80, 80, 0.25)"
    this.color1 = color1 || "#FF0000"
}
gamejs.utils.objects.extend(Puddle, StagedThing)
Puddle.prototype.think = function(dt) {
    StagedThing.prototype.think.call(this, dt)
    this.t += dt
    if (this.t > this.tmax) this.die()
}
Puddle.prototype.draw = function(screen) {
    screen._context.save()
    screen._context.scale(1, 0.5)
    var r = this.t * this.rmax / this.tmax
    if (r > 3) {
        gamejs.draw.circle(screen, this.color0, [0, 0], r)
        gamejs.draw.circle(screen, this.color1, [0, 0], r, 2)
    }
    screen._context.restore()
}

// Ka-boom!
Bolt = function(dhp) {
    StagedThing.apply(this)
    this.t = 0
    this.spent = false
    this.range = 100
    this.dhp = dhp || 10
    sound.play("quake-0")
}
gamejs.utils.objects.extend(Bolt, StagedThing)
Bolt.prototype.think = function(dt) {
    if (!this.spent) {
        for (var j in state.monsters) {
            var m = state.monsters[j]
            var dx = m.gx - this.gx, dy = m.gy - this.gy
//            alert([j, m.gx, m.gy, dx, dy, this.range])
            if (dx * dx + dy * dy < this.range * this.range) {
                m.hit(this.dhp, this)
            }
        }
        this.spent = true
    }
    this.t += dt
    if (this.t > 0.4 && this.parent) this.die()
    StagedThing.prototype.think.call(this, dt)
}
Bolt.prototype.draw = function(screen) {
    for (var j = 0 ; j < 2 ; ++j) {
        var x = 0, y = 0
        while (y > -500) {
            var nx = x + Math.random() * 50 - 25 + 10, ny = y - 60
            gamejs.draw.line(screen, "white", [x, y], [nx, ny], 2)
            x = nx
            y = ny
        }
    }
    screen.boltage = 1 + (screen.boltage || 0)
}

// Like a puddle but it can hurt you
Shockwave = function(tmax, rmax, color1, dhp) {
    color1 = color1 || "#7FFF7F"
    Puddle.apply(this, [tmax, rmax, null, color1])
    this.passed = []
    this.dhp = dhp || 1
    sound.play("quake-0")
}
gamejs.utils.objects.extend(Shockwave, Puddle)
Shockwave.prototype.draw = function(screen) {
    screen._context.save()
    screen._context.scale(1, 0.5)
    var f = this.t / this.tmax
    if (f > 0.5) {
        screen._context.globalAlpha *= (1 - f) * 2
    }
    var r0 = f * this.rmax
    for (var j = 0 ; j < 4 ; ++j) {
        var r = r0 - j * 8
        if (r <= 3) break
        gamejs.draw.circle(screen, this.color1, [0, 0], r, 2)
        screen._context.globalAlpha *= 0.6
    }
    screen._context.restore()
}
Shockwave.prototype.harm = function (victims) {
    var r = this.t * this.rmax / this.tmax
    for (var j in victims) {
        var victim = victims[j]
        if (this.passed.indexOf(victim) > -1) continue
        var dx = victim.gx - this.gx, dy = victim.gy - this.gy
        if (dx * dx + dy * dy < r * r) {
            victim.hit(this.dhp, this)
            this.passed.push(victim)
        }
    }
}


Selector = function() {
    StagedThing.apply(this)
    this.z = -10000
    this.r = 0
}
gamejs.utils.objects.extend(Selector, StagedThing)
Selector.prototype.setends = function(p1, p2) {
    this.gx = (p1[0] + p2[0]) / 2
    this.gy = (p1[1] + p2[1]) / 2
    var dx = (p1[0] - p2[0]) / 2, dy = (p1[1] - p2[1]) / 2
    this.r = Math.sqrt(dx * dx + dy * dy)
    return this
}
Selector.prototype.think = function(dt) {
    StagedThing.prototype.think.call(this, dt)
    this.z = -10000
}
Selector.prototype.draw = function(screen) {
    if (this.r > 4) {
        screen._context.save()
        screen._context.scale(1, 0.5)
        gamejs.draw.circle(screen, "rgba(80,80,80,0.25)", [0, 0], this.r)
        gamejs.draw.circle(screen, "#FF0000", [0, 0], this.r, 2)
        screen._context.restore()
    }
}
// FIXME: doesn't work if not directly connected to the stage
Selector.prototype.contains = function(critter) {
    var dx = this.gx - critter.gx, dy = this.gy - critter.gy
    return dx * dx + dy * dy < this.r * this.r
}


ExitPortal = function() {
    StagedThing.apply(this)
    this.z = -4000
    this.r = 100
    this.t = 0
}
gamejs.utils.objects.extend(ExitPortal, StagedThing)
ExitPortal.prototype.reposition = function() {
    this.gx = Math.random() * 400 - 200
    this.gy = Math.random() * 400 - 200
    return this
}
ExitPortal.prototype.think = function(dt) {
    this.t += dt
    StagedThing.prototype.think.call(this, dt)
}
ExitPortal.prototype.draw = function(screen) {
    screen._context.save()
    screen._context.scale(1, 0.5)
    var a = Math.sin(this.t * 2) * 0.4 + 0.5
    gamejs.draw.circle(screen, "rgba(255,255,255," + a + ")", [0, 0], this.r)
    gamejs.draw.circle(screen, "#0000FF", [0, 0], this.r, 2)
    screen._context.restore()
}
ExitPortal.prototype.contains = function(critter) {
    var dx = this.gx - critter.gx, dy = this.gy - critter.gy
    return dx * dx + dy * dy < this.r * this.r
}





// Collectible token
Token = function(info, color) {
    StagedThing.apply(this)
    this.t = 0
    this.image = new gamejs.Surface([10, 18])
    this.color = color || "white"
    gamejs.draw.circle(this.image, this.color, [5, 5], 5)
    this.info = info || " "
    var theta = Math.random() * 1000
    this.vx = 120 * Math.cos(theta)
    this.vy = 120 * Math.sin(theta)
}
gamejs.utils.objects.extend(Token, StagedThing)
Token.prototype.think = function(dt) {
    this.t += dt
    var h = (this.t % 0.5) * 2
    h = Math.min(h, 1 - h) * 30
    this.gz = 25 * Math.abs(Math.sin(this.t * 5))
    this.gx += this.vx * dt
    this.gy += this.vy * dt
    var f = Math.exp(-1 * dt)
    this.vx *= f
    this.vy *= f
    StagedThing.prototype.think.call(this, dt)
    if (this.t > 15) this.die()
}
Token.prototype.affect = function(who) {
}
Token.prototype.collect = function(who) {
    var par = this.parent, x = this.gx, y = this.gy, z = this.gz
    if (!par) return
    this.die()
    this.affect(who)
    var e = (new Effect(this.info, this.color)).attachto(par).setstagepos([x, y, 30])
}

HealToken = function(dhp) {
    this.dhp = dhp || 5
    Token.apply(this, ["+" + this.dhp + "HP", "green"])
}
gamejs.utils.objects.extend(HealToken, Token)
HealToken.prototype.affect = function(who) {
    if (who)
        who.hp = Math.min(who.hp + this.dhp, who.hp0)
}

ExpToken = function(dxp) {
    this.dxp = dxp || 5
    Token.apply(this, ["+" + this.dxp + "XP", "#AAAAAA"])
}
gamejs.utils.objects.extend(ExpToken, Token)
ExpToken.prototype.affect = function(who) {
    if (who) state.xp += this.dxp
}


ManaToken = function(dmp) {
    this.dmp = dmp || 5
    Token.apply(this, ["+" + this.dmp + "MP", "yellow"])
}
gamejs.utils.objects.extend(ManaToken, Token)
ManaToken.prototype.affect = function(who) {
    if (who)
        who.mp = Math.min(who.mp + this.dmp, who.mp0)
}


Spark = function(color) {
    StagedThing.apply(this)
    this.color = color || "blue"
    var r = Math.random() * 100 + 100
    var theta = Math.random() * 1000
    this.vx = r * Math.cos(theta)
    this.vy = r * Math.sin(theta)
    this.vz = 100
    this.g = -200
    this.image = new gamejs.Surface([4, 4])
    this.image.fill(this.color)
}
gamejs.utils.objects.extend(Spark, StagedThing)
Spark.prototype.think = function(dt) {
    this.gx += this.vx * dt
    this.gy += this.vy * dt
    this.gz += this.vz * dt + 0.5 * this.g * dt * dt
    this.vz += this.g * dt
    StagedThing.prototype.think.call(this, dt)
    if (this.gz < 0 && this.parent) {
        var par = this.parent, x = this.gx, y = this.gy, z = this.gz
        this.die()
        var e = (new Puddle(null, null, null, this.color)).attachto(par).setstagepos([this.gx, this.gy])
    }
}

Shot = function(sender, receiver, dhp, color) {
    StagedThing.apply(this)
    this.color = color || "white"
    this.dhp = dhp || 1
    this.sender = sender
    this.receiver = receiver
    this.p0 = this.sender.gamepos() || [0,0,0]
    this.p1 = this.receiver.gamepos() || [0,0,0]

    var dx = this.p1[0] - this.p0[0]
    var dy = this.p1[1] - this.p0[1]
    var dz = this.p1[2] - this.p0[2]
    var d = Math.sqrt(dx * dx + dy * dy + dz * dz)
    this.tmax = 0.6 + d / 1000.
    this.zmax = this.tmax * 50.
    this.t = 0

    r = Math.round(5 + Math.sqrt(this.dhp))
    this.image = new gamejs.Surface([r, r])
    this.image.fill(this.color)
}
gamejs.utils.objects.extend(Shot, StagedThing)
Shot.prototype.think = function(dt) {
    this.t += dt
    if (this.t > this.tmax) {
        if (this.receiver && this.receiver.parent) {
            this.land()
        }
        this.die()
        return
    } else {
        if (this.receiver && this.receiver.parent) {
            this.p1 = this.receiver.gamepos()
        }
        if (this.p1) {
            var f = this.t / this.tmax
            this.gx = this.p0[0] * (1 - f) + this.p1[0] * f
            this.gy = this.p0[1] * (1 - f) + this.p1[1] * f
            this.gz = this.p0[2] * (1 - f) + this.p1[2] * f + 30 + this.zmax * 4 * f * (1-f)
        } else {
            this.die()
        }
//        alert([f, this.t, this.tmax])
    }
    StagedThing.prototype.think.call(this, dt)
}
Shot.prototype.land = function() {
    this.receiver.hit(this.dhp, this.sender)
}

Drainer = function(sender, receiver, dhp) {
    Shot.apply(this, [sender, receiver, dhp, "green"])
    r = Math.round(5 + Math.sqrt(this.dhp)) * 3
    this.image = new gamejs.Surface([r, r])
    this.image.fill(this.color)
}
gamejs.utils.objects.extend(Drainer, Shot)
Drainer.prototype.land = function() {
    this.receiver.hp = Math.min(this.receiver.hp + this.dhp, this.receiver.hp0)
    var e = (new Effect("+" + this.dhp + "HP", "green")).attachto(this.receiver).setstagepos([0,0,60])
}


HealthBar = function() {
    StagedThing.apply(this)
    this.color0 = "white"
    this.color1 = "red"
}
gamejs.utils.objects.extend(HealthBar, StagedThing)
HealthBar.prototype.draw = function(screen) {
    if (!this.parent || this.parent.hp >= this.parent.hp0) return
    var x0 = Math.round(20 + Math.sqrt(this.parent.hp0) * 2)
    var x = Math.round(Math.max(this.parent.hp * x0 / this.parent.hp0, 0))
    // TODO: make this a slightly better-looking image
    gamejs.draw.line(screen, this.color1, [-x0/2-1,0], [-x0/2+x0+1,0], 6)
    if (x > 0) gamejs.draw.line(screen, this.color0, [-x0/2,0], [-x0/2+x,0], 4)
}

ManaBar = function() {
    StagedThing.apply(this)
    this.color0 = "yellow"
    this.color1 = "black"
}
gamejs.utils.objects.extend(ManaBar, StagedThing)
ManaBar.prototype.draw = function(screen) {
    if (!this.parent || this.parent.mp >= this.parent.mp0) return
    var x0 = Math.round(20 + Math.sqrt(this.parent.mp0) * 2)
    var x = Math.round(Math.max(this.parent.mp * x0 / this.parent.mp0, 0))
    gamejs.draw.line(screen, this.color1, [-x0/2-1,0], [-x0/2+x0+1,0], 6)
    if (x > 0) gamejs.draw.line(screen, this.color0, [-x0/2,0], [-x0/2+x,0], 4)
}



// Sprite base class
Critter = function(hp0, walkspeed) {
    StagedThing.apply(this)
    this.target = null
    this.walkspeed = walkspeed || 100
    this.healrate = 0
    this.hp0 = hp0 || 5
    this.hitradius = 100
    this.castradius = 0
    this.hittimer = 0
    this.hittime = 2
    this.strength = 1
    this.r = 10

    this.prey = null
    this.healthbar = null
    this.image = new gamejs.Surface([60, 60])
    this.hp = this.hp0
    this.reeltimer = 0
    this.reeltilt = true
    this.reelspeed = 400
    this.lastmotion = [Math.random() - 0.5, Math.random() - 0.5]  // To determine facing right
    this.vz = 0
    this.bounce = 100
    this.shotcolor = "blue"
    this.takesphysical = true  // Takes physical damage
    gamejs.draw.circle(this.image, "green", [30, 16], 16)
}
gamejs.utils.objects.extend(Critter, StagedThing)
Critter.prototype.think = function(dt) {
    // Set target based on prey
//    if (this.hittimer) {
//        this.target = null
//    } else 
    if (this.prey && !this.hittimer) {
        var dx = this.prey.gx - this.gx, dy = this.prey.gy - this.gy
        this.logmotion(dx, dy)
        var r = this.hitradius * 0.8
        if (this.target) { // already pursuing the prey
            if (dx * dx + dy * dy < r * r) {
                this.target = null
                this.attack(this.prey)
            } else {
                this.targetprey()
            }
        } else {
            if (dx * dx + dy * dy < this.hitradius * this.hitradius) {
                this.attack(this.prey)
            } else {
                this.target = [this.prey.gx, this.prey.gy]
            }
        }
        if (!this.prey.parent) this.prey = this.target = null
    }

    if (!this.reeltimer && this.hp < 0) {
        sound.play("die-0")
        this.die()
    }
    if (this.reeltimer) {
        var dx = this.reelfrom[0] - this.gx, dy = this.reelfrom[1] - this.gy
        if (dx * dx + dy * dy < 1) {
            dx = Math.random() - 0.5
            dy = Math.random() - 0.5
        }
        var f = this.reelspeed * Math.min(dt, this.reeltimer) / Math.sqrt(dx * dx + dy * dy)
        this.gx -= dx * f
        this.gy -= dy * f
        this.reeltimer -= dt
        if (this.reeltimer <= 0) {
            this.reeltimer = 0
        }
    } else if (this.target) {
        var d = dt * this.walkspeed
        var dx = this.target[0] - this.gx, dy = this.target[1] - this.gy
        this.logmotion(dx, dy)
        if (dx * dx + dy * dy <= d * d) {
            this.gx = this.target[0]
            this.gy = this.target[1]
            this.target = null
        } else {
            var f = d / Math.sqrt(dx * dx + dy * dy)
            this.gx += dx * f
            this.gy += dy * f
        }
    }
    if (this.gz > 0 && this.isearthbound()) {
        this.gz += this.vz * dt - 500 * dt * dt
        this.vz -= 1000 * dt
        if (this.gz < 0) {
            this.land()
        }
    }
    if (this.gz == 0 && this.bounce && this.canbounce()) {
        this.vz = this.bounce * (Math.random() * 0.2 + 1)
        this.gz = 0.01
    }
    if (this.healrate > 0) {
        this.hp = Math.min(this.hp + this.healrate * dt, this.hp0)
    }
    this.hittimer = Math.max(this.hittimer - dt, 0)
    StagedThing.prototype.think.call(this, dt)
}
Critter.prototype.targetprey = function () {
    this.target = [this.prey.gx, this.prey.gy]
}
Critter.prototype.isfacingright = function () {
    var dx = this.lastmotion[0], dy = this.lastmotion[1]
    // FIXME: must be grandchild of stage
    return dx * this.parent.parent.C - dy * this.parent.parent.S > 0
}
Critter.prototype.reelingfromright = function () {
    var dx = this.reelfrom[0] - this.gx, dy = this.reelfrom[1] - this.gy
    // FIXME: must be grandchild of stage
    return dx * this.parent.parent.C - dy * this.parent.parent.S > 0
}
Critter.prototype.draw = function (screen) {
    screen._context.save()
    if (this.reeltimer && this.reeltilt) screen._context.rotate(this.reelingfromright() ? -0.5 : 0.5)
    if (this.isfacingright()) screen._context.scale(-1, 1)
    StagedThing.prototype.draw.call(this, screen)
    screen._context.restore()
}
// Call whenever you move in a direction you should be facing
Critter.prototype.logmotion = function (dx, dy) {
    if (dx || dy) this.lastmotion = [dx, dy]
}
Critter.prototype.isvulnerable = function() {
    return true
}
Critter.prototype.isearthbound = function() {
    return true
}
Critter.prototype.land = function () {
    this.gz = 0
    this.vz = 0
}
Critter.prototype.canbounce = function() {
    return !this.reeltimer && this.target
}
// Receive a hit (of how much, and from whom)
Critter.prototype.hit = function(dhp, who) {
    if (!this.isvulnerable()) return
    this.hp -= dhp
    sound.play("no-0")
    var e = (new Effect("-" + dhp + "HP", "red")).attachto(this).setstagepos([0,0,60])
    if (!this.healthbar) {
        this.healthbar = (new HealthBar()).attachto(this).setstagepos([0,0,60])
    }
    if (who) {
        this.reeltimer = 0.05 * Math.sqrt(dhp)
        this.reelfrom = [who.gx, who.gy]
    }
}
Critter.prototype.attack = function (who) {
    if (this.parent) {
        var shot = new Shot(this, who, this.strength, this.shotcolor)
        shot.attachto(this.parent)
        shot.setpos([this.gx, this.gy, 30])
        this.hittimer = this.hittime * (1 + 0.1 * Math.random())
        this.logmotion(who.gx - this.gx, who.gy - this.gy)
    }
}
Critter.prototype.localcontains = function(pos) {
    var x = pos[0], y = pos[1] + this.r * 0.65
    return x * x + y * y < this.r * this.r
}
Critter.prototype.getshadow = function () {
    return new Indicator(this, this.r * 0.6, "rgba(0,0,0,0.4)", null)
}
Critter.prototype.castshadow = function () {
    this.getshadow().attachto(state.indicators)
}


// Player character
Adventurer = function(pstate) {
    if (!pstate) return
    Critter.apply(this)
    this.name = pstate.name
    this.skill = pstate.skill
    this.hp0 = pstate.hp0
    this.mp0 = pstate.mp0
    this.hp = this.hp0
    this.mp = this.mp0 / 2
    this.walkspeed = pstate.speed
    this.hitradius = pstate.range
    this.castradius = pstate.range
    this.strength = pstate.strength
    
    this.reach = 20 // How far away you grab tokens
    this.r = pstate.size  // Clickable size. Probably won't alter from 30
    this.healrate = 0.01
    this.mp = this.mp0 / 2
    this.manarate = 0.01
    this.manabar = null
    this.casttarget = null
    this.casttimer = 0
    this.quakejump = null
    this.image = Images.getimage(pstate.name)
    this.shotcolor = "blue"
}
gamejs.utils.objects.extend(Adventurer, Critter)
Adventurer.prototype.nab = function(tokens) {
    for (var j = 0 ; j < tokens.length ; ++j) {
        var token = tokens[j]
        if (token.parent) {  // token still alive
            // FIXME: assumes gx,gy is gameplay position
            var dx = Math.abs(this.gx - token.gx)
            if (dx > this.reach) continue
            var dy = Math.abs(this.gy - token.gy)
            if (dy > this.reach) continue
            if (dx * dx + dy * dy < this.reach * this.reach) {
                sound.play("powerup-0")
                token.collect(this)
            }
        }
    }
}
Adventurer.prototype.considerattacking = function(monsters) {
    if (this.target || this.prey || this.hittimer || !this.isresponding()) return
    var x = this.gx, y = this.gy
    var closest = null, d2min = 0
    for (var j in monsters) {
        var m = monsters[j]
        if (!m.takesphysical) continue
        var dx = m.gx - x, dy = m.gy - y
        var d2 = dx * dx + dy * dy
        if (d2 > this.hitradius * this.hitradius) continue
        if (!closest || d2 < d2min) {
            closest = m
            d2min = d2
        }
    }
    if (closest) this.attack(closest)
}
// Will respond to user commands
Adventurer.prototype.isresponding = function() {
    return !this.quakejump
}
// Can get hit by, you know, stuff
Adventurer.prototype.isvulnerable = function() {
    return !this.reeltimer && !this.quakejump
}
Adventurer.prototype.think = function(dt) {
    if (!this.manabar && this.mp0) {
        this.manabar = (new ManaBar()).attachto(this).setstagepos([0,0,68])
    }
    if (this.quakejump) {
        this.handlequake(dt)
    }

    if (this.casttarget) {
        // I'm sure there's a way to do this, but I'm not going to bother looking it up in the middle of LD
        this.castat(this.casttarget[0], this.casttarget[1], this.casttarget[2], this.casttarget[3])
        this.target = this.casttarget ? this.casttarget[0] : null
    }
    if (this.manarate > 0) {
        this.mp = Math.min(this.mp + this.manarate * dt, this.mp0)
    }
    this.casttimer -= dt
    Critter.prototype.think.call(this, dt)
}
Adventurer.prototype.draw = function(screen) {
    screen._context.save()
    if (this.quakejump) {
        if (this.quakejump[0] == "up") {
            var x = this.gz / 100
            var scale = 1 + 1 * Math.exp(-x * (4 - x))
            screen._context.scale(1/scale, scale)
        }
        if (this.quakejump[0] == "hover") {
//            screen._context.rotate(this.quakejump[1] / 0.4 * 6.28)
        }
        if (this.quakejump[0] == "down") {
            var scale = 1 + 1 * Math.exp(-this.gz / 100)
            screen._context.scale(scale, 1/Math.sqrt(scale))
        }
    }
    Critter.prototype.draw.call(this, screen)
    screen._context.restore()
}
Adventurer.prototype.getcastarea = function() {
    var i = new Indicator(this, this.castradius, null, "#0000FF")
    i.z = -20000
    return i
}
Adventurer.prototype.cancast = function() {
    return this.casttimer <= 0 && this.mp > {bolt:5,quake:3,drain:3}[this.skill]
}
Adventurer.prototype.castat = function(pos, critters, indicators, type) {
    if (!this.cancast()) return false
    type = type || this.skill || "quake"
    var dx = pos[0] - this.gx, dy = pos[1] - this.gy
    if (dx * dx + dy * dy < this.castradius * this.castradius) {
        this.casttimer = 1
        this.casttarget = null
        switch (type) {
            case "bolt": this.castboltat(pos, critters, indicators) ; break
            case "quake": this.castquakeat(pos, critters, indicators) ; break
            case "drain": this.castdrainat(pos, critters, indicators) ; break
        }
    } else {
        this.casttarget = [pos, critters, indicators, type]
    }
    return true
}
Adventurer.prototype.castboltat = function(pos, critters, indicators) {
    // FIXME: unless we don't want to attach Adventurers
    var b = (new Bolt(this.strength * 5)).attachto(critters).setstagepos(pos)
//    var s = new Shockwave(0.4, 100, "white", 10)
//    s.attachto(state.indicators).setstagepos(pos)
//    state.mhazards.push(s)
    this.mp -= 5
}
Adventurer.prototype.castquakeat = function(pos, critters, indicators) {
    if (this.quakejump) return
    this.quakejump = ["up", pos, indicators]
    this.mp -= 3
}
Adventurer.prototype.castdrainat = function(pos, critters, indicators) {
    var x = pos[0], y = pos[1]
    if (!state.monsters) return
    var closest = null, d2min = 0
    for (var j in state.monsters) {
        if (state.monsters[j].hp <= 0) continue
        var dx = state.monsters[j].gx - x
        var dy = state.monsters[j].gy - y
        var d2 = dx * dx + dy * dy
        if (d2 > this.castradius * this.castradius) continue
        if (!closest || d2 < d2min) {
            closest = state.monsters[j]
            d2min = d2
        }
    }
    if (closest) {
        var dhp = Math.floor(Math.min(closest.hp, 4 * this.strength))
        closest.hit(dhp, this)
        var d = new Drainer(closest, this, dhp)
        d.attachto(this.parent)
        this.mp -= 3
    }
}
// The casting sequence for the quake spell is a little involved
Adventurer.prototype.handlequake = function(dt) {
    switch (this.quakejump[0]) {
        case "up":
            var dz = dt * 600
            this.gz += dz
            if (this.gz > 200) {
                this.gx = this.quakejump[1][0]
                this.gy = this.quakejump[1][1]
                this.quakejump = ["hover", 0.4, this.quakejump[2]]
            } else {
                var f = dz / (200 - this.gz + dz)
                this.gx += (this.quakejump[1][0] - this.gx) * f
                this.gy += (this.quakejump[1][1] - this.gy) * f
            }
            break
        case "hover":
            this.quakejump[1] -= dt
            if (this.quakejump[1] < 0) {
                this.quakejump = ["down", this.quakejump[2]]
            }
            break
        case "down":
            var dz = dt * 1200
            this.gz -= dz
            if (this.gz < 0) {
                this.gz = 0
                var s = new Shockwave(0.5, 300, "brown", 2*this.strength)
                s.attachto(this.quakejump[1]).setstagepos([this.gx, this.gy, 0])
                state.mhazards.push(s)
                this.quakejump = null
            }
            break
    }
    this.prey = null
    this.target = null
}
Adventurer.prototype.getselinfo = function () {
    var box = new Thing()
    box.centered = false;
    (new TextBox("Adventurer: " + this.name, null, null, "white")).attachto(box).setpos([0,0]);
    (new TextBox("  HP: " + Math.round(this.hp) + "/" + this.hp0, null, null, "white")).attachto(box).setpos([0,56]);
    if (this.mp0) {
        (new TextBox("  Skill: " + this.skill, null, null, "white")).attachto(box).setpos([0,28]);
        (new TextBox("  MP: " + Math.round(this.mp) + "/" + this.mp0, null, null, "white")).attachto(box).setpos([0,84]);
    }
    return box
}



Monster = function(hp0) {
    Critter.apply(this, [hp0])
    this.r = 30
    this.hitradius = 100
    this.basespeed = 40  // walk speed when not pursuing a player
//    this.image = new gamejs.Surface([4*this.r, 4*this.r])
//    gamejs.draw.circle(this.image, "#008800", [2*this.r, this.r], this.r)
    this.wandertime = 3
    this.image = Images.getimage("lump")
    this.shotcolor = "red"
}
gamejs.utils.objects.extend(Monster, Critter)
Monster.prototype.think = function (dt) {
    this.walkspeed = this.prey ? 2 * this.basespeed : this.basespeed
    Critter.prototype.think.call(this, dt)
    if (!this.hittimer && !this.prey && !this.target && this.wandertime) {
        if (Math.random() * this.wandertime < dt) {
            var r = Math.random() * 200 + 100
            var theta = Math.random() * 1000
            this.target = [this.gx + r * Math.cos(theta), this.gy + r * Math.sin(theta)]
        }
    }
    if (this.hittimer && this.prey && !this.target && this.wandertime) {
        if (Math.random() * this.wandertime * 2 < dt) {
            var r = Math.random() * 200 + 100
            var theta = Math.random() * 1000
            this.target = [this.gx + r * Math.cos(theta), this.gy + r * Math.sin(theta)]
        }
    }
}
Monster.prototype.targetprey = function () {
    this.target = [this.prey.gx + Math.random() * 200 - 100, this.prey.gy + Math.random() * 200 - 100]
}
Monster.prototype.hit = function(dhp, who) {
    Critter.prototype.hit.call(this, dhp, who)
    this.target = this.prey = null
}
Monster.prototype.chooseprey = function(players) {
    var closest = null, d2min = 0
    for (var j in players) {
        var p = players[j]
        var dx = p.gx - this.gx, dy = p.gy - this.gy
        var d2 = dx * dx + dy * dy
        if (!closest || d2 < d2min) {
            closest = p
            d2min = d2
        }
    }
    this.prey = closest
}
Monster.prototype.die = function() {
    this.droploot()
    Critter.prototype.die.call(this)
}
Monster.prototype.droploot = function() {
}
Monster.prototype.droptoken = function(type, amt) {
    var token = (new type(amt)).attachto(state.critters).setstagepos([this.gx, this.gy, 0])
    state.tokens.push(token)
    var i = (new Indicator(token, 5, "rgba(0,0,0,0.5)", null)).attachto(state.indicators)
}


Lump = function() {
    var hp = 4
    Monster.apply(this, [hp])
    this.image = Images.getimage("lump")
    this.wandertime = 10
    this.strength = 1
    this.basespeed = 25
}
gamejs.utils.objects.extend(Lump, Monster)
Lump.prototype.droploot = function() {
    this.droptoken(ExpToken, 1)
    if (Math.random() < 0.3) {
        this.droptoken(HealToken, 5)
    }
    if (state.currentlevel != 1 && Math.random() < 0.2) {
        this.droptoken(ManaToken, 2)
    }
}


LargeLump = function() {
    var hp = 10
    Monster.apply(this, [hp])
    this.image = Images.getimage("largelump")
    this.wandertime = 10
    this.strength = 1
    this.basespeed = 25
    this.r *= 1.8
}
gamejs.utils.objects.extend(LargeLump, Monster)
LargeLump.prototype.droploot = function() {
    this.droptoken(ExpToken, 3)
    if (state.currentlevel != 1 && Math.random() < 0.2) {
        this.droptoken(ManaToken, 5)
    }
}


Spike = function() {
    var hp = 12
    Monster.apply(this, [hp])
    this.image = Images.getimage("spike")
    this.strength = 2
    this.wandertime = 1
    this.basespeed = 40
}
gamejs.utils.objects.extend(Spike, Monster)
Spike.prototype.droploot = function() {
    this.droptoken(ExpToken, 6)
    if (Math.random() < 0.3) {
        this.droptoken(ManaToken, 6)
    }
    if (Math.random() < 0.3) {
        this.droptoken(HealToken, 6)
    }
}

LargeSpike = function() {
    var hp = 30
    Monster.apply(this, [hp])
    this.image = Images.getimage("largespike")
    this.strength = 3
    this.wandertime = 1
    this.basespeed = 40
}
gamejs.utils.objects.extend(LargeSpike, Monster)
LargeSpike.prototype.droploot = function() {
    this.droptoken(ExpToken, 15)
    if (Math.random() < 0.3) {
        this.droptoken(ManaToken, 15)
    }
    if (Math.random() < 0.3) {
        this.droptoken(HealToken, 15)
    }
}


Bomb = function() {
    var hp = 100
    Monster.apply(this, [hp])
    this.images = [Images.getimage("bomb0"), Images.getimage("bomb1")]
    this.wandertime = 10
    this.strength = 20
    this.basespeed = 30
    this.hitradius = 1
    this.reeltilt = false
    this.reelspeed = 600
    this.t = 6.9
}
gamejs.utils.objects.extend(Bomb, Monster)
Bomb.prototype.think = function (dt) {
    var n = Math.round(this.t)
    this.t -= dt
    if (this.t <= 0) this.detonate()
    this.image = this.images[Math.floor(this.t < 3 ? this.t * 6 : this.t * 3) % 2]
    if (n && Math.round(this.t) != n && this.parent) {
        var e = (new Effect("" + n, "red")).attachto(this.parent).setstagepos([this.gx, this.gy, 40])
    }
    Monster.prototype.think.call(this, dt)
}
Bomb.prototype.detonate = function () {
    var s = new Shockwave(0.3, 150, "green", this.strength)
    s.attachto(state.indicators).setstagepos([this.gx, this.gy, 0])
    state.hazards.push(s)
    this.die()
}
Bomb.prototype.attack = function(who) {
    this.detonate()
}
Bomb.prototype.droploot = function() {
    if (this.hp < 0) {
        if (Math.random() < 0.4) this.droptoken(ManaToken, 10)
        if (Math.random() < 0.4) this.droptoken(HealToken, 10)
    }
}




// BOSSES

// The Crystal just sort of stands around, you know?
Crystal = function(level) {
    var hp = 150
    Monster.apply(this, [hp])
    this.r = 60
    this.t = Math.random() * 100
    this.wandertime = 0
    this.image = Images.getimage("crystal-0")
    this.bounce = 0
    this.takesphysical = false
}
gamejs.utils.objects.extend(Crystal, Monster)
Crystal.prototype.chooseprey = function(players) {
}
Crystal.prototype.think = function (dt) {
    this.reeltimer = 0
    Monster.prototype.think.call(this, dt)
}
Crystal.prototype.hit = function (dhp, who) {
    sound.play("shine-0")
    Monster.prototype.hit.call(this, dhp, who)
}
Crystal.prototype.draw = function (screen) {
    this.reeltimer = 0
    Monster.prototype.draw.call(this, screen)
}
Crystal.prototype.droploot = function() {
    for (var j = 0 ; j < 5 ; ++j)
        this.droptoken(ExpToken, 20)
}



// Zoltar never picks any prey, just spawns chaos
Zoltar = function(level) {
    this.level = level || 4
    var hp = (10 + 10 * this.level) * 6
    Monster.apply(this, [hp])
    this.r = 30 * this.level
    this.t = Math.random() * 100
    this.wandertime = 0
    this.image = Images.getimage("zoltar-" + this.level)
    this.bounce = 0
    this.bouncetime = [0,1,2,3,4][this.level]
    this.vjump = 200 * this.level
    this.jumpdist = 200 * this.level
    this.dhp = this.level * 2
    this.wavesize = 40 + 60 * this.level
    this.vx = this.vy = this.vz = 0
    this.basespeed = 100 * this.level
    sound.playmusic("boss-2")
}
gamejs.utils.objects.extend(Zoltar, Monster)
Zoltar.prototype.setstagepos = function (pos) {
    Monster.prototype.setstagepos.call(this, pos)
    if (this.level < 4) this.leap()
    return this
}
Zoltar.prototype.think = function (dt) {
    this.t += dt
    this.reeltimer = 0
    this.hittimer = 0
    if (this.gz == 0 && this.vz == 0) {
        this.bouncetimer -= dt
        if (this.bouncetimer < 0) {
            this.leap()
            sound.play("boing-0")
        }
    }
    Monster.prototype.think.call(this, dt)
}
Zoltar.prototype.leap = function () {
    var d = this.jumpdist
    var rnum = function() { return (Math.random() - 0.5) * d}
    var d20 = this.gx * this.gx + this.gy * this.gy
    for (var j = 0 ; j < 10 ; ++j) {
        this.target = [this.gx + rnum(), this.gy + rnum()]
        var d2 = this.target[0] * this.target[0] + this.target[1] * this.target[1]
        if (d2 < 400 * 400 || d2 < d20) break
    }
    this.vz = this.vjump
    this.gz = 0.01
}
Zoltar.prototype.draw = function (screen) {
    screen._context.save()
    var r = 1 + [0, 0.3, 0.25, 0.2, 0.1][this.level] * Math.sin(this.t * 3)
    screen._context.scale(r, 1/r)
    this.reeltimer = 0
    Monster.prototype.draw.call(this, screen)
    screen._context.restore()
}
Zoltar.prototype.chooseprey = function(players) {
}
Zoltar.prototype.land = function () {
    var s = new Shockwave(0.6, this.wavesize, "green", this.dhp)
    s.attachto(state.indicators).setstagepos([this.gx, this.gy, 0])
    state.hazards.push(s)
    Monster.prototype.land.call(this)
    this.gz = 0
    this.vz = 0
    this.target = null
    this.bouncetimer = this.bouncetime * (1 + 0.1 * Math.random())
}
Zoltar.prototype.die = function () {
    var level = this.level - 1
    if (level > 1) {
        for (var j = 0 ; j < (level == 3 ? 3 : 2) ; ++j) {
            var z = (new Zoltar(level)).attachto(state.critters).setstagepos([this.gx, this.gy, 0])
            state.monsters.push(z)
            z.castshadow()
        }
    }
    Monster.prototype.die.call(this)
}
Zoltar.prototype.droploot = function() {
    for (var j = 0 ; j < this.level - 1 ; ++j) {
        this.droptoken(ManaToken, 20)
        this.droptoken(HealToken, 20)
        this.droptoken(ExpToken, 50)
    }
}


// Birdy's skull form
Skull = function() {
    var hp = 150
    Monster.apply(this, [hp])
    this.r = 40
    this.t = Math.random() * 100
    this.image = Images.getimage("skull")
    this.strength = 3
    this.basespeed = 200
//    this.reeltilt = false
    this.hitradius = 200
    this.wandertime = 5000
    sound.playmusic("boss-0")
}
gamejs.utils.objects.extend(Skull, Monster)
Skull.prototype.think = function (dt) {
    this.t += dt
    
    if (this.t >= 6) {
        if (Math.random() < 0.4) this.droptoken(HealToken, 6)
        if (Math.random() < 0.4) this.droptoken(ManaToken, 6)
        var r = 250
        var theta = Math.random() * 1000
        this.target = [r * Math.cos(theta), r * Math.sin(theta)]
    }
    if (this.target) this.t = 0
    Monster.prototype.think.call(this, dt)

    if (this.t > 0.5 && this.t < 2 && Math.random() < dt * 2) {
        for (var j = 0 ; j < state.players.length ; ++j) {
            if (Math.random() < 0.8) continue
            var p = state.players[j]
            if (p.gx * p.gx + p.gy * p.gy < this.hitradius * this.hitradius) {
                this.attack(p)
            }
        }
    }
}
Skull.prototype.chooseprey = function(players) {
}
Skull.prototype.isearthbound = function() {
    return true
}
Skull.prototype.draw = function (screen) {
    Monster.prototype.draw.call(this, screen)
}
Skull.prototype.droploot = function() {
    for (var j = 0 ; j < 10 ; ++j) {
        this.droptoken(ExpToken, 20)
    }
}

// Birdy's bird form
Birdy = function(level) {
    var hp = 1000
    Monster.apply(this, [hp])
    this.r = 40
    this.t = Math.random() * 100
    this.t2 = 0
    var fnames = ["birdy-0", "birdy-1", "birdy-2", "birdy-3"]
    this.frames = new Array()
    for (var j = 0 ; j < 4 ; ++j) this.frames.push(Images.getimage(fnames[j]))
    this.image = this.frames[1]
    this.strength = 40
    this.basespeed = 250
    this.reelspeed = 100
    this.reeltilt = false
    this.hitradius = 400
    sound.playmusic("boss-0")
}
gamejs.utils.objects.extend(Birdy, Monster)
Birdy.prototype.think = function (dt) {
    this.t += dt
    var z = this.gz
    if (this.target) {
        var fnum = Math.floor(this.t * 8) % 4
    } else {
        var fnum = [0,1,1,1,1,1,1,1,2,3][Math.floor(this.t * 8) % 10]
    }
    this.image = this.frames[fnum]
    this.gz += 5 * fnum
    
    this.t2 += dt
    if (this.t2 >= 6) {
        if (Math.random() < 0.4) this.droptoken(HealToken, 6)
        if (Math.random() < 0.4) this.droptoken(ManaToken, 6)
        var r = Math.random() * 250
        var theta = Math.random() * 1000
        this.target = [r * Math.cos(theta), r * Math.sin(theta)]
        this.t2 = 0
    }
    Monster.prototype.think.call(this, dt)
    this.gz = z

    if (Math.random() * 10 < dt) {
        var m = (new Bomb()).attachto(state.critters).setstagepos([this.gx, this.gy, this.gz])
        state.monsters.push(m)
        m.castshadow()
        
/*        for (var j = 0 ; j < state.players.length ; ++j) {
            if (Math.random() < 0.8) continue
            var p = state.players[j]
            if (p.gx * p.gx + p.gy * p.gy < this.hitradius * this.hitradius) {
                this.attack(p)
            }
        }*/
    }
}
Birdy.prototype.chooseprey = function(players) {
}
Birdy.prototype.isearthbound = function() {
    return false
}
Birdy.prototype.draw = function (screen) {
    Monster.prototype.draw.call(this, screen)
}




exports.Thing = Thing
exports.FPSCounter = FPSCounter
exports.TextBox = TextBox
exports.Button = Button
exports.Stage = Stage
exports.StagedThing = StagedThing
exports.Puddle = Puddle
exports.Indicator = Indicator
exports.Selector = Selector
exports.ExitPortal = ExitPortal
exports.Critter = Critter
exports.Adventurer = Adventurer
exports.HealToken = HealToken
exports.ExpToken = ExpToken
exports.ManaToken = ManaToken
exports.Effect = Effect
exports.Bolt = Bolt
exports.Shockwave = Shockwave

exports.Monster = Monster
exports.Lump = Lump
exports.LargeLump = LargeLump
exports.Spike = Spike
exports.LargeSpike = LargeSpike
exports.Bomb = Bomb
exports.Crystal = Crystal
exports.Zoltar = Zoltar
exports.Birdy = Birdy
exports.Skull = Skull



}}, ["gamejs", "Images", "state", "sound"]);/* This file has been generated by yabbler.js */
require.define({
"main": function(require, exports, module) {
var state = require('./state')
var sound = require('./sound')

var screen
var dragpos, dragging = false
var mousepos, mousestart, mouset0
var gamejs = require('gamejs')
var Thing = require('./Thing')

/*
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();*/
 

// We count it as a click if the mouse has moved less than 20px and mouseup
//   is within 0.25s of mousedown
// I think that this is more reliable than relying on the browser click event? idk i heard that
function handleclick(pos) {
    var gamepos = state.stage.togamepos(pos)
    var clicked = state.stage.topcontains(pos)
    if (clicked) {
        if (state.selected.length == 1 && state.selected[0] === clicked) {
            state.applyselection()
        } else if (clicked instanceof Thing.Adventurer) {
            state.applyselection([clicked])
        } else if (clicked instanceof Thing.Monster && clicked.takesphysical) {
            for (var j in state.selected) {
                state.selected[j].prey = clicked
                sound.play("select-0")
            }
        }
    } else if (state.selected.length) {
        var p = (new Thing.Puddle()).attachto(state.indicators).setstagepos(gamepos)
        for (var j = 0 ; j < state.selected.length ; ++j) {
            // TODO: better crowding algorithm
            var theta = Math.random() * 1000, r = 20 * j
            state.selected[j].target = [gamepos[0] + r * Math.sin(theta), gamepos[1] + r * Math.cos(theta)]
            state.selected[j].casttarget = null
            state.selected[j].prey = null
        }
    }
}

function handlemouseup(pos) {
    if (dragging) {
        if (selector) {
            newselected = state.players.filter(function (p) { return selector.contains(p) })
            state.applyselection(newselected)
        }
    } else {
        handleclick(pos)
    }
    dragging = false
    dragpos = null
}

function handlemousedown(pos) {
    dragpos = pos
    mousestart = pos
    mouset0 = (new Date()).getTime()
}
function handlemousemove(pos) {
    if (dragpos) {
        var dx = pos[0] - dragpos[0], dy = pos[1] - dragpos[1]
        if (!dragging) {
            dragging = dx * dx + dy * dy > 20 * 20
        }
        if (dragging) {
            dragpos = pos
        }
    }
}

function handlekeydown(key, pos) {
    switch (key) {
        case gamejs.event.K_TAB:
            if (state.players.length) {
                if (state.selected.length == 1) {
                    for (var j = 0 ; j < state.players.length ; ++j) {
                        if (state.selected.indexOf(state.players[j]) != -1) {
                            state.applyselection([state.players[(j+1)%state.players.length]])
                            break
                        }
                    }
                } else {
                    state.applyselection([state.players[0]])
                }
            }
            break
/*        case gamejs.event.K_0:
            state.beatlevel()
            break
        case gamejs.event.K_1:
            var gamepos = state.stage.togamepos(pos)
            var s = (new Thing.Shockwave(0.5, 200)).attachto(state.indicators).setstagepos(gamepos)
            state.hazards.push(s)
            break*/
        case gamejs.event.K_a:  // select/deselect all
            if (state.selected.length) {
                state.applyselection()
            } else {
                state.applyselection(state.players)
            }
            break
        case gamejs.event.K_SPACE:  // cast
            if (state.selected.length == 1) {
                state.selected[0].castat(state.stage.togamepos(pos), state.critters, state.indicators)
            }
            break
        case gamejs.event.K_RIGHT:
            state.stage.turn(Math.PI / 4)
            break
        case gamejs.event.K_LEFT:
            state.stage.turn(-Math.PI / 4)
            break
/*        case gamejs.event.K_m:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Monster()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_l:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Lump()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_b:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Bomb()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_s:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Spike()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_z:
            var z = (new Thing.Zoltar()).attachto(state.critters).setstagepos([0,0,600])
            state.monsters.push(z)
            z.castshadow()
            break
        case gamejs.event.K_k:
            var b = (new Thing.Birdy()).attachto(state.critters).setstagepos([0,0,100])
            state.monsters.push(b)
            b.castshadow()
            break
        case gamejs.event.K_u:
            var b = (new Thing.Skull()).attachto(state.critters).setstagepos([0,0,600])
            state.monsters.push(b)
            b.castshadow()
            break*/
    }
}

var t0 = 0
function think(dt) {
    dt = Math.min(dt * 0.001, 0.1)
    if (state.currentlevel > 20) {
        titlethink(dt)
    } else if (state.currentlevel > 10) {
        cutthink(dt)
    } else if (state.currentlevel == 10) {
        shopthink(dt)
    } else if (state.currentlevel >= 1) {
        gamethink(dt)
    }
    sound.setvolumes(document.getElementById("sfxvolume").value * 0.1,
                     document.getElementById("musicvolume").value * 0.1)
}


function titlethink(dt) {
    screen.fill("black")
    screen._context.textAlign = "center"
    screen._context.fillStyle = "white"
    screen._context.font = "bold 40px serif"
    screen._context.fillText(state.title, 427, 200)
    screen._context.font = "bold 24px serif"
    screen._context.fillText(state.subtitle, 427, 260)
    if (state.currentlevel != 26) {
        screen._context.font = "16px serif"
        screen._context.fillText("click to continue", 427, 400)
    }
    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (state.currentlevel != 26 && screen.getRect().collidePoint(event.pos)) {
                state.loadlevel()
            }
        } else if (event.type === gamejs.event.KEY_DOWN && event.key == gamejs.event.K_BACKSPACE) {
            state.loadlevel(10)
        }
    })
}


// Upgradin stuff....
function shopthink(dt) {
    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (screen.getRect().collidePoint(event.pos)) {
                var button = state.HUD.topcontains(event.pos)
                if (button && button.callback) {
                    button.callback()
                } else {
                    var sprite = state.gameplay.topcontains(event.pos)
                    if (sprite) {
                        state.applyselection([sprite])
                    }
                }
            }
        }
        if (event.type === gamejs.event.KEY_DOWN) {
            if (event.key == gamejs.event.K_0) state.xp += 10
//            handlekeydown(event.key, mousepos)
        }
    })

    state.setshopvisibility()

    state.stage.turn(0.03 * dt)

    state.stage.think(dt)
    state.critters.think0(dt)
    state.indicators.think0(dt)
    state.HUD.think0(dt)
    
//    state.statusbox.update(state.stage.alpha)


    screen.fill("black")
    state.gameplay.draw0(screen)
    state.HUD.draw0(screen)

}



// The gameplay context
function gamethink(dt) {
    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (screen.getRect().collidePoint(event.pos)) {
                handlemouseup(event.pos)
            }
        }
        if (event.type === gamejs.event.MOUSE_DOWN) {
            if (screen.getRect().collidePoint(event.pos)) {
                handlemousedown(event.pos)
            }
        }
        if (event.type === gamejs.event.MOUSE_MOTION) {
            if (screen.getRect().collidePoint(event.pos)) {
                handlemousemove(event.pos)
            } else {
                dragpos = null
            }
            mousepos = event.pos
        }
        if (event.type === gamejs.event.KEY_DOWN) {
            handlekeydown(event.key, mousepos)
        }
    })


    if (state.tokens.length < 30 && Math.random() < dt) {
        var tpos = function() { return [Math.random() * 600 - 300, Math.random() * 600 - 300] }
        var spawntoken = function(type, amt) {
            var token = (new type(amt)).attachto(state.critters).setstagepos(tpos())
            state.tokens.push(token)
            var i = (new Thing.Indicator(token, 5, "rgba(0,0,0,0.5)", null)).attachto(state.indicators)
        }
        if (state.currentlevel == 1) {
            if (Math.random() * 5 < 1) spawntoken(Thing.HealToken, 3)
        } else if (state.currentlevel == 2) {
            if (Math.random() * 10 < 1) spawntoken(Thing.HealToken, 3)
            if (Math.random() * 10 < 1) spawntoken(Thing.ManaToken, 3)
        } else if (state.currentlevel == 3) {
            if (Math.random() * 20 < 1) spawntoken(Thing.HealToken, 5)
            if (Math.random() * 20 < 1) spawntoken(Thing.ManaToken, 5)
        } else if (state.currentlevel == 4) {
            if (Math.random() * 20 < 1) spawntoken(Thing.HealToken, 10)
            if (Math.random() * 20 < 1) spawntoken(Thing.ManaToken, 10)
        } else if (state.currentlevel == 5) {
            if (Math.random() * 30 < 1) spawntoken(Thing.HealToken, 10)
            if (Math.random() * 30 < 1) spawntoken(Thing.ManaToken, 10)
        }
    }


    var castarea = null
    var selinfo = null
    if (state.selected.length == 1) {
        castarea = state.selected[0].getcastarea().attachto(state.indicators)
        selinfo = state.selected[0].getselinfo().attachto(state.HUD).setpos([0, 0])
    }

    selector = null
    if (dragpos && dragging) {
        var p1 = state.stage.togamepos(mousestart), p2 = state.stage.togamepos(mousepos)
        selector = (new Thing.Selector()).attachto(state.indicators).setends(p1, p2)
    }

    state.gameevents(dt)

    // FIXME
    //state.gameplay.think0(dt)
    state.stage.think(dt)
    state.critters.think0(dt)
    state.indicators.think0(dt)
    state.HUD.think0(dt)

    for (var j in state.players) {
        state.players[j].nab(state.tokens)
        state.players[j].considerattacking(state.monsters)
    }
    for (var j in state.hazards) {
        state.hazards[j].harm(state.players)
    }
    for (var j in state.mhazards) {
        state.mhazards[j].harm(state.monsters)
    }
    for (var j in state.monsters) {
        state.monsters[j].chooseprey(state.players)
    }
//    state.statusbox.update(state.xp + " XP")


    screen.fill("black")
    state.gameplay.draw0(screen)
    if (screen.boltage) {
        for (var j = 0 ; j < screen.boltage ; ++j) {
            screen.fill("rgba(255,255,255," + Math.random() + ")")
        }
        screen.boltage = 0
    }
    state.HUD.draw0(screen)

    if (selector) {
        selector.die()
    }
    if (castarea) {
        castarea.die()
    }
    if (selinfo) {
        selinfo.die()
    }

    state.filtergroups()

}


function init() {

    gamejs.display.setMode([854, 480])
/*
    backdropimg = new gamejs.Surface([854, 854])
    backdropimg.fill("#000088")
    var circ = new gamejs.Surface([100, 100])
    var carr = new gamejs.surfacearray.SurfaceArray(circ)
    for (var x = 0 ; x < 100 ; ++x) {
        for (var y = 0 ; y < 100 ; ++y) {
            var dx = x - 50, dy = y - 50
            var a = Math.floor(32 * Math.exp(-(dx * dx + dy * dy) / 400))
            carr.set(x, y, [0, 64, 0, a])
        }
    }
    gamejs.surfacearray.blitArray(circ, carr)
    circ = gamejs.transform.scale(circ, [300, 300])
    var rect = circ.getRect()
    for (var j = 0 ; j < 240 ; ++j) {
        var x = Math.random() * 854, y = Math.random() * 854, r = Math.random() * 100
        rect.center = [x, y]
        backdropimg.blit(circ, rect)
    }*/
    

    screen = gamejs.display.getSurface()
//    state.makelayers()
    state.loadlevel()

    gamejs.time.fpsCallback(think, null, 40)

}

// ls -1 img/*.png sound/*.ogg music/*.ogg | sed 's/^/    \"/;s/$/\",/'
gamejs.preload([
    "img/birdy-0.png",
    "img/birdy-1.png",
    "img/birdy-2.png",
    "img/birdy-3.png",
    "img/crystal-0.png",
    "img/dana-0.png",
//    "img/foots-0.png",
    "img/lisa-0.png",
    "img/lump-0.png",
    "img/mort-0.png",
//    "img/noggin-0.png",
//    "img/peepers-0.png",
    "img/rosa-0.png",
    "img/skull-0.png",
    "img/spike-0.png",
    "img/theo-0.png",
//    "img/vern-0.png",
    "img/zoltar-0.png",
    "img/zoltar-1.png",
    "music/boss-0.ogg",
    "music/boss-2.ogg",
//    "music/cutscene-0.ogg",
    "music/fast-0.ogg",
    "music/happy-0.ogg",
    "music/happy-1.ogg",
    "music/happy-2.ogg",
    "sound/boing-0.ogg",
//    "sound/cast-0.ogg",
//    "sound/cry-0.ogg",
    "sound/die-0.ogg",
//    "sound/ding-0.ogg",
//    "sound/klaxon-0.ogg",
    "sound/no-0.ogg",
    "sound/portal-0.ogg",
    "sound/powerup-0.ogg",
    "sound/quake-0.ogg",
    "sound/select-0.ogg",
    "sound/shine-0.ogg",
])


gamejs.ready(init)


}}, ["state", "sound", "gamejs", "Thing"]);