
var qsaucers = {}
var qplanets = {}

function qinit() {

qsaucers.greeter = Saucer(300, 400, "Use your browser's zoom function to zoom out and get a wide view. Or zoom in if you need to read small text! Press Ctrl+0 (zero) to return to the default zoom.")


// Mothership

var nextship = 3  // 6 10 15 21
qsaucers.mothership = UFX.Thing()
    .addcomp(InSpace, 0, 0)
    .addcomp(CirclesSun)
    .addcomp(Scales, 3)
    .addcomp(DrawSaucer)
    .addcomp(ShowsSpeechBubble)
    .addcomp({
        setinfo: function () {
            if (state.missions.length == 0) {
                if (state.explored.length) {
                    this.info = "Wow, you did a good job exploring that planet. I think that deserves a reward. Take another ship. That will help you explore even faster!"
                    qcomplete("first")
                    ships.push(Ship(settings.sx/2, settings.sy/2))
                    addmissions()
                } else {
                    this.info = "Hey, you want to try your hand at exploring a planet? Just park your ship in front of that planet over there until it reaches 100%. We've already done most of it for you."
                }
            } else if (state.missions.length == 21) {
                this.info = "You've completed every mission we have! Thanks for playing!"
            } else if (state.missions.length >= nextship) {
                this.info = "You've completed at least " + nextship + " exploration missions for us. That deserves a new ship!"
                ships.push(Ship(settings.sx/2, settings.sy/2))
                nextship += ships.length
                addmissions()
            } else {
                this.info = "You've completed " + state.missions.length + " exploration missions for us. Go talk to some more ships and find out how you can complete more missions! Come back when you've done " + nextship + " for a reward."
            }
        }
    })

distressed = undefined
qsaucers.rescuer = UFX.Thing()
    .addcomp(InSpace, 2600, 1600)
    .addcomp(OscillatesWhenIdle, 2.5)
    .addcomp(Scales, 2)
    .addcomp(DrawSaucer)
    .addcomp(ShowsSpeechBubble)
    .addcomp({
        setinfo: function () {
            if (state.unlocked.rescuer) {
                if (distressed && distressed.interacting) {
                    state.rescues++
                    this.info = "Thanks! We see the planet in distress. We're on it. You've helped us make " + state.rescues + " rescues so far!"
                    distressed.distressed = false
                    distressed = undefined
                    qcomplete("rescue" + state.rescues)
                } else if (state.rescues == 5) {
                    this.info = "You've helped us make 5 rescues! I don't think we'll be hearing any more distress calls any time soon."
                } else {
                    this.info = "You've helped us make " + state.rescues + " so far. If you ever hear any distress calls, find the planet giving them off. Park a ship there and bring another ship back here to talk to us."
                }
            } else {
                this.info = "Hi there explorer. This is a rescue ship. You want to help out? We'll give the universal distress frequency. If you ever hear any distress calls, find the planet giving them off. Park a ship there and bring another ship back here to talk to us."
                state.unlocked.rescuer = true
            }
        }
    })



qplanets.first = Planet(2600, 2500, 20, "blue")
qplanets.first.explored = 0.9


function seeker (x, y, missionname, plans, t0, t1, t2) {
    return Saucer(x, y)
        .addcomp({
            setinfo: function () {
                var complete = true
                plans.forEach( function (plan) { if (!plan.interacting) complete = false })
                if (state.missions.indexOf(missionname) > -1) {
                    this.info = t2
                } else if (complete) {
                    this.info = t1
                    qcomplete(missionname)
                } else {
                    this.info = t0
                }
            }
        })
}

// Swapped shadow quest

qplanets.swapper = UFX.Thing()
              .addcomp(InSpace, 1600, 2500)
              .addcomp(IsRound, 20, "white", true)
              .addcomp(ShowsPlanetInfo)
qsaucers.swapper = seeker(3400, 1800, "swapper", [qplanets.swapper],
    "I wonder if you've ever come across a world where the shadow points toward the sun instead of away from it? That would be so interesting to me. If you find one, please park one ship there and come talk to me with another ship.",
    "Oh wow, you found a planet with a shadow pointing the wrong way. You're such a good explorer, thank you!",
    "Thanks again!"
)

// Flat world quest

qplanets.squished = UFX.Thing()
              .addcomp(InSpace, 1700, 900)
              .addcomp(Squished, 1.15)
              .addcomp(IsRound, 20, "green")
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)
qsaucers.squished = seeker(500, 2000, "squished", [qplanets.squished],
    "I've been looking for a certain planet that's flattened, not round. If you find one, please park one ship there and come talk to me with another ship.",
    "Yes, you've found the flattened world! Thanks so much!",
    "Thanks again!"
)

