var dialogue = {
    script: [
        [
            "Day 1",
            "My name is Jemery Maker. I am a terraformer.",
            "While performing a routine terraforming on planet Horus 14045b, my ship was struck by an eletrical storm and fell into the ocean. I had to eject.",
            "My ship fails to respond to pings, even though my transponder signal should be able to penetrate many kilometers of fluid.",
            "Scans suggest that the ocean on this world is made of a previously unknown substance, which must cause massive electromagnetic interference.",
            "My life support can hold out for some time, but without a ship, I don't see how I'm going anywhere.",
            "For now, I find myself on an island with one of the meteorological dissipation devices I installed before losing my ship.",
            "It's currently inactive, but If I can activate it, I should be safe from the lightning for now.",
        ],
        [
            "Day 3",
            "Today, something came out of the ocean.",
            "This planet was certified devoid of life, so I was, to say the least, surprised.",
            "Indeed the object doesn't register on any lifeform tests. You'd never know it wasn't alive to look at it, though.",
            "Whatever it is, it carries enough electromotive force to charge the terraforming devices I deployed.",
            "It doesn't appear dangerous. I might even say it appears... willing to help.",
            "I've found two devices on this island. If I can completely charge them, they'll activate.",
            "With any luck, I can make the immediate vicinity hospitable enough for me to hold on until help arrives.",
        ],
        [
            "Day 7",
            "A new kind of object appeared in the ocean.",
            "I'm hoping to use this one to reach other islands.",
            "Continued scans confirm that the objects are made of the same material as the ocean itself.",
            "The computer refers to it as a mimeo-organic bio-electric plasmino.",
            "I've started calling them Morbels for short. Seems appropriate.",
            "I'm more concerned with where they're coming from. Why do I go days not seeing any, and then hundreds?",
        ],
        [
            "Day 15",
            "Still another kind of Morbel has appeared, this one in the air.",
            "This is very fortunate for me, as I need something high to charge the troposcopic vaporators.",
        ],
        [
            "Day 21",
            "I've discovered the the Morbel material that makes up the ocean is extremely electrochemically active.",
            "I believe that by moving a terraforming device into the ocean, it may become active simply on contact.",
            "I came to an amazing realization today.",
            "It may be possible for me to completely terraform this world and complete my assignment.",
            "If I can change the composition of the atmosphere enough, the long-range scanners at headquarters will notice.",
            "They'll determine that the job is done and send a probe.",
            "I may be going home after all.",
        ],
        [
            "Day 29",
            "In the meantime, I've been trying to solve the mystery of the Morbels' origin.",
            "Based on my analysis, it looks like that origin might be me.",
            "The mimeo-organic plasmino that makes up the ocean has the ability to copy patterns it encounters,",
            "except there haven't been any significantly complex patterns to copy.",
            "When my ship crash-landed in the ocean, the plasmino was able to interact with the ship's systems",
            "and emulate the patterns it encountered there.",
            "My crash landing was an abiogenic event that kick-started what might be considered life on this planet.",
            "Once exposed, the plasmino was extremely capable at evolving more and more complex systems,",
            "explaining the extremely rapid development I've seen over a matter of weeks.",
        ],
        [
            "Day 44",
            "I've finally located a master terraforming station.",
            "If I can activate it, I can start the planet-wide terraforming process. I can finally go home.",
            "Unfortunately, the resulting climate change will make the entire planet completely uninhabitable for Morbels.",
            "If it works, none of them will survive.",
            "This is especially troubling since some of them have started talking to me.",
            
            "I have decided not to tell them that their world is coming to an end. It's best they don't know.",
            "I must say, though, they are the friendliest non-living objects that I've ever met.",
        ],
        [
            "Day 93",
            "This will be my final entry.",
            "I've been imprisoned on a remote island for the past 24 days.",
            "The Morbels periodically tell me of their progress, but otherwise I am completely cut off.",
            "There is no hope of escape for me. I know that I'm going to die here.",
            "But first, I want to apologize, in whatever way I can.",
            "You see, after I tried to complete the terraforming process, the Morbels have become single-minded.",
            "They have been advancing at an alarming rate, hundreds of years of technology achieved in a single day.",
            "They've created an armada with weapons far beyond anything else in existence.",
            "Their goal is retribution for what they see as an act of attempted genocide.",
            "I don't know how long their rage will last, or what the toll will be when it's complete.",
            "I do know that if they decide to wipe out every last person in existence, they're capable of it.",
            "I'm grateful only that, if that happens, I won't be there to see it.",
            "Goodbye.",
        ],
    ],
    init: function () {
        this.jline = 0
        this.t = 0
        this.active = true
        this.alpha = 1
        this.settext()
    },
    wordwrap: function (text, llen) {
        llen = llen || 60
        var texts = [text]
        while (texts[texts.length - 1].length > llen) {
            var t = texts[texts.length - 1]
            var a = t.lastIndexOf(" ", llen)
            texts[texts.length - 1] = t.substr(0, a)
            texts.push(t.substr(a))
        }
        return texts
    },
    settext: function () {
        this.texts = this.wordwrap(this.script[gamestate.stage][this.jline], 60)
    },
    think: function (dt) {
        if (!this.active) return
        this.t += dt
        if (this.t > 2) {
            this.alpha -= 4 * dt
            if (this.alpha < 0) {
                this.alpha = 0
                this.t = 0
                this.jline += 1
                if (this.jline < this.script[gamestate.stage].length) {
                    this.settext()
                }
            }
        } else {
            this.alpha = Math.min(this.alpha + 4 * dt, 1)
        }
        if (this.jline >= this.script[gamestate.stage].length) {
            this.active = false
        }
    },
    draw: function () {
        if (!this.active) return
        context.save()
        UFX.draw("fs white ss black lw 1 alpha", this.alpha, "textalign center textbaseline middle")
        if (this.jline == 0) {
            context.clearRect(0, 0, settings.sx, settings.sy)
            context.translate(settings.sx / 2, settings.sy / 2)
            context.font = settings.fonts.stagetitle0
            context.fillText("CASTAWAY LOG", 0, -70)
            context.font = settings.fonts.stagetitle1
            context.fillText(this.texts[0], 0, 10)
        } else {
            context.translate(settings.sx / 2, settings.sy * 1.05)
            context.font = settings.fonts.dialogue
            this.texts.forEach(function (text, jtext, texts) {
                var y = (-texts.length + jtext) * 30
                context.strokeText(text, 0, y)
                context.fillText(text, 0, y)
            })
        }
        context.restore()
    },

}


