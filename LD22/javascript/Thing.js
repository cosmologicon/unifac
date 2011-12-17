var gamejs = require('gamejs')

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
TextBox = function(text, pos) {
    Thing.apply(this)
    this.font = new gamejs.font.Font("20px sans-serif")
    this.centered = false
    this.update(text)
    this.setpos(pos)
    return this
}
gamejs.utils.objects.extend(TextBox, Thing)
TextBox.prototype.update = function(text) {
    this.text = text || " "
    this.image = this.font.render(this.text, "white")
}


// FPS counter. automatically updates
FPSCounter = function() {
    TextBox.apply(this, ["???fps", [5, 10]])
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
    this.image0.fill("#004400")
    for (var j = 0 ; j < 100 ; ++j)
        gamejs.draw.circle(this.image0, "rgba(0,0,32,0.2)", [Math.random() * 854, Math.random() * 854], 100)
    this.image = gamejs.transform.scale(this.image0, [854, 427])
    return this
}
gamejs.utils.objects.extend(Stage, Thing)
Stage.prototype.think0 = function(dt) {
    Thing.prototype.think0.call(this, dt)
    this.children.sort(function(a,b) { return a.z - b.z })
}
// Convert gamepos (gx, gy, gz) into stagepos (x, y, z)
// TODO: handle rotation?
Stage.prototype.stagepos = function(pos) {
    var gx = pos[0], gy = pos[1], gz = pos[2]
    return [gx, gy/2 - gz/2, gy]
}
Stage.prototype.togamepos = function(pos) {
    var wpos = this.worldpos()
    var x = pos[0] - wpos[0], y = pos[1] - wpos[1]
    return [x, 2*y]
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
    return this
}
// FIXME: there's an error here if it's not a direct child of the stage.
StagedThing.prototype.stagepos = function(pos) {
    if (pos) {
        return this.parent.stagepos([pos[0] + this.gx, pos[1] + this.gy, pos[2] + this.gz])
    } else {
        return this.parent.stagepos([this.gx, this.gy, this.gz])
    }
}
StagedThing.prototype.think = function(dt) {
    var p = this.stagepos()
    this.x = p[0]
    this.y = p[1]
    this.z = p[2]
}

Effect = function(text) {
    StagedThing.apply(this)
    this.t = 0
    this.text = text || " "
    // TODO: use a stroke-able font because it looks cooler
    this.font = new gamejs.font.Font("12px sans-serif")
    this.image = this.font.render(this.text, "yellow")
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


// I don't know, an indicator of some kind?
Puddle = function() {
    StagedThing.apply(this)
    this.t = 0
}
gamejs.utils.objects.extend(Puddle, StagedThing)
Puddle.prototype.think = function(dt) {
    StagedThing.prototype.think.call(this, dt)
    this.t += dt
    if (this.t > 0.5) this.die()
}
Puddle.prototype.draw = function(screen) {
    screen._context.scale(1, 0.5)
    gamejs.draw.circle(screen, "rgba(80,80,80,0.25)", [0, 0], this.t * 50)
    gamejs.draw.circle(screen, "#FF0000", [0, 0], this.t * 50, 2)
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
        screen._context.scale(1, 0.5)
        gamejs.draw.circle(screen, "rgba(80,80,80,0.25)", [0, 0], this.r)
        gamejs.draw.circle(screen, "#FF0000", [0, 0], this.r, 2)
    }
}


// Collectible token
Token = function() {
    StagedThing.apply(this)
    this.t = Math.random() * 100
    this.image = new gamejs.Surface([10, 10])
    gamejs.draw.circle(this.image, "yellow", [5, 5], 5)
    this.info = "+HP"
}
gamejs.utils.objects.extend(Token, StagedThing)
Token.prototype.think = function(dt) {
    this.t += dt
    var h = (this.t % 0.5) * 2
    h = Math.min(h, 1 - h) * 30
    this.gz = 25 * Math.abs(Math.sin(this.t * 5))
    StagedThing.prototype.think.call(this, dt)
}
/*Token.prototype.draw = function(screen) {
    screen.blit(this.image, [-5, -3 - h])
}*/
Token.prototype.collect = function(who) {
    var par = this.parent, x = this.gx, y = this.gy, z = this.gz
    this.die()
    var e = (new Effect(this.info)).attachto(par).setstagepos([x, y, z])
}


// Sprite base class
Critter = function() {
    StagedThing.apply(this)
    this.target = null
    this.walkspeed = 100
    this.image = new gamejs.Surface([60, 60])
    gamejs.draw.circle(this.image, "green", [30, 16], 16)
}
gamejs.utils.objects.extend(Critter, StagedThing)
Critter.prototype.think = function(dt) {
    if (this.target) {
        var d = dt * this.walkspeed
        var dx = this.target[0] - this.gx, dy = this.target[1] - this.gy
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
    StagedThing.prototype.think.call(this, dt)
}

// Player character
Adventurer = function() {
    Critter.apply(this)
    this.reach = 20
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
                token.collect()
                // TODO: get the token's powaaaah!
            }
        }
    }
}




exports.Thing = Thing
exports.FPSCounter = FPSCounter
exports.TextBox = TextBox
exports.Stage = Stage
exports.StagedThing = StagedThing
exports.Puddle = Puddle
exports.Selector = Selector
exports.Critter = Critter
exports.Adventurer = Adventurer
exports.Token = Token
exports.Effect = Effect

