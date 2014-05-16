# The game state

from random import *
import ship, thing, effect, settings, boss, img

def init():
	global ships, player, hazards, effects, projectiles, bosses, mode, yc, zc, stage
	global hpmax
	mode = "quest"
	stage = 3
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = []
	effects = []
	projectiles = []
	bosses = []
	money = 0
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
	yc = 0
	zc = settings.zc
	addtext(settings.gamename)
	addtext("by Christopher Night")
	think(0)
	player.jump(1.4)

def think(dt):
	global yc, zc, money, ships, hazards, effects, projectiles, bosses, mode
	yc += dt * settings.vyc
#	zc += (2 - zc) * 0.4 * dt
	if mode == "quest":
		addquest(dt)
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
			mode = "quest"
			player.x = 0
			player.falling = False
			player.jump(1.4)
	if mode == "boss":
		img.setshroud((0, 0, 20, 100))
	elif mode == "quest":
		img.setshroud((20, 20, 60, 50))
	elif mode == "reset":
		img.setshroud((100, 100, 140, 50))

def addquest(dt):
	if random() * 2 < dt:
		pos = uniform(-settings.lwidth, settings.lwidth), yc + 60, 0
		hazards.append(thing.Shipwreck(pos))
	if random() * 4 < dt:
		t = 20
		x, vx = choice([(0, 1.5), (0, -1.5)])
		y = player.y + t * player.vy
		vy = uniform(2, 3)
		effects.append(effect.Flock((x - t * vx, y - t * vy, zc + 0.5), (vx, vy, 0)))
	return
	if random() * 1 < dt:
		t = 8
		x, vx = choice([(5, 1.5), (-5, -1.5)])
		y = player.y + t * player.vy
		vy = uniform(4, 6)
		ships.append(ship.MineShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
	return
	if random() * 5 < dt:
		t = 12
		x, y = player.x, player.y + t * player.vy
		vx, vy = uniform(-1, 1), uniform(4, 6)
		ships.append(ship.PirateShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
	if random() * 0.5 < dt:
		pos = uniform(-settings.lwidth - 5, settings.lwidth + 5), yc + 60, 0
		w = choice([1, 1.5, 2, 2.5])
		h = choice([2, 3, 5, 8])
		h = 8
		hazards.append(thing.Rock(pos, (w, h)))
	return
	if random() * 5 < dt:
		pos = choice([-20, -15, -10 -7, 7, 10, 15, 20]), yc + 60, 0
		effects.append(effect.Island(pos))

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

def addboss():
	global mode, bosses
	mode = "boss"
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
	mode = "reset"
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

