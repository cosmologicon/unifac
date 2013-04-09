import settings
import math

class World(object):
	def __init__(self, name, p, r, colorcode):
		self.name = name
		self.setp(p)
		self.r = r
		self.colorcode = colorcode
	def setp(self, p):
		self.p = p
		self.sector = settings.getsector(p)
	def checkland(self, (x, y)):
		wx, wy = self.p
		dx, dy = x - wx, y - wy
		return dx ** 2 + dy ** 2 < self.r ** 2

class Galaxy(object):
	def __init__(self):
		self.worlds = {}
		self.sectors = {}
	def getstate(self):
		return [
			(world.name, world.p, world.r, world.colorcode)
			for world in self.worlds.values()
		]
	def setstate(self, state):
		self.worlds = {}
		self.sectors = {}
		for worldinfo in state:
			self.addworld(World(*worldinfo))
	def addworld(self, world):
		self.worlds[world.name] = world
		if world.sector not in self.sectors:
			self.sectors[world.sector] = []
		self.sectors[world.sector].append(world)
	def worldsnear(self, sector):
		ret = []
		for s in settings.sectorsnear(sector):
			if s not in self.sectors:
				continue
			ret.extend(self.sectors[s])
		return ret
	def checkland(self, p):
		for world in self.worldsnear(settings.getsector(p)):
			if world.checkland(p):
				return world
		return None
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
		self.hatchery = World("hatchery", (0,0), settings.size0, 0)
		self.addworld(self.hatchery)
		for p in settings.hatcherypos():
			self.addworld(World(settings.randomname(), p, settings.size1, 0))
		for jworld in range(settings.nworlds):
			self.addworld(self.randomworld())

class Stork(object):
	def __init__(self, state):
		if state:
			self.setstate(state)
	def setstate(self, state):
		self.name = state["name"]
		self.parent = state["parent"]
		self.p = state["p"]
		self.v = state["v"] if "v" in state else (0,0)
		self.held = state["held"] if "held" in state else None
	def getstate(self):
		return {
			"name": self.name,
			"parent": self.parent,
			"p": self.p,
			"v": self.v,
			"held": self.held,
		}
	def think(self, dt, moves={}):
		if self.parent:
			self.v = settings.runv * (-moves["dx"] if "dx" in moves else 0), 0
			self.p = [
				self.p[0] + dt * self.v[0] / galaxy.worlds[self.parent].r,
				self.p[1],
			]
			if "jump" in moves:
				self.launch()
		else:
			self.p = [
				self.p[0] + dt * self.v[0],
				self.p[1] + dt * self.v[1],
			]
			d = math.sqrt(self.p[0] ** 2 + self.p[1] ** 2)
			self.v = [
				self.v[0] - settings.g * dt * self.p[0] / d,
				self.v[1] - settings.g * dt * self.p[1] / d,
			]
	def worldpos(self):
		if not self.parent:
			return self.p
		x, y = self.p
		px, py = galaxy.worlds[self.parent].p
		return px + math.cos(x) * y, py + math.sin(x) * y
	def land(self, parent, galaxy):
		(x, y), (px, py) = self.worldpos(), galaxy.worlds[parent].p
		self.parent = parent
		dx, dy = x - px, y - py
		self.p = math.atan2(dy, dx), galaxy.worlds[parent].r
		self.v = 0, 0
	def launch(self):
		self.v = [
			settings.launchv * math.cos(self.p[0]),
			settings.launchv * math.sin(self.p[0]),
		]
		self.p = self.worldpos()
		self.parent = None
		self.think(0.01)

class Gamestate(object):
	def __init__(self, state = None):
		self.storks = {}
		if state:
			self.setstate(state)
	def setstate(self, state):
		pass
	def getstate(self):
		return None
	def advance(self, dt, moves, galaxy):
		for sname, stork in sorted(self.storks.items()):
			if sname not in moves:
				continue
			stork.think(dt, moves[sname])
			if not stork.parent:
				self.checkland(stork, galaxy)
	def checkland(self, stork, galaxy):
		w = galaxy.checkland(stork.p)
		if not w: return
		stork.land(w.name, galaxy)
	# Add or update
	def addstork(self, stork):
		self.storks[stork.name] = stork
	def addyou(self, stork):
		self.you = stork
		self.addstork(stork)

galaxy = Galaxy()
gamestate = Gamestate()


