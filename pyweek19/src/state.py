import settings, ships, things, quest

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
		self.things = [
			things.Planet((10, 0)),
			things.Sun((0, 15)),
		]
		for _ in range(4):
			self.ships.append(ships.Guard(self.things[0]))
		self.modules = [
			"engine",
			"laser",
			"gun",
		]
		self.active = {
			"engine": True,
			"laser": True,
			"gun": True,
		}
		self.effects = []
		self.quests = [
			quest.StartQuest(),
		]

	def handlebutton(self, buttonname):
		if buttonname in self.modules:
			self.toggleactive(buttonname)
			return True

	def toggleactive(self, modulename):
		self.active[modulename] = not self.active[modulename]

	def think(self, dt):
		import random, math, vista
		if random.random() < dt:
			theta = random.uniform(0, math.tau)
			x = vista.x0 + settings.fadedistance * math.sin(theta)
			y = vista.y0 + settings.fadedistance * math.cos(theta)
			self.ships.append(ships.Rock((x, y)))
		if random.random() < dt:
			theta = random.uniform(0, math.tau)
			x = vista.x0 + settings.fadedistance * math.sin(theta)
			y = vista.y0 + settings.fadedistance * math.cos(theta)
			self.ships.append(ships.Drone((x, y)))
		if not self.active["engine"]:
			self.you.allstop()
		if self.active["laser"] and self.you.laser.canfire():
			for s in self.ships:
				if s.laserable and self.you.laser.canreach(s):
					self.you.laser.fire(s)
		if self.active["gun"] and self.you.gun.canfire():
			for s in self.ships:
				if s.laserable and self.you.gun.canreach(s):
					self.you.gun.fire(s)
		for s in self.ships:
			if s.shootsyou:
				for w in s.weapons:
					if w.canfire() and w.canreach(self.you):
						w.fire(self.you)
		for t in self.things:
			t.think(dt)
		for s in self.ships:
			s.think(dt)
		for e in self.effects:
			e.think(dt)
		for q in self.quests:
			q.think(dt)
		self.ships = [s for s in self.ships if not s.faded()]

	def drawviewport(self):
		for t in self.things:
			t.draw()
		for s in self.ships:
			s.draw()
		for e in self.effects:
			e.draw()

state = State()

