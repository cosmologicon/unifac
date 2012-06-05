// Structures made out of a bunch of stacked blocks

// A transformation of offset and rotation (angle A)
// The "world coordinates" in this case are with respect to the tower base,
//   not with respect to the world, which uses a different coordinate system
function Xform(x, y, A, dx, dy, dA) {
    var xform = Object.create(Xform.prototype)
    xform.x = x || 0
    xform.y = y || 0
    xform.A = A || 0
    xform.dx = dx || 0
    xform.dy = dy || 0
    xform.dA = dA || 0
    xform.S0 = Math.sin(xform.A)
    xform.C0 = Math.cos(xform.A)
    xform.S1 = Math.sin(xform.A + xform.dA)
    xform.C1 = Math.cos(xform.A + xform.dA)
    return xform
}

Xform.prototype = {
    getSC: function (zeta) {
        if (zeta == 0) return [this.S0, this.C0]
        if (zeta == 1 || zeta === undefined) return [this.S1, this.C1]
        var A = this.A + zeta * this.dA
        return [Math.sin(A), Math.cos(A)]
    },
    worldpos: function (x, y, zeta) {
        if (zeta === undefined) zeta = 1
        var SC = this.getSC(zeta)
        return [this.x + zeta * this.dx + SC[1] * x + SC[0] * y,
                this.y + zeta * this.dy - SC[0] * x + SC[1] * y]
    },
    localpos: function (x, y, zeta) {
        if (zeta === undefined) zeta = 1
        var SC = this.getSC(zeta)
        var px = x - this.x - zeta * this.dx, py = y - this.y - zeta * this.dy
        return [SC[1] * px - SC[0] * py, SC[0] * px + SC[1] * py]
    },
    worldvec: function (x, y, zeta) {
        if (zeta === undefined) zeta = 1
        var SC = this.getSC(zeta)
        return [x * SC[1] + y * SC[0], -x * SC[0] + y * SC[1]]
    },
    localvec: function (x, y, zeta) {
        if (zeta === undefined) zeta = 1
        var SC = this.getSC(zeta)
        return [x * SC[1] - y * SC[0], x * SC[0] + y * SC[1]]
    },
    add: function (x, y, A, dx, dy, dA, zeta) {
        var xy = this.worldpos(x || 0, y || 0, zeta)
        var dxy = this.worldvec(dx || 0, dy || 0, zeta)
        A = (A || 0) + this.A + zeta * this.dA
        return Xform(xy[0], xy[1], A, dxy[0], dxy[1], dA)
    },
}

var HoldsBlocks = {
    initchildren: function () {
        this.children = []
    },
}

var AnchorToParent = {
    setparent: function (parent, zeta) {
        this.parent = parent
        this.parent.children.push(this)
        this.x = this.y = this.A = 0  // anchor point to parent
        this.zeta = zeta || 0  // fraction of the way up the parent's relative motion to inherit
    },
}

var BlockWobbles = {
    setwobbleparams: function () {
        this.dpx = this.dpy = this.dpA = 0
        this.vpx = this.vpy = this.vpA = 0
        this.apx = this.apy = this.apA = 0

        // TODO: put these ranges into the prototype
        this.wx = UFX.random(125, 250) ; this.bx = UFX.random(4, 10)
        this.wy = UFX.random(125, 250) ; this.by = UFX.random(4, 10)
        this.wA = UFX.random(125, 250) ; this.bA = UFX.random(4, 10)

        this.pxmax = this.pymax = 30 ; this.pAmax = 1
    },
    think: function (dt) {
        this.vpx += (this.apx - this.dpx * this.wx) * dt
        this.vpx *= Math.exp(-this.bx * dt)
        this.dpx += this.vpx * dt
        this.px = this.px0 + Math.min(Math.max(this.dpx, -this.pxmax), this.pxmax)
        this.vpy += (this.apy - this.dpy * this.wy) * dt
        this.vpy *= Math.exp(-this.by * dt)
        this.dpy += this.vpy * dt
        this.py = this.py0 + Math.min(Math.max(this.dpy, -this.pymax), this.pymax)
        this.vpA += (this.vpA - this.dpA * this.wA) * dt
        this.vpA *= Math.exp(-this.bA * dt)
        this.dpA += this.vpA * dt
        this.pA = this.pA0 + Math.min(Math.max(this.dpA, -this.pAmax), this.pAmax)
    },
}