// Square quest

var xs = [800, 800, 2800, 2800]
var ys = [400, 2400, 400, 2400]
qplanets.squares = []
for (var j = 0; j < 4 ; ++j) {
    qplanets.squares.push(Planet(xs[j], ys[j], 20, "green"))
}
qsaucers.square = seeker(3300, 3300, "square", qplanets.squares,
    "I heard somewhere that there are four green planets that make a perfect square. If you find them, please park a ship at each of the four worlds, and then bring a fifth ship back here to talk to me.",
    "Hey, you found four green planets that make a perfect square! Well done!",
    "Thanks again!"
)


var xs = [200, 1200, 2200, 3200]
var ys = [2600, 2000, 1400, 800]
qplanets.collinears = []
for (var j = 0; j < 4 ; ++j) {
    qplanets.collinears.push(Planet(xs[j], ys[j], 20, "red"))
}
qsaucers.collinear = seeker(1100, 3800, "collinear", qplanets.collinears,
    "There's supposedly four red planets that are in a straight line. If you find them, please park a ship at each of the four worlds, and then bring a fifth ship back here to talk to me.",
    "Oh nice, you found four red planets in a straight line!",
    "Thanks again!"
)


// No stars quest

qplanets.nostars = Planet(1500, 300, 20, "orange")
var nstars = []
stars.forEach(function (star) {
    var dx = star[0] - 1500, dy = star[1] - 300
    if (dx*dx + dy*dy > 200*200) {
        nstars.push(star)
    }
})
stars = nstars
qsaucers.nostars = seeker(2200, 2800, "nostars", [qplanets.nostars],
    "Have you ever seen a planet with no stars around it? I mean, it's like the stars are missing in the close vicinity of the planet. I think such a planet might exist. If you find one, please park a ship there and bring another ship back to talk to me.",
    "Wow, a planet with no stars around it! How did you manage to find it? Thank you!",
    "Thanks again!"
)


// Antipode quest

qplanets.antipodes = [
    Planet(2200, 250, 20, "blue"),
    Planet(settings.sx - 2200, settings.sy - 250, 20, "blue"),
]
qsaucers.antipode = seeker(1200, 1000, "antipode", qplanets.antipodes,
    "You know what I'd like to find? Two blue planets that are on exact opposite sides of the sun. I'm talking exactly opposite each other. They'd have to be the same distance away from the sun, too, for it to really count. If you find two blue planets like that, please park a ship at each one and bring another ship back to talk to me.",
    "Thanks, you found exactly what I was looking for, two blue planets opposite the sun!",
    "Thanks again!"
)


// Renamed quest

qplanets.renamed = Planet(1000, 1500, 20, "blue")
qplanets.renamed.worldname = "Billy Bob's planet - no tresspassing"
qsaucers.renamed = seeker(3500, 300, "renamed", [qplanets.renamed],
    "How you doin'? My name's Billy Bob. You think you could help me out? I have a planet somewhere around here, but I can't find it! You'll know it's mine because when you finish exploring it, it says so. If you could park a ship at my planet and bring another ship back to talk to me, I'd be much obliged. What color is it?... I don't remember!",
    "Yay, you found my planet! Thank you kindly!",
    "Thanks again!"
)

