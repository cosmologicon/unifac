import logging
import grid, player, vista, monster, menu

log = logging.getLogger(__name__)

gridstate = grid.Grid()
you = player.Player({ "username": None })
monsters = {}

pwatch = 0, 0

def makeeffect(oldstate, newstate):
	diffs = dict((field, oldstate[field] != newstate[field]) for field in grid.Tile.fields)
	diffs["colors"] = tuple(oldstate["colors"]) != tuple(newstate["colors"])
	assert not diffs["x"] and not diffs["y"] and not diffs["s"]
	if diffs["device"] and not diffs["colors"]:
		if oldstate["device"] == "coin":
			vista.CoinFlipTile(oldstate, newstate)
			#log.debug("CoinFlipTile effect created")
		else:
			vista.FlipTile(oldstate, newstate)
			#log.debug("FlipTile effect created")
	if diffs["colors"]:
		vista.FlipTile(oldstate, newstate)
		#log.debug("FlipTile effect created")

def applydelta(delta):
	for oldstate, newstate in gridstate.applydelta(delta):
		#log.debug("delta %s %s %s %s", oldstate["x"], oldstate["y"], oldstate["colors"], newstate["colors"])
		makeeffect(oldstate, newstate)

def handlemonsters(ms):
	for mstate in ms:
		monsters[mstate["name"]] = monster.Monster(mstate)
	for mname, m in list(monsters.items()):
		if not m.alive:
			del monsters[mname]

def handleeffects(effects):
	for effect in effects:
		etype, args = effect[0], effect[1:]
		if etype == "splat":
			vista.SplatEffect(*args)
		if etype == "step":
			vista.StepEffect(*args)
		if etype == "laser":
			vista.LaserEffect(*args)



