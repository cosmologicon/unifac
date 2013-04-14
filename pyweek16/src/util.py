import uuid, os.path, random, datetime, math, logging
import settings, data

log = logging.getLogger(__name__)

def getlogin():
	if settings.resetlogin: return None
	fname = data.filepath(settings.loginfile)
	if os.path.exists(fname):
		return open(fname).read()
	return None
def savelogin(username):
	fname = data.filepath(settings.loginfile)
	open(fname, "w").write(username)

usednames = set()
def randomname():
	while True:
		r = str(uuid.uuid4())
		if r not in usednames:
			return r

def rotateleft(w, h, colors):
	if (w, h) == (1, 1):
		return colors[1], colors[2], colors[3], colors[0]

def rotateright(w, h, colors):
	if (w, h) == (1, 1):
		return colors[3], colors[0], colors[1], colors[2]

def rotate(w, h, colors, dA):
	if dA == 1:
		return rotateright(w, h, colors)

def randomcolors(w, h):
	if (w, h) == (1, 1):
		rs = (0, 0, 0, 1), (0, 0, 1, 1), (0, 1, 0, 1), (0, 1, 1, 1)
	r = random.choice(rs)
	for _ in range(random.choice(range(4))):
		r = rotateright(w, h, r)
	return r

# What sectors must be prebuilt when this device is active?
def horizonsectors(tile):
	if tile.device not in settings.horizon:
		return []
	r = settings.horizon[tile.device] + settings.horizonbuffer
	sx0, sx1 = (tile.x - r) // settings.sectorsize, (tile.x + r) // settings.sectorsize
	sy0, sy1 = (tile.y - r) // settings.sectorsize, (tile.y + r) // settings.sectorsize
	return [(sx, sy) for sx in range(sx0, sx1+1) for sy in range(sy0, sy1+1)]


fogcache = {}
def fillfogcache(r):
	fogcache[r] = {}
	R = r + settings.penumbra
	for dx in range(-R, R+1):
		for dy in range(-R, R+1):
			d = int(math.sqrt(dx ** 2 + dy ** 2))
			fogcache[r][(dx, dy)] = min(max(d - r, 0), settings.penumbra)
def solvefog(gridstate, sx, sy):
	sector = gridstate.sectors[(sx, sy)]
	eyes = [(x, y, settings.horizon[tile.device])
		for x, y, tile in gridstate.adevices(sx, sy) if tile.device in settings.horizon]
	for ex, ey, r in eyes:
		if r not in fogcache:
			fillfogcache(r)
	for tx in range(settings.sectorsize):
		x = sx * settings.sectorsize + tx
		for ty in range(settings.sectorsize):
			y = sy * settings.sectorsize + ty
			fs = [fogcache[r].get((ex - x, ey - y), settings.penumbra) for ex, ey, r in eyes]
			sector.tiles[(tx, ty)].fog = min(fs) if fs else settings.penumbra


def screenshotname():
	return data.filepath(datetime.datetime.now().strftime("screenshot-%Y%m%d%H%M%S.png"))


