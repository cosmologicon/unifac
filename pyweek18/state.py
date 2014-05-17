# The game state

from random import *
import ship, thing, effect, settings, boss, img

# Call at program start
def init():
	global ships, player, hazards, effects, projectiles, bosses
	global yc, vyc, zc
	vyc = 2
	yc = 0
	zc = settings.zc
	ships = []
	hazards = []
	effects = []
	projectiles = []
	bosses = []

def start():
	global ships, player, hazards, effects, projectiles, bosses, vyc, yc, zc
	global stage, substages, tstage
	global hpmax
	setmode("quest")
	tstage = 0
	stage = 1
	substages = legs[stage][:]
	setstage()
	player = ship.PlayerShip((0, yc, 0))
	ships = [player]
	hpmax = 8
	player.hp = hpmax
	player.tcooldown = 0.05
	player.cannons = [
		[0, 0, 0, 0],
		[-0.4, 0, -7, 0],
		[0.4, 0, 0, 0],
		[-0.4, 0, 0, 0],
		[0.4, 0, 7, 0],
	]
	player.tcooldown = 0.4
	player.cannons = [[0,0,0,0]]
	think(0)
	player.jump(1.4)

def save():
	obj = stage
	cPickle.dump(obj, open(settings.savename, "wb"))

def load():
	obj = cPickle.load(open(settings.savename, "rb"))
	stage = obj

def setmode(newmode):
	global mode, modetime, vyc
	mode = newmode
	modetime = 0
#	if mode == "gameover":
#		vyc = 20
#	else:
#		vyc = 2

def think(dt):
	global yc, zc, ships, hazards, effects, projectiles, bosses, modetime, tstage, substages
	modetime += dt
	tstage += dt
	yc += dt * vyc
#	zc += (2 - zc) * 0.4 * dt
	if mode == "quest":
		adddecoration(dt)
	while hq and hq[0].y < yc + settings.yrange[1]:
		hazards.append(hq.pop(0))
	while sq and sq[0].y < yc + settings.yrange[1]:
		ships.append(sq.pop(0))
	while eq and eq[0][0] < yc:
		eq.pop(0)[1]()
	oships = [s for s in ships if s is not player]
	if player.alive:
		player.hitany(hazards + oships)
		player.think(dt)
	for h in hazards:
		h.hitany(projectiles)
		h.think(dt)
	for s in oships:
		s.hitany(projectiles)
		s.think(dt)
	for e in effects:
		e.think(dt)
	for p in projectiles:
		p.think(dt)
	ships = [s for s in ships if s.alive]
	hazards = [h for h in hazards if h.alive]
	effects = [e for e in effects if e.alive]
	projectiles = [p for p in projectiles if p.alive]
	if mode == "boss":
		if not any(b.alive for b in bosses):
			beatboss()
	if mode == "reset":
		if not any(t.alive for t in texts):
			setmode("quest")
			player.x = 0
			player.falling = False
			player.jump(1.4)
	if mode == "gameover":
		if not any(t.alive for t in texts):
			start()
	if mode == "boss":
		img.setshroud((0, 0, 20, 100))
	elif mode == "quest":
		img.setshroud((20, 20, 60, 50))
	elif mode == "reset":
		img.setshroud((100, 100, 140, 50))
	elif mode == "gameover":
		img.setshroud((140, 0, 0, 80))

legs = {
	1: [
		["addtext", settings.gamename],
		["addtext", "by Christopher Night"],
		["nothing", 5, 6],
		["addtext", "arrows: move"],
		["smallrocks", 20, 6],
		["addtext", "up/space: jump"],
		["moresmallrocks", 40, 6],
		["boss", None, 6],
	],
	3: [
		["nothing", 8, 4],
		["tallrocks", 40, 4],
		["pirates", 40, 2],
		["prelude", 5, 5],
		["boss", None, 5]
	],
}

