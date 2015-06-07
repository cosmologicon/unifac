<h1>Using UFX</h1>

UFX doesn't yet support any sophisticated include methods or minification. Just include whatever modules you want in your HTML with `script` tags.

```
<script src="UFX/ticker.js"></script>
<script src="UFX/Thing.js"></script>
<script src="UFX/scene.js"></script>
<script src="UFX/key.js"></script>
<script src="UFX/mouse.js"></script>
```

All UFX functionality is accessed through the `UFX` object. Most functionality within a given module is accessed through a sub-object named after that module, such as `UFX.ticker` or `UFX.Thing`.

<h1>UFX documentation module list</h1>



<h1>UFX documentation function list</h1>



# `UFX.scene`: scene management #

This section describes the basic usage of the `UFX.scene` module. It can also be used, along with `UFX.playback`, to record gameplay and play it back. This is an advanced topic, covered in [UFXPlaybacks](UFXPlaybacks.md).

This module is a lightweight framework for managing scenes. Scenes in UFX are the different modes that your game can be in. There's no strict rule for how you divide up different scenes, but generally it makes sense to divide it based on how input is handled. For instance, arrow keys might control the character in ActionScene but move the cursor in MenuScene. (In some other game engines, scenes are called contexts, but of course "context" already means something in HTML5.)

Scenes are kept in a scene stack. You can push a scene onto the stack, or pop the top scene off the stack. Each frame the topmost scene's corresponding methods will be called. Certain methods are also invoked whenever the stack is modified. A stack is a common way to manage scenes, but if your scene logic is really simple, you can just treat it as a stack of size 1, which is the current scene.

The object `UFX.scene` is an instance of `UFX.SceneStack`. If for some reason you want more than one scene stack, you can call `UFX.SceneStack` as a constructor, and use the functions listed here.

```
var myscenestack = UFX.SceneStack()
myscenestack.init()
myscenestack.push("menu")
```

## function `UFX.scene.init`: register scene methods ##

This method requires the `UFX.ticker` module. It registers the appropriate methods with `UFX.ticker` so that they'll be called once per frame. Can optionally specify a `maxups` and `minups` parameter, which are passed to `UFX.ticker.registersync`. If not provided, these default to 300 and 10, respectively.

```
UFX.scene.init()
```

## function `UFX.scene.top`: return the scene on top of the stack ##

```
var scene = UFX.scene.top()
```

Returns `null` if the stack is currently empty.

## functions `UFX.scene.push` and `UFX.scene.ipush`: add a scene to the stack ##

Push a scene onto the scene stack. The current scene on top of the stack (if it exists) has its `suspend` method called, if it exists. Then the new scene is pushed onto the stack and its `start` method is called, if it exists.

```
UFX.scene.push(NextScene)
```

You have the option of storing your scenes in the object `UFX.scenes`. If you do this, you refer to a scene by its key when you call `UFX.scene.push`.

```
UFX.scenes.next = NextScene
UFX.scene.push("next")
```

If any additional arguments are passed to `UFX.scene.push`, they will be passed to the new scene's `start` method.

```
UFX.scenes.action.start = function (level, difficulty) {
   ...
}
UFX.scene.push("action", 3, "easy")
```

Calls to `UFX.scene.push` are not applied immediately. They will be applied at the next call to `UFX.scene.think`. This is usually what you want. But if you want the push to take effect immediately, use `UFX.scene.ipush`.

```
UFX.scene.ipush(NextScene)
```

## functions `UFX.scene.pop` and `UFX.scene.ipop`: remove a scene from the stack ##

Pop a scene off the scene stack. The current scene's `stop` method is called, if it exists. Then it is removed from the top of the scene stack. If there's another scene on the stack, its `resume` method is called, if it exists.

```
UFX.scene.pop()
```

Calls to `UFX.scene.pop` are not applied immediately. They will be applied at the next call to `UFX.scene.think`. This is usually what you want. But if you want the pop to take effect immediately, use `UFX.scene.ipop`.

```
UFX.scene.ipop()
```

`UFX.scene.ipop` returns the scene that was popped off. `UFX.scene.pop` doesn't return anything.

## functions `UFX.scene.swap` and `UFX.scene.iswap`: replace the top scene ##

Replace the scene currently on top of the scene stack with another scene. The current scene's `stop` method is called, if it exists. The new scene's `start` method is then called, if it exists.

```
UFX.scene.swap(NextScene)
```

You have the option of storing your scenes in the object `UFX.scenes`. If you do this, you refer to a scene by its key when you call `UFX.scene.swap`.

```
UFX.scenes.next = NextScene
UFX.scene.swap("next")
```

This is similar to a call to `UFX.scene.pop` followed by a call to `UFX.scene.push`. The only difference is that scene underneath the current scene does not have its `resume` and `suspend` methods called.

If any additional arguments are passed to `UFX.scene.swap`, they will be passed to the new scene's `start` method.

Calls to `UFX.scene.swap` are not applied immediately. They will be applied at the next call to `UFX.scene.think`. This is usually what you want. But if you want the pop to take effect immediately, use `UFX.scene.iswap`.

```
UFX.scene.iswap(NextScene)
```

## function `UFX.scene.think`: update the current scene ##

The `think` method of the current scene will be called, if it exists. Any arguments passed to `UFX.scene.think` will be passed on to the scene's `think` method. If there are any queued stack updates, they will be resolved when this function is called, before calling `think` on the current scene.

```
UFX.scene.think(dt)
```

If you used `UFX.scene.init` then you do not have to call this function manually. It will automatically be called once per frame with a single argument `dt`, the time in seconds since the last update.

## function `UFX.scene.draw`: render the current scene ##

The `draw` method of the current scene will be called, if it exists. Any arguments passed to `UFX.scene.draw` will be passed on to the scene's `draw` method.

```
UFX.scene.draw()
```

If you used `UFX.scene.init` then you do not have to call this function manually. It will automatically be called once per frame with no arguments.

## Scene objects ##

A scene is an object that gets pushed onto the scene stack. You can generally just define it as a collection of methods.

```
var ActionScene = {
    start: function () {
        // startup logic here
    },
    think: function (dt) {
        // update game logic
    },
    draw: function () {
        // draw the scene
    },
}
UFX.scene.push(ActionScene)
```

Generally you won't manually call any of the methods that are used by `UFX.scene`; they'll be called automatically. You can also of course define your own methods and members:

```
    draw: function () {
        this.drawbackground()
        this.drawsprites()
    },
    drawbackground: function () {
        // ....
    },
    drawsprites: function () {
        // ....
    },
```

The methods that are used by `UFX.scene` are: `startargs`, `start`, `thinkargs`, `think`, `draw`, `suspend`, `resume`, and `stop`. None of these are required. Any missing methods are simply skipped. With the exception of `startargs` and `thinkargs`, these methods should not return anything.

You can optionally define a scene as an element of `UFX.scenes`. This lets you refer to it by key name when pushing it onto the scene stack.

```
UFX.scenes.action = {
    start: function () {
        // startup logic here
    },
    think: function (dt) {
        // update game logic
    },
    draw: function () {
        // draw the scene
    },
}
UFX.scene.push("action")
```

### function `Scene.start`: begin scene ###

Called when this scene is first pushed onto the stack. This method can take any number of arguments, which are passed in via the call to `UFX.scene.push` or `UFX.scene.swap`.

### function `Scene.think`: update ###

Called for the scene on top of the stack whenever `UFX.scene.think` is called. This method can take any number of arguments, which are passed in via the call to `UFX.scene.think`. If you used `UFX.scene.init`, then this will be called once per frame with a single argument `dt`.

### function `Scene.draw`: render ###

Called for the scene on top of the stack whenever `UFX.scene.draw` is called. This method can take any number of arguments, which are passed in via the call to `UFX.scene.draw`. If you used `UFX.scene.init`, then this will be called once per frame with no arguments.

### function `Scene.suspend`: suspend scene ###

Called when another scene is pushed on top of this one. Takes no arguments.

### function `Scene.resume`: resume scene ###

Called when another scene is popped off of this one, and this one is once again the top scene on the stack. Takes no arguments.

### function `Scene.stop`: stop scene ###

Called when this scene is popped off the stack. Takes no arguments.

### function `Scene.startargs`: provide arguments for `Scene.start` ###

This method is for advanced use. Please see UFXPlaybacks for more information.

### function `Scene.thinkargs`: provide arguments for `Scene.think` ###

This method is for advanced use. Please see UFXPlaybacks for more information.

# `UFX.key`: handle keyboard input #

Javascript's standard key handling is event-based (asynchronous). Generally for fast-paced games, you would prefer synchronous handling, so you can take care of key presses at a specific place in your event loop. The `UFX.key` module queues up key-related events, so that you can handle them whenever you're ready. It also provides a convenient way to access "combos", meaning sets of keys that are pressed at roughly the same time.

If you're not using an event loop, or you want asynchronous key handling for some other reason, it's probably better to use Javascript's built-in key event handlers.

## function `UFX.key.init`: start handling key events ##

Call this function once when you're ready to start taking key input. If you want to stop again, use `UFX.key.active`.

