# The game state

from random import *
import ship, thing, effect, settings, boss

def init():
	global ships, player, hazards, effects, projectiles, bosses, mode, yc
	global hpmax
	mode = "normal"
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = []
	effects = []
	projectiles = []
	bosses = []
	money = 0
	hpmax = 1
	player.hp = hpmax
	player.tcooldown = 0.5
	yc = 0
	addtext(settings.gamename)
	addtext("by Christopher Night")
	think(0)
	player.jump(1.4)

def think(dt):
	global yc, money, ships, hazards, effects, projectiles, bosses, mode
	yc += dt * settings.vyc
	if mode == "normal":
		if random() * 2 < dt:
			pos = uniform(-settings.lwidth, settings.lwidth), yc + 60, 0
			w = choice([1, 1.4, 1.8])
			h = choice([1.5, 2, 2.5])
			hazards.append(thing.Rock(pos, (w, h)))
		if random() * 5 < dt:
			pos = choice([-20, -15, -10 -7, 7, 10, 15, 20]), yc + 60, 0
			effects.append(effect.Island(pos))
		if random() * 5 < dt:
			t = 12
			x, y = player.x, player.y + t * player.vy
			vx, vy = uniform(-1, 1), uniform(6, 8)
			ships.append(ship.PirateShip((x - t * vx, y - t * vy, 0), (vx, vy), 1))
	oships = [s for s in ships if s is not player]
	if player.alive:
		player.hitany(hazards + oships)
		player.think(dt)
	for s in oships:
		s.hitany(projectiles)
		s.think(dt)
	for h in hazards:
		h.think(dt)
	for e in effects:
		e.think(dt)
	for p in projectiles:
		p.think(dt)
	ships = [s for s in ships if s.alive]
	hazards = [h for h in hazards if h.alive]
	effects = [e for e in effects if e.alive]
	projectiles = [p for p in projectiles if p.alive]
	if mode == "boss":
		bosses = [b for b in bosses if b.alive]
		if not bosses:
			beatboss()
	if mode == "reset":
		if not any(t.alive for t in texts):
			mode = "normal"
			player.x = 0
			player.falling = False
			player.jump(1.4)

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
	inst = effect.Instructions(text, y + 40)
	texts.append(inst)
	effects.append(inst)

def addboss():
	global mode, bosses
	mode = "boss"
#	bosses = [boss.Boss((20, yc + 20, 0))]
	bosses = [boss.Balloon((0, yc, 4.5))]
	ships.extend(bosses)

def beatboss():
	global mode
	for b in bosses:
		b.hp = -10000
	player.falling = True
	mode = "reset"
	addtext("Stage Complete")
	addtext("Progress Saved")

def getlayers():
	layers = [
		l for s in ships for l in s.getlayers()
	] + [
		l for h in hazards for l in h.getlayers()
	] + [
		l for e in effects for l in e.getlayers()
	] + [
		l for p in projectiles for l in p.getlayers()
	]
	
	layers += [
		("shroud", 0, yc + dy, 0, 0, None, None) for dy in range(10, 60, 20)
	]
	
	layers.sort(key = lambda l: -l[2])
	return layers

