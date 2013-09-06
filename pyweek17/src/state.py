import math
import things
from vec import vec


R = 9   # radius of the moon
dots = {}

structures = []
wires = []
satellites = []
copters = []
stuff = []
effects = []
hq = None
t = 0
tick = 0
reserves = [0, 0, 0]
materials = [0, 0]
buildable = []


def init():
	
	global t, hq, tick
	t = 0
	tick = 0
	dots.clear()
	del structures[:]
	del wires[:]
	del satellites[:]
	del copters[:]
	del stuff[:]
	del effects[:]
	reserves[:] = [0, 0, 0]
	materials[:] = [10, 0]
	
	hq = things.HQ(vec(0, 0, 1))
	hq.t = 5
	structures.append(hq)
	
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

def updatenetwork():
	waspow = [s.powered for s in structures]

	for s in structures:
		s.power = [False, False, False]
		s.powered = False
		s.neighbors = []

	global wires
	wires = [w for w in wires if w.s0.alive and w.s1.alive]

	ws = set((w.s0.u, w.s1.u) for w in wires)

	for j in range(len(structures)):
		for k in range(j):
			s0, s1 = structures[j], structures[k]
			if s0.u.dot(s1.u) > getdotreach(s0, s1):
				s0.neighbors.append(s1)
				s1.neighbors.append(s0)
				if (s0.u, s1.u) not in ws:
					wires.append(things.Wire(s0, s1))

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

	# Tech tree
	powtypes = []
	for s in structures:
		if s.powered and type(s) not in powtypes:
			powtypes.append(type(s))
	del buildable[:]
	buildable.extend([
		things.Extractor,
		things.Collector,
		things.WRelay,
		things.BRelay,
		things.RRelay,
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
			w = things.Wire(obj, s)
			w.t = 10
			yield w


def think(dt):
	global tick, t
	t += dt
	tick += dt
	while tick > 1:
		runtick()
		tick -= 1
	global satellites, structures, effects
	satellites = [s for s in satellites if s.alive]
	structures = [s for s in structures if s.alive]
	effects = [e for e in effects if e.alive]

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
	for e in effects:
		yield e

infotext = []

def runtick():
	del infotext[:]
	pres = [4, 0, 0]
	mres = [0, 0, 0]
	cres = [0, 0, 0]
	for j in (0, 1, 2):
		for s in structures:
			if not s.on():
				continue
			mres[j] += s.pneeds[j]
			cres[j] += s.pcap[j]
		for s in satellites:
			pres[j] += s.gpower[j]
		reserves[j] = min(reserves[j] + pres[j] - mres[j], cres[j])
		infotext.append("%s/%s (+%s-%s)" % (reserves[j], cres[j], pres[j], mres[j]))
	nsat = len([s for s in satellites if s.on()])
	satcon = sum(s.satcon for s in structures if s.on())
	if nsat or satcon:
		infotext.append("sat: %s/%s" % (nsat, satcon))
	if nsat > satcon:
		pass  # TODO: kill satellites!
	infotext.append("M: %s" % materials[0])

	


def getdot(r):
	if r not in dots:
		dots[r] = math.cos(float(r)/R)
	return dots[r]

def getdotreach(s0, s1):
	return getdot(
		(s0.buff + 1 if s0.reach is None else s0.reach) +
		(s1.buff + 1 if s1.reach is None else s1.reach)
	)


mustbepowered = False
def canbuild(stype, pos):
	power = False
	for s in structures:
		d = pos.dot(s.u)
		if d > getdot(stype.buff + s.buff):
			return False
		if d > getdotreach(stype, s):
			power = True
	return power or not mustbepowered

def build(structure):
	structures.append(structure)
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


def launch(stype):
	satellites.append(stype(hq, 25))
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



