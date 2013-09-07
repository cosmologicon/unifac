import math
import things, settings, info, text
from vec import vec


R = 32   # radius of the moon
dots = {}

structures = []
wires = []
satellites = []
copters = []
stuff = []
debris = []
effects = []
hq = None
t = 0
tick = 0
ttick = 0
reserves = [0, 0, 0]
materials = [0, 0, 0]
buildable = []
buildclock = 1
launchclock = 1

def init():
	
	global t, hq, tick, R, ttick
	t = 0
	tick = 0
	ttick = 0
	R = info.Rs[settings.level]
	dots.clear()
	del structures[:]
	del wires[:]
	del satellites[:]
	del copters[:]
	del stuff[:]
	del debris[:]
	del effects[:]
	reserves[:] = [0, 0, 0]
	materials[:] = info.m0s[settings.level]
	
	hq = things.HQ(vec(0, 0, 1))
	hq.t = 5
	structures.append(hq)
	satellites.append(things.WSat(hq, 18))
	satellites.append(things.WSat(hq, 22))
	runtick()
#	structures.append(things.RArtifact(vec(0, 1, 0), vec(1, 0, 0)))
	
	updatenetwork()

#	towers = [things.Car() for _ in range(4)]
#	towers += [things.Mine() for _ in range(4)]
	
#	t0 = things.Tower(vec(0, 0, 1))
#	t1 = things.Tower(vec(0.5, 0, 1).norm())
#	t2 = things.Tower(vec(1, 0, 1).norm())
#	t3 = things.Tower(vec(1, 0.3, 0.8).norm())
#	towers += [t0, t1, t2, t3]
#	towers += [
#		things.Wire(t0.u, t1.u),
#		things.Wire(t1.u, t2.u),
#		things.Wire(t2.u, t3.u),
#		things.Copter(),
#		things.Mine(vec(0, 1, 0)),
#	]
#	for h in range(19, 35):
#		towers.append(things.Satellite(t0, h))

	if settings.level == 1:
		while len(debris) < 30:
			u = vec.randomunit()
			if u.dot(hq.u) < 0.8:
				things.Debris(u)

def checklose():
	if not hq.alive:
		return True
	return False

def checkwin():
	if settings.level == 0:
		return sum(isinstance(s, things.Satcon) and s.on() for s in structures) >= 3
	return False


def wirematch(s0, s1):
	if isinstance(s0, things.HQ):
		for j, p in enumerate(s1.pneeds):
			if p:
				return j
	if isinstance(s1, things.HQ):
		return wirematch(s1, s0)
	for j, (p0, p1) in enumerate(zip(s0.pneeds, s1.pneeds)):
		if p0 and p1:
			return j
	return None

def updatenetwork():
	waspow = [s.powered for s in structures]

	for s in structures:
		s.power = [False, False, False]
		s.powered = False
		s.neighbors = []
		s.boost = 1

	global wires
	wires = [w for w in wires if w.s0.alive and w.s1.alive]

	ws = set((w.s0.u, w.s1.u) for w in wires)

	for j in range(len(structures)):
		for k in range(j):
			s0, s1 = structures[j], structures[k]
			if s0.u.dot(s1.u) > getdotreach(s0, s1):
				c = wirematch(s0, s1)
				if c is not None:
					s0.neighbors.append(s1)
					s1.neighbors.append(s0)
					if (s0.u, s1.u) not in ws:
						wires.append(things.Wire(s0, s1, c))

	hq.power = [True, True, True]
	hq.powered = True
	tonetwork = [hq]
	while tonetwork:
		newpower = []
		for s0 in tonetwork:
			for s1 in s0.neighbors:
				if s1.powered:
					continue
				s1.power = [a or (b and c) for a, b, c in zip(s1.power, s0.power, s1.pneeds)]
				if all(a or not b for a, b in zip(s1.power, s1.pneeds)):
					s1.powered = True
					if s1.enabled:
						newpower.append(s1)
		tonetwork = newpower

	for s in structures:
		if s.boostfactor and s.on():
			for s1 in s.neighbors:
				s1.boost = max(s1.boost, s.boostfactor)


	# Tech tree
	powtypes = []
	for s in structures:
		if s.powered and type(s) not in powtypes:
			powtypes.append(type(s))
	del buildable[:]
	buildable.extend([
#		things.Extractor,
#		things.Collector,
#		things.WRelay,
#		things.BRelay,
#		things.RRelay,
	])
#	if things.HQ in powtypes:
#		buildable.extend([things.Extractor, things.Collector])
#		if things.Extractor in powtypes and things.Collector in powtypes:
#			buildable.extend([things.Relay, things.Launchpad])


	ispow = [s.powered for s in structures]



	if any(x and not y for x, y in zip(ispow, waspow)):
		pass  # play power up sound
	elif any(y and not x for x, y in zip(ispow, waspow)):
		pass  # play power down sound

# Generate all wires that will lead to this structure if it's built
def wiresto(obj):
	for s in structures:
		if s.u.dot(obj.u) > getdotreach(obj, s):
			c = wirematch(obj, s)
			if c is not None:
				w = things.Wire(obj, s, c)
				w.t = 10
				yield w