This function takes one optional argument, which is the DOM object to which you want to bind the key event handlers. Unfortunately it doesn't work like I thought it would (you can't bind to the canvas and only capture key presses when the canvas has focus) so I'm not sure that this is a useful feature. By default the key event handlers are associated with `document`.

```
UFX.key.init()
```

## boolean `UFX.key.active`: control overall functioning ##

Set this to `false` to disable any functioning by `UFX.key`. You can set it to `true` again at any time to resume functioning. Defaults to `true`.

```
UFX.key.active = true
```

## object `UFX.key.ispressed`: array of currently pressed keys ##

Use this associative array to determine whether a key is currently being held down. Lookup is done by name. For instance, if the space bar is currently being held down, then `UFX.key.ispressed.space` will be defined and truthy (specifically, it's the key down event). Otherwise it will be undefined.

This operates by keeping track of key down events and corresponding key up events. If, for some reason, the key up event is not registered with UFX, then UFX will think that the key is still held down until it's pressed again.

`UFX.key.ispressed` operates independently from the event queue. It's not necessary to have `UFX.key.qdown` or `UFX.key.qup` be true for it to work.

Key names are defined in `UFX.key.map` and can be changed. If `UFX.key.watchlist` is set, then only keys being watched will appear in `UFX.key.ispressed`.

```
if (UFX.key.ispressed.right) runright()
```

## object `UFX.key.codepressed`: array of currently pressed key codes ##

This associative array acts just like `UFX.key.ispressed`, except that lookup is done by numerical key code.

```
if (UFX.key.ispressed[39]) runright()
```

## function `UFX.key.events`: get queued events ##

Returns an array of events on the event queue, and clears the queue. It's probably a good idea to call this function (or `UFX.key.clearevents`) periodically even if you're not actively using key events, to prevent the event queue from growing huge.

Key events correspond to either a key being pressed (down) or a key being released (up). They have the following attributes:

  * `type`: a string, either `down` or `up`
  * `code`: a number, the key code, such as `32`
  * `name`: a string, the key name, such as `space`
  * `time`: a number, the Javascript timestamp of the event
  * `baseevent`: the corresponding Javascript event

Key up events also have the following attribute:

  * `dt`: a number, the time (in milliseconds) that the key was pressed for

```
UFX.key.events().forEach(function (event) {
    if (event.type == "down" && event.name == "space") {
        jump()
    }
})
```

## function `UFX.key.clearevents`: clear event queue ##

Clears the event queue, but doesn't return anything. It's not necessary to call this function if you're calling `UFX.key.events`.

```
UFX.key.clearevents()
```

## object `UFX.key.map`: map from key codes to key names ##

An associative array mapping key codes (such as `32`) to recognizable names (such as `space`). These names are used in events returned from `UFX.key.events` and in `UFX.key.ispressed`, and the entries in `UFX.key.watchlist` are compared against `UFX.key.map` to determine whether a key is watched.

You can just overwrite the names for the keys if you don't like the ones I chose.

Any key whose code does not appear in `UFX.key.map` will use a default name in place of the key name whenever it needs one. For instance, a key with code `777` would have a default name of `key#777`.

```
UFX.key.map[13] = "return"  // changing from the default of "enter"
// Change all letter key names from uppercase to lowercase
for (var j = 65 ; j < 91 ; ++j) {
    UFX.key.map[j] = UFX.key.map[j].toLowerCase()
}
```

## array `UFX.key.watchlist`: deal only with certain keys ##

Set this to a list of key names you want to watch. Every other key will be ignored by `UFX.key`, and its default behavior will occur. Set this to `null` if you want to watch all keys. Defaults to `null`.

```
// watch only arrow keys and space bar
UFX.key.watchlist = "up down left right space".split()
```

## boolean `UFX.key.capture`: prevent default behavior ##

Generally if you're going to handle a key press you want to prevent its default behavior in the browser (for instance, you don't want the page to scroll when an arrow key is pressed if it controls the game). Set this to `false` if you don't want to prevent the default behavior. Defaults to `true`.

```
UFX.key.capture = true
```

## boolean `UFX.key.qdown`: enqueue key down events ##

Set this to `false` if you don't want `UFX.key` to record events when a key is pressed. Defaults to `true`.

```
UFX.key.qdown = false
```

## boolean `UFX.key.qup`: enqueue key down events ##

Set this to `false` if you don't want `UFX.key` to record events when a key is released. Defaults to `true`.

```
UFX.key.qup = false
```

Up and down events are the only types of events returned by `UFX.key.events`. If you only use one or the other, disabling the other one will mean you don't need to check `event.type`.

## function `UFX.key.combos`: get queued combos ##

A combo in `UFX.key` is defined as a set of keys that are pressed at roughly the same time. This is useful, for instance, if you have grid-based motion and you want to distinguish the combo "up+left" from "up" and "left" separately.

Combo events have the following attributes:

  * `keys`: A sorted list of names of the keys in the combo, such as `['left', 'up']`
  * `kstring`: The same list join with spaces into a single string, such as `'left up'`
  * time: a number, the timestamp of the first key down event in the combo

```
UFX.key.combos().forEach(function (combo) {
    if (combo.kstring === "shift space") {
        firelasers()
    }
})
```

## function `UFX.key.clearcombos`: clear combo queue ##

Clears the combo queue, but doesn't return anything. You don't need to call this if you're calling `UFX.key.combos`.

```
UFX.key.clearcombos()
```

## boolean `UFX.key.qcombo`: enqueue key down events ##

Combos are disabled by default. Set this to `true` to enable them.

```
UFX.key.qcombo = true
```

## number `UFX.key.combodt`: combo duration ##

The maximum amount of time (in milliseconds) between the first key press in a combo and the last key press. Defaults to `100`. This also controls how quickly combo events are registered. If it's set to 100, then a combo event will not be added to the queue until 100 milliseconds have passed, since there's no way to know if more keys will be pressed before then.

```
UFX.key.combodt = 50  // Less forgiving
```


# `UFX.mouse`: handle mouse events #

Javascript's standard mouse handling is event-based (asynchronous). Generally for fast-paced games, you would prefer synchronous handling, so you can take care of mouse motion and clicks at a specific place in your event loop. The `UFX.mouse` module queues up mouse-related events, so that you can handle them whenever you're ready. This is also useful if you want to serialize user input to make playbacks (see `UFX.playback`).

If you're not using an event loop, or you want asynchronous mouse handling for some other reason, it's probably better to use JavaScript's built-in mouse event handlers.

## function `UFX.mouse.init`: begin handling mouse events ##

Call this function once when you're ready to start capturing mouse events. If you want to stop again, set `UFX.mouse.active` to `false`.

This function takes an optional argument, which should be a DOM element, and which defaults to `document`. It's the element whose position is used to calculate the position of the mouse. The upper-left corner of this element will be the origin for mouse events.

Typically, if you're using a canvas, you pass in the canvas element.

```
UFX.mouse.init(document.getElementById("mycanvas"))
```

If the element has `style.width` or `style.height` values set, `UFX.mouse` will only transform the mouse position correctly if these values are in pixel amounts, such as `canvas.style.width = "800px"`. In particular, it will transform correctly when the canvas is adjusted using `UFX.maximize`.

If you feel the need to specify the canvas CSS width as `"40em"` or `100%` or something like that, and you need accurate mouse positions, you're on your own.

## function `UFX.mouse.state`: summarize mouse state ##

This function returns a convenient object that summarizes the mouse state since the last time it was called. The simplest, recommended usage of `UFX.mouse` is to call this function once per frame and use resulting object. Calling `UFX.mouse.state` will also clear the event queue, so it's not recommended to use both this function and `UFX.mouse.events`.

The exact form of the returned object depends on which `UFX.mouse` options are enabled. Generally you enable or disable options by setting flags - see `UFX.mouse.capture`, `UFX.mouse.qdown`, `UFX.mouse.qup`, `UFX.mouse.qclick`, and `UFX.mouse.watchdrag`.

The returned object is JSONable, which is important for saving playbacks with `UFX.playback`.

```
var mstate = UFX.mouse.state()
```

The elements of the `mstate` object after this call are:

  * `mstate.pos`: 2-element Array giving the current positions of the mouse, or `null` if no event have occurred yet.
  * `mstate.dpos`: 2-element Array giving the change in the position of the mouse since the last call (defaults to `[0, 0]`)
  * `mstate.left`: object summarizing the left mouse button. Will not be present if `UFX.mouse.capture.left` is set to `false`
  * `mstate.right`: similar to `mstate.left` for the right mouse button. Will only be present if `UFX.mouse.capture.right` is set to `true`
  * `mstate.middle`: similar to `mstate.left` for the middle mouse button. Will only be present if `UFX.mouse.capture.middle` is set to `true`
  * `mstate.wheeldy`: Amount of scrolling on the mouse wheel since the last call. Will only be present if `UFX.mouse.capture.wheel` is set to `true`

The elements `mstate.left`, `mstate.right`, and `mstate.middle` are themselves objects. The elements of `mstate.left` are (and the other two are similar):

  * `mstate.left.isdown`: is the left mouse button currently held down?
  * `mstate.left.down`: was a mousedown event registered with the left mouse button since the last update? Will not be present if `UFX.mouse.qdown` is set to `false`.
  * `mstate.left.up`: similar to `mstate.left.down` but for mouseup events. Will not be present if `UFX.mouse.qup` is set to `false`.
  * `mstate.left.click`: similar to `mstate.left.down` but for click events. Will only be present if `UFX.mouse.qclick` is set to `true`

