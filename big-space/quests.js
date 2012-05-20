
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
                this.info = "You've completed " + state.missions.length + " exploration missions for us. Come back when you've done " + 10 + " for a reward."
            }
        }
    })

qplanets.first = Planet(2600, 2500, 20, "blue")
qplanets.first.explored = 0.9


function qcomplete(qname) {
    state.missions.push(qname)
    if (qname == "first") {
        ships.push(Ship(settings.sx/2, settings.sy/2))
    }
}


}