def setstage():
	global hq, sq, eq
	hq, sq, eq = [], [], []
	yc0 = yc
	vylast = None
	ymax = settings.yrange[1]
	for leg in legs[stage]:
		if leg[0] == "addtext":
			eq.append((yc0, doaddtext(leg[1])))
			continue
		legtype, length, legvy = leg
		eq.append((yc0, setspeed(legvy)))
		if legtype == "tallrocks":
			dy = 0
			while dy < length * legvy:
				x = uniform(-settings.lwidth - 5, settings.lwidth + 5)
				size = choice([1, 1.5, 2, 2.5]), choice([5, 5.5, 6, 6.5, 7, 7.5, 8])
				hq.append(thing.Rock((x, yc0 + dy, 0), size))
				dy += 2
		if legtype == "smallrocks":
			dy = 0
			while dy < length * legvy:
				x = uniform(-settings.lwidth - 5, settings.lwidth + 5)
				size = choice([1, 1.5, 2, 2.5]), choice([1, 1.2, 1.4, 1.6])
				hq.append(thing.Rock((x, yc0 + dy, 0), size))
				dy += 3
		if legtype == "moresmallrocks":
			dy = 0
			while dy < length * legvy:
				x = uniform(-settings.lwidth - 5, settings.lwidth + 5)
				size = choice([1, 1.5, 2, 2.5]), choice([1, 1.2, 1.4, 1.6])
				hq.append(thing.Rock((x, yc0 + dy, 0), size))
				dy += 1
		if legtype == "pirates":
			dy = 0
			while dy < length * legvy:
				x, vx = choice([(5, 1.5), (-5, -1.5)])
				vy = uniform(1, 1.5)
				t = (dy * (vylast - legvy) + ymax * legvy) / (legvy * (vylast - vy))
				if t < dy / legvy:
					t = ymax / (legvy - vy)
				y = yc0 + dy + 10
				sq.append(ship.MineShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
				dy += 1 * legvy
		if legtype == "prelude":
			eq.append((yc0 - vylast * 20, addflock))
		if legtype == "boss":
			eq.append((yc0, addboss))
		if length is not None:
			yc0 += length * legvy
		vylast = legvy
	hq.sort(key = lambda h: h.y)
	sq.sort(key = lambda s: s.y)
	eq.sort(key = lambda e: e[0])

def setspeed(vy, mode=None):
	def s():
		global vyc
		vyc = vy
		if mode is not None:
			setmode(mode)
	return s

def addquest(dt, stagetype):
	if stagetype == "tallrocks":
		if random() * 0.5 < dt:
			pos = uniform(-settings.lwidth - 5, settings.lwidth + 5), yc + 60, 0
			w = choice([1, 1.5, 2, 2.5])
			h = 8
			hazards.append(thing.Rock(pos, (w, h)))
	if stagetype == "pirates":
		if random() * 1 < dt:
			t = 15
			x, vx = choice([(5, 1.5), (-5, -1.5)])
			y = player.y + t * player.vy
			vy = vyc - uniform(1, 2)
			ships.append(ship.MineShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
	return

	if random() * 20 < dt:
		t = 20
		x, vx = choice([(0, 1.5), (0, -1.5)])
		y = player.y + t * player.vy
		vy = vyc - uniform(2, 4)
		effects.append(effect.Flock((x - t * vx, y - t * vy, zc + 0.5), (vx, vy, 0)))
	if random() * 1 < dt:
		t = 8
		x, vx = choice([(5, 1.5), (-5, -1.5)])
		y = player.y + t * player.vy
		vy = vyc - uniform(1, 2)
		ships.append(ship.MineShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
	if random() * 2 < dt:
		pos = uniform(-settings.lwidth, settings.lwidth), yc + 60, 0
		hazards.append(thing.Shipwreck(pos))
	return
	if random() * 0.5 < dt:
		pos = uniform(-settings.lwidth - 5, settings.lwidth + 5), yc + 60, 0
		w = choice([1, 1.5, 2, 2.5])
		h = choice([2, 3, 5, 8])
		h = 8
		hazards.append(thing.Rock(pos, (w, h)))
	if random() * 5 < dt:
		t = 12
		x, y = player.x, player.y + t * player.vy
		vx, vy = uniform(-1, 1), uniform(4, 6)
		ships.append(ship.PirateShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
	return
	if random() * 5 < dt:
		pos = choice([-20, -15, -10 -7, 7, 10, 15, 20]), yc + 60, 0
		effects.append(effect.Island(pos))

def adddecoration(dt):
	if random() * 5 < dt:
		pos = choice([-20, -15, -10 -7, 7, 10, 15, 20]), yc + settings.yrange[1], 0
		effects.append(effect.Island(pos))
	if random() * 4 < dt:
		x = uniform(-20, 0)
		z = uniform(8, 15)
		vx, t = -2, 20
		y = yc + 10 + t * vyc
		effects.append(effect.Cloud((x - vx * t, y, z), (vx, 0, 0)))

def addsilver(obj):
	silver = thing.Silver((obj.x, obj.y, obj.z))
	hazards.append(silver)

def addhp(dhp):
	player.hp += dhp
	if player.hp > hpmax:
		player.hp = hpmax
		player.tblitz = 5
	else:
		addheal(player)

def gameover():
	setmode("gameover")
	addtext("Game over")
	addtext("Continuing...")
	effects.extend([thing.Slinker(s) for s in ships])
	del ships[:]
	effects.extend([thing.Slinker(h) for h in hazards])
	del hazards[:]
	del hq[:]
	del sq[:]

def addsplash(obj):
	splash = effect.Splash((obj.x, obj.y, 0))
	effects.append(splash)

def addsmoke(obj):
	effects.append(effect.Smoke((obj.x, obj.y, obj.z)))

def addheal(obj):
	heal = effect.Heal((obj.x, obj.y, obj.z + 1))
	heal.vy = obj.vy
	effects.append(heal)

texts = []
def addtext(text):
	global texts
	texts = [t for t in texts if t.alive]
	y = max([t.y for t in texts] + [yc])
	inst = effect.Instructions(text, y + 30)
	texts.append(inst)
	effects.append(inst)
def doaddtext(text):
	def a():
		addtext(text)
	return a


def addflock():
	t = 20
	x, vx = choice([(0, 1.5), (0, -1.5)])
	y = player.y + t * player.vy
	vy = vyc - uniform(2, 4)
	effects.append(effect.Flock((x - t * vx, y - t * vy, zc + 0.5), (vx, vy, 0)))

def addboss():
	global mode, bosses
	setmode("boss")
#	bosses = [boss.Boss((20, yc + 20, 0), 8)]
#	bosses = [boss.Balloon((0, yc, 4.5))]
	bosses = [
		boss.Bosslet((20, yc + 20, 0), 8),
		boss.Bosslet((-20, yc + 20, 0), 9),
		boss.Bosslet((-30, yc + 20, 0), 10),
		boss.Bosslet((30, yc + 20, 0), 11),
	]
	ships.extend(bosses)
	ships.extend([
		ship.Blockade(2, 3, 7, 1),
		ship.Blockade(-2, 3, 7, 1.2),
		ship.Blockade(0, 4, 7, 0.7),
	])

def beatboss():
	global mode, bosses, hazards, ships
	for b in bosses:
		b.hp = -10000
	bosses = []
	hazards = []
	for s in ships:
		if s is not player:
			s.hp = -10000
	player.falling = True
	setmode("reset")
	addtext("Stage Complete")
	addtext("Progress Saved")

def getlayers():
	objs = ships + hazards + effects + projectiles
	shadows = [s for obj in objs for s in obj.getshadows()]
	layers = [l for obj in objs for l in obj.getlayers()]
	layers += [
		("shroud", 0, yc + dy, 0, 0, None, None) for dy in (4, 6, 8, 12, 16, 24, 32, 40)
	]
	
	layers.sort(key = lambda l: -l[2])
	shadows.sort(key = lambda l: -l[2])
	return layers, shadows

