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

var DrawBlock = {
    init: function () {
        this.w = 50
    },
    draw: function () {
        var p0 = this.xform.worldpos(-this.w*0.4, 0, 0)
        var p1 = this.xform.worldpos(this.w*0.4, 0, 1)
        var p2 = this.xform.worldpos(this.w*0.4, 0, 0)
        var p3 = this.xform.worldpos(-this.w*0.4, 0, 1)
        UFX.draw("ss white lw 1 b m", p0[0], p0[1], "l", p1[0], p1[1],
                                 "m", p2[0], p2[1], "l", p3[0], p3[1], "s")
        var p0 = this.xform.worldpos(-this.w/2, 0)
        var p1 = this.xform.worldpos(this.w/2, 0)
        UFX.draw("ss green lw 4 b m", p0[0], p0[1], "l", p1[0], p1[1], "s")
    },
}

var Ground = UFX.Thing()
                .addcomp(HoldsBlocks)
                .addcomp(RefusesImpulse)
                .definemethod("draw")
                .definemethod("think")
Ground.initchildren()
Ground.xform = Xform()

function NormalBlock(parent) {
    var block = Object.create(NormalBlock.prototype)
    block.initchildren()
    block.setparent(parent, 1)  // zeta = 1
    block.setxform0(UFX.random(-10, 10), UFX.random(40, 60), UFX.random(-0.3, 0.3))
    block.setwobbleparams()
    return block
}
NormalBlock.prototype = UFX.Thing()
                           .addcomp(AnchorToParent)
                           .addcomp(HoldsBlocks)
                           .addcomp(BlockWobbles)
                           .addcomp(TakesImpulse)
                           .addcomp(DrawBlock)
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

function BlockTower(x) {
    var tower = Object.create(BlockTower.prototype)
    tower.x = x
    tower.y = 0
    tower.initblocks()
    tower.blocks.push(NormalBlock(Ground))
    tower.blocks.push(NormalBlock(tower.blocks[1]))
    tower.blocks.push(NormalBlock(tower.blocks[2]))
    tower.blocks.push(NormalBlock(tower.blocks[3]))
    tower.blocks.push(NormalBlock(tower.blocks[4]))
    tower.blocks.push(NormalBlock(tower.blocks[5]))
    tower.blocks.push(NormalBlock(tower.blocks[6]))
    tower.blocks.push(NormalBlock(tower.blocks[3]))
    tower.blocks.push(NormalBlock(tower.blocks[8]))
    tower.blocks.push(NormalBlock(tower.blocks[9]))
    tower.alive = true
    tower.think(0)
    return tower
}
BlockTower.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(MadeOfBlocks)