If truthy, the elements `mstate.left.down`, `mstate.left.up`, and `mstate.left.click` will be the mouse position of the corresponding events.

If `UFX.mouse.watchdrag` is `true` and the left mouse button is currently held down, then the following elements will also be present:

  * `mstate.left.dx`: Total net x motion since the left mouse button was held down
  * `mstate.left.dy`: Total net y motion since the left mouse button was held down
  * `mstate.left.dt`: Total time since the left mouse button was held down (milliseconds)

Note that it's possible to miss events that happen very quickly. If two mouse down event occur during one frame, there's no indication that more than one happened. If you need to make sure to capture very rapid events, use `UFX.mouse.events` instead of `UFX.mouse.state`.

Generally, any falsy elements of `mstate` will be undefined, to cut down on JSON size.

```
var mstate = UFX.mouse.state()
if (mstate.left.down) {
    handleclick(mstate.left.down)
}
if (mstate.left.isdown) {
    handledrag(mstate.dpos)
}
scroll(mstate.wheeldy)
drawcursor(mstate.pos)
```

## boolean `UFX.mouse.active`: enable or disable overall functioning ##

Set this to `false` to disable all functioning by `UFX.mouse`. You can set it to `true` again at any time to resume functioning. Defaults to `true`.

```
UFX.mouse.active = true
```

## array `UFX.mouse.pos`: current mouse position ##

A continuously-updated 2-element Array. May be `null` if no events have occurred yet.

```
if (UFX.mouse.pos) {
    mousex = UFX.mouse.pos[0]
    mousey = UFX.mouse.pos[1]
}
```

## object `UFX.mouse.drag`: mouse drag information ##

An object with information on the current drag events (ie mouse downs whose corresponding mouse up has not happened yet). `UFX.mouse.drag.left`, `UFX.mouse.drag.right`, and `UFX.mouse.drag.middle` will only be defined if the corresponding mouse button is currently being held down, and the corresponding element of `UFX.mouse.capture` is true, and `UFX.mouse.watchdrag` is true.

Useful elements of `UFX.mouse.drag.left` are, when present:

  * `pos0`: The mouse position where the drag started
  * `pos`: The current mouse position
  * `dx`: Net change in x mouse position during the drag
  * `dy`: Net change in y mouse position during the drag
  * `t0`: Starting timestamp of drag
  * `dt`: Total duration of drag so far (milliseconds)

`UFX.mouse.drag` is not JSONable.

```
if (UFX.mouse.drag.left) {
    drawline(UFX.mouse.drag.left.pos0, UFX.mouse.drag.left.pos)
}
```

## boolean `UFX.mouse.qdown`: handle mouse down events ##

Set this to `false` if you don't want to capture mouse down events. Defaults to `true`.

```
UFX.mouse.qdown = false
```

## boolean `UFX.mouse.qup`: handle mouse up events ##

Set this to `true` if you want to capture mouse up events. Defaults to `false`.

```
UFX.mouse.qup = true
```

## boolean `UFX.mouse.qclick`: handle click events ##

Set this to `true` if you want to capture mouse click events. Defaults to `false`. Make sure you know what you're doing if you're capturing both mouseup and click events, because I don't know why you'd want to do that.

```
UFX.mouse.qclick = true
```

## object `UFX.mouse.capture`: which mouse buttons to watch ##

Object with boolean elements `left`, `right`, `middle`, and `wheel`. Set them to `true` or `false` as desired to capture corresponding mouse events. By default only `UFX.mouse.capture.left` is `true`, the rest are `false`.

```
UFX.mouse.capture.right = true
UFX.mouse.capture.wheel = true
```

## boolean `UFX.mouse.watchdrag`: watch for mouse drags ##

Set this to `false` if you want to ignore mouse drags. Defaults to `true`. Note that disabling this won't change which DOM events are captured. It simply prevents `UFX.mouse.drag` from being updated, as well as the drag information returned by `UFX.mouse.state`.

```
UFX.mouse.watchdrag = false
```

## function `UFX.mouse.events`: get enqueued events ##

Returns an array of event objects, each of which represents a mouse event that's happened since the last call to `UFX.mouse.events` or `UFX.mouse.state`. The events that are returned depend on which events are being watched, which is determined by `UFX.mouse.capture`, `UFX.mouse.qdown`, etc. It's not recommended to use both this function and `UFX.mouse.state`.

The event objects have the following properties:

  * `type`: A string, one of `"click"`, `"up"`, `"down"`, or `"wheel"`.
  * `pos`: A 2-element array of the mouse position when the event occurred.
  * `time`: The timestamp when the event occurred.
  * `button`: The mouse button that caused the event. A number `0`, `1`, or `2` representing the left, middle, or right mouse button. Not defined for events of type `wheel`.
  * `dy`: The amount of wheel motion of the event. Only defined for events of type `wheel`.
  * `event`: The underlying DOM event object.

If `UFX.mouse.watchdrag` is `true` and there was a corresponding mouse down event, events of type `up` have additional properties that describe the entire drag distance and duration between mouse down and mouse up:

  * `pos0`: Position of mouse down event
  * `dx`: Net change in x position
  * `dy`: Net change in y position
  * `t0`: Timestamp of mouse down event
  * `dt`: Time between mouse down and mouse up (milliseconds)

```
UFX.mouse.events.forEach(function (event) {
    if (event.type == "down") attackat(event.pos)
    if (event.type == "wheel") zoom(event.dy)
})
```

# `UFX.draw`: convenience functions for 2d context #

HTML5 drawing primitives are issued to a context object that's created from the canvas element. These are pretty powerful and UFX encourages their use. The only downside is that they're kind of verbose. The `UFX.draw` module simply offers a few shorthands to make a series of calls to a context's methods. Here's an example:

```
UFX.draw(context, "ss black fs rgb(0,0,200) ( m 0 100 l 100 -50 l -100 -50 ) f s")
```

This is a shorthand for the following series of calls:

```
context.strokeStyle = "black"
context.fillStyle = "rgb(0,0,200)"
context.beginPath()
context.moveTo(0, 100)
context.lineTo(100, -50)
context.lineTo(-100, -50)
context.closePath()
context.fill()
context.stroke()
```

## function `UFX.draw`: invoke context methods ##

A call to `UFX.draw` will apply one or more methods on the specified context object. There are three ways to specify the context object:

  1. Pass it as the first argument to `UFX.draw`.
  1. Register it with `UFX.draw` by passing it to a call to `UFX.draw.setcontext`. After you do this, all calls to `UFX.draw` that don't get passed a context object will default to the registered context.
  1. Extend the context with a call to `UFX.draw.extend` and then call it as a method on the context object itself.

Each of these ways of specifying the context object will also work on other methods in the `UFX.draw` module, such as `UFX.draw.lingrad`. Here are examples of each of the three ways:

```
// Draw to context1 by passing it as an argument
UFX.draw(context1, "fr 0 0 100 100")
UFX.draw(context1, "sr 0 0 100 100")

// Draw to context2 by setting it to the default context
UFX.draw.setcontext(context2)
UFX.draw("fr 0 0 100 100")
UFX.draw("sr 0 0 100 100")

// Draw to context3 by extending it and calling its draw method
UFX.draw.extend(context3)
context3.draw("fr 0 0 100 100")
context3.draw("sr 0 0 100 100")
```

`UFX.draw` takes one or more additional arguments. These arguments contain tokens that tell `UFX.draw` which context methods to invoke, and the arguments for those methods. Arguments can be strings, numbers, or arrays (or in some cases gradient objects). Strings are treated as space-separated sequences of tokens. Arrays can contain strings, numbers, or other arrays. All strings are case-insensitive.

```
var x = 50, y = 80, p = [x, y], color = "blue"

// These are all equivalent
UFX.draw(context, "ss blue b m 50 80 l 80 50 s")
UFX.draw(context, "ss blue b m", x, y, "l", 80, 50, "s")
UFX.draw(context, "ss", color, "b m", p, "l 80 50", "s")
UFX.draw(context, "ss blue b", ["m 50", 80, "l"], y, [x, "s"])
UFX.draw(context, [["ss", "blue"], ["b"], ["m", p], ["l", 80, 50], ["s"]])
```

Most arguments will be strings and numbers, as in this example. One exception is the `fs` and `ss` tokens, to which you can pass any object that can be assigned to `context.fillStyle` and `context.strokeStyle`, such as gradient objects.

The syntax for the string argument is based on the specification for SVG paths, but it's not identical to it. To improve parsing efficiency, spaces are not optional: `"(l0 100)f"` is not a valid replacement for `"( l 0 100 ) f"`. Arguments that could normally be written with spaces must be written without spaces when passed to `UFX.draw`: `"fs rgb(0, 0, 100)"` is not a valid replacement for `"fs rgb(0,0,100)"`.

Each token is followed by a certain number of arguments. Arguments are never optional, and each token must be followed by the exact number of arguments it expects.

## `UFX.draw` token list ##

Most common tokens have two forms: the full method name, or a 1- or 2-letter short form. All tokens are case-insensitive.

