# UFX Component Model #

This is a guide to the component-based entity model used in the `UFX.Thing` module. Component-based design is a popular alternative to using a class hierarchy for modeling game entities. It's fairly simple conceptually, but it takes some practice to use it effectively.

Familiarity with Javascript's function-calling conventions and prototypal inheritance system is recommended.

## Creating Entities ##

An _entity_ is any thing that appears within the game. Common examples of entities are the player character, enemies, platforms, launched missiles, vehicles, and the camera. (Entities in UFX are completely generic, so anything that's a Javascript object can theoretically be an entity, including saved games, scenes, and music wrappers, but this is not typically very useful. Normally only things within the game world will be implemented as entities.)

A _component_ describes some aspect of an entity, such as rendering, motion, stats, saving state, taking input, or pathfinding. Examples of components are TakesDamage, AttacksPlayer, MovesWithMouse, and ExplodesWhenTouched.

In a class hierarchy system, each type of entity would have its own constructor. In UFX, all entities are created with the constructor `UFX.Thing`. Components are associated with an entity via the `addcomp` method.

```
var turtle = UFX.Thing()
turtle.addcomp(CanBeStompedOn)
turtle.addcomp(CrawlsOnGround, 20)
turtle.addcomp(BitesYourAnkles)
turtle.addcomp(DrawSprite, "turtle.png")
```

For convenience, the `addcomp` method returns the entity, so it can be chained like this:

```
var turtle = UFX.Thing()
              .addcomp(CanBeStompedOn)
              .addcomp(CrawlsOnGround, 20)
              .addcomp(BitesYourAnkles)
              .addcomp(DrawSprite, "turtle.png")
```

(Additional arguments passed to `addcomp` are used in the component's `init` method, explained below.)

## Mixing and Matching Components ##

The main benefit of a component-based system over a class hierarchy is that any component can be attached to any entity, without the need for the entity types to be arranged into a class tree. Here's an example of four entities that wouldn't easily fit together in a class tree.

```
var player = UFX.Thing()
              .addcomp(TakesKeyboardInput)
              .addcomp(TakesDamage)
              .addcomp(GivesDamage)
              .addcomp(WalksLikeAPerson)
              .addcomp(FeelsGravity)

var wizard = UFX.Thing()
              .addcomp(CastsSpells)
              .addcomp(TargetsPlayer)
              .addcomp(TakesDamage)
              .addcomp(WalksLikeAPerson)
              .addcomp(FeelsGravity)

var bat = UFX.Thing()
              .addcomp(TargetsPlayer)
              .addcomp(TakesDamage)
              .addcomp(GivesDamage)
              .addcomp(FliesErratically)

var boulder = UFX.Thing()
              .addcomp(GivesDamage)
              .addcomp(FeelsGravity)
              .addcomp(RollsDownhill)
```

The main challenge with a component-based system is deciding how to divide up the components effectively.

## Creating Components ##

A component is implemented as a collection of methods that will be called on the entity it's associated with. It's important to remember that within the methods, `this` always refers to the _entity_, not to the _component_.

```
var HasHealthPoints = {
    init: function (health) {
        this.health = health
    },
    takedamage: function (damage) {
        this.health -= damage
    },
    isalive: function () {
        return this.health > 0
    },
}
```

The components themselves don't have data members, but like in this example, they can be used to attach data members to the entities they're associated with.

Methods named `init` and `remove` have special meaning. Other than that, methods in a component can have any name except `addcomp`, `removecomp`, or `definemethod`.

## Entity Methods ##

When an entity is created by calling `UFX.Thing()`, it doesn't come with any useful methods except `addcomp`.

When a component is added to an entity, two things happen. First, that component's `init` method is called (if it exists). Second, for every method of the component, a method is created on the entity.

```
var player = UFX.Thing() // player has no useful methods except addcomp   

player.addcomp(HasHealthPoints, 100)
// HasHealthPoints.init is called on player, setting player.health to 100
// player now has the methods takedamage and isalive

player.takedamage(10)  // reduce player.health by 10
```

## Single Method from Multiple Components ##

More than one of an entity's components can have a method by the same name. When an entity's method is called, and it has two or more components with a method by that name, then _each_ component's version of that method will be called. This is an important and powerful feature.

```
var MakesNoise = {
    jump: function () {
        playsound("boing")
    },
    takedamage: function () {
        playsound("ouch")
    },
}

player.addcomp(MakesNoise)

player.takedamage(8) // both HasHealthPoints.takedamage and MakesNoise.takedamage will be called on player
```

The default behavior for methods defined in multiple components is:

  * The component methods will be called in the order the components were added to the entity
  * The arguments passed to each method will be the same as the arguments passed to the entity method
  * The return value from the entity method will be the return value from the _last_ component method to be called

There is currently no functionality to change this default behavior, but hopefully it will be available in the future.

## Entities as Prototypes ##

You want to use `UFX.Thing` to make a prototype for a type of entity? Sure, you can do that. This is probably more efficient, both with memory and speed of constructing objects.

```
function Bird(health) {
    this.health = health
}

Bird.prototype = UFX.Thing().
                   addcomp(FliesSmoothly).
                   addcomp(DrawSprite, "bird.png")
```

You just have to remember that the constructor has no way to call the components' `init` methods. They'll be called when the component is added to the prototype, _not_ when the constructor is called. If you want your components to have an initialization method called from the constructor, just call it something other than `init`.

## Combining Components ##

For convenience, arrays of components may be used in place of individual components when calling `UFX.Thing`, `addcomp`, `removecomp`:

```
var ShootsEveryone = [ShootsPlayer, ShootsEnemies, ShootsNPCs]
var shooter = UFX.Thing()
                 .addcomp(ShootsEveryone, 100)
```

This is equivalent to:

```
var shooter = UFX.Thing()
                 .addcomp(ShootsPlayer, 100)
                 .addcomp(ShootsEnemies, 100)
                 .addcomp(ShootsNPCs, 100)
```

Arrays of arrays of components are also fine. An array of components can be treated as a component for almost all purposes.

## Component Inheritance ##

Component inheritance doesn't come up a lot, because if you have functionality you want to add to a component, you can just make it a separate component. But you might want one component to inherit from another if you want to override some behavior. This should work fine.

However, you probably should not add two different components to a single entity if one of them inherits from the other (or generally if their prototype chains have any common ancestors).

## Removing Components ##

The recommended usage of `UFX.Thing` is to add all the components you want when you create an entity, and never remove them. If you want to remove a component, first consider whether you can just disable it by setting a flag. Removing components comes with these caveats:

  1. Adding and removing components is not fast, so be mindful of performance.
  1. Component removal cannot be used with entity serialization (which I haven't implemented yet anyway).
  1. Component removal cannot be used with entity normalization (which I haven't implemented yet anyway).
  1. Component removal can produce unintuitive results if you use component inheritance or combine components. This is because components can share methods when you do this. If you have added two components that share a method, removing one will remove both copies of the method.

If you're still sure you want to remove the component, use the `removecomp` method of the entity.

```
player.removecomp(TakesDamage)
```

If the component has a method named `remove`, it will be called with any additional arguments given to `removecomp` (like how `init` is called when you call `addcomp`).