def think(dt):
	global tick, t, buildclock, launchclock, ttick
	global satellites, structures, effects
	t += dt
	ttick += dt
	tick += dt
	for s in structures:
		buildclock += dt * s.dbuildclock * s.boost
		launchclock += dt * s.dlaunchclock * s.boost
	buildclock = min(buildclock, 1)
	launchclock = min(launchclock, 1)


	while tick > 1:
		runtick()
		tick -= 1
	while ttick > 30:
		text.clear()
		ttick -= 30
	satellites = [s for s in satellites if s.alive]
	structures = [s for s in structures if s.alive]
	effects = [e for e in effects if e.alive]
	matchcollectors()

def thinkers():
	for s in structures:
		yield s
	for c in copters:
		yield c
	for s in satellites:
		yield s
	for w in wires:
		yield w
	for s in stuff:
		yield s
	for d in debris:
		yield d
	for e in effects:
		yield e

def drawers():
	for s in structures:
		yield s
	for c in copters:
		yield c
	for s in satellites:
		yield s
	for w in wires:
		yield w
	for s in stuff:
		yield s
	for d in debris:
		yield d
	for e in effects:
		yield e

def matchcollectors():
	getters = [s for s in structures if isinstance(s, things.Collector) and s.on() and not s.copter]
	gettables = [s for s in stuff if isinstance(s, things.Material)]
	for c in copters:
		if c.target in gettables:
			gettables.remove(c.target)
	matchgetters(getters, gettables)

	getters = [s for s in structures if isinstance(s, things.Cleaner) and s.on() and not s.copter]
	gettables = list(debris)
	for c in copters:
		if c.target in gettables:
			gettables.remove(c.target)
	matchgetters(getters, gettables)


def matchgetters(getters, gettables):
	while getters and gettables:
		getter, gettable = max(
			[(x, y) for x in getters for y in gettables],
			key = lambda (x,y): x.u.dot(y.u)
		)
		getter.dispatch(gettable)
		getters.remove(getter)
		gettables.remove(gettable)
		

status = False

def runtick():
	global status, ppow, mpow, cpow, reserves
	status = True
	ppow = [0, 0, 0]
	mpow = [0, 0, 0]
	cpow = [0, 0, 0]
	for j in (0, 1, 2):
		for s in structures:
			if not s.on():
				continue
			mpow[j] += s.pneeds[j]
			cpow[j] += s.pcap[j] * s.boost
		for s in satellites:
			ppow[j] += s.gpower[j]
		reserves[j] = min(reserves[j] + ppow[j] - mpow[j], cpow[j])

	global nsat, satcon
	nsat = len([s for s in satellites if s.on()])
	satcon = sum(s.satcon * s.boost for s in structures if s.on())
	if nsat > satcon:
		pass  # TODO: kill satellites!

	


def getdot(r):
	if r not in dots:
		dots[r] = math.cos(float(r)/R)
	return dots[r]

def getdotreach(s0, s1):
	return getdot(
		(s0.buff + 1 if s0.reach is None else s0.reach) +
		(s1.buff + 1 if s1.reach is None else s1.reach)
	)


def canbuild(stype, pos):
	for s in structures:
		d = pos.dot(s.u)
		if d > getdot(stype.buff + s.buff):
			return False
	for x in debris:
		d = pos.dot(x.u)
		if d > getdot(stype.buff + 0.5):
			return False
	return True

def willgetpower(stype, pos):
	for s in structures:
		d = pos.dot(s.u)
		if d > getdotreach(stype, s):
			return True
	return False

def build(structure):
	global buildclock
	structures.append(structure)
	buildclock -= structure.buildclock
	for j in range(len(materials)):
		materials[j] -= structure.cost[j]
	updatenetwork()

def unbuild(structure):
	structures.remove(structure)
	structure.alive = False
	effects.append(things.Explosion(structure.u, structure.f))
	updatenetwork()

def toggleenable(structure):
	if structure is hq:
		return
	structure.enabled = not structure.enabled
	updatenetwork()


def canlaunch(stype):
	if launchclock < stype.launchclock:
		return False
	if nsat >= satcon:
		return False
	launchers = [s for s in structures if isinstance(s, things.Launcher) and s.on()]
	if not launchers:
		return False
	return True


def launch(stype):
	global launchclock
	launchclock -= stype.launchclock
	
	launchers = [s for s in structures if isinstance(s, things.Launcher) and s.on()]
	if not launchers:
		return
	launcher = launchers[0]
	structures.remove(launcher)
	structures.append(launcher)
	launcher.launch(stype)
	for j in range(len(materials)):
		materials[j] -= stype.cost[j]
	updatenetwork()

def unlaunch(stype):
	for s in list(satellites):
		if s.on() and type(s) is stype:
			s.unlaunch()
			return True
	return False

def collect(obj):
	for j in range(len(materials)):
		materials[j] += obj.resources[j]

def pointing(p):
	if not p:
		return None
	p = p.norm()
	for s in structures:
		if p.dot(s.u) > getdot(s.buff):
			return s
	return None