### Path tokens ###

| **token** | **args** | **equivalent method call** |
|:----------|:---------|:---------------------------|
| `beginpath` or `b` or `(` | 0        | `beginPath()`              |
| `closepath` or `)` | 0        | `closePath()`              |
| `moveto` or `m` | 2        | `moveTo(x, y)`             |
| `lineto` or `l` | 2        | `lineTo(x, y)`             |
| `quadraticcurveto` or `q` | 4        | `quadraticCurveTo(x0, y0, x1, y1)` |
| `beziercuverto` or `c` | 6        | `bezierCurveTo(x0, y0, x1, y1, x2, y2)` |
| `arc` or `a` | 5        | `arc(x, y, r, A0, A1, true)` |
| `antiarc` or `aa` | 5        | `arc(x, y, r, A0, A1, false)` |
| `arcto`   | 5        | `arcTo(x1, y1, x2, y2, r)` |
| `o` or `circle` | 3        | `arc(x, y, r, 0, 2*Math.PI)` |
| `rr` or `roundedrect` | 5        | args are: `x, y, w, h, r`  |

### Styling tokens ###

| **token** | **args** | **equivalent method call** |
|:----------|:---------|:---------------------------|
| `fs` or `fillstyle` | 1        | `fillStyle = s`            |
| `ss` or `strokestyle` | 1        | `strokeStyle = s`          |
| `lw` or `linewidth` | 1        | `lineWidth = w`            |
| `lc` or `linecap` | 1        | `lineCap = s`              |
| `al` or `alpha` or `globalalpha` | 1        | `globalAlpha = a`          |
| `textalign` | 1        | `textAlign = s`            |
| `textbaseline` | 1        | `textBaseline = s`         |
| `shb` or `shadowblur` | 1        | `shadowBlur = s`           |
| `shc` or `shadowcolor` | 1        | `shadowColor = s`          |
| `shx` or `shadowx` or `shadowoffsetx` | 1        | `shadowOffsetX = x`        |
| `shy` or `shadowy` or `shadowoffsety` | 1        | `shadowOffsetY = y`        |
| `shxy` or `shadowxy` or `shadowoffsetxy` | 2        | `shadowOffsetX = x`<br><code>shadowOffsetY = y</code> <br>
<tr><td> <code>sh</code> or <code>shadow</code> </td><td> 4        </td><td> <code>shadowColor = c</code><br><code>shadowOffsetX = x</code><br><code>shadowOffsetY = y</code><br><code>shadowBlur = b</code> </td></tr></tbody></table>

<h3>Action tokens</h3>

<table><thead><th> <b>token</b> </th><th> <b>args</b> </th><th> <b>equivalent method call</b> </th></thead><tbody>
<tr><td> <code>f</code> or <code>fill</code> </td><td> 0           </td><td> <code>fill()</code>           </td></tr>
<tr><td> <code>s</code> or <code>stroke</code> </td><td> 0           </td><td> <code>stroke()</code>         </td></tr>
<tr><td> <code>fr</code> or <code>fillrect</code> </td><td> 4           </td><td> <code>fillRect(x, y, w, h)</code> </td></tr>
<tr><td> <code>sr</code> or <code>strokerect</code> </td><td> 4           </td><td> <code>strokeRect(x, y, w, h)</code> </td></tr>
<tr><td> <code>cr</code> or <code>clearrect</code> </td><td> 4           </td><td> <code>clearRect(x, y, w, h)</code> </td></tr>
<tr><td> <code>clip</code> </td><td> 0           </td><td> <code>clip()</code>           </td></tr>
<tr><td> <code>f0</code> or <code>fillall</code> </td><td> 0           </td><td> <code>fillRect(0, 0, canvas.width, canvas.height)</code> </td></tr>
<tr><td> <code>c0</code> or <code>clearall</code> </td><td> 0           </td><td> <code>clearRect(0, 0, canvas.width, canvas.height)</code> </td></tr>
<tr><td> <code>drawimage</code> </td><td> 3           </td><td> <code>drawImage(img, x, y)</code> </td></tr>
<tr><td> <code>drawimage0</code> </td><td> 1           </td><td> <code>drawImage(img, 0, 0)</code> </td></tr></tbody></table>

The <code>fillall</code> and <code>clearall</code> tokens are meant to be shorthand for filling and clearing the entire canvas. Note that this won't necessarily work if there's currently a transformation in place.<br>
<br>
<h3>Text rendering tokens</h3>

<table><thead><th> <code>font</code> </th><th> 1 </th><th> <code>font = f</code> </th></thead><tbody>
<tr><td> <code>ft</code> or <code>filltext</code> </td><td> 3 </td><td> <code>fillText(text, x, y)</code> </td></tr>
<tr><td> <code>ft0</code> or <code>filltext0</code> </td><td> 1 </td><td> <code>fillText(text, 0, 0)</code> </td></tr>
<tr><td> <code>st</code> or <code>stroketext</code> </td><td> 3 </td><td> <code>strokeText(text, x, y)</code> </td></tr>
<tr><td> <code>st0</code> or <code>stroketext0</code> </td><td> 1 </td><td> <code>strokeText(text, 0, 0)</code> </td></tr>
<tr><td> <code>fst</code> or <code>fillstroketext</code> </td><td> 3 </td><td> <code>fillText(text, x, y) ; strokeText(text, x, y)</code> </td></tr>
<tr><td> <code>fst0</code> or <code>fillstroketext0</code> </td><td> 1 </td><td> <code>fillText(text, 0, 0) ; strokeText(text, 0, 0)</code> </td></tr></tbody></table>

Note that you <i>cannot</i> put spaces in token arguments. Not even if you put them in quotes. Because fonts and text often need to have spaces, for these arguments, tildes (<code>~</code>) will be replaced with spaces before applying:<br>
<br>
<pre><code>UFX.draw(context, "font 20px~'Contrail~One' ft Hello~world! 200 100")<br>
// equivalent to:<br>
context.font = "20px 'Contrail One'"<br>
context.fillText("Hello world!", 200, 100)<br>
</code></pre>

<h3>Transformation tokens</h3>

<table><thead><th> <b>token</b> </th><th> <b>args</b> </th><th> <b>equivalent method call</b> </th></thead><tbody>
<tr><td> <code>[</code> or <code>save</code> </td><td> 0           </td><td> <code>save()</code>           </td></tr>
<tr><td> <code>]</code> or <code>restore</code> </td><td> 0           </td><td> <code>restore()</code>        </td></tr>
<tr><td> <code>t</code> or <code>translate</code> </td><td> 2           </td><td> <code>translate(dx, dy)</code> </td></tr>
<tr><td> <code>r</code> or <code>rotate</code> </td><td> 1           </td><td> <code>rotate(A)</code>        </td></tr>
<tr><td> <code>z</code> or <code>scale</code> </td><td> 2           </td><td> <code>scale(sx, sy)</code>    </td></tr>
<tr><td> <code>zx</code> or <code>xscale</code> </td><td> 1           </td><td> <code>scale(sx, 1)</code>     </td></tr>
<tr><td> <code>zy</code> or <code>yscale</code> </td><td> 1           </td><td> <code>scale(1, sy)</code>     </td></tr>
<tr><td> <code>hflip</code> </td><td> 0           </td><td> <code>scale(-1, 1)</code>     </td></tr>
<tr><td> <code>vflip</code> </td><td> 0           </td><td> <code>scale(1, -1)</code>     </td></tr>
<tr><td> <code>x</code> or <code>transform</code> </td><td> 6           </td><td> <code>transform(m11, m12, m21, m22, dx, dy)</code> </td></tr>
<tr><td> <code>xshear</code> </td><td> 1           </td><td> <code>transform(1, 0, m21, 1, 0, 0)</code> </td></tr>
<tr><td> <code>yshear</code> </td><td> 1           </td><td> <code>transform(1, m12, 0, 1, 0, 0)</code> </td></tr></tbody></table>

<h2>function <code>UFX.draw.circle</code>: fill/stroke a circle</h2>

<h2>function <code>UFX.draw.lingrad</code>: create a linear gradient</h2>

This is a shorthand for calling <code>context.createLinearGradient</code>, followed by any number of calls to <code>gradient.addColorStop</code>. It takes at least 4 arguments.<br>
<br>
<pre><code>var grad = UFX.draw.lingrad(context, 0, 0, 300, 150, 0, "red", 0.5, "blue", 1, "rgba(0,0,255,0.5)")<br>
</code></pre>

is equivalent to:<br>
<br>
<pre><code>var grad = context.createLinearGradient(0, 0, 300, 150)<br>
grad.addColorStop(0, "red")<br>
grad.addColorStop(0.5, "blue")<br>
grad.addColorStop(1, "rgba(0,0,255,0.5)")<br>
</code></pre>

The context on which <code>createLinearGradient</code> is called can be specified in any of the 3 ways that it can be specified for <code>UFX.draw</code>. However, this function does not support array arguments or space-separated-string arguments like <code>UFX.draw</code> does.<br>
<br>
<h2>function <code>UFX.draw.radgrad</code>: create a radial gradient</h2>

