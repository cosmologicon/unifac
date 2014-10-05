import ships

class State(object):
	def __init__(self):
		self.you = ships.You()
		self.mother = ships.Mothership((3, 3))
		self.ships = [
			self.you,
			self.mother,
			ships.Bogey((3, -3)),
			ships.Bogey((-3, 3)),
		]
		self.modules = [
			"engine",
			"laser",
		]
		self.active = {
			"engine": True,
			"laser": True,
		}
		self.effects = []

	def handlebutton(self, buttonname):
		if buttonname in self.modules:
			self.toggleactive(buttonname)
			return True

	def toggleactive(self, modulename):
		self.active[modulename] = not self.active[modulename]

	def think(self, dt):
		if not self.active["engine"]:
			self.you.allstop()
		if self.active["laser"] and self.you.laser.canfire():
			for s in self.ships:
				if s.laserable and self.you.laser.canreach(s):
					self.you.laser.fire(s)
		for s in self.ships:
			s.think(dt)
		for e in self.effects:
			e.think(dt)

	def drawviewport(self):
		for s in self.ships:
			s.draw()
		for e in self.effects:
			e.draw()

state = State()

