var dialogue = {
    script: [
        [
            "Day 1",
            "My name is Jemery Maker. I am a terraformer.",
            "While performing a routine terraforming on a remote planet, my ship was struck by an eletrical storm.",
            "I was forced to abandon ship as it fell into the ocean.",
            "My ship fails to respond to pings, even though my transponder signal should be able to penetrate several kilometers of fluid.",
            "Scans suggest that the ocean on this world is made of an unknown substance, which must cause massive interference.",
            "My life support can hold out for some time, but with no ship, I don't see how I'm going anywhere.",
            "For now, I find myself on an island with one of the meteorological dissipation devices I deployed.",
            "If I can charge it using the ball lightning in the area, I should be safe from the storms for now.",
        ],
        [
            "Day 3",
            "Today, something came out of the ocean.",
            "This planet was certified devoid of life, so I was, to say the least, surprised.",
            "Indeed the object doesn't register on any lifeform tests. You'd never know it wasn't alive to look at it, though.",
            "Whatever it is, it carries enough electromotive force to charge the terraforming devices I deployed.",
            "It doesn't appear dangerous. I might even say it appears... willing to help.",
            "I've found two devices on this island. If I can completely charge them, they'll activate.",
            "With luck, I can make the immediate vicinity hospitable enough for me to hold on until help arrives.",
        ],
        [
            "Day 7",
            "A new kind of object appeared in the ocean.",
            "I'm hoping to use this one to reach other islands.",
            "Continued scans confirm that the objects are made of the same exotic material as the ocean itself.",
            "The computer refers to it as a mimeo-organic bio-electric plasmino.",
            "I've started calling them Morbels for short.",
            "While they continue to pose no threat, their sudden appearance is startling.",
        ],
        [
            "Day 13",
            "Still another kind of Morbel has appeared, this one in the air.",
            "This is very fortunate for me, as I need something high to charge the troposcopic vaporators.",
            "I came to an amazing realization today.",
            "By using the Morbels to charge enough devices,",
            "I may be able to terraform this entire world and complete my assignment.",
            "If I can pull it off, the long-range scans at headquarters will notice the change in atmospheric composition.",
            "They'll determine that the job is done and send a followup probe.",
            "I may be going home after all.",
        ],
        [
            "Day 16",
            "I've discovered the the Morbel material that makes up the ocean is extremely electrochemically active.",
            "By moving a terraforming device into the ocean, it may activate simply on contact.",
            "As the Morbels continue to increase in complexity, their origin puzzles me more and more.",
            "How is it that there was no trace of activity when I first arrived, and now I'm surrounded by it?",
            "I've begun a series of analyses to determine the most likely explanation.",
        ],
        [
            "Day 25",
            "My analysis leaves me with an inescapable conclusion:",
            "The origin of the Morbels is me.",
            "The mimeo-organic plasmino that makes up the ocean on this planet can copy patterns it encounters,",
            "and that's the way it's been for billions of years, ready to copy whatever it can,",
            "except there hasn't been anything of significant complexity to copy.",
            "When my ship crash-landed in the ocean, the plasmino was able to interact with the ship's systems",
            "and emulate the patterns it encountered there.",
            "My crash landing was an abiogenic event that kick-started what might be considered life on this planet.",
            "Once exposed, the plasmino was extremely capable at evolving more and more complex systems,",
            "resulting in the rapid development I've seen over a matter of weeks.",
        ],
        [
            "Day 31",
            "I've located a master terraforming station.",
            "If I can activate it, it'll start the planet-wide terraforming process. I can finally go home.",
            "Unfortunately, the resulting climate change will make the entire planet completely uninhabitable for Morbels.",
            "If it works, none of them will survive.",
            "This is especially troubling since some of them have started talking to me.",
            "But for now I just need to get home, I can worry about the consequences later.",
            "I have decided not to tell them that their world is coming to an end. It's best they don't know.",
            "I must say, though, they are the friendliest non-living objects that I've ever met.",
        ],
        [
            "Day 42",
            "This will be my final entry.",
            "I've been imprisoned on a remote island for the past 11 days.",
            "The Morbels periodically tell me of their progress, but otherwise I am completely cut off.",
            "There is no hope of escape for me. I know that I'm going to die here.",
            "But first, I want to apologize, in whatever way I can.",
            "You see, after I tried to complete the terraforming process, the Morbels have become single-minded.",
            "They have been advancing at an alarming rate, hundreds of years of technology achieved in a single day.",
            "They've created a spacefaring armada with weapons far beyond anything else in existence.",
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
        this.tnext = this.script[gamestate.stage][this.jline].length * 0.04 + 2
        if (this.jline == 0) this.tnext = 3
    },
    think: function (dt) {
        if (!this.active) return
        this.t += dt
        if (this.t > this.tnext) {
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


