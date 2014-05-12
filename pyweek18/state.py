# The game state

from random import *
import ship, thing, effect, settings

def init():
	global ships, player, hazards, effects, yc
	global hpmax
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = [thing.Rock((4, 4, 0))]
	effects = [
		effect.Instructions(settings.gamename, 60),
		effect.Instructions("by Christopher Night", 100),
		effect.Instructions("PyWeek 18", 140),
	]
	money = 0
	hpmax = 1
	player.hp = hpmax
	yc = 0
	think(0)
	player.jump(1.4)

def think(dt):
	global yc, money, ships, hazards, effects
	yc += dt * settings.vyc
	if random() * 0.4 < dt:
		pos = uniform(-settings.lwidth, settings.lwidth), yc + 60, 0
		hazards.append(thing.Rock(pos))
	if random() * 2 < dt:
		pos = choice([-20, -15, -10 -7, 7, 10, 15, 20]), yc + 60, 0
		effects.append(effect.Island(pos))
	for h in hazards:
		if player.flashtime or not h.alive:
			continue
		dx, dy = h.x - player.x, h.y - player.y
		if dx ** 2 + dy ** 2 < 1 and player.z <= 0:
			hurt()
	for s in ships:
		s.think(dt)
	for h in hazards:
		h.think(dt)
	for e in effects:
		e.think(dt)
	if not player.alive and player in ships:
		effects.append(effect.Corpse(player))
	ships = [s for s in ships if s.alive]
	hazards = [h for h in hazards if h.alive]
	effects = [e for e in effects if e.alive]

def addsplash(obj):
	splash = effect.Splash((obj.x, obj.y, 0))
	effects.append(splash)

def addsmoke(obj):
	effects.append(effect.Smoke((obj.x, obj.y, obj.z)))

def addheal(obj):
	heal = effect.Heal((obj.x, obj.y, obj.z + 1))
	heal.vy = obj.vy
	effects.append(heal)

def hurt(n=1):
	addsmoke(player)
	player.hp -= n
	player.flashtime = 1
	

def getlayers():
	layers = [
		l for s in ships for l in s.getlayers()
	] + [
		l for h in hazards for l in h.getlayers()
	] + [
		l for e in effects for l in e.getlayers()
	]
	
	layers += [
		("shroud", 0, yc + dy, 0, 0, None) for dy in range(10, 60, 20)
	]
	
	layers.sort(key = lambda l: -l[2])
	return layers

