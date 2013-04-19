import os.path, random, datetime, math, logging, string
import settings, data

log = logging.getLogger(__name__)

class serializable(object):
	fields = None
	defaults = None
	def __init__(self, state):
		self.setstate(state)
	def setstate(self, state):
		for field in self.fields:
			setattr(self, field, state[field] if field in state else self.defaults[field])
	def getstate(self):
		return dict((field, getattr(self, field)) for field in self.fields)

def getlogin():
	if settings.resetlogin: return None, None
	fname = data.filepath(settings.loginfile)
	if os.path.exists(fname):
		return open(fname).read().split()
	return None, None
def savelogin(username, password):
	fname = data.filepath(settings.loginfile)
	open(fname, "w").write("%s %s" % (username, password))

usednames = set()
namechars = string.letters + string.digits
def randomname(n = 5):
	while True:
		r = "".join(random.choice(namechars) for _ in range(n))
		if r not in usednames:
			return r

def cycle(array, n):
	n %= len(array)
	return tuple(array[n:] + array[:n])

def rotate(s, colors, dA):
	return cycle(colors, 3 * s * dA)

def rdevice(device, dA):
	if not device:
		return device
	if device[0] == "2":
		return device[:-1] + str((int(device[-1]) + dA) % 2)
	if device[0] == "1":
		return device[:-1] + str((int(device[-1]) + dA) % 4)
	return device		

def spin(s, colors, device, dA):
	return rotate(s, colors, dA), rdevice(device, dA)

def randomcolors(s):
	if s == 1:
		rs = (0, 0, 0, 1), (0, 0, 1, 1), (0, 1, 0, 1), (0, 1, 1, 1)
		r = random.choice(rs)
		r = rotate(s, r, random.choice(range(4)))
		return r
	while True:
		r = tuple(random.choice([0, 1]) for _ in range(4*s))
		if s <= sum(r) <= 3*s:
			return r
def randomnewcolors(oldcolors):
	s = len(oldcolors) // 4
	while True:
		r = randomcolors(s)
		if sum(x == y for x,y in zip(oldcolors, r)) in (0,4*s):
			continue
		if r in [rotate(s, oldcolors, n) for n in (1, 2, 3)]:
			continue
		return r


# What sectors must be prebuilt when this device is unlocked?
def horizonsectors(x, y, r):
	sx0, sx1 = (x - r) // settings.sectorsize, (x + r) // settings.sectorsize
	sy0, sy1 = (y - r) // settings.sectorsize, (y + r) // settings.sectorsize
	return [(sx, sy) for sx in range(sx0, sx1+1) for sy in range(sy0, sy1+1)]

# Tiles adjacent to the tile at (x,y)
def neighbors(s, x, y):
	for j in range(s):
		yield x+j, y-1  # top side neighbor
		yield x+s, y+j  # right side neighbor
		yield x+j, y+s  # bottom side neighbor
		yield x-1, y+j  # left side neighbor


fogcache = {}
def fillfogcache(r):
	if r in fogcache:
		return fogcache[r]
	fogcache[r] = {}
	R = r + settings.penumbra
	for dx in range(-2*R, 2*R+1):
		for dy in range(-2*R, 2*R+1):
			d = int(0.5 * math.sqrt(dx ** 2 + dy ** 2))
			fogcache[r][(dx*0.5, dy*0.5)] = min(max(d - r, 0), settings.penumbra)
	return fogcache[r]
def solvefog(gridstate, sx, sy):
	sector = gridstate.sectors[(sx, sy)]
	eyes = [(x, y, settings.horizon[tile.device])
		for x, y, tile in gridstate.adevices(sx, sy) if tile.device in settings.horizon]
	for ex, ey, r in eyes:
		fillfogcache(r)
	for tx in range(settings.sectorsize):
		x = sx * settings.sectorsize + tx
		for ty in range(settings.sectorsize):
			y = sy * settings.sectorsize + ty
			fs = [fogcache[r].get((ex - x, ey - y), settings.penumbra) for ex, ey, r in eyes]
			sector.setfog(x, y, min(fs) if fs else settings.penumbra)
def removefog(gridstate, x0, y0, r):
	for (dx, dy), f in fillfogcache(r).items():
		if dx != int(dx) or dy != int(dy):
			continue
		x, y = x0 + dx, y0 + dy
		tile = gridstate.getrawtile(x, y)
		if not tile or tile.fog < f:
			continue
		gridstate.setfog(x, y, f)

def countfog(gridstate, x0, y0, r):
	n = 0
	for (dx, dy), f in fillfogcache(r).items():
		x, y = x0 + dx, y0 + dy
		tile = gridstate.getrawtile(x, y)
		if not tile or tile.fog < f:
			continue
		n += 1
	return n


def screenshotname():
	return data.filepath(datetime.datetime.now().strftime("screenshot-%Y%m%d%H%M%S.png"))


