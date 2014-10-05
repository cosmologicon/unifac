import ships

class State(object):
	def __init__(self):
		self.ships = [ships.You()]

	def think(self, dt):
		for ship in self.ships:
			ship.think(dt)

	def draw(self):
		for ship in self.ships:
			ship.draw()

state = State()

