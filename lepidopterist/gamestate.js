// Maintain game state in a convenient global variable, as well as saving and loading

var gamestate = {
    // MEMBER VARIABLES STORING THE GAME STATE

    // Strength of each ability
    abilities: {
        leap: 2,
        nab: 1,
    },
    // Records, scores, etc.
    records: {
        height: 0,
        combo: 0,
        collected: {},
        bank: 0,
        hiscore: 0,
    },
    // levels unlocked and visited
    levels: {
        unlocked: 1,
        maxvisited: 0,
    },
    // TODO: add record of seen tips


    // METHODS FOR SAVING AND LOADING STATE

    statename: "lepstate",
    getstate: function () {
        return [this.abilities, this.records, this.levels]
    },
    setstate: function (state) {
        this.abilities = state[0]
        this.records = state[1]
        this.levels = state[2]
    },
    save: function () {
        localStorage[this.statename] = JSON.stringify(this.getstate())
    },
    load: function () {
        if (localStorage[this.statename]) {
            this.setstate(JSON.parse(localStorage[this.statename]))
        }
        this.save()
    },
    reset: function () {
        delete localStorage[this.statename]
        window.location.reload()
    },
}
gamestate.load()

