import logging, threading, random, cPickle, os.path, time
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

lastsave = 0
def save():
	global lastsave
	log.debug("Saving...")
	lastsave = int(time.time())
	gridstate.zipsectors()
	s = "state-%s.pickle" % time.strftime("%Y%m%d%H")
	path = os.path.join(settings.serverstatedir, s)
	obj = gridstate, users, passwords, pwatch, monsters, quests
	cPickle.dump(obj, open(path, "wb"))
	
#	import zlib, json
#	s1 = json.dumps(gridstate.getstate())
#	s2 = cPickle.dumps(gridstate)
#	print "Grid state size %s %s %s %s" % (len(s1), len(zlib.compress(s1)), len(s2), len(zlib.compress(s2)))
	
	log.debug("Saving complete.")

def load(fname):
	global gridstate, users, passwords, pwatch, monsters, quests
	log.debug("Loading...")
	path = os.path.join(settings.serverstatedir, fname)
	obj = cPickle.load(open(path, "rb"))
	gridstate, users, passwords, pwatch, monsters, quests = obj
	update.grid = gridstate
	update.monsters = monsters
	update.quests = quests
	log.debug("Loading complete.")

def choosebases(n = 20):
	bases = []
	d2 = 0.2 * settings.sectorsize ** 2
	while len(bases) < n:
		x = random.randint(0, settings.sectorsize)
		y = random.randint(0, settings.sectorsize)
		s = random.choice(settings.basesdist)
		t = random.choice(settings.basetdist)
		if s == 2 and t == "record":
			continue
		if x + s >= settings.sectorsize or y + s >= settings.sectorsize:
			continue
		overlap = any((x - bx) ** 2 + (y - by) ** 2 < d2 for bx, by, bs, bt in bases)
		if overlap:
			d2 *= 0.9
			continue
		d2 = max(0.2 * settings.sectorsize ** 2, 2 * 4 ** 2)
		bases.append((x, y, s, t))
	return bases

def addrandomcoin(sx, sy):
	if (sx, sy) not in gridstate.sectors:
		return
	x = sx * settings.sectorsize + random.randint(0, settings.sectorsize-1)
	y = sy * settings.sectorsize + random.randint(0, settings.sectorsize-1)
	tile = gridstate.getbasetile(x, y)
	if not tile or tile.s > 1:
		return
	if (tile.active or tile.device) and random.random() < 0.99:
		return
	glock.acquire()
	gridstate.setdevice(x, y, "coin")
	glock.release()

def makesector(sx, sy):
	if (sx, sy) in gridstate.sectors:
		return
	glock.acquire()
	gridstate.fillsector(sx, sy)
	if not settings.BOSS:
		x0, y0 = settings.sectorsize*sx, settings.sectorsize*sy
		for x, y, s, t in choosebases(20):
			gridstate.putdevice(x0+x, y0+y, "b%s%s" % (s, t), s)
		sector = gridstate.sectors[(sx, sy)]
		while len(sector.devices["coin"]) < settings.backgroundcoins:
			addrandomcoin(sx, sy)
#	util.solvefog(gridstate, sx, sy)
	glock.release()



def getbaseradius(dname):
	s, t = int(dname[1]), dname[:2]
	r = settings.baserange[s]
	if t == "scan":
		r *= 2
	return r

# Uncover fog
def sweepnode(x, y, r = None):
	glock.acquire()
	tile = gridstate.getbasetile(x, y)
	x += tile.s // 2
	y += tile.s // 2
	r = getbaseradius(tile.device) if r is None else r
	for sx, sy in util.horizonsectors(x, y, r + settings.horizonbuffer):
		makesector(sx, sy)
	util.removefog(gridstate, x, y, r)
	glock.release()

if settings.serverstate0:
	load(settings.serverstate0)
elif settings.BOSS:
	makesector(0, 0)
	gridstate.putdevice(0, 0, "b5reactor", 5)
	sweepnode(0, 0, 25)
else:
	makesector(0, 0)
	for d, devices in gridstate.sectors[(0,0)].devices.items():
		if not d.startswith("b"):
			continue
		for t in devices:
			sweepnode(t.x, t.y)

#quests.append(
#	quest.Quest(None, gridstate.getrawtile(5, 0))
#)

def resetupdate():
	update.effects = []
	update.monsterdelta = []
	update.quests = []
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
	global quests, bossreset
	glock.acquire()
	if settings.BOSS and bossreset:
		quests.append(bossreset)
		bossreset = False
		quests[0].alive = True
		quests[0].progress = 0
		initbossquest()
	for q in quests:
		q.think(dt)
		if not q.alive:
			gridstate.unlocktiles(q.who, q.tiles())
			update.quests.append(q)
			if q.complete:
				completequest(q)
	quests = [q for q in quests if q.alive]
	for m in monsters.values():
		m.think(dt)
	checked = set()
	for q in quests:
		for x, y, d in gridstate.aqdevices(q.tile.x, q.tile.y, q.r):
			if (x,y) in checked:
				continue
			devicethink(dt, x, y, d)
			checked.add((x, y))
	if not settings.BOSS and time.time() > lastsave + settings.savetime:
		save()
	glock.release()

	return
	if 5 * random.random() < dt:
		glock.acquire()
		for (sx, sy), sector in gridstate.sectors.items():
			while len(sector.devices["coins"]) < settings.backgroundcoins:
				print sx, sy, len(gridstate.sectors[(sx,sy)].devices["coins"])
				addrandomcoin(sx, sy)
		glock.release()


