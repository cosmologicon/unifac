var gamejs = require('gamejs')
var Images = require('./Images')
var state = require('./state')


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
    this.hittime = 1
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
    if (this.hittimer) {
        this.target = null
    } else if (this.prey) {
        var dx = this.prey.gx - this.gx, dy = this.prey.gy - this.gy
        this.logmotion(dx, dy)
        var r = this.hitradius * 0.8
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

    if (!this.reeltimer && this.hp < 0) {
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
    Critter.prototype.think.call(this, dt)
}
Adventurer.prototype.draw = function(screen) {
    screen._context.save()
    if (this.quakejump) {
        if (this.quakejump[0] == "up") {
            var x = this.gz / 100
            var scale = 1 + 4 * Math.exp(-x * (4 - x))
            screen._context.scale(1/scale, scale)
        }
        if (this.quakejump[0] == "hover") {
//            screen._context.rotate(this.quakejump[1] / 0.4 * 6.28)
        }
        if (this.quakejump[0] == "down") {
            var scale = 1 + 4 * Math.exp(-this.gz / 100)
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
    return this.mp >= 3
}
Adventurer.prototype.castat = function(pos, critters, indicators, type) {
    if (this.mp < {bolt:5,quake:3,drain:3}[type]) return false
    type = type || this.skill || "quake"
    var dx = pos[0] - this.gx, dy = pos[1] - this.gy
    if (dx * dx + dy * dy < this.castradius * this.castradius) {
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
        var dhp = Math.floor(Math.min(closest.hp, 3 * this.strength))
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
                var s = new Shockwave(0.5, 300, "brown", 3*this.strength)
                s.attachto(this.quakejump[1]).setstagepos([this.gx, this.gy, 0])
                state.mhazards.push(s)
                this.quakejump = null
            }
            break
    }
    this.prey = null
    this.target = null
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
    if (state.currentlevel != 1 && Math.random() < 0.3) {
        this.droptoken(ManaToken, 5)
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
    if (Math.random() < 0.5) {
        this.droptoken(ManaToken, 3)
    }
}


Spike = function() {
    var hp = 10
    Monster.apply(this, [hp])
    this.image = Images.getimage("spike")
    this.wandertime = 1
    this.basespeed = 60
}
gamejs.utils.objects.extend(Spike, Monster)

Bomb = function() {
    var hp = 20
    Monster.apply(this, [hp])
    this.images = [Images.getimage("bomb0"), Images.getimage("bomb1")]
    this.wandertime = 10
    this.strength = 0
    this.basespeed = 40
    this.hitradius = 1
    this.reeltilt = false
    this.reelspeed = 600
    this.t = 10
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




// BOSSES

// The Crystal just sort of stands around, you know?
Crystal = function(level) {
    var hp = 50
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
Crystal.prototype.draw = function (screen) {
    this.reeltimer = 0
    Monster.prototype.draw.call(this, screen)
}



// Zoltar never picks any prey, just spawns chaos
Zoltar = function(level) {
    this.level = level || 4
    var hp = (10 + 10 * this.level) / 10
    Monster.apply(this, [hp])
    this.r = 60 * this.level
    this.t = Math.random() * 100
    this.wandertime = 0
    this.image = Images.getimage("zoltar-" + this.level)
    this.bounce = 0
    this.bouncetime = [0,2,4,6,8][this.level]
    this.vjump = 200 * this.level
    this.jumpdist = 200 * this.level
    this.dhp = this.level
    this.wavesize = 60 + 40 * this.level
    this.vx = this.vy = this.vz = 0
    this.basespeed = 100 * this.level
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
    state.statusbox.update([this.gx, this.gy, this.gz])
    if (this.gz == 0 && this.vz == 0) {
        this.bouncetimer -= dt
        if (this.bouncetimer < 0) {
            this.leap()
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
    if (level) {
        for (var j = 0 ; j < 3 ; ++j) {
            var z = (new Zoltar(level)).attachto(state.critters).setstagepos([this.gx, this.gy, 0])
            state.monsters.push(z)
            z.castshadow()
        }
    }
    Monster.prototype.die.call(this)
}


// Birdy's bird form
Birdy = function(level) {
    var hp = 200
    Monster.apply(this, [hp])
    this.r = 40
    this.t = Math.random() * 100
    var fnames = ["birdy-0", "birdy-1", "birdy-2", "birdy-3"]
    this.frames = new Array()
    for (var j = 0 ; j < 4 ; ++j) this.frames.push(Images.getimage(fnames[j]))
    this.image = this.frames[1]
    this.strength = 10
    this.basespeed = 250
    this.reeltilt = false
    this.hitradius = 400
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
    Monster.prototype.think.call(this, dt)
    this.gz = z

    if (Math.random() < dt * 6) {
        for (var j = 0 ; j < state.players.length ; ++j) {
            if (Math.random() < 0.8) continue
            var p = state.players[j]
            if (p.gx * p.gx + p.gy * p.gy < this.hitradius * this.hitradius) {
                this.attack(p)
            }
        }
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
exports.Bomb = Bomb
exports.Crystal = Crystal
exports.Zoltar = Zoltar
exports.Birdy = Birdy


