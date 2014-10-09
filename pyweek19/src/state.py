import settings, ships, things, quest, parts, starmap

starmap.init()

class State(object):
	def __init__(self):
		self.bank = 0
		self.you = ships.You(starmap.ps["start"])
		self.mother = ships.Mothership(starmap.ps["mother"])
		# points of interest
		self.interests = set()
		self.ships = [
			self.you,
			self.mother,
		]
		self.things = [
#			things.Planet((10, 0)),
#			things.Sun((0, 15)),
			things.Sun(starmap.ps["angel0"]),
			things.Sun(starmap.ps["angel1"]),
			things.Sun(starmap.ps["angel2"]),
			things.Sun(starmap.ps["angel3"]),
			things.Sun(starmap.ps["angel4"]),
		]
#		for _ in range(4):
#			self.ships.append(ships.Guard(self.things[0]))
		self.effects = []
		self.quests = [
			quest.IntroQuest(),
		]

		# SHIP LAYOUT
		self.parts = [
		]
		# iedges for active power supplies
		self.supplies = {
			1: (-1, 2, 0, 2),
		}
		self.parts = [
			parts.Conduit((2,)).rotate(1).shift((0, 2)),
			parts.Module("engine").shift((1, 2)),
		]
		# self.modules is a list of placed module names
		# self.powered maps module names to powered-up state
		# self.hookup maps hooked up module name to the supply numbers that feed it.
		self.sethookup()
		print self.hookup

	def handlebutton(self, buttonname):
		if buttonname in self.modules:
			self.toggleactive(buttonname)
			return True

	def toggleactive(self, modulename):
		self.active[modulename] = not self.active[modulename]

	def think(self, dt):
		import random, math, vista
		if random.random() * 0.2 < dt:
			theta = random.uniform(0, math.tau)
			x = vista.x0 + settings.fadedistance * math.sin(theta)
			y = vista.y0 + settings.fadedistance * math.cos(theta)
			self.ships.append(ships.Rock((x, y)))
		if random.random() * 0.2 < dt:
			theta = random.uniform(0, math.tau)
			x = vista.x0 + settings.fadedistance * math.sin(theta)
			y = vista.y0 + settings.fadedistance * math.cos(theta)
			self.ships.append(ships.Drone((x, y)))
		if not self.active["engine"]:
			self.you.allstop()
		if self.active["drill"] and self.you.drill.canfire():
			for s in self.ships:
				if s.drillable and self.you.drillable.canreach(s):
					self.you.drill.fire(s)
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
		import vista, img
		for t in self.things:
			t.draw()
		for s in self.ships:
			s.draw()
		for e in self.effects:
			e.draw()
		for iname in self.interests:
			obj = getattr(self, iname)
			if not vista.isvisible((obj.x, obj.y), obj.radius - 1):
				pos, angle = vista.indpos((obj.x, obj.y))
				img.worlddraw("arrow", pos, angle = angle)


	def canaddpart(self, part):
		takenblocks = set(b for p in self.parts for b in p.blocks)
		return set(part.blocks).isdisjoint(takenblocks)

	def addpart(self, part):
		self.parts.append(part)
		self.sethookup()

	def sethookup(self):
		powered = {
			edge: [supply] for supply, edge in self.supplies.items()
		}
		self.hookup = {}
		self.modules = [part.name for part in self.parts if part.ismodule]
		self.active = { mname: False for mname in settings.modulecosts }
		while True:
			n = len(powered)
			for part in self.parts:
				if all(edge in powered for edge in part.inputs):
					supplies = sorted(set.union(*(set(powered[edge]) for edge in part.inputs)))
					for oedge in part.outputs:
						powered[oedge] = supplies
					if part.ismodule:
						self.hookup[part.name] = supplies
			if len(powered) == n:
				break

	def partat(self, block):
		for part in self.parts:
			if block in part.blocks:
				return part
		return None

	def removepart(self, part):
		self.parts.remove(part)
		self.sethookup()

state = State()

