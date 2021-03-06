


HasPosition = {
    init: function (tower, pos) {
        this.tower = tower
        this.x = pos ? pos[0] : 0
        this.y = pos ? pos[1] : 0
        this.tower.addsprite(this)
    },
}

FeelGravity = {
    init: function (g) {
        this.g = g || 400
        this.vx = 0
        this.vy = 0
    },
    
    think: function (dt) {
        if (this.parent === this.tower) {
            this.oldy = this.y
            this.y += (this.vy - 0.5 * this.g * dt) * dt
            this.vy -= this.g * dt
        }
        this.vx = Math.min(Math.max(-settings.walkspeed, this.vx), settings.walkspeed)
        this.x += this.vx * dt
//        this.vx *= Math.exp(-settings.slidefactor * dt)
    },
}

CanLand = {
    init: function () {
        this.dropspeed = 1
    },
    land: function (platform) {
/*        if self.vy < -100:
            y0, vy0 = self.y - platform.y, self.vy
            try:
                t = (vy0 + math.sqrt(vy0 ** 2 + 2 * self.g * y0)) / self.g
            except:
                t = 0
            landspeed = vy0 - self.g * t
            if landspeed < -settings.diespeed:
                self.alive = False*/
        this.vy = 0
        this.y = platform.y
        this.attachto(platform)
    },
    drop: function () {
        this.attachto(this.tower)
        this.vy = -this.dropspeed
        this.y -= 0.1
    },

    think: function (dt) {
        if (this.parent === this.tower) {
            var platforms = this.tower.platforms
            for (var j = 0 ; j < platforms.length ; ++j) {
                if (platforms[j].catches(this)) {
                    this.land(platforms[j])
                    return
                }
            }
        } else {
            if (this.parent !== this.tower && !this.parent.holds(this)) {
                this.drop()
            }
        }
    },
}

FacePosition = {
    init: function () {
        this.facingright = true
    },
    
    lookingat: function () {
        return [this.x + (this.facingright ? 1 : -1) * this.tower.r * 0.6,
                this.y]
        return [this.x + (this.facingright ? 1 : -1) * this.tower.r * 0.2 + this.vx * 0.4,
                this.y + this.vy * Math.abs(this.vy) * 0.0008]
    },
}

DrawBox = {
    draw: function (yrange) {
        var pos = this.tower.worldpos(this.x, this.y, 6)
        context.save()
        context.beginPath()
        context.translate(pos[0], pos[1])
        context.moveTo(-6, 0)
        context.lineTo(6, 0)
        context.lineTo(-4, -20)
        context.lineTo(4, -20)
        context.closePath()
        context.strokeStyle = "orange"
        context.stroke()
        context.restore()
    },
    drawfuncs: function (yrange) {
        return [[this.draw, this, (this.tower.infront(this.x) ? 1 : -1), this.y, "sprite"]]
    },
}


Controlled = {
    init: function () {
        this.maxjumps = 2
        this.laststand = this.y  // last y-coordinate while grounded
        this.njumps = this.maxjumps  // Number of times having jumped since leaving last platform
        this.tjump = null
    },
    controlstep: function (ds) {
//        if self.outtimer: return
        if (ds == 0) {
            if (this.parent === this.tower) {
                this.vx *= 0.9
            } else {
                this.vx = 0
            }
            return
        }
        if (this.vx * ds < 0) this.vx = 0
        this.vx += settings.walkaccel * ds
//        this.x += settings.walkspeed * ds
        this.facingright = ds > 0
        //.stepped = True
    },
    controljump: function () {
        if (this.parent === this.tower) {
            if (this.njumps >= this.maxjumps) return
//            this.vy = settings.jumpspeed
//            self.vy = min(self.vy + settings.djumpboost, settings.jumpspeed)
            this.njumps += 1
//            if self.playsounds: noise.play("jump-1")
        } else {
            this.attachto(this.tower)
//            this.vy = settings.jumpspeed
            this.njumps = 1
//            if self.playsounds: noise.play("jump-1")
        }
    },
    think: function (dt) {
        if (this.tjump !== null) this.tjump += dt
    },
    drop: function () {
        this.njumps = 1
        this.tjump = 0
    },
    // Call this each update with jcontrol whether up is being pressed
    //   and hcontrol whether right/left is being pressed
    control: function (hcontrol, jcontrol, dt) {
        this.controlstep(hcontrol * dt)
        if (jcontrol) {
            if (this.tjump === null) {
                this.tjump = 0
                this.controljump()
            }
            this.tjump += dt
            if (this.tjump < settings.hoptime) {
                this.vy = this.tjump * settings.jumpspeed / settings.hoptime
            }
            this.controljump(dt)
        } else {
            this.tjump = null
        }
//        if self.outtimer: return
    },
    land: function () {
        this.njumps = 0
        this.tjump = null
        this.laststand = this.y
    },
    // Call this when the jump key is released
    releasejump: function (dt) {
        if (this.tjump >= settings.hoptime) return
        if (this.vy <= 0) return
        var v0 = settings.jumpspeed * this.tjump / settings.hoptime
//        this.vy = v0 - this.tjump * this.g
//        this.y = this.laststand + (v0 - 0.5 * this.g * this.tjump) * this.tjump
//        this.vy = 0
        this.vy *= this.tjump / settings.hoptime
    },
}

function You(tower, pos) {
    return UFX.Thing().
        addcomp(UFX.Component.HasParent).
        addcomp(Controlled).
        addcomp(HasPosition, tower, pos).
        addcomp(FacePosition).
        addcomp(FeelGravity).
        addcomp(CanLand).
        addcomp(DrawBox)
}