This is a shorthand for calling <code>context.createRadialGradient</code>, followed by any number of calls to <code>gradient.addColorStop</code>. It takes at least 6 arguments.<br>
<br>
<pre><code>var grad = UFX.draw.radgrad(context, 0, 0, 0, 300, 0, 500, "red", 0.5, "blue", 1, "rgba(0,0,255,0.5)")<br>
</code></pre>

is equivalent to:<br>
<br>
<pre><code>var grad = context.createRadialGradient(0, 0, 0, 300, 0, 500)<br>
grad.addColorStop(0, "red")<br>
grad.addColorStop(0.5, "blue")<br>
grad.addColorStop(1, "rgba(0,0,255,0.5)")<br>
</code></pre>

The context on which <code>createRadialGradient</code> is called can be specified in any of the 3 ways that it can be specified for <code>UFX.draw</code>. However, this function does not support array arguments or space-separated-string arguments like <code>UFX.draw</code> does.<br>
<br>
<h1><code>UFX.Thing</code>: component-based entities</h1>

This module implements a component-based entity system. For more information, especially if you are unfamiliar with component-based systems, please see <a href='UFXComponentModel.md'>UFXComponentModel</a>.<br>
<br>
Components in UFX are implemented as objects with one or more methods. The components themselves cannot have any members. When an entity's method is invoked, it invokes the method of every component with a method by that name.<br>
<br>
<pre><code>// Define two components<br>
var HasHealthPoints = {<br>
    init: function (health) {<br>
        this.health = health<br>
    },<br>
    takedamage: function (damage) {<br>
        this.health -= damage<br>
    },<br>
}<br>
var MakesNoise = {<br>
    jump: function () {<br>
        playsound("boing")<br>
    },<br>
    takedamage: function () {<br>
        playsound("ouch")<br>
    },<br>
}<br>
<br>
// Define an entity with these two components<br>
var player = UFX.Thing()<br>
player.addcomp(HasHealthPoints, 100)<br>
player.addcomp(MakesNoise)<br>
player.takedamage(10)  // invokes both HasHealthPoints.takedamage and<br>
                       //   MakesNoise.takedamage<br>
</code></pre>

A component method named <code>init</code> is called when it's added to the entity, and a method named <code>remove</code> is called when it's removed from the entity. Other than that, component methods can have any name except <code>definemethod</code>, <code>addcomp</code>, or <code>removecomp</code>.<br>
<br>
For more details and examples, please see <a href='UFXComponentModel.md'>UFXComponentModel</a>.<br>
<br>
<h2>function <code>UFX.Thing</code>: construct an entity</h2>

Call <code>UFX.Thing</code> as a constructor for a component-based entity. When first constructed, an entity has no useful methods except <code>addcomp</code>. Methods that give the entity functionality will be added dynamically when the components are added.<br>
<br>
The constructor can take any number of arguments, which are components that are immediately added to the entity.<br>
<br>
<pre><code>var player = UFX.Thing(MakesNoise)<br>
</code></pre>

<h2>function <code>UFX.Thing.addcomp</code>: add a component</h2>

Add a component to the entity, giving the entity the functionality associated with that component. The <code>init</code> method of the component is immediately called, if it exists. Any additional arguments passed to <code>addcomp</code> are passed on to the component's <code>init</code> method.<br>
<br>
<code>addcomp</code> returns the entity, so that calls to it can be easily chained:<br>
<br>
<pre><code>var player = UFX.Thing()<br>
                .addcomp(HasHealthPoints, 100)<br>
                .addcomp(MakesNoise)<br>
</code></pre>

<h2>function <code>UFX.Thing.definemethod</code>: add an empty method</h2>

If you have an entity <code>player</code>, and you don't add any components with a <code>think</code> method to it, then <code>player.think</code> will be undefined, and invoking it will cause an error. <code>definemethod</code> allows you to create an empty, placeholder method that does nothing and returns <code>undefined</code>.<br>
<br>
<pre><code>player.definemethod("think")<br>
player.think()  // will not cause an error<br>
</code></pre>

If you want, you can also define the method yourself, but this will then cause an error if you try to add any components with that method to the entity:<br>
<br>
<pre><code>var KeepTime = {<br>
    init: function () { this.t = 0 },<br>
    think: function (dt) { this.t += dt },<br>
}<br>
<br>
player1.think = function () {}<br>
player1.addcomp(KeepTime)  // error!<br>
<br>
player2.definemethod("think")<br>
player2.addcomp(KeepTime)  // behaves as expected<br>
</code></pre>

Calling <code>definemethod</code> with a method name that already has been added to the entity does nothing.<br>
<br>
<code>definemethod</code> returns the entity, so that it can be chained.<br>
<br>
<h2>function <code>UFX.Thing.removecomp</code>: remove a component</h2>

Remove a component's functionality from an entity. The <code>remove</code> method of the component is immediately called, if it exists. Any additional arguments passed to <code>removecomp</code> are passed on to the component's <code>remove</code> method. Returns the entity.<br>
<br>
<pre><code>player.removecomp(MakesNoise)<br>
</code></pre>

Using <code>removecomp</code> is generally discouraged, and there are several caveats associated with it. See <a href='UFXComponentModel#Removing_Components.md'>Removing components</a>

<h1><code>UFX.random</code>: generate pseudorandom numbers</h1>

Pseudorandom number generator, offering two things that the built-in <code>Math.random</code> does not. First, you can manually seed the RNG, so that you can generate the same sequence of random numbers more than once. This is important for certain procedural content generation techniques, and game replays. Second, there are a few convenience functions related to random numbers.<br>
<br>
If you don't need either of these things, feel free to use <code>Math.random</code>.<br>
<br>
The RNG is a fast linear congruential generator (LCG). This is suitable for most video games, but not suitable for simulations for research purposes, or for cryptography.<br>
<br>
<h2>function <code>UFX.random</code>: generate floating-point random numbers</h2>

Generate a floating-point number within a given range. With no arguments, generate a number in the half-open range [0,1), just like <code>Math.random</code>. With one argument, generate a number in the range [0,a). With two arguments, generate a number in the range [a,b).<br>
<br>
<pre><code>var x = UFX.random()         // x is between 0 and 1<br>
var y = UFX.random(10)       // y is between 0 and 10<br>
var z = UFX.random(-20, 20)  // z is between -20 and 20<br>
</code></pre>

<h2>function <code>UFX.random.rand</code>: generate integer random numbers</h2>

Generate an integer within a given range. Ranges are <b>half-open</b>, just like with <code>UFX.random</code>. The result <b>cannot</b> take the upper value of the range. With no arguments, the range is the entire range of possible random numbers.<br>
<br>
<pre><code>var x = UFX.random.rand()         // x is an integer and 0 &lt;= x &lt; 4294967296<br>
var y = UFX.random.rand(10)       // y is an integer and 0 &lt;= y &lt; 10<br>
var z = UFX.random.rand(-20, 20)  // z in an integer and -20 &lt;= z &lt; 20<br>
</code></pre>

<h2>number <code>UFX.random.seed</code>: manually seed the RNG and get current seed</h2>

Set this member to manually seed the RNG. Save this value if you want to restore the current state of the RNG. If no seed is specified, <code>Math.random</code> will be used to get a seed. You should set <code>UFX.random.seed</code> to some integer in the range [0,4294967296). No error checking is done using this method.<br>
<br>
The seed is not set automatically until a random number is generated. If you want to access the value of <code>UFX.random.seed</code> before any random numbers are generated, see <code>UFX.random.setseed</code>.<br>
<br>
It's generally not necessary to manually seed the RNG unless you want to generate the same sequence of random numbers more than once.<br>
<br>
<pre><code>UFX.random.seed = 14045<br>
var x = UFX.random()<br>
var oldseed = UFX.random.seed<br>
var y = UFX.random()<br>
UFX.random.seed = oldseed<br>
var z = UFX.random()      // y == z<br>
</code></pre>

<h2>function <code>UFX.random.setseed</code>: manually seed the RNG</h2>

You can also use this function to seed the RNG. If you pass it a number, that will be assigned to <code>UFX.random.seed</code>. Make sure it's an integer in the range [0,4294967296). If you pass it some JSON-able object, the object will be converted to a string and hashed into a valid seed, which will be used. If you call <code>UFX.random.setseed</code> with no arguments, a random seed will be chosen using <code>Math.random</code>. This is useful if you need to get the random seed before any random numbers are generated.<br>
<br>
The function returns the new random seed.<br>
<br>
<pre><code>var oldseed = UFX.random.setseed()<br>
UFX.random.setseed(14045)<br>
UFX.random.setseed(["random", "number"])<br>
</code></pre>

<h2>function <code>UFX.random.pushseed</code>: save state and use new seed</h2>

Save the current state of <code>UFX.random</code> on a stack and set the state to something new. This function can take any seed argument that <code>UFX.random.setseed</code> can take, including none. Returns the new seed.<br>
<br>
This is useful if you want to generate a few random numbers without disrupting the state of <code>UFX.random</code>. Use <code>UFX.random.popseed</code> when you're done and want to put it back how it was.<br>
<br>
<pre><code>UFX.random.pushseed(14045)<br>
</code></pre>

<h2>function <code>UFX.random.popseed</code>: restore state</h2>

Restore the state of <code>UFX.random</code> to where it was the last time <code>UFX.random.pushseed</code> was called. Returns the newly popped seed.<br>
<br>
<pre><code>UFX.random.popseed()<br>
</code></pre>