var HasXform = {
    setxform0: function (x, y, A) {
        this.px = this.px0 = x || 0
        this.py = this.py0 = y || 0
        this.pA = this.pA0 = A || 0
        this.xform = this.parent.xform.add(this.x, this.y, this.A, this.px, this.py, this.pA, this.zeta)
    },
    think: function (dt) {
        this.oldxform = this.xform
        this.xform = this.parent.xform.add(this.x, this.y, this.A, this.px, this.py, this.pA, this.zeta)
    },
}


var TakesImpulse = {
    init: function () {
        this.passfrac = 0.5
    },
    takeimpulse: function (ix, iy, x, y, zeta, source) {
        var f = this.parent.passfrac  // fraction of impulse accepted by this block
        if (this.parent !== source) {
            this.parent.takeimpulse(ix*(1-f), iy*(1-f), x, y, this.zeta, this)
        }
        for (var j = 0 ; j < this.children.length ; ++j) {
            var child = this.children[j]
            if (child === source) continue
            var g = source === this.parent ? 0.5 : -0.5  // TODO: re-evaluate this formula
            var p = this.xform.worldpos(0, 0, 0)
            child.takeimpulse(ix*g, iy*g, p[0], p[1], 0, this)
        }
        var ipos = this.xform.localvec(ix*f, iy*f, 0)
        var pos = this.xform.localpos(x, y)
        this.vpx += ipos[0]
        this.vpy += ipos[1]
        // TODO: where the heck does this factor come from, and can I justify it?
        this.vpA += (ipos[0] * pos[1] - ipos[1] * pos[0]) * 0.0005
    },
}

var RefusesImpulse = {
    init: function () {
        this.passfrac = 1
    },
    takeimpulse: function () {
    },
}

var HasPlatform = {
    init: function () {
        this.w = 60
    },
    interact: function (sprite, oldx, oldy, x, y) {
        if (!sprite.state.catchable) return
        var oldpos = this.oldxform.localpos(oldx, oldy)
        var pos = this.xform.localpos(x, y)
        if (oldpos[1] > 0 && pos[1] <= 0 && pos[0] > -this.w/2 && pos[0] < this.w/2) {
            sprite.nextstate = ClimbState
            sprite.block = this
            sprite.blockx = pos[0]
            sprite.blocky = 0
            this.takeimpulse(0, -200, x, y)
            sprite.updatestate()
        }
    },
    dismount: function (sprite) {
        var p = this.xform.worldpos(sprite.blockx, sprite.blocky, 1)
        this.takeimpulse(0, -200, p[0], p[1])
    },
    holds: function (sprite) {
        return sprite.blockx > -this.w/2 && sprite.blockx < this.w/2
    },
    draw: function () {
/*        var p0 = this.xform.worldpos(-this.w*0.4, 0, 0)
        var p1 = this.xform.worldpos(this.w*0.4, 0, 1)
        var p2 = this.xform.worldpos(this.w*0.4, 0, 0)
        var p3 = this.xform.worldpos(-this.w*0.4, 0, 1)
        UFX.draw("ss white lw 1 b m", p0[0], p0[1], "l", p1[0], p1[1],
                                 "m", p2[0], p2[1], "l", p3[0], p3[1], "s")*/

/*        var p0 = this.xform.worldpos(-this.w/2, 0)
        var p1 = this.xform.worldpos(this.w/2, 0)
        UFX.draw("ss green lw 4 b m", p0[0], p0[1], "l", p1[0], p1[1], "s")*/
        var p = this.xform.worldpos(0, 0)
        var A = this.xform.A + this.xform.dA
        var sline = "b o 0 0 0.5 m -0.5 0 l -0.5 -0.5 a 0 -0.5 0.5 3.14 6.28 l 0.5 0"
        UFX.draw("[ t", p[0], p[1], "r", -A, "z", this.w, this.w/8, sline, "fs gray f")
//        UFX.draw("b o 0.2 0.3 0.1 o -0.1 -0.3 0.1 fs green f")
        
        UFX.draw(sline, "] ss white lw 0.6 s")
    },
}

