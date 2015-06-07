# Scope #

With this document I'm trying to collect everything someone would need when they're trying to write an HTML5 game that relies on JavaScript determinism. I'm concerned here both with what determinism guarantees the JavaScript specification makes, and also what browsers actually implement.

Since the context here is HTML5 games, I'm only concerned with the modern specification (ECMAScript 5) and modern browsers (Chrome ??+, Firefox ??+, IE 9+).

# Introduction #

## What is determinism? ##

Determinism is the ability to run the same code with the same initial state and get **exactly** the same final state. Note that it has to be exact: there's no such things as almost deterministic.

## When do you need determinism? ##

You definitely don't need it for every game. Only when you need to replay a game. Here are the three main use cases I've found:

  1. Racing against ghosts (or time travel mechanics)
  1. Uploading games for review purposes
  1. Online multiplayer

When determinism is difficult to achieve, you may want to compromise in a certain way, which depends on your purpose for needing determinism. For instance, if you're just uploading the gameplay so you can watch it for research purposes, it's probably okay if 5% of browsers fail at determinism, because you don't necessarily need to be able to reproduce every single play through.

The strictest environment for determinism is realtime online multiplayer.

## How can you achieve determinism? ##

The majority of JavaScript is deterministic. Achieving determinism involves avoiding or working around potential sources of nondeterminism. These fall into three general categories:

  1. Things that are nondeterministic by design, such as `Math.random` and `Date.now`.
  1. Things that are not specified by the standard and left up to the browser to decide, such as the ordering of keys in an object.
  1. Implementation bugs.

For the most part, there's a clear distinction between features you can rely on to be deterministic and features that make no guarantees at all.

The big issue is going to be Numbers. JavaScript is actually quite rare in that the specification makes strong guarantees as to how floating-point operations behave. However, not every browser follows the specification here 100% of the time, so I'll go into detail about how to handle Numbers properly.

Most of the time, you want to just avoid any nondeterministic features. But if necessary, there are sometimes ways around it. For instance, `Object.keys` is not deterministic because the ordering of keys in objects is not specified. However, it's possible to make a deterministic function that invokes `Object.keys` like this:

```
function sortedkeys(obj) {
    return Object.keys(obj).sort()
}
```

I recommend using this kind of thing carefully.