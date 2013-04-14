import logging, threading
import grid, util, settings, player

log = logging.getLogger(__name__)

gridstate = grid.Grid()
glock = threading.RLock()

glock.acquire()
gridstate.fillsector(0, 0)
gridstate.putdevice(2, 2, "eye")
gridstate.activate(2, 2)
gridstate.putdevice(20, 10, "eye")
gridstate.activate(20, 10)
gridstate.putdevice(10, 12, "base")
gridstate.activate(10, 12)
for sx, sy in util.horizonsectors(gridstate.getbasetile(2, 2)):
	gridstate.fillsector(sx, sy)
	util.solvefog(gridstate, sx, sy)
glock.release()

log.debug(gridstate.getbasetile(2, 2).getstate())
log.debug(gridstate.getbasetile(2, 3).getstate())
log.debug(gridstate.adevices(0, 0))


users = {}
passwords = {}
activeusers = set()
watchers = {}  # map from clients to the sectors they're watching
rwatchers = {}  # map from sectors to the clients who are watching them

# Returns a list of tiles whose activation state changed
def rotate((x, y), dA):
	glock.acquire()
	ret = gridstate.rotate(x, y, dA)
	glock.release()
	return ret
def deploy(who, (x, y), device):
	if device not in settings.devicecost or users[who].coins < settings.devicecost[device]:
		raise ValueError("Not enough coins")
	glock.acquire()
	gridstate.deploy(x, y, device)
	glock.release()
	users[who].coins -= settings.devicecost[device]

def getdelta():
	glock.acquire()
	ret = gridstate.getdelta()
	glock.release()
	return ret

def handleactivation(tiles, who):
	for x, y in tiles:
		tile = gridstate.getbasetile(x, y)
		if tile.active and tile.device == "coin":
			users[who].coins += 1
			gridstate.setdevice(x, y, None)


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


