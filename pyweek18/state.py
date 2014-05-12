# The game state

from random import *
import ship, thing, effect, settings

def init():
	global ships, player, hazards, effects, projectiles, yc
	global hpmax
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = []
	effects = [
		effect.Instructions(settings.gamename, 60),
		effect.Instructions("by Christopher Night", 100),
		effect.Instructions("PyWeek 18", 140),
	]
	projectiles = []
	money = 0
	hpmax = 1
	player.hp = hpmax
	player.tcooldown = 0.5
	yc = 0
	think(0)
	player.jump(1.4)

def think(dt):
	global yc, money, ships, hazards, effects, projectiles
	yc += dt * settings.vyc
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
		vx, vy = uniform(-1, 1), uniform(3, 6)
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

def addsplash(obj):
	splash = effect.Splash((obj.x, obj.y, 0))
	effects.append(splash)

def addsmoke(obj):
	effects.append(effect.Smoke((obj.x, obj.y, obj.z)))

def addheal(obj):
	heal = effect.Heal((obj.x, obj.y, obj.z + 1))
	heal.vy = obj.vy
	effects.append(heal)


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

