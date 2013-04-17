import logging, threading, random
import grid, util, settings, player, monster, update, quest

log = logging.getLogger(__name__)

gridstate = grid.Grid()
update.grid = gridstate
glock = threading.RLock()

users = {}
passwords = {}
activeusers = set()
watchers = {}  # map from clients to the sectors they're watching
rwatchers = {}  # map from sectors to the clients who are watching them
pwatch = {}
update.monsters = monsters = {}
quests = []


def makesector(sx, sy):
	if (sx, sy) in gridstate.sectors:
		return
	glock.acquire()
	gridstate.fillsector(sx, sy)
	for x in (5, 15, 25, 35):
		for y in (5, 15, 25, 35):
			gridstate.putdevice(sx*settings.sectorsize+x, sy*settings.sectorsize+y, "eye", random.choice((2,3,4)))
	util.solvefog(gridstate, sx, sy)
	glock.release()

# Uncover fog
def sweepnode(x, y):
	glock.acquire()
	for sx, sy in util.horizonsectors(gridstate.getbasetile(x, y)):
		makesector(sx, sy)
	tile = gridstate.getrawtile(x, y)
	r = settings.horizon[tile.device]
	util.removefog(gridstate, x + tile.s//2, y + tile.s//2, r)
	glock.release()

makesector(0, 0)
sweepnode(5, 5)
sweepnode(-5, -5)

#quests.append(
#	quest.Quest(None, gridstate.getrawtile(5, 0))
#)

def resetupdate():
	update.effects = []
	update.monsterdelta = []
resetupdate()

def addrandommonster():
	x = random.randint(-10, 20)
	y = random.randint(-10, 20)
	if not gridstate.canmoveto(x, y) or (x,y) in monsters:
		return
	m = monster.Monster({
		"name": util.randomname(),
		"x": x,
		"y": y,
	})
	monsters[(x,y)] = m
	update.monsterdelta.append(m.getstate())

#for _ in range(20):
#	addrandommonster()

def think(dt):
	global quests
	glock.acquire()
	for q in quests:
		q.think(dt)
	quests = [q for q in quests if q.alive]
	for m in monsters.values():
		m.think(dt)
	glock.release()
	for mname, m in list(monsters.items()):
		if not m.alive:
			del monsters[mname]
#	m = addrandommonster()

# Returns a list of tiles whose activation state changed
def rotate((x, y), dA):
	glock.acquire()
	ret = gridstate.rotate(x, y, dA)
	t = gridstate.getbasetile(x, y)
	if t.s > 1:
		sweepnode(t.x, t.y)
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
	glock.acquire()
	for x, y in tiles:
		tile = gridstate.getbasetile(x, y)
		if tile.active and tile.device == "coin":
			users[who].coins += 1
			gridstate.setdevice(x, y, None)
	glock.release()

def questinfo(who, (x, y)):
	x, y = int(x), int(y)
	for q in quests:
		if q.who == who:
			return None
		if q.p0 == (x, y):
			return None
	tile = gridstate.getbasetile(x, y)
	if not tile:
		return None
	if tile.device not in ("base", "eye",):
		return None
	# TODO: make sure you can only quest on tiles you haven't already beaten
	qinfo = {
		"p": (x, y),
		"xp": 2,
		"coins": 3,
		"range": 10,
		"difficulty": 0,
		"bonus": False,
	}
	return qinfo

def initquest(who, p, solo, qinfo):
	tile = gridstate.getbasetile(*p)
	q = quest.Quest(who, tile)
	quests.append(q)
	if solo:
		locktiles(q.tiles())


# Returns a gamestate update to be sent to this client
def setwatch(who, x, y):
	if who in pwatch:
		x0, y0 = pwatch[who]
		if abs(x0 - x) + abs(y0 - y) < settings.watchstick:
			return None
	pwatch[who] = x, y
	log.debug("updating watch %s %s %s", who, x, y)
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
	if who in pwatch:
		del pwatch[who]

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