function drawweb(xy0, SC0, xy1, SC1, w0, w1) {
    w0 = w0 || 10
    w1 = w1 || 1
    var x0 = xy0[0], y0 = xy0[1], x1 = xy1[0], y1 = xy1[1], dx = x1 - x0, dy = y1 - y0
    var S0 = SC0[0], C0 = SC0[1], S1 = SC1[0], C1 = SC1[1], dS = S1 - S0, dC = C1 - C0
    function p(x,zeta) { return [x0+dx*zeta+x*(C0+dC*zeta), y0+dy*zeta-x*(S0+dS*zeta)] }
    UFX.draw("m", p(-w0,0), "c", p(-w1,0), p(-w1,0.3), p(-w1,0.5), "c", p(-w1,0.7), p(-w1,1), p(-w0,1),
               "l", p(w0,1), "c", p(w1,1), p(w1,0.7), p(w1,0.5), "c", p(w1,0.3), p(w1,0), p(w0,0))
/*    UFX.draw("m", p(-w0,0), "l", p(-w0,1), "l", p(w0,1), "l", p(w0,0))*/
}
var HasSupports = {
    draw: function () {
        UFX.draw("b")
        var basezeta = this.parent === Ground ? -0.1 : 0
        for (var j = 0 ; j < 6 ; ++j) {
            var x0 = [-20, 0, 20, 0, 20, -20][j]
            var dx = [20, 20, -40, -20, -20, 40][j]
            var y0 = [0, 3, -1, -3, 0, 1][j]
            var dy = [3, -3, 2, 3, -3, -2][j]
            drawweb(this.xform.worldpos(x0, y0, basezeta), this.xform.getSC(0),
                    this.xform.worldpos(x0+dx, y0+dy, 1), this.xform.getSC(1))
        }
        UFX.draw("fs rgba(200,200,255,0.3) f")
    },
}
var HasSplitSupports = {
    draw: function () {
        UFX.draw("b")
        var basezeta = this.parent === Ground ? -0.1 : 0
        for (var j = 0 ; j < 3 ; ++j) {
            var x0 = [-20, 0, 20][j]
            var dx = [20, -20, 0][j]
            var y0 = [0, 2, -2][j]
            var dy = [2, -2, 2][j]
            drawweb(this.xform.worldpos(x0, y0, basezeta), this.xform.getSC(0),
                    this.xform.worldpos(x0+dx, y0+dy, 1), this.xform.getSC(1))
            drawweb(this.sister.xform.worldpos(-x0, -y0, basezeta), this.sister.xform.getSC(0),
                    this.sister.xform.worldpos(-x0-dx, -y0-dy, 1), this.sister.xform.getSC(1))
        }
        UFX.draw("fs rgba(200,200,255,0.3) f b")
        var SC = this.sister.xform.getSC(1)
        drawweb(this.xform.worldpos(-20, 0, 1), this.xform.getSC(1),
                this.sister.xform.worldpos(-20, 0, 1), [-SC[0], -SC[1]], 10, 2)
        drawweb(this.xform.worldpos(20, 0, 1), this.xform.getSC(1),
                this.sister.xform.worldpos(20, 0, 1), [-SC[0], -SC[1]], 10, 2)
        UFX.draw("f")
    },
}



var Ground = UFX.Thing()
                .addcomp(HoldsBlocks)
                .addcomp(RefusesImpulse)
                .definemethod("draw")
                .definemethod("think")
                .definemethod("interact")
