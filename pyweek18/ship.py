
from thing import *

class Ship(Thing):
	pass


class PlayerShip(Ship):
	
	layers = [
		["brown", -1],
		["purple", 0],
		["brown", 1],
	]

	def think(self, dt):
		self.y += 10 * dt
		Ship.think(self, dt)
		self.alive = True


