import logging
import grid, player, vista, monster, menu, settings, util

log = logging.getLogger(__name__)

gridstate = grid.Grid()
you = player.Player({ "username": None })
monsters = {}

pwatch = 0, 0

def makeeffect(oldstate, newstate):
	diffs = dict((field, oldstate[field] != newstate[field]) for field in grid.Tile.fields)
	diffs["colors"] = tuple(oldstate["colors"]) != tuple(newstate["colors"])
	assert not diffs["x"] and not diffs["y"] and not diffs["s"]
	if not diffs["colors"] and not diffs["device"]:
		return None
	for dA in (1,2,3):
		nstate = tuple(newstate["colors"]), newstate["device"]
		if nstate == util.spin(oldstate["s"], oldstate["colors"], oldstate["device"], dA):
			return vista.SpinTile(gridstate.getbasetile(oldstate["x"], oldstate["y"]), dA)
	if diffs["device"] and not diffs["colors"]:
		if oldstate["device"] == "coin":
			return vista.CoinFlipTile(oldstate, newstate)
			#log.debug("CoinFlipTile effect created")
		else:
			return vista.FlipTile(oldstate, newstate)
			#log.debug("FlipTile effect created")
		return

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
		if etype == "bomb":
			# TODO separate bomb effects
			vista.SplatEffect(*args)
		if etype == "step":
			vista.StepEffect(*args)
		if etype == "laser":
			vista.LaserEffect(*args)
		if etype == "gameover":
			menu.loadgameover()

def canunlock(dname):
	if dname not in settings.devicexp:
		return False
	if dname in you.unlocked:
		return False
	if you.xp < settings.devicexp[dname]:
		return False
	return True

def canquest(x, y):
	tile = gridstate.getbasetile(x, y)
	if you.trained < 1:
		return False
	if tile.s == 1:
		return False
	if not tile.active:
		return False
	return True

qstatus = None
def qupdate(qprogress, qT):
	global qstatus
	qstatus = qprogress, qT