<h2>function <code>UFX.random.hash</code>: convert any object to a seed</h2>

This method is used by <code>UFX.random.setseed</code> whenever a non-number seed is passed in. It takes any JSON-able object and returns an integer in the range [0,4294967296). It uses the Jenkins hash function.<br>
<br>
You might find it useful for something else, I don't know.<br>
<br>
<pre><code>var hash = UFX.random.hash(["random", "number"])<br>
</code></pre>

<h2>function <code>UFX.random.choice</code>: choose an element from an array</h2>

Select a random element from a given array with uniform probability.<br>
<br>
<pre><code>var flip = UFX.random.choice(["heads", "tails"])<br>
</code></pre>

<h2>function <code>UFX.random.shuffle</code>: shuffle an array</h2>

Randomly reorder the elements of a given array using the Fischer-Yates shuffle algorithm. This is an in-place shuffle, so the array is changed. The return value of the function is also the array.<br>
<br>
<pre><code>var a = [1, 2, 3, 4]<br>
UFX.random.shuffle(a)<br>
// a might now be [3, 4, 2, 1]<br>
</code></pre>

<h2>function <code>UFX.random.word</code>: random string of letters</h2>

Return a random string of letters. Takes two optional arguments, the number of letters (defaults to 8), and the letters to choose from (defaults to lowercase English letters).<br>
<br>
<pre><code>var password = UFX.random.word(12)<br>
</code></pre>

<h2>function <code>UFX.random.rdisk</code>: random point on unit disk</h2>

Returns a pair of random numbers drawn from a uniform distribution in the random disk. Takes no arguments.<br>
<br>
<pre><code>var p = UFX.random.rdisk()<br>
var x = p[0], y = p[1]     // x^2 + y^2 &lt;= 1<br>
</code></pre>

<h2>function <code>UFX.random.normal</code>: Gaussian random variable</h2>

Returns a random number drawn from a Gaussian normal distribution. The mean and standard deviation can optionally be specified. If not, they default to 0 and 1.<br>
<br>
<pre><code>var x = UFX.random.normal()      // mean = 0, std dev = 1<br>
var y = UFX.random.normal(5)     // mean = 5, std dev = 1<br>
var z = UFX.random.normal(5, 5)  // mean = 5, std dev = 5<br>
</code></pre>

Because the normal RNG algorithm generates numbers in pairs, the results of <code>UFX.random.normal</code> are cached every other call. This causes a subtle issue when using this function along with <code>UFX.random.seed</code>, since the cached value will not advanced the state of <code>UFX.random</code>:<br>
<br>
<pre><code>var seed = UFX.random.seed  // save UFX.random's state<br>
UFX.random.normal()     // UFX.random's state is advanced here.<br>
var x = UFX.random()<br>
UFX.random.seed = seed  // restore the state<br>
UFX.random.normal()     // state is *not* advanced - cached value used<br>
var y = UFX.random()    // x != y<br>
</code></pre>

This can be remedied by always using <code>UFX.random.setseed</code> rather than accessing <code>UFX.random.seed</code> directly. If there is a cached value for <code>UFX.random.normal</code>, it will be removed when <code>UFX.random.setseed</code> is called.<br>
<br>
<h2>function <code>UFX.random.spread</code>: unclustered 2-dimensional points</h2>

Generate randomly-selected points that still appear random while avoiding being too close together. This is useful, for instance, if you want to place cities randomly on a map but not have two on top of each other. The generated points all lie in the unit square, with 0 <= x < 1 and 0 <= y < 1.<br>
<br>
Takes two optional arguments. The first argument is the number of points to generate (defaults to 100). The second argument is the spread factor (defaults to 0.15). The higher the spread factor, the more aggressively clustering is avoided. A spread factor close to 0 will be indistinguishable from regular randomly-placed points. A spread factor close to 1 will have a very uniform appearance.<br>
<br>
<pre><code>var points = UFX.random.spread(50)<br>
for (var j = 0 ; j &lt; 50 ; ++j) {<br>
    var x = 500 * points[j][0]<br>
    var y = 500 * points[j][1]<br>
    // etc.<br>
}<br>
</code></pre>

<h1><code>UFX.ticker</code>: game loop management</h1>

<code>UFX.ticker</code> repeatedly calls a function, where your game logic is implemented.<br>
<br>
This is the API documentation for <code>UFX.ticker</code>. Not all combinations of options listed here will produce useful results. It's highly recommended you use one of the forms given in <a href='UFXtickerUsage.md'>UFXtickerUsage</a>.<br>
<br>
You probably only need to call one function - <code>UFX.ticker.init</code> - once at the beginning of your program. If you use <code>UFX.scene</code>, you don't even need to do that, since <code>UFX.scene.init</code> calls <code>UFX.ticker.init</code>.<br>
<br>
<h2>function <code>UFX.ticker.init</code>: start up game loop</h2>

Call this once at the beginning of your game (or call it automatically via <code>UFX.scene.init</code>). Takes up to 4 arguments: the update callback, (optionally) the render callback, (optionally) an options objects, and (optionally) a boolean related to the default options.<br>
<br>
<pre><code>function think(dt) {<br>
    // update the game state<br>
}<br>
function draw(f) {<br>
    // render the game to screen<br>
}<br>
UFX.ticker.init(think, draw, { fps: 60 })<br>
</code></pre>

The first and second arguments are passed to <code>UFX.ticker.setcallbacks</code>, and the third and fourth arguments are passed to <code>UFX.ticker.setoptions</code>. Please see those functions for more details.<br>
<br>
<h2>function <code>UFX.ticker.getrates</code>: rate counter summary</h2>

Returns a string showing the frame rate, update rate, and game clock factor formatted to 3 decimals. This is intended for display purposes.<br>
<br>
<pre><code>if (debugmode) window.title = UFX.ticker.getrates()<br>
</code></pre>

If you want to use the values for more detailed profiling, see <code>UFX.ticker.wups</code>, <code>UFX.ticker.wfps</code>, and <code>UFX.ticker.wfactor</code> below.<br>
<br>
<h2>number <code>UFX.ticker.wfps</code>: frame rate in wall time</h2>

The actual number of frames per second, as measured in wall time, delivered by <code>UFX.ticker</code>. This may be less than requested if the game is lagging.<br>
<br>
<pre><code>UFX.ticker.wfps.toPrecision(3) + "fps"<br>
</code></pre>

<h2>number <code>UFX.ticker.wups</code>: update rate in wall time</h2>

<code>UFX.ticker</code> distinguishes between "updates", when the game logic is updated, and "frames", when the canvas is redrawn. By default these happen at the same time, but depending on the options, the update rate might be different from the frame rate.<br>
<br>
<code>UFX.ticker.wups</code> is the actual number of updates per second, as measured in wall time, delivered by <code>UFX.ticker</code>. This may be less than requested if the game is lagging.<br>
<br>
<pre><code>UFX.ticker.wups.toPrecision(3) + "ups"<br>
</code></pre>

<h2>number <code>UFX.ticker.wfactor</code>: game clock factor</h2>

The approximate ratio of the rate of the game clock to the wall clock. Under normal conditions it's 1, but it drops if the game is lagging.<br>
<br>
<h2>function <code>UFX.ticker.setcallbacks</code>: register update and render callbacks</h2>

Registers an update callback and (optionally) a render callback. Normally you don't call this directly, it's called via <code>UFX.ticker.init</code>.<br>
<br>
<pre><code>UFX.ticker.setcallbacks(think, draw)<br>
</code></pre>

The <code>think</code> callback is called once per update, and is passed 3 arguments: the game time in seconds since the last update, the update number during this frame starting at 0, and the total number of updates during this frame. Under the default settings, these arguments always have the values 1/30, 0, and 1.<br>
<br>
The <code>draw</code> callback is called once per frame, and is passed one argument: the interpolation factor in the range (0,1], relating to the timing of this render relative to updates. Under the default settings, this argument will always have the value 1.<br>
<br>
Please see <a href='UFXtickerUsage.md'>UFXtickerUsage</a> for a better understanding of updates and frames.<br>
<br>
<h2>function <code>UFX.ticker.setoptions</code>: set options</h2>

Optionally reset the options to their default value, and then apply any options passed in via an intialization object. Normally you don't call this directly, it's called via <code>UFX.ticker.init</code>.<br>
<br>
<pre><code>UFX.ticker.setoptions({<br>
    fps: 60,<br>
    sync: true,<br>
})<br>
</code></pre>

Options can also be set directly:<br>
<br>
<pre><code>UFX.ticker.fps = 60<br>
UFX.ticker.sync = true<br>
</code></pre>

The only difference is that when you call <code>UFX.ticker.setoptions</code>, all options are restored to the default before the options you passed in are applied. You can restore to the default by calling it with no arguments:<br>
<br>
<pre><code>UFX.ticker.setoptions()   // restore to default<br>
</code></pre>

Alternately, if you pass <code>true</code> as a second argument, the defaults will not be restored before your options are applied.<br>
<br>
<pre><code>UFX.ticker.setoptions({<br>
   fps: 60,<br>
   sync: true,<br>
}, true)<br>
</code></pre>

