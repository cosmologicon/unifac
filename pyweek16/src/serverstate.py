import logging, threading
import grid, util, settings

log = logging.getLogger(__name__)

gridstate = grid.Grid()
glock = threading.RLock()

glock.acquire()
gridstate.fillsector(0, 0)
gridstate.setdevice(2, 2, "eye")
gridstate.getbasetile(2, 2).active = True
gridstate.setdevice(20, 10, "eye")
gridstate.getbasetile(20, 10).active = True
for sx, sy in util.horizonsectors(gridstate.getbasetile(2, 2)):
	gridstate.fillsector(sx, sy)
	util.solvefog(gridstate, sx, sy)
glock.release()

log.debug(gridstate.getbasetile(-2, -2))


users = set()
activeusers = set()
watchers = {}  # map from clients to the sectors they're watching
rwatchers = {}  # map from sectors to the clients who are watching them

def rotate(who, (x, y), dA):
	glock.acquire()
	gridstate.rotate(x, y, dA)
	glock.release()

def getdelta():
	glock.acquire()
	ret = gridstate.getdelta()
	glock.release()
	return ret

# Returns a gamestate update to be sent to this client
def setwatch(who, x, y):
	a, s = settings.watchradius, settings.sectorsize
	xmin, xmax = (x - a) // s, (x + a) // s
	ymin, ymax = (y - a) // s, (y + a) // s
	newwatch = set((sx, sy) for sx in range(xmin, xmax+1) for sy in range(ymin, ymax+1))
	oldwatch = watchers[who] if who in watchers else set()
	watchers[who] = newwatch
	for sector in newwatch - oldwatch:
		if sector not in rwatchers:
			rwatchers[sector] = set()
		rwatchers[sector].add(who)
	for sector in oldwatch - newwatch:
		rwatchers[sector].remove(who)
	return gridstate.getstate(newwatch - oldwatch)

def removewatcher(who):
	if who not in watchers:
		return
	for sector in watchers[who]:
		rwatchers[sector].remove(who)
	del watchers[who]

# Given a gamestate delta, break it up into pieces to be sent to each appropriate client
def breakdelta(delta):
	clients = {}
	for sector, sdelta in delta:
		if sector not in rwatchers:
			continue
		for watcher in rwatchers[sector]:
			if watcher not in clients:
				clients[watcher] = []
			clients[watcher].append((sector, sdelta))
	return clients


