import logging
import grid, util

log = logging.getLogger(__name__)

gridstate = grid.Grid()
gridstate.fillsector(0, 0)
gridstate.setdevice(2, 2, "eye")
gridstate.gettile(2, 2).active = True
for sx, sy in util.horizonsectors(gridstate.gettile(2, 2)):
	gridstate.fillsector(sx, sy)
	util.solvefog(gridstate, sx, sy)
gridstate.gettile(20, 60).device = "eye"
gridstate.gettile(20, 60).active = True
for sx, sy in util.horizonsectors(gridstate.gettile(20, 60)):
	gridstate.fillsector(sx, sy)
	util.solvefog(gridstate, sx, sy)



users = set()
activeusers = set()

def rotate(who, (x, y), dA):
	gridstate.gettile(x, y).rotate(gridstate, dA)