Ground.initchildren()
Ground.xform = Xform()

function NormalBlock(tower, parent, dx) {
    var block = Object.create(NormalBlock.prototype)
    block.tower = tower
    block.initchildren()
    block.setparent(parent, 1)  // zeta = 1
    block.setxform0(UFX.random(-20, 20) + (dx || 0), UFX.random(40, 60), UFX.random(-0.5, 0.5))
    block.setwobbleparams()
    return block
}
NormalBlock.prototype = UFX.Thing()
                           .addcomp(AnchorToParent)
                           .addcomp(HoldsBlocks)
                           .addcomp(BlockWobbles)
                           .addcomp(TakesImpulse)
                           .addcomp(HasSupports)
                           .addcomp(HasPlatform)
                           .addcomp(HasXform)

// Returns two blocks
function Splitter(tower, parent) {
    var block1 = Object.create(SplitterLeft), block2 = Object.create(SplitterRight)
    block1.tower = block2.tower = tower
    block1.setparent(parent, 1)
    block2.setparent(parent, 1)
    block1.initchildren()
    block2.initchildren()
    var x0 = UFX.random(-20, 20)
    block1.setxform0(x0 - 45, UFX.random(40, 60), -0.4)
    block2.setxform0(x0 + 45, UFX.random(40, 60), 0.4)
    block1.setwobbleparams()
    block2.setwobbleparams()
    block1.sister = block2
    return [block1, block2]
}
var SplitterLeft = UFX.Thing()
                      .addcomp(AnchorToParent)
                      .addcomp(HoldsBlocks)
                      .addcomp(BlockWobbles)
                      .addcomp(TakesImpulse)
                      .addcomp(HasSplitSupports)
                      .addcomp(HasPlatform)
                      .addcomp(HasXform)
var SplitterRight = UFX.Thing()
                      .addcomp(AnchorToParent)
                      .addcomp(HoldsBlocks)
                      .addcomp(BlockWobbles)
                      .addcomp(TakesImpulse)
                      .addcomp(HasPlatform)
                      .addcomp(HasXform)


var MadeOfBlocks = {
    initblocks: function () {
        this.blocks = [Ground]
    },
    think: function (dt) {
        this.blocks.forEach(function (block) { block.think(dt) })
    },
    draw: function () {
        this.blocks.forEach(function (block) { context.save() ; block.draw() ; context.restore() })
    },
}

var InteractsWithYou = {
    think: function (dt) {
        if (you.vy > 0) return
        var dx = getdx(this.x, you.x), r = you.y + gamestate.worldr
        var x = r * Math.sin(dx), y = r * Math.cos(dx) - gamestate.worldr
        var dx = getdx(this.x, you.oldx), r = you.oldy + gamestate.worldr
        var oldx = r * Math.sin(dx), oldy = r * Math.cos(dx) - gamestate.worldr
        this.blocks.forEach(function (block) {
            block.interact(you, oldx, oldy, x, y)
        })
    },
}

function BlockTower(x) {
    var tower = Object.create(BlockTower.prototype)
    tower.x = x
    tower.y = 0
    tower.initblocks()
    tower.blocks.push(NormalBlock(tower, Ground))
    tower.blocks.push(NormalBlock(tower, tower.blocks[1]))
    tower.blocks.push.apply(tower.blocks, Splitter(tower, tower.blocks[2]))
    tower.blocks.push(NormalBlock(tower, tower.blocks[3]))
    tower.blocks.push(NormalBlock(tower, tower.blocks[5]))
    tower.blocks.push.apply(tower.blocks, Splitter(tower, tower.blocks[4]))
    tower.blocks.push(NormalBlock(tower, tower.blocks[7]))
    tower.blocks.push(NormalBlock(tower, tower.blocks[8]))
    tower.blocks.push(NormalBlock(tower, tower.blocks[9]))
    tower.alive = true
    tower.think(0)
    return tower
}
BlockTower.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(MadeOfBlocks)
                    .addcomp(InteractsWithYou)


