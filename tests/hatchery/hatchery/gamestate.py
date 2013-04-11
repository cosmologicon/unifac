import settings
import math, random

class stateobj(object):
	fields = []
	defaults = {}
	def __init__(self, state=None):
		if state:
			self.setstate(state)
	def setstate(self, state):
		for field in self.fields:
			setattr(self, field, state[field] if field in state else self.defaults[field])
	def getstate(self):
		return dict((field, getattr(self, field)) for field in self.fields)


class World(stateobj):
	fields = "name p r colorcode ndeliver".split()
	defaults = { "ndeliver": 0 }
	@property
	def sector(self):
		return settings.getsector(self.p)
	@property
	def x(self):
		return self.p[0]
	@property
	def y(self):
		return self.p[1]
	def checkland(self, (x, y)):
		return (x - self.x) ** 2 + (y - self.y) ** 2 < self.r ** 2

class Galaxy(object):
	def __init__(self):
		self.worlds = {}
		self.sectors = {}
		self.neighborhoods = {}
	def getstate(self, knowledge = None):
		ret = []
		for name, world in self.worlds.items():
			known = not knowledge or name in knowledge
			ret.append({
				"name": name,
				"p": world.p,
				"r": world.r,
				"colorcode": world.colorcode if known else None,
				"ndeliver": world.ndeliver if known else None,
			})
		return ret
	def setstate(self, state):
		self.worlds = {}
		self.sectors = {}
		self.neighborhoods = {}
		for worldstate in state:
			self.addworld(World(worldstate))
	def addworld(self, world):
		self.worlds[world.name] = world
		if world.sector not in self.sectors:
			self.sectors[world.sector] = []
		self.sectors[world.sector].append(world)
	def applyknowledge(self, info):
		for wname, wstate in info.items():
			self.worlds[wname].setstate(wstate)

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
			key = lambda w: math.sqrt((w.x - x) ** 2 + (w.y - y) ** 2) - w.r
		)
	def checkland(self, p):
		for world in self.worldsnear(settings.getsector(p)):
			if world.checkland(p):
				return world
		return None
	def randomworld(self):  # random non-hatchery world
		world = World({
			"name": settings.randomname(),
			"p": settings.randompos(),
			"r": settings.randomsize(),
			"colorcode": settings.randomcolorcode(),
		})
		while world.name in self.worlds or any(settings.collide(world, w2) for w2 in self.worlds.values()):
			world.name = settings.randomname()
			world.p = settings.randompos()
			world.r = settings.randomsize()
		return world
	def create(self):
		self.addworld(World({
			"name": "hatchery",
			"p": (0,0),
			"r": settings.size0,
			"colorcode": 0,
		}))
		for p in settings.hatcherypos():
			self.addworld(World({
				"name": settings.randomname(),
				"p": p,
				"r": settings.size1,
				"colorcode": 0,
			}))
		for jworld in range(settings.nworlds):
			self.addworld(self.randomworld())

class Stork(stateobj):
	fields = "name parent p v held".split()
	defaults = { "v": (0, 0), "held": None }
	@property
	def sector(self):
		return settings.getsector(self.p)
	@property
	def x(self):
		return self.p[0]
	@x.setter
	def x(self, value):
		self.p = value, self.y
	@property
	def y(self):
		return self.p[1]
	@y.setter
	def y(self, value):
		self.p = self.x, value
	@property
	def vx(self):
		return self.v[0]
	@vx.setter
	def vx(self, value):
		self.v = value, self.vy
	@property
	def vy(self):
		return self.v[1]
	@vy.setter
	def vy(self, value):
		self.v = self.vx, value

	def think(self, dt, moves=None):
		if self.parent:
			r = galaxy.worlds[self.parent].r
			if moves is not None:
				self.vx = settings.runv * (-moves["dx"] if "dx" in moves else 0)
			self.vy -= settings.g * dt
			self.x += dt * self.vx / r
			self.y += self.vy * dt
			if self.y <= r:
				self.y, self.vy = r, 0
			if moves and "jump" in moves:
				self.launch()
		else:
			self.x += dt * self.vx
			self.y += dt * self.vy
			d = math.sqrt(self.x ** 2 + self.y ** 2)
			self.vx -= settings.g * dt * self.p[0] / d
			self.vy -=  settings.g * dt * self.p[1] / d
			if moves and "jump" in moves:
				self.land(galaxy.nearestworld(self.p).name)
	@property
	def worldpos(self):
		if not self.parent:
			return self.p
		parent = galaxy.worlds[self.parent]
		return parent.x + math.cos(self.x) * self.y, parent.y + math.sin(self.x) * self.y
	def land(self, parent):
		x, y = self.worldpos
		px, py = galaxy.worlds[parent].p
		self.parent = parent
		dx, dy = x - px, y - py
		self.p = math.atan2(dy, dx), max(math.sqrt(dx**2 + dy**2), galaxy.worlds[parent].r)
		self.v = 0, -settings.launchv
	def launch(self):
		self.v = [
			settings.launchv * math.cos(self.x),
			settings.launchv * math.sin(self.x),
		]
		self.p = self.worldpos
		self.parent = None
		self.think(0.01)

def randomstork(name=None):
	stork = Stork({
		"name": name or settings.randomname(),
		"p": (random.uniform(-1,1), random.uniform(-1,1)),
		"parent": None,
	})
	stork.land("hatchery")
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

	def localadvance(self, dt, moves=None):
		for sname, stork in sorted(self.storks.items()):
			m = None if moves is None else moves[sname] if sname in moves else {}
			stork.think(dt, m)
			if not stork.parent:
				self.checkland(stork)

	def useradvance(self, dt, sname, moves=None):
		stork = self.storks[sname]
		stork.think(dt, moves)
		if not stork.parent:
			self.checkland(stork)

	# Only called on the server
	# dt should always be a single frame
	# Returns new state, state patches, knowledge deltas
	def advance(self, dt, moves, knowledge):
		kpatch = {}
		for sname, stork in sorted(self.storks.items()):
			m = moves[sname] if sname in moves else {}
			stork.think(dt, m)
			if stork.parent:
				if stork.parent.name not in knowledge[stork.name]:
					knowledge[stork.name].add(w.name)
					kpatch[stork.name] = w.getstate()
			else:
				w = self.checkland(stork)
				if w and w.name not in knowledge[stork.name]:
					knowledge[stork.name].add(w.name)
					kpatch[stork.name] = w.getstate()
		spatch = dict((sname, self.getstate()) for sname in self.storks)
		return self.getstate(), spatch, kpatch

	def checkland(self, stork):
		w = galaxy.checkland(stork.p)
		if not w: return None
		stork.land(w.name)
		return w
	# Add or update
	def addstork(self, stork):
		self.storks[stork.name] = stork
	def removestork(self, sname):
		del self.storks[sname]

galaxy = Galaxy()

