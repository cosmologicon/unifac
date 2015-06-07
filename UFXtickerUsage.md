# Using `UFX.ticker` #

This page gives several use cases for `UFX.ticker`, and the options you should pass in for them.

If you're using the `UFX.scene` module, don't call `UFX.ticker.init` directly. Just pass in any options to `UFX.scene.init`, and the `think` and `draw` functions will be members of your scene object.

# Simplest usage #

```
UFX.ticker.init(think)
```

```
UFX.scene.init()
```

Use this if:

  * you want to get started right away

You will need:

  * a function that you want called 30 times per second (called `think` in this example). If you're using `UFX.scene`, then your `think` function is a method of your scene object.

`UFX.ticker` will try to call `think` 30 times per second. If `think` takes too long to run, then it will be called as often as possible.

`think` will get passed some arguments from `UFX.ticker`, but you can ignore these.

# Setting the frame rate #

```
UFX.ticker.init(think)
UFX.ticker.fps = 60
```

```
UFX.scene.init()
UFX.ticker.fps = 60
```

or pass an initialization object as the third argument:

```
UFX.ticker.init(think, null, {
    fps: 60,
})
```

```
UFX.scene.init({
    fps: 60,
})
```

Use this if:

  * you want to set the frame rate to something other than 30fps

You will need:

  * the desired frame rate

Again, if `UFX.ticker` is unable to meet the desired frame rate, `think` will be called as often as possible.

The first argument passed to `think` is the game time elapsed since the last frame, in seconds. In this example, it will always be 1/60, even if more real time has passed.

# Separate updating and rendering #

```
UFX.ticker.init(think, draw, {
    fps: 60,
})
```

```
UFX.scene.init({
    fps: 60,
})
```

Use this if:

  * you want to separate your game loop into updating and rendering

You will need:

  * an additional function that renders the game to the screen (called `draw` in this example). If you're using `UFX.scene`, `draw` is, like `think`, a method of your scene object.

`UFX.ticker` will call both `think` and `draw` once per frame.

By itself, splitting updating and rendering into separate functions doesn't get you anything. But it will be necessary for further refinements.

`draw` will be passed a single argument (the interpolation factor), but it will always be `1` in this case and you can ignore it.

# Multiple updates per loop #

```
UFX.ticker.init(think, draw, {
    ups: 60,
    maxupf: 3,
})
```
UFX.scene.init({
    ups: 60,
    maxupf: 3,
})

Use this if:

  * you expect that your bottleneck will be in rendering
  * you want to avoid the game lagging if rendering takes a long time

You will need:

  * the desired number of game updates per second (`ups`)
  * the maximum number of updates per frame (`maxupf`)
  * a game loop that works even if frames are dropped

Now we have a distinction between _updates_ (calls to `think`) and _frames_ (calls to `draw`). With this usage, `UFX.ticker` will alternate between updates and frames (calling `think` then `draw` etc.), but if the game can't keep up with this, some frames will be skipped. As long as it's able to make 60 updates per second, and no more than 3 updates per frame, the game will run at full speed.

You will need to make sure that `draw` does not change your game state in any significant way, ie, that the game will play the same even if some calls to `draw` are skipped.

The second argument to `think` is the update number during this frame, starting at 0. The third argument is the number of updates this frame. The calls might end up something like this:

{{{
think(1/60, 0, 3)
think(1/60, 1, 3)
think(1/60, 2, 3)
draw(1)
think(1/60, 0, 2)
think(1/60, 1, 2)
draw(1)
}}}

= Frame interpolation =

{{{
UFX.ticker.init(think, draw, {
    ups: 20,
    minupf: 0,
})
}}}

{{{
UFX.scene.init({
    ups: 20,
    minupf: 0,
})
}}}

Use this if:

  * you expect that your bottleneck will be in updating
  * you want more frames than updates

You will need:

  * to implement frame interpolation within your `draw` function

If you set `minupf` (minimum updates per frame) to 0, that gives `UFX.ticker` the option of calling `draw` multiple times in a row without calling `think`. This gives you the possibility of rendering at 60 frames per second even if a single update takes more than 1/60 seconds, as long as your rendering step is fast.

In order for this to be worthwhile, you need to be able to render a frame "in between" updates, meaning you have to show the game as its state would be in between one update and the next. A single argument, the interpolation factor, will be passed to `draw`. It will be in the range (0,1], where a value of 0 represents the previous update, and a value of 1 represents the current update. The calls might look something like this:

{{{
think(1/20)
draw(0.3)
draw(0.6)
draw(0.9)
think(1/20)
}}}

= Semi-fixed timestep =

{{{
UFX.ticker.init(think, draw, {
    minups: 10,
    maxups: 250,
})
}}}

{{{
UFX.scene({
    minups: 10,
    maxups: 250,
})
}}}

Use this if:

  * you want to avoid the game lagging on slow computers, but also have a high frame rate on fast computers

You will need:

  * a minimum update rate (`minups`) before game slowdown occurs
  * a `think` function that can handle a range of frame rates

This usage lets you update and render as fast as possible on faster computers, but degrade gracefully if the computer can't keep up, without requiring frame interpolation. This is accomplished by adaptively changing the amount of game time that occurs within each update, which is passed as the first argument to `think`. You should advance the game state more or less depending on this argument.

Please be aware if there is any physics or collision detection involved in your game, that it is difficult to get physics right with a semi-fixed timestep. This option is probably not appropriate for all types of games.```