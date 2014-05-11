# The game state

from random import *
import ship, thing, settings

def init():
	global ships, player, hazards, yc
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = [thing.Rock((4, 4, 0))]
	yc = player.y - settings.dyc
	think(0)

def think(dt):
	global yc
	if random() * 2 < dt:
		pos = randrange(-5, 5), yc + 100, 0
		hazards.append(thing.Rock(pos))
	for s in ships:
		s.think(dt)
	for h in hazards:
		h.think(dt)
	yc = player.y - settings.dyc

def getlayers():
	layers = [
		l for s in ships for l in s.getlayers()
	] + [
		l for h in hazards for l in h.getlayers()
	]
	
	layers.sort(key = lambda l: -l[2])
	return layers

