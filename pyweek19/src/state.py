import ships

class State(object):
	def __init__(self):
		self.you = ships.You()
		self.mother = ships.Mothership((3, 3))
		self.ships = [self.you, self.mother]
		self.modules = [
			"thruster",
			"laser",
		]


	def think(self, dt):
		for ship in self.ships:
			ship.think(dt)

	def drawviewport(self):
		for ship in self.ships:
			ship.draw()

state = State()

