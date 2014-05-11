# The game state

from random import *
import ship, thing, effect, settings

def init():
	global ships, player, hazards, effects, yc
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = [thing.Rock((4, 4, 0))]
	effects = []
	yc = player.y - settings.dyc
	think(0)

def think(dt):
	global yc
	if random() * 0.4 < dt:
		pos = uniform(-settings.lwidth, settings.lwidth), yc + 60, 0
		hazards.append(thing.Rock(pos))
	if random() * 2 < dt:
		pos = choice([-20, -15, -10 -7, 7, 10, 15, 20]), yc + 60, 0
		effects.append(effect.Island(pos))
	for h in hazards:
		if not h.alive:
			continue
		dx, dy = h.x - player.x, h.y - player.y
		if dx ** 2 + dy ** 2 < 1 and player.z <= 0:
			h.alive = False
			addsmoke(player)
	for s in ships:
		s.think(dt)
	for h in hazards:
		h.think(dt)
	for e in effects:
		e.think(dt)
	yc = player.y - settings.dyc

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
	]
	
	layers += [
		("shroud", 0, yc + dy, 0, 0, None) for dy in range(10, 100, 10)
	]
	
	layers.sort(key = lambda l: -l[2])
	return layers

