var gamejs = require('gamejs')
var Images = require('./Images')

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
Stage.prototype.stageposof = function(pos) {
    var gx = pos[0], gy = pos[1], gz = pos[2]
    return [gx, gy/2 - 0.866*gz, gy]
}
Stage.prototype.gamepos = function(pos) {
    return pos
}
Stage.prototype.stagepos = function(pos) {
    return this.stageposof(pos)
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
    this.think(0)
    return this
}
// TODO - clean up this mess maybe?
StagedThing.prototype.stageposof = function(pos) {
    return this.parent.stageposof(pos)
}
StagedThing.prototype.stagepos = function(pos) {
    return this.stageposof(this.gamepos(pos))
}
StagedThing.prototype.gamepos = function(pos) {
    if (pos) {
        return this.parent.gamepos([pos[0] + this.gx, pos[1] + this.gy, pos[2] + this.gz])
    } else {
        return this.parent.gamepos([this.gx, this.gy, this.gz])
    }
}
StagedThing.prototype.think = function(dt) {
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
    this.font = new gamejs.font.Font("12px sans-serif")
    this.image = this.font.render(this.text, this.color)
    return this
}
gamejs.utils.objects.extend(Effect, StagedThing)
Effect.prototype.think = function(dt) {
    this.gz += 50 * dt
//    alert([this.gx, this.gy, this.gz])
//    alert(this.gamepos())
//    alert(this.stageposof(this.gamepos()))
//    alert(this.stagepos())
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
    screen._context.scale(1, 0.5)
    if (this.color0)
        gamejs.draw.circle(screen, this.color0, [0, 0], this.r)
    if (this.color1)
        gamejs.draw.circle(screen, this.color1, [0, 0], this.r, 2)
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
    screen._context.scale(1, 0.5)
    var r = this.t * this.rmax / this.tmax
    if (r > 3) {
        gamejs.draw.circle(screen, this.color0, [0, 0], r)
        gamejs.draw.circle(screen, this.color1, [0, 0], r, 2)
    }
}

