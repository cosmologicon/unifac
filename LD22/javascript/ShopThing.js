var gamejs = require('gamejs')
var Thing = require('./Thing')
var Images = require('./Images')
var state = require('./state')


BankBox = function() {
    Thing.TextBox.apply(this, ["To spend: ???XP", [740,40]])
    this.font = new gamejs.font.Font("24px sans-serif")
    this.centered = true
}
gamejs.utils.objects.extend(BankBox, Thing.TextBox)
BankBox.prototype.think = function (dt) {
    this.update("To spend: " + state.xp + "XP")
    TextBox.prototype.think.call(this, dt)
}

Greeting = function() {
    Thing.TextBox.apply(this, ["Please select an adventurer to upgrade", [427,240]])
    this.font = new gamejs.font.Font("24px sans-serif")
    this.update("Please select an adventurer to upgrade")
    this.centered = true
}
gamejs.utils.objects.extend(Greeting, Thing.TextBox)


UpgradeMenu = function(player, pstates, index) {
    Thing.Thing.apply(this)
    this.player = player
    this.index = index
    this.pstates = pstates
    this.pstate = pstates[index]
    this.font = new gamejs.font.Font("24px sans-serif")
    this.centered = true
    this.image = null
}
gamejs.utils.objects.extend(UpgradeMenu, Thing.Thing)
UpgradeMenu.prototype.build = function () {
    this.image = new gamejs.Surface([300, 240])
    this.image.fill("#000044")
    while (this.children.length) this.children[0].die()
    this.setpos([427, 200])
    var namebox = new Thing.TextBox("Adventurer: " + this.pstate.name)
    namebox.attachto(this).setpos([-130, -110])
    var s = new Thing.TextBox("Skill: " + this.pstate.skill)
    s.attachto(this).setpos([-120, -80]);
    (new Thing.TextBox("" + this.pstate.xpspent, [0, 0], "12px sans-serif", "blue")).attachto(this).setpos([120, 80]);
    (new Thing.TextBox(this.pstate.hp0 + "HP")).attachto(this).setpos([-30, -44]);
    (new Thing.TextBox(this.pstate.mp0 + "MP")).attachto(this).setpos([-30, -12]);
    (new Thing.TextBox(this.pstate.strength + " strength")).attachto(this).setpos([-30, 20]);
    (new Thing.TextBox(Math.floor(this.pstate.speed/10) + " speed")).attachto(this).setpos([-30, 52]);
    (new Thing.TextBox(Math.floor(this.pstate.range/20) + " range")).attachto(this).setpos([-30, 84]);

    var i = this.index;
    (new Thing.Button("-" + state.upgradeamt(0, i) + "XP", null, function () { state.upgrade(0, i) })).attachto(this).setpos([-80,-32]);
    (new Thing.Button("-" + state.upgradeamt(1, i) + "XP", null, function () { state.upgrade(1, i) })).attachto(this).setpos([-80,0]);
    (new Thing.Button("-" + state.upgradeamt(2, i) + "XP", null, function () { state.upgrade(2, i) })).attachto(this).setpos([-80,32]);
    (new Thing.Button("-" + state.upgradeamt(3, i) + "XP", null, function () { state.upgrade(3, i) })).attachto(this).setpos([-80,64]);
    (new Thing.Button("-" + state.upgradeamt(4, i) + "XP", null, function () { state.upgrade(4, i) })).attachto(this).setpos([-80,96]);


/*    hp0: 200,
    mp0: 200,
    speed: 100,
    range: 100,
    xpspent: 0,
    deserted: 0,*/

}
UpgradeMenu.prototype.think = function (dt) {
    if (!this.image) this.build()
    Thing.Thing.prototype.think(dt)
}



exports.BankBox = BankBox
exports.Greeting = Greeting
exports.UpgradeMenu = UpgradeMenu

