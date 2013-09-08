import math, cPickle, os.path, os
import things, settings, info, text, sound, random, data
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
tasteroids = 0
reserves = [0, 0, 0]
materials = [0, 0, 0]
buildable = []
buildclock = 1
launchclock = 1
wintime = 0
artifacts = []

fname = data.filepath("savegame.pkl")
def save():
	obj = R, structures, wires, satellites, copters, stuff, debris, effects, hq, t, tick, ttick, reserves, materials, buildable, buildclock, launchclock, artifacts, wintime, nsat, satcon, status, ppow, mpow, cpow, reserves, tsatkill, tshutdown, tasteroids, settings.level
	cPickle.dump(obj, open(fname, "wb"))

def load():
	if not os.path.exists(fname):
		init()
		return
	obj = cPickle.load(open(fname, "rb"))
	global R, structures, wires, satellites, copters, stuff, debris, effects, hq, t, tick, ttick, reserves, materials, buildable, buildclock, launchclock, artifacts, wintime, nsat, satcon, status, ppow, mpow, cpow, reserves, tsatkill, tshutdown, tasteroids
	R, structures, wires, satellites, copters, stuff, debris, effects, hq, t, tick, ttick, reserves, materials, buildable, buildclock, launchclock, artifacts, wintime, nsat, satcon, status, ppow, mpow, cpow, reserves, tsatkill, tshutdown, tasteroids, settings.level = obj

def removesave():
	if os.path.exists(fname):
		os.remove(fname)



def init():
	
	global t, hq, tick, R, ttick, tasteroids
	t = 0
	tick = 0
	ttick = 0
	tasteroids = 0
	R = info.Rs[settings.level] if settings.level is not None else 12
	dots.clear()
	del structures[:]
	del wires[:]
	del satellites[:]
	del copters[:]
	del stuff[:]
	del debris[:]
	del effects[:]
	reserves[:] = [0, 0, 0]
	materials[:] = info.m0s[settings.level] if settings.level is not None else [0, 0, 0]
	
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
	global artifacts, wintime
	wintime = 0

	if settings.level == 2:
		artifacts = [
			things.WBRArtifact(vec(0, 0, -1)),
#			things.WArtifact(vec(math.sin(0), math.cos(0), -8).norm()),
#			things.RArtifact(vec(math.sin(math.tau/3), math.cos(math.tau/3), -8).norm()),
#			things.BArtifact(vec(math.sin(2*math.tau/3), math.cos(math.tau/3), -8).norm()),
		]
		for artifact in artifacts:
			structures.append(artifact)
		while len(debris) < 30:
			u = vec.randomunit()
			if -0.8 < u.dot(hq.u) < 0.8:
				things.Debris(u)

	if settings.level == 3:
		artifacts = [
			things.WBRArtifact(vec(0, 0, -1)),
		]
		for artifact in artifacts:
			structures.append(artifact)
		wintime = 0


def checklose():
	if not hq.alive:
		return True
	if settings.level == 3 and not artifacts:
		return True
	return False

def checkwin(dt):
	global wintime
	if settings.level == 0:
		return sum(isinstance(s, things.Satcon) and s.on() for s in structures) >= 3
	if settings.level == 1:
		return not debris
	if settings.level in (2, 3):
		if all(a.on() for a in artifacts):
			wintime += dt
		else:
			wintime = 0
		return wintime >= 30
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
		sound.play("powerup")
	elif any(y and not x for x, y in zip(ispow, waspow)):
		sound.play("powerdown")

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
	global tick, t, buildclock, launchclock, ttick, tasteroids
	global satellites, structures, effects, copters
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
	copters = [s for s in copters if s.alive]
	structures = [s for s in structures if s.alive]
	effects = [e for e in effects if e.alive]
	matchcollectors()

	if settings.level == 3:
		tasteroids += dt
		if tasteroids > 40:
			for h in range(30):
				things.Asteroid(100 + 0.2 * h)
			tasteroids -= 40

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

	getters = [s for s in structures if isinstance(s, things.Medic) and s.on() and not s.copter]
	gettables = [s for s in structures if s.hp < s.hp0]
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
tsatkill = 0
tshutdown = [0, 0, 0]
def runtick():
	global status, ppow, mpow, cpow, reserves
	global tsatkill, tshutdown
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
			ppow[j] += s.gpower[j] * info.pmults[settings.level]
		reserves[j] = max(min(reserves[j] + ppow[j] - mpow[j], cpow[j]), -1)
		if reserves[j] < 0:
			tshutdown[j] += 1
			if tshutdown[j] >= 10:
				shutdown(j)
				tshutdown[j] = 0
		else:
			tshutdown[j] = 0

	global nsat, satcon
	nsat = len([s for s in satellites if s.on()])
	satcon = sum(s.satcon * s.boost for s in structures if s.on())
	if nsat > satcon:
		tsatkill += 1
		if tsatkill >= 20:
			unlaunchrandom()
			tsatkill -= 10
	else:
		tsatkill = 0

