
var Hornet = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(PortalUser)
	.addcomp(HasStates, ["think", "draw"])

var HornetStates = {}
HornetStates.sway = UFX.Thing()

