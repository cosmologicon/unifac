import things
from vec import vec


R = 32   # radius of the moon

structures = []
hq = None

def init():
	
	global t, hq
	t = 0
	del structures[:]
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
	for s in structures:
		s.power = False
	hq.power = True

def canbuild(stype, pos):
	for s in structures:
		if pos.dot(s.u) > 0.99:
			return False
	return True

def build(structure):
	structures.append(structure)
	updatenetwork()