shots = {}
def devicethink(dt, x, y, d):
	if not d.device:
		log.debug("Error with None device %s %s %s", x, y, d)
		return
	if "laser" in d.device or "blaster" in d.device:
		if (x, y) in shots and shots[(x, y)] > 0:  # weapon reload
			shots[(x,y)] -= dt
			return
		for dx, dy in settings.regions[d.device]:
			px, py = x + dx, y + dy
			if (px, py) in monsters:
				if monsters[(px, py)] < 0.5:
					continue
				monsters[(px, py)].hurt(1 if "laser" in d.device else 3)  # laser = 1, blaster = 3
				shots[(px, py)] = settings.devicereload[d.device]
				update.effects.append(["laser", x, y, px, py])
				break
	if "mine" in d.device:
		for dx, dy in settings.regions[d.device]:
			px, py = x + dx, y + dy
			if (px, py) in monsters:
				if monsters[(px, py)].t < 0.5:
					continue
				monsters[(px, py)].hurt(5)
				gridstate.setdevice(x, y, None)
				update.effects.append(["bomb", x, y])
				break
		

# Returns a list of tiles whose activation state changed
def canrotate(who, (x, y)):
	t = gridstate.getbasetile(x, y)
	if t.lock and t.lock != who:
		return False
	if t.fog:
		return False
	return True
def rotate((x, y), dA):
	glock.acquire()
	ret = gridstate.rotate(x, y, dA)
#	t = gridstate.getbasetile(x, y)
#	if t.s > 1:
#		sweepnode(t.x, t.y)
	glock.release()
	return ret
def deploy(who, (x, y), device):
	if device not in users[who].unlocked:
		raise ValueError("Device not unlocked")
	if device not in settings.devicecost or users[who].coins < settings.devicecost[device]:
		raise ValueError("Not enough resources")
	glock.acquire()
	if device == "shuffle":
		ret = gridstate.matchcolors(x, y)
	else:
		gridstate.deploy(x, y, device)
		ret = None
	glock.release()
	users[who].coins -= settings.devicecost[device]
	return ret
def unlock(who, dname):
	if dname not in settings.devicesize:
		raise ValueError("Unrecognized device")
	if users[who].xp < settings.devicexp[dname]:
		raise ValueError("Not enough XP")
	if dname in users[who].unlocked:
		raise ValueError("Already unlocked")
	users[who].unlocked[dname] = 1
	if dname[0] == "2":
		users[who].unlocked[dname[:-1] + "0"] = 1
		users[who].unlocked[dname[:-1] + "1"] = 1
	if dname[0] == "1":
		users[who].unlocked[dname[:-1] + "0"] = 1
		users[who].unlocked[dname[:-1] + "1"] = 1
		users[who].unlocked[dname[:-1] + "2"] = 1
		users[who].unlocked[dname[:-1] + "3"] = 1
	users[who].xp -= settings.devicexp[dname]


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
	tile = gridstate.getbasetile(x, y)
	if not tile:
		return None
	for q in quests:
		if q.who == who:
			return None
		if q.tile is tile:
			return None
	if tile.device[0:2] not in ("b2", "b3", "b4"):
		return None
	# TODO: make sure you can only quest on tiles you haven't already beaten
	s, t = int(tile.device[1]), tile.device[2:]
	qinfo = {
		"p": (tile.x, tile.y),
		"xp": settings.basexp[s],
		"coins": settings.basecoins[s],
		"range": settings.baserange[s],
		"difficulty": ["", "", "easy", "medium", "hard"][s],
		"bonus": t == "supply",
		"story": t == "record",
		"s": s,
		"t": t,
	}
	if t == "resource":
		qinfo["coins"] *= 2
	if t == "ops":
		qinfo["xp"] *= 2
	if t == "scan":
		qinfo["range"] *= 2
	if t == "record":
		qinfo["xp"] = 0
		qinfo["coins"] = 0
		qinfo["range"] = 0
	return qinfo

def initquest(who, p, solo, qinfo):
	tile = gridstate.getbasetile(*p)
	q = quest.Quest(who, tile, qinfo)
	quests.append(q)
	if solo:
		gridstate.locktiles(who, q.tiles())

bossreset = False
def completequest(quest):
	global bossreset
	if quest.diff == "boss":
		update.effects.append(["gameover"])
		bossreset = quest
	else:
		who = quest.who
		users[who].xp += quest.qinfo["xp"]
		users[who].coins += quest.qinfo["coins"]
		tile = quest.tile
		sweepnode(tile.x, tile.y, quest.qinfo["range"])

def initbossquest():
	del quests[:]
	monsters.clear()
	gridstate.changecolors(0, 0, util.randomcolors(5))
	
	initquest(None, (0,0), False, {
		"p": (0, 0),
		"xp": 0,
		"range": 30,
		"difficulty": "boss",
		"bonus": False,
		"story": False,
		"s": 5,
		"t": "boss",
	})


if settings.BOSS:
	initbossquest()

# Returns a gamestate update to be sent to this client
def setwatch(who, x, y, force = False):
	if who in pwatch and not force:
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
#	if who in pwatch:
#		del pwatch[who]

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


