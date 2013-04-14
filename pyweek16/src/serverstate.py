import logging
import grid

log = logging.getLogger(__name__)

gridstate = grid.Grid()

users = set()
activeusers = set()

def rotate(who, (x, y), dA):
	gridstate.gettile(x, y).rotate(dA)