// Ka-boom!
Bolt = function() {
    StagedThing.apply(this)
    this.t = 0
}
gamejs.utils.objects.extend(Bolt, StagedThing)
Bolt.prototype.think = function(dt) {
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
}
gamejs.utils.objects.extend(Shockwave, Puddle)
Shockwave.prototype.draw = function(screen) {
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


Bolt.prototype.think = function(dt) {
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
// FIXME: doesn't work if not directly connected to the stage
Selector.prototype.contains = function(critter) {
    var dx = this.gx - critter.gx, dy = this.gy - critter.gy
    return dx * dx + dy * dy < this.r * this.r
}



// Collectible token
Token = function(info, color) {
    StagedThing.apply(this)
    this.t = Math.random() * 100
    this.image = new gamejs.Surface([10, 18])
    this.color = color || "white"
    gamejs.draw.circle(this.image, this.color, [5, 5], 5)
    this.info = info || " "
}
gamejs.utils.objects.extend(Token, StagedThing)
Token.prototype.think = function(dt) {
    this.t += dt
    var h = (this.t % 0.5) * 2
    h = Math.min(h, 1 - h) * 30
    this.gz = 25 * Math.abs(Math.sin(this.t * 5))
    StagedThing.prototype.think.call(this, dt)
}
Token.prototype.affect = function(who) {
}
Token.prototype.collect = function(who) {
    var par = this.parent, x = this.gx, y = this.gy, z = this.gz
    if (!par) return
    this.die()
    this.affect(who)
    var e = (new Effect(this.info)).attachto(par).setstagepos([x, y, 30])
}

HealToken = function(dhp) {
    this.dhp = dhp || 5
    Token.apply(this, ["+" + this.dhp + "HP", "red"])
}
gamejs.utils.objects.extend(HealToken, Token)
HealToken.prototype.affect = function(who) {
    if (who)
        who.hp = Math.min(who.hp + this.dhp, who.hp0)
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



// Collectible token
HealthBar = function() {
    StagedThing.apply(this)
    this.color0 = "white"
    this.color1 = "red"
}
gamejs.utils.objects.extend(HealthBar, StagedThing)
HealthBar.prototype.draw = function(screen) {
    if (!this.parent || this.parent.hp >= this.parent.hp0) return
    var x0 = Math.round(this.parent.hp0 * 4)
    var x = Math.round(Math.max(this.parent.hp * x0 / this.parent.hp0, 0))
    // TODO: make this a slightly better-looking image
    gamejs.draw.line(screen, this.color1, [-x0/2-1,0], [-x0/2+x0+1,0], 6)
    if (x > 0) gamejs.draw.line(screen, this.color0, [-x0/2,0], [-x0/2+x,0], 4)
}



// Sprite base class
Critter = function(hp0) {
    StagedThing.apply(this)
    this.target = null
    this.walkspeed = 100
    this.healrate = 0
    this.manarate = 0
    this.hp0 = hp0 || 5
    this.hitradius = 100
    this.castradius = 0
    this.hittimer = 0
    this.hittime = 1
    this.strength = 1
    this.r = 10

    this.prey = null
    this.healthbar = null
    this.image = new gamejs.Surface([60, 60])
    this.hp = this.hp0
    this.reeltimer = 0
    gamejs.draw.circle(this.image, "green", [30, 16], 16)
}
gamejs.utils.objects.extend(Critter, StagedThing)
Critter.prototype.think = function(dt) {
    // Set target based on prey
    if (this.hittimer) {
        this.target = null
    } else if (this.prey) {
        var dx = this.prey.gx - this.gx, dy = this.prey.gy - this.gy
        var r = this.hitradius - 20
        if (this.target) { // already pursuing the prey
            if (dx * dx + dy * dy < r * r) {
                this.target = null
                this.attack(this.prey)
            } else {
                this.target = [this.prey.gx, this.prey.gy]
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

    if (this.reeltimer) {
        var dx = this.reelfrom[0] - this.gx, dy = this.reelfrom[1] - this.gy
        var f = 4 * this.walkspeed * Math.min(dt, this.reeltimer) / Math.sqrt(dx * dx + dy * dy)
        this.gx -= dx * f
        this.gy -= dy * f
        this.reeltimer -= dt
        if (this.reeltimer <= 0) {
            this.reeltimer = 0
            if (this.hp < 0) {
                this.die()
            }
        }
    } else if (this.target) {
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
    if (this.healrate > 0) {
        this.hp = Math.min(this.hp + this.healrate * dt, this.hp0)
    }
    this.hittimer = Math.max(this.hittimer - dt, 0)
    StagedThing.prototype.think.call(this, dt)
}
// Receive a hit (of how much, and from whom)
Critter.prototype.hit = function(dhp, who) {
    this.hp -= dhp
    var e = (new Effect("-" + dhp + "HP")).attachto(this)
    if (!this.healthbar) {
        this.healthbar = (new HealthBar()).attachto(this).setstagepos([0,0,60])
    }
    // TODO: can't I put this back?
    e.gx = 0
    e.gy = 0
    e.gz = 30
    if (who) {
        this.reeltimer = 0.05 * Math.sqrt(dhp)
        this.reelfrom = [who.gx, who.gy]
    }
}
Critter.prototype.attack = function (who) {
    who.hit(this.strength, this)
    this.hittimer = this.hittime
}
Critter.prototype.localcontains = function(pos) {
    var x = pos[0], y = pos[1] + this.r
    return x * x + y * y < this.r * this.r
}



// Player character
Adventurer = function() {
    hp0 = 5
    Critter.apply(this, [hp0])
    this.reach = 20
    this.r = 30
    this.healrate = 0.2
    this.image = Images.getadvimage()
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
                token.collect(this)
                // TODO: get the token's powaaaah!
            }
        }
    }
}
Adventurer.prototype.think = function(dt) {
    Critter.prototype.think.call(this, dt)
//    if (Math.random() * 3 < dt) (new Spark()).attachto(this.parent).setstagepos([this.gx, this.gy, 30])
}


// What do you think?
Monster = function(hp0) {
    Critter.apply(this, [hp0])
    this.r = 15
    this.hitradius = 100
    this.image = new gamejs.Surface([4*this.r, 4*this.r])
    this.basespeed = 40  // walk speed when not pursuing a player
    gamejs.draw.circle(this.image, "#008800", [2*this.r, this.r], this.r)
//    this.image = Images.getadvimage()
}
gamejs.utils.objects.extend(Monster, Critter)
Monster.prototype.think = function (dt) {
    this.walkspeed = this.prey ? 2 * this.basespeed : this.basespeed
    Critter.prototype.think.call(this, dt)
    if (!this.hittimer && !this.prey && !this.target) {
        if (Math.random() * 3 < dt) {
            var r = Math.random() * 200 + 100
            var theta = Math.random() * 1000
            this.target = [this.gx + r * Math.cos(theta), this.gy + r * Math.sin(theta)]
        }
    }
}
Monster.prototype.hit = function(dhp, who) {
    Critter.prototype.hit.call(this, dhp, who)
    this.target = this.prey = null
}

// TODO
Monster.prototype.chooseprey = function(players) {
    this.prey = players[0]
}



exports.Thing = Thing
exports.FPSCounter = FPSCounter
exports.TextBox = TextBox
exports.Stage = Stage
exports.StagedThing = StagedThing
exports.Puddle = Puddle
exports.Indicator = Indicator
exports.Selector = Selector
exports.Critter = Critter
exports.Adventurer = Adventurer
exports.HealToken = HealToken
exports.Effect = Effect
exports.Bolt = Bolt
exports.Shockwave = Shockwave

exports.Monster = Monster