<h3><code>UFX.ticker</code> options</h3>

The options <code>sync</code>, <code>cthis</code>, and <code>fps</code> are pretty straightforward. If you wish to set more options, please see the suggested usages in <a href='UFXtickerUsage.md'>UFXtickerUsage</a>.<br>
<br>
<br>
<table><thead><th> <b>name</b> </th><th> <b>default</b> </th><th> <b>meaning</b> </th></thead><tbody>
<tr><td> <code>sync</code> </td><td> <code>"auto"</code> </td><td> Whether to use <code>window.requestAnimationFrame</code>. If set to <code>"auto"</code>, will use it if it's available and fall back to a timeout if not. </td></tr>
<tr><td> <code>cthis</code> </td><td> <code>null</code> </td><td> The object to use as <code>this</code> when calling the callbacks </td></tr>
<tr><td> <code>delay</code> </td><td> <code>0</code> </td><td> Minimum delay in milliseconds between end of one frame and start of next. </td></tr>
<tr><td> <code>fps</code> </td><td> <code>30</code> </td><td> Desired number of frames per second. Game will lag if this frame rate cannot be achieved. </td></tr>
<tr><td> <code>ups</code> </td><td> <code>null</code> </td><td> Desired number of updates per second. Defaults to <code>fps</code> </td></tr>
<tr><td> <code>minups</code> </td><td> <code>null</code> </td><td> Desired minimum updates per second. Defaults to <code>ups</code> </td></tr>
<tr><td> <code>maxups</code> </td><td> <code>null</code> </td><td> Desired maximum updates per second. Defaults to <code>ups</code> </td></tr>
<tr><td> <code>minupf</code> </td><td> <code>1</code> </td><td> Minimum updates per frame </td></tr>
<tr><td> <code>maxupf</code> </td><td> <code>1</code> </td><td> Maximum updates per frame </td></tr>
<tr><td> <code>cfac</code> </td><td> <code>null</code> </td><td> A factor controlling how quickly the rate counters update. Defaults to <code>1/ups</code>. </td></tr></tbody></table>

The HTML5 specification prevents <code>setTimeout</code> from executing recursively with a timeout of less than 4ms, which makes the theoretical maximum frame rate 250fps.<br>
<br>
<h2>function <code>UFX.ticker.resume</code>: start or continue game loop</h2>

This function is called from <code>UFX.ticker.init</code>. You don't need to call it yourself.<br>
<br>
<pre><code>UFX.ticker.resume()<br>
</code></pre>

<h2>function <code>UFX.ticker.stop</code>: stop game loop</h2>

Suspends <code>UFX.ticker</code> activity and cancels any pending timeouts. You can resume with <code>UFX.ticker.resume</code>.<br>
<br>
<pre><code>UFX.ticker.stop()<br>
</code></pre>

<h2>function <code>UFX.ticker.resetcounters</code>: reset frame rate counters</h2>

Resets internal counters for <code>UFX.ticker.wfps</code>, <code>UFX.ticker.wups</code>, and <code>UFX.ticker.wfactor</code>.<br>
<br>
<pre><code>UFX.ticker.resetcounters()<br>
</code></pre>

<h1><code>UFX.resource</code>: load external resources</h1>

Use <code>UFX.resource</code> to load external images, sounds, web fonts, and data files, and to call a callback when loading is complete.<br>
<br>
The simplest usage is to define the callbacks <code>UFX.resource.onloading</code> and <code>UFX.resource.onload</code>, and then to call <code>UFX.resource.load</code>. After loading is complete, your resources will be available in the <code>images</code>, <code>sounds</code>, and <code>data</code> subobjects of <code>UFX.resource</code>.<br>
<br>
<pre><code>UFX.resource.onloading = function (f) {<br>
    displayprogressbar(f)<br>
}<br>
UFX.resource.onloaded = function () {<br>
    displayimage(UFX.resource.images.splashscreen)<br>
    UFX.resource.sounds.startup.play()<br>
    startgame()<br>
}<br>
UFX.resource.load({<br>
    splashscreen: "imgs/splash.png",<br>
    startup: "sfx/startup.ogg",<br>
})<br>
</code></pre>

<h2>function <code>UFX.resource.load</code>: load various resources</h2>

Pass an object whose values are URLs for resources to be loaded asynchronously.<br>
<br>
<pre><code>UFX.resource.load({<br>
    sprite: "player.png",     // Will be available as UFX.resource.images.sprite<br>
    jump: "jump.ogg",         // Will be available as UFX.resource.sounds.jump<br>
    level: "leveldata.json",  // Will be available as UFX.resource.data.level<br>
    stats: "stats.csv",       // Will be available as UFX.resource.data.stats<br>
})<br>
</code></pre>

UFX.resource will parse the resource as one of four data types, depending on extension: images (JavaScript <code>Image</code> objects), sounds (JavaScript <code>Audio</code> objects), JSON (parsed with <code>JSON.parse</code>), and raw data (unparsed). Both JSON and raw data are under <code>UFX.resource.data</code>.<br>
<br>
To change how UFX.resource handles a certain extension, modify <code>UFX.resource.imagetypes</code>, <code>UFX.resource.soundtypes</code>, <code>UFX.resource.jsontypes</code>, and <code>UFX.resource.rawtypes</code>. To explicitly load a resource as a certain type regardless of extension, use <code>UFX.resource.loadimage</code>, <code>UFX.resource.loadsound</code>, or <code>UFX.resource.loadjson</code>.<br>
<br>
<code>UFX.resource.load</code>, as well as the other loading functions, can be called multiple times in a row. However, all the calls should be in one "batch". That is, don't call it once, wait for the resources to load, and then call it again.<br>
<br>
<code>UFX.resource.load</code>, as well as the other loading functions, has alternate calling conventions. It can take multiple arguments, each of which can be a URL string, an array of URL strings, or (as above) an object mapping identifiers to URL strings.<br>
<br>
When using strings or arrays as arguments, the identifier by which you can access the resources will be the strings themselves.<br>
<br>
<pre><code>var leveldata = ["data/lev1.json", "data/lev2.json"]<br>
var sounds = { jump: "sfx/jump.ogg", shoot: "sfx/shoot.ogg" }<br>
UFX.resource.load("img/frame1.png", leveldata, sounds)<br>
UFX.resource.load("img/frame2.png")<br>
<br>
// Resources will be available at:<br>
//   UFX.resource.data["data/lev1.json"]<br>
//   UFX.resource.data["data/lev2.json"]<br>
//   UFX.resource.sounds.jump<br>
//   UFX.resource.sounds.shoot<br>
//   UFX.resource.images["img/frame1.png"]<br>
//   UFX.resource.images["img/frame2.png"]<br>
</code></pre>

<h2>function <code>UFX.resource.loadwebfonts</code>: load Google web fonts by name</h2>

This uses the Google web fonts API to asynchronously load fonts. Pass one or more string arguments naming fonts. Fonts are treated along with any resources loaded with <code>UFX.resource.load</code> as far as load fraction is concerned. However, the fonts themselves are not available through the <code>UFX.resource</code> object. Instead just refer to them like any other font.<br>
<br>
<pre><code>UFX.resource.onload = function () {<br>
    context.font = "40px 'Contrail One'"<br>
    context.fillText("Click to start", 100, 100)<br>
}<br>
UFX.resource.loadwebfonts("Viga", "Contrail One")<br>
</code></pre>

<h2>function <code>UFX.resource.onloading</code>: loading progress callback</h2>

Set this to a function to be called after each resource is loaded. It takes a single argument, which is the fraction of resources that are done loading (between 0 and 1). It's not really a great indication of the fraction of loading time that's complete, but nothing ever is, so that's what I use it for.<br>
<br>
<pre><code>UFX.resource.onloading = function (f) {<br>
    setloadingtext("Loading.... " + Math.round(100 * f) + "%")<br>
}<br>
</code></pre>

<h2>function <code>UFX.resource.onload</code>: loading complete callback</h2>

Set this to a function to be called once the last resource is done loading.<br>
<br>
<pre><code>UFX.resource.onload = function () {<br>
    playgame()<br>
}<br>
</code></pre>

<h2>constructor <code>UFX.resource.Multisound</code>: multiple copies of a sound</h2>

This function makes multiple copies of a sound and cycles through them whenever you play it. This is for a sound that must be played in quick succession, such as gunfire. It takes two arguments. The first is either a sound resource or a URL to load a sound from. The second is the number of copies you want made of the sound (defaults to 10).<br>
<br>
The resulting object has two useful methods, <code>play</code> and <code>pause</code>, which work the same as for a normal sound object. You can also set the member <code>volume</code> like normal, which will take effect the next time you call <code>play</code>.<br>
<br>
<pre><code>UFX.resource.sound.shoot = UFX.resource.Multisound(UFX.resource.sound.shoot)<br>
UFX.resource.sound.shoot.volume = 0.3<br>
UFX.resource.sound.shoot.play()<br>
</code></pre>

<h2>constructor <code>UFX.resource.SoundRandomizer</code>: multiple related sounds</h2>

