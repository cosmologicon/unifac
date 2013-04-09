import settings

class World(object):
	def __init__(self, name, p, r, colorcode):
		self.name = name
		self.setp(p)
		self.r = r
		self.colorcode = colorcode
	def setp(self, p):
		self.p = p
		self.sector = settings.getsector(p)

class Galaxy(object):
	def __init__(self):
		self.worlds = {}
		self.sectors = {}
	def addworld(self, world):
		self.worlds[world.name] = world
		if world.sector not in self.sectors:
			self.sectors[world.sector] = []
		self.sectors[world.sector].append(world)
	def randomworld(self):
		world = World(
			settings.randomname(),
			settings.randompos(),
			settings.randomsize(),
			settings.randomcolorcode()
		)
		while world.name in self.worlds or any(settings.collide(world, w2) for w2 in self.worlds.values()):
			world.name = settings.randomname()
			world.setp(settings.randompos())
			world.r = settings.randomsize()
		return world
	def create(self):
		hatchery = World("hatchery", (0,0), settings.size0, 0)
		self.addworld(hatchery)
		for jworld in range(settings.nworlds):
			self.addworld(self.randomworld())

galaxy = Galaxy()


class Gamestate(object):
	def __init__(self, state = None):
		if state:
			self.setstate(state)
	def setstate(self, state):
		pass
	def getstate(self):
		return None

