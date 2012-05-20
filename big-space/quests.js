
var qsaucers = {}
var qplanets = {}

function qinit() {

qsaucers.greeter = Saucer(300, 400, "Use your browser's zoom function to zoom out and get a wide view. Or zoom in if you need to read small text! Press Ctrl+0 (zero) to return to the default zoom.")

qsaucers.rescuer = Saucer(600, 600, "")
    .addcomp({
        interact: function (ship) {
            if (state.rescues == 0) {
                this.info = "This is a rescue ship. You want to help us out? I'll give you the universal distress frequency. If you ever find a planet giving off|a distress call, park a ship at the distressed planet and bring another ship back to talk to us.".split("|")
            } else {
                this.info = ["You've helped us with " + state.rescues + " rescues."]
            }
        },
    })

// Mothership

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
                } else {
                    this.info = "Hey, you want to try your hand at exploring a planet? Just park your ship in front of that planet over there until it reaches 100%. We've already done most of it for you."
                }
            } else {
                this.info = "You've completed " + state.missions.length + " exploration missions for us. Go talk to some more ships and find out how you can complete more missions! Come back when you've done " + 10 + " for a reward."
            }
        }
    })

qplanets.first = Planet(2600, 2500, 20, "blue")
qplanets.first.explored = 0.9


// Swapped shadow quest

qsaucers.swapper = Saucer(3200, 3200)
    .addcomp({
        setinfo: function () {
            if (state.missions.indexOf("swapper") > -1) {
                this.info = "Thanks again!"
            } else if (qplanets.swapper.interacting) {
                this.info = "Oh wow, you found a planet with a shadow pointing the wrong way. You're such a good explorer, thank you!"
                qcomplete("swapper")
            } else {
                this.info = "I wonder if you've ever come across a world where the shadow points toward the sun instead of away from it? That would be so interesting to me. If you find one, please park one ship there and come talk to me with another ship."
            }
        }
    })
qplanets.swapper = UFX.Thing()
              .addcomp(InSpace, 1600, 2500)
              .addcomp(IsRound, 20, "white", true)
              .addcomp(ShowsPlanetInfo)

// Flat world quest

qsaucers.squished = Saucer(3000, 1400)
    .addcomp({
        setinfo: function () {
            if (state.missions.indexOf("squished") > -1) {
                this.info = "Thanks again for finding that flattened world!"
            } else if (qplanets.squished.interacting) {
                this.info = "Yes, you've found the flattened world! Thanks so much!"
                qcomplete("squished")
            } else {
                this.info = "I've been looking for a certain planet that's flattened, not round. If you find one, please park one ship there and come talk to me with another ship."
            }
        }
    })


qplanets.squished = UFX.Thing()
              .addcomp(InSpace, 1700, 900)
              .addcomp(Squished, 1.15)
              .addcomp(IsRound, 20, "green")
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)

// Square quest

var xs = [800, 800, 2800, 2800]
var ys = [400, 2400, 400, 2400]
qplanets.squares = []
for (var j = 0; j < 4 ; ++j) {
    qplanets.squares.push(Planet(xs[j], ys[j], 20, "green"))
}


var xs = [200, 1200, 2200, 3200]
var ys = [2600, 2000, 1400, 800]
qplanets.collinears = []
for (var j = 0; j < 4 ; ++j) {
    qplanets.collinears.push(Planet(xs[j], ys[j], 20, "red"))
}


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


// Antipode quest

qplanets.antipodes = [
    Planet(2200, 250, 20, "blue"),
    Planet(settings.sx - 2200, settings.sy - 250, 20, "blue"),
]


// Renamed quest

qplanets.renamed = Planet(1000, 1500, 20, "blue")
qplanets.renamed.worldname = "Billy Bob's planet - no tresspassing"


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

// Inflater quest

qplanets.inflater = UFX.Thing()
              .addcomp(InSpace, 300, 3100)
              .addcomp({ draw: function () { if (this.interacting) context.scale(0.6, 0.6) } })
              .addcomp(IsRound, 20, "white")
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)


qplanets.starcrown = Planet(1900, 3100, 20, "purple")
for (var j = 0 ; j < 6 ; ++j) {
    var x = 1900 + 25 * Math.sin(j * Math.PI / 3)
    var y = 3100 + 25 * Math.cos(j * Math.PI / 3)
    stars[j] = [x, y]
}


qplanets.overexplore = Planet(3600, 2800, 20, "brown")
qplanets.overexplore.exploremax = 2


qplanets.blinker = UFX.Thing()
              .addcomp(InSpace, 3500, 2200)
              .addcomp({
                  draw: function () { context.globalAlpha *= 0.8 + 0.2 * Math.sin(Date.now() * 0.001) } 
              })
              .addcomp(IsRound, 20, "yellow")
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)


qplanets.reverser = Planet(3000, 450, 20, "brown")

qplanets.slower = Planet(500, 1200, 20, "yellow")


qplanets.chimer = Planet(2400, 3700, 20, "purple")
qplanets.chimer.chimes = true

} // end of qinit


function qcomplete(qname) {
    state.missions.push(qname)
    if (qname == "first") {
        ships.push(Ship(settings.sx/2, settings.sy/2))
        planets.push(qplanets.swapper)
        saucers.push(qsaucers.swapper)
        planets.push(qplanets.squished)
        saucers.push(qsaucers.squished)
        
        for (var j = 0 ; j < 4 ; ++j) planets.push(qplanets.squares[j])
        for (var j = 0 ; j < 4 ; ++j) planets.push(qplanets.collinears[j])
        for (var j = 0 ; j < 2 ; ++j) planets.push(qplanets.antipodes[j])
        planets.push(qplanets.nostars)
        planets.push(qplanets.renamed)
        planets.push(qplanets.killmusic)
        planets.push(qplanets.inflater)
        planets.push(qplanets.starcrown)
        planets.push(qplanets.overexplore)
        planets.push(qplanets.blinker)
        planets.push(qplanets.reverser)
        planets.push(qplanets.slower)
        planets.push(qplanets.chimer)
    }
}