def shutdown(j):
	for s in structures:
		if s.pneeds[j]:
			s.enabled = False
	reserves[j] = max(reserves[j], 0)
	updatenetwork()
	


def getdot(r):
	if r not in dots:
		dots[r] = math.cos(float(r)/R)
	return dots[r]

def getdotreach(s0, s1):
	return getdot(
		(s0.buff + 1 if s0.reach is None else s0.reach) +
		(s1.buff + 1 if s1.reach is None else s1.reach)
	)


def asteroidland(obj):
	stuff.remove(obj)
	effects.append(things.Explosion(obj.u, obj.f))
	hit = False
	for s in structures:
		d = obj.u.dot(s.u)
		if d > getdot(s.buff):
			hit = True
			s.hp -= 1
			if s.hp <= 0:
				unbuild(s)
	if not hit:
		things.Debris(obj.u)


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
		if not s.on():
			continue
		if sum(s.pneeds) and any(x and not y for x, y in zip(stype.pneeds, s.pneeds)):
			continue
		d = pos.dot(s.u)
		if d > getdotreach(stype, s):
			return True
	return False

def overload(pneeds = None):
	if pneeds is None:
		pneeds = 0, 0, 0
	for j in range(3):
		if pneeds[j] > cpow[j] + ppow[j] - mpow[j]:
			return j
	return None

def builderror(stype):
	if buildclock < stype.buildclock:
		return "Command center recharging"
	for j in range(3):
		if stype.cost[j] > materials[j]:
			return "Insufficient %s" % info.mnames[j]
	return None

def build(structure):
	global buildclock
	structures.append(structure)
	buildclock -= structure.buildclock
	for j in range(len(materials)):
		materials[j] -= structure.cost[j]
	updatenetwork()

def unbuild(structure):
	if structure is hq or structure in artifacts:
		sound.play("error")
		return
	structures.remove(structure)
	structure.alive = False
	effects.append(things.Explosion(structure.u, structure.f))
	updatenetwork()

def toggleenable(structure):
	if structure is hq:
		return
	structure.enabled = not structure.enabled
	updatenetwork()


def launcherror(stype):
	launchers = [s for s in structures if isinstance(s, things.Launcher) and s.on()]
	if not launchers:
		return "No active launchpads"
	if launchclock < stype.launchclock:
		return "Launchpads recharging"
	if nsat >= satcon:
		return "Insufficient satellite control"
	for j in range(3):
		if stype.cost[j] > materials[j]:
			return "Insufficient %s" % info.mnames[j]
	return None


def launch(stype):
	global launchclock
	launchers = [s for s in structures if isinstance(s, things.Launcher) and s.on()]
	launcher = launchers[0]
	launchclock -= stype.launchclock
	structures.remove(launcher)
	structures.append(launcher)
	launcher.launch(stype)
	for j in range(len(materials)):
		materials[j] -= stype.cost[j]
	updatenetwork()

def unlaunchrandom():
	if satellites:
		unlaunch(type(random.choice(satellites)))

def unlaunch(stype):
	for s in list(satellites):
		if s.on() and type(s) is stype:
			s.unlaunch()
			return True
	return False

def collect(obj):
	for j in range(len(materials)):
		materials[j] += obj.resources[j] * info.mmults[settings.level]

def pointing(p):
	if not p:
		return None
	p = p.norm()
	for s in structures:
		if p.dot(s.u) > getdot(s.buff):
			return s
	return None






