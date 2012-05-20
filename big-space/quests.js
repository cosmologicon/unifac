
var qsaucers = {}

qsaucers.rescuer = Saucer(600, 600, "")
    .addcomp({
        interact: function (ship) {
            if (state.rescues == 0) {
                this.info = "This is a rescue ship. You want to help us|out? I'll give you the universal distress frequency.|If you ever find a planet giving off|a distress call, park a ship at the distressed planet|and bring another ship back to talk to us.".split("|")
            } else {
                this.info = ["You've helped us with " + state.rescues + " rescues."]
            }
        },
    })

