# Playbacks using the UFX.playback module #

A playback is a recording of inputs into a running game, such as the keys a player pushes. These can then be replayed with a game instance so you can see the action as it happened. There are three use cases I'm trying to support:

  * watching playtesters' games remotely for development purposes
  * in-game walkthrough videos
  * server-side validation of high scores

There's also the use case of showing a "ghost" version of a player that you play against, like in a racing game. Playbacks can probably help with this, but it's a bit trickier because you have to get input at the same time you're replaying old input. I haven't tried it out.

The way playbacks work is by saving everything that affects the state of the game, especially player input, but also random number seeds and any external signals. This is an alternative to actually writing down the entire game state every frame. Advantages to playbacks:

  * takes much less memory and CPU
  * does not require functions to get and set the state of game entities

Disadvantages to playbacks:

  * more difficult to rewind and fast forward the playback
  * requires careful construction of your game logic to ensure that the same inputs will produce the same state

This last point can be a bit tricky, but it definitely can be done. This document explains how.

Playbacks are recorded using the `UFX.playback` object, located in the `UFX.scene` module. A playback can be JSONed and then included in your game for walkthroughs, emailed to you, or uploaded to a server and viewed remotely.

  * Playbacks recorded in one version of your game can only be replayed in that same version.
  * Scenes must be registered on the `UFX.scenes` object.

## Game state ##

One of the biggest things you'll have to do in order to use playbacks for your game is to carefully identify what makes up your game's _state_. You'll also need to distinguish (what I'm calling for lack of a better term) the _coarse state_ from the _fine state_. At any particular moment during the gameplay, the game state can be quite complicated - this is the fine state. But there are certain points in the gameplay, such as at the beginning of a level, where the state can be summarized with just a few values. This is the _coarse state_. Typically, when you save your game, the coarse state gets saved but the fine state does not.

An example for a platformer like Super Mario World would be:

  * Coarse state:
    * number of current level
    * which powerups have been unlocked
    * number of lives
    * which levels have been unlocked
  * Fine state:
    * current position and velocity of all sprites, including projectiles
    * which enemies are currently targeting the player
    * which coins in the level have been collected
    * time remaining in current level

In order to use playbacks, you need to have a function that gives a JSONable representation of the current coarse state, and a function that, given such a representation, can recreate the coarse state. If your game has a save game feature, the representation of the saved game can probably be used.

You don't need to be able to represent your current fine state.

You also need to identify _checkpoints_. These are points in the game where the coarse state is sufficient to summarize the game state. Examples typically include the beginnings and ends of levels, or when navigating from one menu to the next. (Often these will correspond to changes in the `UFX.scene` stack.) When playing back a playback session, you have to start from such a checkpoint.

## Setting game state ##

You need to provide your recorder object with a way to get the game's state, and provide your playback object with a way to set the game's state. The most straightforward way is to have a pair of functions. The `getstate` function should return an Array, which, when applied to the `setstate` function, will properly set the state:

```
function getstate() {
    return [gstate.score, gstate.lives]
}
function setstate(score, lives) {
    gstate.score = score
    gstate.lives = lives
}
```

Two rules of thumb are that `setstate.apply(null, getstate())` should be able to be called at any time and have no effect, and that `setstate` should be idempotent, meaning if you call it twice in a row with the same arguments it's the same as calling it just once.

## Data structure ##

This is the explanation of the data structures used by `UFX.Playback`.

A **session** object is an entire gameplay session, from when you start recording to when you stop recording. It's the main object, and it's basically just a sequence of chapters. It has the following members:

  * `name`: name of this session
  * `chapters`: an Array of chapter objects

A **chapter** object is a self-contained playback unit, meaning that you can start playing back at the beginning of any chapter, and you can't start from the middle of a chapter. If you're using the playback upload script, you can upload and download one chapter at a time, to save time and bandwidth. It has the following members:

  * `index`: chapter number within `session.chapters`
  * `t`: time of chapter start
  * `initializer`: an initializer object
  * `seq`: sequence of

An **initializer** object is something that contains all the information necessary to put the game into a certain state.

  * `state`:
  * `scenes`:
  * `instance`:

## Usage ##

Technically you can start a new chapter at any time, but it makes the most sense for

## Determinism ##

In order for playbacks to work, you need to set up your model so that it gets into exactly the same state when given the same inputs. For this you need all your model logic to be deterministic. JavaScript is a relatively deterministic language, but there are still a few things you need to watch out for.

### Floating point operations ###

Floating point operations are a potential source of non-determinism. According to the JavaScript specification, floating-point operations must follow IEEE 754 and therefore should be deterministic. One exception is fused multiply add (FMA), which allows two operations to occur before rounding is applied. You can avoid this by assigning to a variable after every operation:

```
x += vx * dt  // potentially non-deterministic

var d = vx * dt  // should be deterministic
x += d
```

There is, unfortunately, a [bug in v8](https://code.google.com/p/v8/issues/detail?id=436) that violates the JavaScript specification on 32-bit Linux. If you want a playback from Chrome on 32-bit Linux, the only workaround is to stick to fixed-point math.

### `Math.random` ###

Basically, you can't use it. `Math.random` is a pseudorandom number generator. Usually languages and libraries that provide a PRNG will let you seed them so that you can deterministically generate a sequence of random numbers, but JavaScript does not. This is the main reason that the `UFX.random` module exists.

If you know at the beginning of the update how many random numbers you're going to need, you can use `Math.random` to generate them in `thinkargs` and pass them to `think`.

### Iterating over an object ###

Take care when iterating over an object with a for...in loop. The ordering of keys is non-deterministic, so they may appear in a different order

### `JSON.stringify` ###

Stringification is not deterministic across implementations. If you need to use the string from `JSON.stringify` anywhere other than `JSON.parse`, you must first overwrite the browser's default method with a custom deterministic one.

If you call `UFX.random.setseed`, note that it uses `JSON.stringify` if you pass an argument that's not a number or a string. If you need this call to be deterministic, pass a number or string.

### `Date` methods ###

Obviously, `Date.now` and such should not be called during your update.

### References to the DOM ###

Things to watch out for.... checkboxes that affect the model, screen dimensions, whether the window is maximized.