This function merges a set of distinct sound resources together and gives you the ability to play one at random. This is for sounds that get played often, such as gunfire or footsteps, that you want to add a little variation to. It takes two arguments. The first is an array of sounds that you want merged. The second is a number that defaults to 3. If possible, the same sound will not be played within 3 consecutive calls to <code>play</code>.<br>
<br>
<pre><code>UFX.resource.sound.shoot = UFX.resource.SoundRandomizer([<br>
    UFX.resource.sound.shoot1,<br>
    UFX.resource.sound.shoot2,<br>
    UFX.resource.sound.shoot3,<br>
    UFX.resource.sound.shoot4,<br>
])<br>
UFX.resource.sound.volume = 0.3<br>
UFX.resource.sound.shoot.play()<br>
</code></pre>

<code>SoundRandomizer</code> objects require the <code>UFX.random</code> module be used.<br>
<br>
<h2>function <code>UFX.resource.mergesounds</code>: create a <code>SoundRandomizer</code> object</h2>

This is a shorthand for calling <code>UFX.resource.SoundRandomizer</code> when the sounds you want randomize are all members of <code>UFX.resource.sound</code> and their names follow a simple pattern. Any sound name that begins with the string you pass will be merged into a <code>SoundRandomizer</code> object with that name.<br>
<br>
<pre><code>UFX.resource.load({<br>
    shoot1: "shoot1.ogg",<br>
    shoot2: "shoot2.ogg",<br>
    shoot3: "shoot3.ogg",<br>
    shoot4: "shoot4.ogg",<br>
})<br>
UFX.resource.onload = function () {<br>
    UFX.resource.mergesounds("shoot")<br>
    UFX.resource.shoot.volume = 0.3<br>
}<br>
</code></pre>

This function requires the <code>UFX.random</code> module be used.<br>
<br>
<h2>array <code>UFX.resource.imagetypes</code>: extensions to treat as images</h2>

<h2>array <code>UFX.resource.soundtypes</code>: extensions to treat as sounds</h2>

<h2>array <code>UFX.resource.jsontypes</code>: extensions to treat as JSON</h2>

<h2>array <code>UFX.resource.rawtypes</code>: extensions to treat as raw data</h2>

<h2>function <code>UFX.resource.loadimage</code>: load as image regardless of extension</h2>

<h2>function <code>UFX.resource.loadsound</code>: load as audio regardless of extension</h2>

<h2>function <code>UFX.resource.loadjson</code>: load as JSON regardless of extension</h2>


<h1><code>UFX.maximize</code>: resize canvas to fit screen/window</h1>

This module only does one thing, but it's sort of a tricky thing. <code>UFX.maximize</code> will resize your canvas element so that it takes up either the whole screen or the whole browser window.<br>
<br>
There are several caveats associated with fullscreen mode. Please see <code>UFX.maximize.full</code> below for more information.<br>
<br>
<h2>function <code>UFX.maximize.maximize</code>: go fullscreen or fill window</h2>

This function will first try to call <code>UFX.maximize.full</code> and go fullscreen. There are several reasons that might fail, though, so if that happens it will then call <code>UFX.maximize.fill</code>.<br>
<br>
<pre><code>UFX.maximize.maximize(canvas)<br>
</code></pre>

<h2>function <code>UFX.maximize.full</code>: go fullscreen</h2>

<pre><code>UFX.maximize.full(canvas)<br>
</code></pre>

There are a few things you should know if you want to use fullscreen mode:<br>
<br>
<ul><li>As of 2013, the HTML5 fullscreen API is not finalized or implemented in any browser I know of, so for fullscreen to work you need polyfill. As a matter of policy, UFX does not have any polyfill built in, so you'll need to add it for this to work on current browsers. <a href='https://code.google.com/p/unifac/wiki/JavaScriptSnippets#Polyfill'>Suggested form.</a>
</li><li>Most browsers have strict restrictions on when an attempt to go fullscreen will succeed. Generally, the attempt must be made while in an event handler for key press or mouse click. Some browsers won't support it at all.<br>
</li><li>Even if you do it right, fullscreen can be disabled or cancelled by the user. You should not rely on it to succeed.<br>
</li><li>Going fullscreen happens asynchronously, so the results of this call will not happen immediately. If fullscreen has not been achieved after 0.1 seconds, it will revert.</li></ul>

<h2>function <code>UFX.maximize.fill</code>: fill the browser window</h2>

This sets it up so that the canvas fills the current browser window, and resizes the canvas whenever the browser window is resized.<br>
<br>
<pre><code>UFX.maximize.fill(canvas)<br>
</code></pre>

<h2>function <code>UFX.maximize.restore</code> restore canvas to original size</h2>

<pre><code>UFX.maximize.restore()<br>
</code></pre>

<h2>function <code>UFX.maximize.init</code>: register canvas</h2>

You can optionally use this to register a canvas element with <code>UFX.maximize</code>, and then later you can call the other methods without any arguments.<br>
<br>
<pre><code>UFX.maximize.init(canvas)<br>
UFX.maximize.maximize()<br>
</code></pre>

<h2>string <code>UFX.maximize.resizemode</code>: specify resizing behavior</h2>

Canvas elements have two different concepts of size. <i>Display size</i> is how big the canvas actually appears on the screen, and it's specified by <code>canvas.style.width</code> and <code>canvas.style.height</code>. <i>Game size</i> is how big the canvas is for the purposes of your game, and it's specified by <code>canvas.width</code> and <code>canvas.height</code>. Coordinates passed to drawing commands are in terms of game size. If the display size is different from the game size, the canvas will be stretched in the browser window.<br>
<br>
Depending on what you set <code>UFX.maximize.resizemode</code> to, <code>UFX.maximize</code> will change one or both or neither of these.<br>
<br>
<ul><li><code>"none"</code>: neither the display size nor the game size will be changed. The canvas will appear centered in the screen or window surrounded by black on all sides.<br>
</li><li><code>"fixed"</code>: the game size is not changed. The display size will be as large as possible to fit within the screen or window, while maintaining the same aspect ratio as the game size. This is the default mode. It's recommended if your game is not responsive, meaning the game runs correctly at only one resolution.<br>
</li><li><code>"aspect"</code>: The game size and display size are both changed the same thing, to be as large as possible to fit within the screen or window, while maintaining the same aspect ratio. This is recommended if your game is fixed-aspect responsive, meaning the game runs correctly for any resolution at the given aspect ratio.<br>
</li><li><code>"total"</code>: The game size and display size are both changed to fill the entire screen or window. This is recommended if your game is fully responsive, meaning the game runs correctly for any resolution.</li></ul>

<table><thead><th> </th><th> <code>none</code> </th><th> <code>fixed</code> </th><th> <code>aspect</code> </th><th> <code>total</code> </th></thead><tbody>
<tr><td> change game size? </td><td> no                </td><td> no                 </td><td> yes                 </td><td> yes                </td></tr>
<tr><td> change display size? </td><td> no                </td><td> yes                </td><td> yes                 </td><td> yes                </td></tr>
<tr><td> display size = game size? </td><td> yes               </td><td> no                 </td><td> yes                 </td><td> yes                </td></tr>
<tr><td> change aspect ratio? </td><td> no                </td><td> no                 </td><td> no                  </td><td> yes                </td></tr>
<tr><td> fill entire screen/window? </td><td> no                </td><td> no                 </td><td> no                  </td><td> yes                </td></tr></tbody></table>

<pre><code>UFX.maximize.resizemode = "none"<br>
</code></pre>

<h1><code>UFX.Noisescape</code>: endless 2-D coherent noise</h1>

<code>UFX.Noisescape</code> is a constructor for "noisescape" objects, which provide coherent noise similar to fractal Perlin noise over an unlimited 2-D area. The primary usage is procedurally generated terrain.<br>
<br>
<code>UFX.Noisescape</code> is not related to <code>UFX.noise</code>, which is a more general-purpose module for coherent noise. <code>UFX.Noisescape</code> makes certain tradeoffs of performance and convenience that are suited specifically to procedurally generated terrain.<br>
<br>
Once initialized, the object is used to calculate the value of a function h(x,y). The most basic usage involves the <code>value</code> method:<br>
<br>
<pre><code>var noise = new UFX.Noisescape()<br>
var h = noise.value(x, y)<br>
</code></pre>

This is slow, however, and provides no caching. For the most part, you'll want to use the other methods provided. These can be used to generate "parcels" of values in square blocks (default 256x256).<br>
<br>
<h2><code>UFX.Noisescape</code> initialization options</h2>

These are members of the initialization object that get passed into the constructor. They all have default values. You can leave off the object to use the defaults if you want. The list of options and default values are given here:<br>
<br>
<pre><code>var noise = new UFX.Noisescape({<br>
    psize: 256,<br>
    random: Math.random,<br>
})<br>
</code></pre>

<h3>option Number <code>psize</code>: parcel size</h3>

The size of the square parcels. The default is 256.<br>
<br>
<h3>option function <code>random</code>: random number generator</h3>

A function that returns a random number between 0 and 1, which is used to generate reference values for the noise. The default is <code>Math.random</code>.<br>
<br>
If you want to generate the same noisescape more than once, replace this with a deterministic RNG, such as <code>UFX.random</code>, and seed it appropriately.<br>
<br>
<pre><code>UFX.random.setseed("myseed")<br>
var noise = new UFX.Noisescape({<br>
    random: UFX.random,<br>
})<br>
</code></pre>