// Kill music quest

qplanets.killmusic = Planet(900, 2800, 20, "red")
    .addcomp({
        think: function (dt) {
            var v = UFX.resource.sounds.music.volume
            if (this.interacting) {
                UFX.resource.sounds.music.volume = Math.max(v - 0.3 * dt, 0)
            } else {
                UFX.resource.sounds.music.volume = Math.min(v + 0.3 * dt, 1)
            }
        }
    })
qsaucers.killmusic = seeker(2600, 800, "killmusic", [qplanets.killmusic],
    "You know this background music that's always playing? I'd love to know about a planet where you could make it stop. If you ever find a planet that causes the background music to stop when you park there, bring a second ship back to talk to me.",
    "Oh thanks! You found out where I can stop the music!",
    "Thanks again!"
)

// Inflater quest

qplanets.inflater = UFX.Thing()
              .addcomp(InSpace, 300, 3100)
              .addcomp({ draw: function () { if (this.interacting) context.scale(0.6, 0.6) } })
              .addcomp(IsRound, 20, "white")
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)
qsaucers.inflater = seeker(400, 700, "inflater", [qplanets.inflater],
    "How do you do? I'm some kind of scientist. I'm looking for a planet that shrinks whenever you park on it. Have you ever seen something like that? If you do, please park a ship there and bring another ship back to talk to me.",
    "You found the shrinking planet! Thank you very much!",
    "Thanks again!"
)


qplanets.starcrown = Planet(1900, 3100, 20, "purple")
for (var j = 0 ; j < 6 ; ++j) {
    var x = 1900 + 25 * Math.sin(j * Math.PI / 3)
    var y = 3100 + 25 * Math.cos(j * Math.PI / 3)
    stars[j] = [x, y]
}
qsaucers.starcrown = seeker(300, 3700, "starcrown", [qplanets.starcrown],
    "I'm looking for a planet that has a ring of six stars around it. If you find one, please park a ship there and bring another ship back to talk to me. I would be very grateful.",
    "Oh thank you, a planet with a ring of stars. It's just what I was looking for!",
    "Thanks again!"
)


qplanets.overexplore = Planet(3600, 2800, 20, "brown")
qplanets.overexplore.exploremax = 2
qsaucers.overexplore = seeker(1200, 2200, "overexplore", [qplanets.overexplore],
    "You think that 100% is the most you can explore any planet? Not so, I heard there's one planet where you can explore up to 200%! Can you imagine? What does that even mean? Anyway, if you find one, please park a ship there and come back to talk to me.",
    "Yes, you found it! A planet you can explore more than 100%! Thank you!",
    "Thanks again!"
)


qplanets.blinker = UFX.Thing()
              .addcomp(InSpace, 3500, 2200)
              .addcomp({
                  draw: function () { context.globalAlpha *= 0.8 + 0.2 * Math.sin(Date.now() * 0.001) } 
              })
              .addcomp(IsRound, 20, "yellow")
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)
qsaucers.blinker = seeker(1500, 3200, "blinker", [qplanets.blinker],
    "I'm telling you, there's a planet that fades in and out. It's subtle, but you'll see it if you look closely. Park a ship there and bring another one back to talk to me, if you would.",
    "Hey, a planet that fades in and out. Trippy. Thank you!",
    "Thanks again!"
)


qplanets.reverser = Planet(3000, 450, 20, "brown")
qsaucers.reverser = seeker(2500, 3000, "reverser", [qplanets.reverser],
    "Did you ever get close to a planet and your ship was suddenly facing the wrong direction? That's so weird, to be flying backward! There's a planet here somewhere that does that to you. If you park a ship there, please bring another ship back to see me.",
    "Wow, it's that planet that makes you reverse direction. Thank you!",
    "Thanks again!"
)

