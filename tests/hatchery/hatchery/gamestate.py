import settings
import math, random

class World(object):
	def __init__(self, name, p, r, colorcode, ndeliver=0):
		self.name = name
		self.setp(p)
		self.r = r
		self.colorcode = colorcode
		self.ndeliver = ndeliver
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
		self.neighborhoods = {}
	def getstate(self, knowledge = None):
		ret = []
		for name, world in self.worlds.items():
			known = not knowledge or name in knowledge
			color = world.colorcode if known else None
			ndeliver = world.ndeliver if known else None
			ret.append((name, world.p, world.r, color, ndeliver))
		return ret
	def setstate(self, state):
		self.worlds = {}
		self.sectors = {}
		self.neighborhoods = {}
		for worldinfo in state:
			self.addworld(World(*worldinfo))
	def addworld(self, world):
		self.worlds[world.name] = world
		if world.sector not in self.sectors:
			self.sectors[world.sector] = []
		self.sectors[world.sector].append(world)
	def worldsnear(self, sector):
		if sector in self.neighborhoods:
			return self.neighborhoods[sector]
		ret = []
		for s in settings.sectorsnear(sector):
			if s not in self.sectors:
				continue
			ret.extend(self.sectors[s])
		self.neighborhoods[sector] = ret
		return ret
	def nearestworld(self, (x, y)):
		return min(
			self.worldsnear(settings.getsector((x, y))),
			key = lambda w: math.sqrt((w.p[0] - x) ** 2 + (w.p[1] - y) ** 2) - w.r
		)
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
			r = galaxy.worlds[self.parent].r
			self.v = [
				settings.runv * (-moves["dx"] if "dx" in moves else 0),
				0 if self.p[1] <= r else self.v[1] - settings.g * dt,
			]
			self.p = [
				self.p[0] + dt * self.v[0] / r,
				max(self.p[1] + self.v[1] * dt, r),
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
			if "jump" in moves:
				self.land(galaxy.nearestworld(self.p).name, galaxy)
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
		self.p = math.atan2(dy, dx), max(math.sqrt(dx**2 + dy**2), galaxy.worlds[parent].r)
		self.v = 0, -settings.launchv
	def launch(self):
		self.v = [
			settings.launchv * math.cos(self.p[0]),
			settings.launchv * math.sin(self.p[0]),
		]
		self.p = self.worldpos()
		self.parent = None
		self.think(0.01)

def randomstork(galaxy):
	stork = Stork({
		"name": settings.randomname(),
		"p": (random.uniform(-1,1), random.uniform(-1,1)),
		"v": (0, 0),
		"parent": None,
		"held": None,
	})
	stork.land(galaxy.worlds["hatchery"])
	return stork


class Gamestate(object):
	def __init__(self, state = None):
		self.setstate(state or {})
	def setstate(self, state):
		self.storks = {}
		for sname, s in state.items():
			self.addstork(Stork(s))
	def getstate(self):
		return dict((sname, s.getstate()) for sname, s in self.storks.items())
	def advance(self, dt, moves, galaxy):
		for sname, stork in sorted(self.storks.items()):
			m = moves[sname] if sname in moves else {}
			stork.think(dt, m)
			if not stork.parent:
				self.checkland(stork, galaxy)
	def checkland(self, stork, galaxy):
		w = galaxy.checkland(stork.p)
		if not w: return
		stork.land(w.name, galaxy)
	# Add or update
	def addstork(self, stork):
		self.storks[stork.name] = stork
	def removestork(self, sname):
		del self.storks[sname]

galaxy = Galaxy()
gamestate = Gamestate()
you = None

