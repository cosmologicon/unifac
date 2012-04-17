// Skeletal animation, yo!

/* Here's an example skeleton:
You only really have to fill in skel.skeleton, and the rest will be added automatically

    var skel = {
        partmap: {
            bod: ["root", 0],
            arm: ["bod", -1],
        },
        defaultpose: {
            bod: { x: 0, y: 0, r: 0, s: 1 },
            larm0: { x: 0, y: 0, r: 0, s: 1 },
        },
        animations: [
            {
                name: "walk",
                duration: 1.0,
                kframes: [
                    {
                        t: 0,
                        pose: {
                            bod: { x: 0, y: 0, r: 0, s: 1 },
                            larm0: { x: 0, y: 0, r: 0, s: 1 },
                        }
                    },
                ],
            },
        ],
    }
*/
if (typeof skelspecs === "undefined") {
    var defaultskel = {
        partmap: {
        },
    }
    var skelspecs = {
        default: defaultskel,
    }
    popwindow(skelspecs)
}

// A skeleton consists of:
//   a tree of body parts,
//   a default frame pose,
//   and a series of animations, each of which contains several keyframe poses
// A pose is a map from part names to the pose specs for each part

function Skeleton(skelspec) {
    this.partmap = skelspec.partmap
    this.buildtree()
    this.defaultpose = skelspec.defaultpose || this.zeropose()
    this.animations = {}
    if (skelspec.animations) {
        for (var aname in skelspec.animations) {
            this.animations[aname] = new Animation(this, skelspec.animations[aname])
        }
    }
}
Skeleton.prototype = {
    // Build the part tree from the JSON'd spec.
    // The tree itself can't be JSON'd because it has circular references
    addpartfromspec: function (nodename) {
        if (nodename in this.parts) return this.parts[nodename]
        var parentname = this.partmap[nodename][0]
        var layer = this.partmap[nodename][1]
        var parent = this.addpartfromspec(parentname)
        var part = this.parts[nodename] = {
            parent: parent,
            layer: layer,
            children: []
        }
        parent.children.push(part[nodename])
        parent.children.sort(function (p1, p2) { return p1.layer - p2.layer })
        return part
    },
    buildtree: function () {
        this.parts = {
            root: {
                parent: null,
                layer: 0,
                children: [],
            }
        }
        for (var partname in this.partmap) {
            this.addpartfromspec(partname)
        }
    },
    
    // A pose where all the parts are zeroed out
    zeropose: function () {
        var pose = {}
        for (var nodename in this.partmap) {
            pose[nodename] = zeroposespec()
        }
        return pose
    },
    
    addanimation: function (aname) {
        aname = aname || "anim" + this.animations.length
        this.animations.push(new Animation(this, { name: aname }))
    },
    
    // Return a JSON-able object that this skeleton can be rebuilt from
    getspec: function () {
        var animations = []
        for (var j = 0 ; j < this.animations.length ; ++j) {
            animations.push(this.animations[j].getspec())
        }
        return {
            partmap: this.partmap,
            defaultpose: this.defaultpose,
            animations: animations,
        }
    },
}

// An animation comprises a series of keyframes
function Animation (skeleton, animationspec) {
    animationspec = animationspec || {}
    this.skeleton = skeleton
    this.duration = animationspec.duration || 1.0
    this.kframes = animationspec.kframes || []
}
Animation.prototype = {

    // Add a keyframe at the specified location,
    //   based on current known frames
    addkframe: function (t) {
        this.kframes.push(this.getframe(t))
        this.kframes.sort(function (f0, f1) { return f0.t - f1.t })
    },
    
    // Get a (deep copied) frame for a specified point in time, even between keyframes
    getframe: function (t) {
        if (!this.kframes.length) {
            return { t: t, pose: copypose(this.skeleton.defaultpose()) }
        }
        var lastj = this.kframes.length - 1, nextj = 0
        for (var j = 0 ; j < this.kframes.length ; ++j) {
            var tf = this.kframes[j].t
            if (tf == t) {
                return { t: t, pose: copypose(this.kframes[j].pose) }
            }
            if (tf < t && tf > this.kframes[lastj]) lastj = j
            if (t < tf && tf < this.kframes[nextj]) nextj = j
        }
        var f0 = this.kframes[lastj], f1 = this.kframes[nextj]
        var dt = t - f0.t, dt0 = f1.t - f0.t
        if (dt < 0) dt += this.duration
        if (dt0 < 0) dt0 += this.duration
        return { t: t, pose: interppose(f0.pose, f1.pose, 1 - dt / dt0) }
    },

    // Find the nearest keyframe to the specified time (does not wrap)
    nearestkframe: function(t) {
        if (!this.kframes.length) return null
        var mindt = 1000, jmin = 0
        for (var j = 0 ; j < this.kframes.length ; ++j) {
            var dt = Math.abs(this.kframes[j].t - t)
            if (dt < mindt) {
                dt = mindt ; jmin = j
            }
        }
        return anim.kframes[jmin]
    },

    // Find the next keyframe (for advancing), wrapping past the end of the duration
    nextkframe = function(t) {
        if (!this.kframes.length) return null
        for (var j = 1 ; j < this.kframes.length ; ++j) {
            if (this.kframes[j].t > t) return this.kframes[j]
        }
        return this.kframes[0]
    },

    // Return a JSON-able spec (no references to skeleton)
    getspec: function () {
        return {
            duration: this.duration,
            kframes: this.kframes,
        }
    },
}


// Functions related to manipulation of pose specs
// This object too lightweight to make a class for
function zeroposespec() {
    return { x: 0, y: 0, r: 0, s: 1 }
}
function copyposespec(pspec) {
    return { x: pspec.x, y: pspec.y, r: pspec.r, s: pspec.s }
}
function applyposespec(pspec) {
    context.translate(pspec.x, pspec.y)
    context.rotate(pspec.r)
    context.translate(-pspec.x, -pspec.y)
}
function copypose(pose0) {
    var pose = {}
    for (var partname in pose0) {
        pose[partname] = copyposespec(pose0[partname])
    }
    return pose
}
function interpposespec(pspec0, pspec1, f) {
    return {
        x: pspec0.x * (1-f) + pspec1.x * f,
        y: pspec0.y * (1-f) + pspec1.y * f,
        r: pspec0.r * (1-f) + pspec1.r * f,
        s: pspec0.s * (1-f) + pspec1.s * f,
    }
}
function interppose(pose0, pose1, f) {
    var pose = {}
    for (var partname in pose0) {
        pose[partname] = interpposespec(pose0[partname], pose1[partname], f)
    }
    return pose
}