qplanets.slower = Planet(500, 1200, 20, "yellow")
qsaucers.slower = seeker(3000, 2200, "slower", [qplanets.slower],
    "Have you ever seen a planet that makes your ship slow down unexpectedly? If you find one, park a ship there and bring another ship to talk to me.",
    "Wow, it's that planet that makes you slow down. Thank you!",
    "Thanks again!"
)


qplanets.chimer = Planet(2400, 3700, 20, "purple")
qplanets.chimer.chimes = true
qsaucers.chimer = seeker(1800, 300, "chimer", [qplanets.chimer],
    "There's a planet that makes a cute little noise when you stop on it. Bling! Have you heard it? I wish I could find it.... If you park a ship there, please bring another ship back here to talk to me.",
    "Thanks, you found the noisemaking planet I was looking for. You're so thoughtful!",
    "Thanks again!"
)

pspares = []
var bcoords = []
for (var p in qplanets) {
    if (qplanets[p].length) {
        for (var j = 0 ; j < qplanets[p].length ; ++j) {
            bcoords.push([qplanets[p][j].x, qplanets[p][j].y])
        }
    } else {
        bcoords.push([qplanets[p].x, qplanets[p].y])
    }
}
for (var s in qsaucers) {
    bcoords.push([qsaucers[s].x, qsaucers[s].y0])
}

while (pspares.length < 40) {
    var x = UFX.random(100, settings.sx - 100)
    var y = UFX.random(100, settings.sy - 100)
    var dx = x - settings.sx / 2, dy = y - settings.sy / 2
    if (dx*dx + dy*dy < 600*600) continue
    var good = true
    bcoords.forEach(function (p) {
        var dx = x - p[0], dy = y - p[1]
        if (dx*dx + dy*dy < 220*220) good = false
    })
    if (!good) continue
    bcoords.push([x, y])

    var color = UFX.random.choice("red orange yellow green blue purple white brown".split(" "))
    pspares.push(Planet(x, y, 20, color))
}


} // end of qinit



function qcomplete(qname) {
    state.missions.push(qname)
}

function addmissions() {
    if (ships.length == 2) {
        planets.push(qplanets.swapper)
        saucers.push(qsaucers.swapper)
        planets.push(qplanets.squished)
        saucers.push(qsaucers.squished)
        planets.push(qplanets.nostars)
        saucers.push(qsaucers.nostars)
        planets.push(qplanets.renamed)
        saucers.push(qsaucers.renamed)
        planets.push(qplanets.killmusic)
        saucers.push(qsaucers.killmusic)
        planets.push(qplanets.inflater)
        saucers.push(qsaucers.inflater)
        planets.push(qplanets.starcrown)
        saucers.push(qsaucers.starcrown)
        planets.push(qplanets.overexplore)
        planets.push(qplanets.blinker)
        saucers.push(qsaucers.blinker)
        planets.push(qplanets.reverser)
        planets.push(qplanets.slower)
        saucers.push(qsaucers.slower)
        planets.push(qplanets.chimer)
        saucers.push(qsaucers.chimer)
        for (var j = 0 ; j < 2 ; ++j) planets.push(qplanets.antipodes[j])
        for (var j = 0 ; j < 4 ; ++j) planets.push(qplanets.squares[j])
        for (var j = 0 ; j < 4 ; ++j) planets.push(qplanets.collinears[j])
        for (var j = 0 ; j < 10 ; ++j) planets.push(pspares[j])
    } else if (ships.length == 3) {
        saucers.push(qsaucers.antipode)
        saucers.push(qsaucers.rescuer)
        for (var j = 10 ; j < 20 ; ++j) planets.push(pspares[j])
    } else if (ships.length == 4) {
        saucers.push(qsaucers.overexplore)
        saucers.push(qsaucers.reverser)
        for (var j = 20 ; j < 30 ; ++j) planets.push(pspares[j])
    } else if (ships.length == 5) {
        saucers.push(qsaucers.square)
        saucers.push(qsaucers.collinear)
        for (var j = 30 ; j < 40 ; ++j) planets.push(pspares[j])
    }
}

