import logging
import grid, player, vista

log = logging.getLogger(__name__)

gridstate = grid.Grid()
you = player.Player({ "username": None })


def makeeffect(oldstate, newstate):
	diffs = dict((field, oldstate[field] != newstate[field]) for field in grid.Tile.fields)
	assert not diffs["x"] and not diffs["y"] and not diffs["s"]
	if diffs["device"] and not diffs["colors"]:
		if oldstate["device"] == "coin":
			vista.CoinFlipTile(oldstate, newstate["device"])
		else:
			vista.FlipTile(oldstate, newstate["device"])

def applydelta(delta):
	for oldstate, newstate in gridstate.applydelta(delta):
		makeeffect(oldstate, newstate)

