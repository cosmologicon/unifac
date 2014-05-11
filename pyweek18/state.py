# The game state

import ship, thing

def init():
	global ships, player, hazards, y0
	player = ship.PlayerShip((0, 0, 0))
	ships = [player]
	hazards = [thing.Rock((4, 4, 0))]
	y0 = player.y
	think(0)

def think(dt):
	global y0
	for s in ships:
		s.think(dt)
	for h in hazards:
		h.think(dt)
	y0 = player.y

def getlayers():
	layers = [
		l for s in ships for l in s.getlayers()
	] + [
		l for h in hazards for l in h.getlayers()
	]
	
	layers.sort(key = lambda l: -l[2])
	return layers

