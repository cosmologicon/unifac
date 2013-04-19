import pygame, math, logging, os.path
import settings, clientstate, data, util, menu, text

log = logging.getLogger(__name__)

screen = None

def init():
	global screen
	pygame.font.init()
	screen = pygame.display.set_mode((settings.screenx, settings.screeny))
	pygame.display.set_caption("Last Will of the Emtar")

camerax0, cameray0 = 200, 200
cameraz = 40

def worldtoscreen((x, y)):
	return (
		int(settings.windowx * 0.5 + cameraz * x - camerax0),
		int(settings.screeny * 0.5 + cameraz * y - cameray0),
	)
def screentoworld((px, py)):
	return (
		(px + camerax0 - 0.5 * settings.windowx) / cameraz,
		(py + cameray0 - 0.5 * settings.screeny) / cameraz,
	)
def screentotile(p):
	return [int(math.floor(a)) for a in screentoworld(p)]
def p0():
	return int(math.floor(camerax0 / cameraz)), int(math.floor(cameray0 / cameraz))
def drag(dx, dy):
	global camerax0, cameray0
	x, y = camerax0 - dx, cameray0 - dy
	ix, iy = [int(math.floor(a/cameraz)) for a in (x, y)]
	tile = clientstate.gridstate.getbasetile(ix, iy)
	if not tile or tile.fog:
		return
	camerax0, cameray0 = x, y
	return True
def zoom(dz, (x, y)):
	global camerax0, cameray0, cameraz
	z = cameraz
	if dz > 0:
		for j in range(dz):
			zs = [zoom for zoom in settings.zooms if zoom > z]
			if zs:
				z = min(zs)
			
	else:
		for j in range(-dz):
			zs = [zoom for zoom in settings.zooms if zoom < z]
			if zs:
				z = max(zs)
	# (x + x0 - sx/2) / z0 = (x + x1 - sx/2) / z1
	# z1 x + z1 x0 - z1 sx/2 = z0 x + z0 x1 - z0 sx / 2
	# z0 x1 = z1 x + z1 x0 - z1 sx/2 + z0 sx / 2 - z0 x
	x = 1.0 / cameraz * ((z - cameraz) * (x - settings.windowx / 2) + z * camerax0)
	y = 1.0 / cameraz * ((z - cameraz) * (y - settings.screeny / 2) + z * cameray0)
	tile = clientstate.gridstate.getbasetile(int(x/cameraz), int(y/cameraz))
	if not tile or tile.fog:
		return
	camerax0, cameray0 = x, y
	cameraz = z
	return True

def visibletiles():
	xmin, ymin = screentotile((0, 0))
	xmax, ymax = screentotile((settings.windowx, settings.screeny))
	for x in range(xmin-4, xmax+1):
		for y in range(ymin-4, ymax+1):
			yield x, y


u = settings.tileunit
u2, u4 = u//2, u//4

imgcache = {}
def getimg(name):
	if name in imgcache:
		return imgcache[name]
	if os.path.exists(data.filepath("tile-%s" % u, name + ".png")):
		img = pygame.image.load(data.filepath("tile-%s" % u, name + ".png")).convert_alpha()
	elif name[:-1] in ("red-", "blue-", "1laser", "2laser", "1blaster", "1dshield"):
		color, a = name[:-1], int(name[-1])
		img = pygame.transform.rotate(getimg("%s0" % color), -90 * a)
	elif name[:-1] in ("base-active-", "base-inactive-", "outline-", "fog-"):
		img0 = getimg(name[:-2])
		s = int(name[-1])
		img = pygame.Surface((u*s, u*s)).convert_alpha()
		img.fill((0,0,0,0))
		# I can do this much more cleverly, really I can, but it's late and I just want to see how it looks.
		for x in range(2*s+1):
			for y in range(2*s+1):
				if (x, y) == (0, 0):
					img.blit(img0, (0,0), (0,0,u4,u4))
				elif (x, y) == (2*s, 0):
					img.blit(img0, (-u4+u*s,0), (3*u4,0,u4,u4))
				elif (x, y) == (0, 2*s):
					img.blit(img0, (0,-u4+u*s), (0,3*u4,u4,u4))
				elif (x, y) == (2*s, 2*s):
					img.blit(img0, (-u4+u*s, -u4+u*s), (3*u4,3*u4,u4,u4))
				elif x == 0:
					img.blit(img0, (0,-u4+u2*y), (0,u4,u4,u2))
				elif y == 0:
					img.blit(img0, (-u4+u2*x,0), (u4,0,u2,u4))
				elif x == 2*s:
					img.blit(img0, (-u4+u*s,-u4+u2*y), (3*u4,u4,u4,u2))
				elif y == 2*s:
					img.blit(img0, (-u4+u2*x, -u4+u*s), (u4,3*u4,u2,u4))
				else:
					img.blit(img0, (-u4+u2*x, -u4+u2*y), (u4,u4,u2,u2))
#		pygame.image.save(img, "%s.png" % name)
	elif name.startswith("blue") or name.startswith("red"):
		color, j, s = name.split("-")
		s = int(s)
		a, j = divmod(int(j), s)
		if a == 0:
			dx, dy = j, 0
		elif a == 1:
			dx, dy = s-1, j
		elif a == 2:
			dx, dy = s-1-j, s-1
		elif a == 3:
			dx, dy = 0, s-1-j
		img = pygame.Surface((u*s, u*s)).convert_alpha()
		img.fill((0,0,0,0))
		img.blit(getimg("%s-%s" % (color, a)), (u*dx, u*dy))
	imgcache[name] = img
	return img

def deviceimg(device, z):
	if z == u:
		return getimg(device)
	key = "%s+%s" % (device, z)
	if key in imgcache:
		return imgcache[key]
	img0 = deviceimg(device, u)
	imgcache[key] = pygame.transform.smoothscale(img0, (z, z))
	return imgcache[key]

tilecache = {}
def gettileimg(s, colors, device, fog, active, locked = False, z = None):
	z = z or cameraz
	key = (colors and tuple(colors)), device, fog, active, locked, z
	if key in tilecache:
		return tilecache[key]
	if z == u:
		if locked:
			img = gettileimg(s, colors, device, max(fog, 2), active, False).copy()
			# TODO: lock image
		elif fog == 0:
			if s == 1:
				if device is None:
					img = pygame.Surface((u, u)).convert_alpha()
					img.fill((0,0,0,0))
					tnames = ["base-active" if active else "base-inactive"]
					if colors:
						for j in range(4):
							tnames.append("%s-%s" % (("blue" if colors[j] else "red"), j))
					tnames.append("outline")
					for tname in tnames:
						img.blit(getimg(tname), (0, 0))
				else:
					img = gettileimg(s, colors, None, fog, active, locked, z = u).copy()
					if device in settings.devicesize:
						img.blit(getimg(device), (0, 0))
			else:
				img = pygame.Surface((u*s, u*s)).convert_alpha()
				img.fill((0,0,0,0))
				tnames = ["base-active-%s" % s if active else "base-inactive-%s" % s]
				if colors:
					for j in range(4*s):
						tnames.append("%s-%s-%s" % (("blue" if colors[j] else "red"), j, s))
				tnames.append("outline-%s" % s)
				for tname in tnames:
					img.blit(getimg(tname), (0, 0))
				if device:
					dimg = getimg(device[2:])
					rect = dimg.get_rect(center = img.get_rect().center)
					img.blit(dimg, rect)
					
		elif fog == settings.penumbra:
			img = pygame.Surface((u, u)).convert_alpha()
			img.fill((0,0,0,0))
		else:
			img = gettileimg(s, colors, device, 0, active, locked, z).copy()
			f = getimg("fog")
			for _ in range(fog):
				img.blit(f, (0, 0))
	else:
		img0 = gettileimg(s, colors, device, fog, active, locked, z = u)
		img = pygame.transform.smoothscale(img0, (z*s, z*s))
	tilecache[key] = img
	return img

tileeffects = {}
effects = []
class Effect(object):
	alive = True
	T = 0.25
	t = 0
	def think(self, dt):
		self.t += dt
		if self.t >= self.T:
			self.alive = False

class SpinTile(Effect):
	T = 0.25
	def __init__(self, tile, dA):
		self.dA = dA % 4
		if self.dA > 2: self.dA -= 4
		self.state = tile.getstate()
		self.device = tile.device
		self.drawon = self.device and ("laser" in self.device)
		self.drawover = self.device in ("wall", "coin")
		if self.device and self.device[:2] in ("b2", "b3", "b4", "b5"):
			self.drawover = True
			self.device = tile.device[2:]

		device = self.device if self.drawon else None
		locked = tile.lock and tile.lock != clientstate.you.username
		self.img0 = gettileimg(tile.s, tile.colors, device, tile.fog, False, locked)
		self.p0 = tile.x + 0.5 * tile.s, tile.y + 0.5 * tile.s
		tileeffects[(tile.x, tile.y)] = self
	def draw(self):
		A = self.dA * min(self.t / self.T, 1)
		img = pygame.transform.rotozoom(self.img0, -90 * A, 1)
		px, py = worldtoscreen(self.p0)
		rect = img.get_rect(center = (px, py-1))
		screen.blit(img, rect)
		if self.drawover:
			img = deviceimg(self.device, cameraz)
			rect = img.get_rect(center = (px, py))
			screen.blit(img, rect)

class FlipTile(Effect):
	T = 0.25
	def __init__(self, oldstate, newstate):
		self.state0 = oldstate
		locked = oldstate["lock"] and oldstate["lock"] != clientstate.you.username
		self.img0 = gettileimg(oldstate["s"], oldstate["colors"], oldstate["device"],
			oldstate["fog"], oldstate["active"], locked)
		self.img1 = gettileimg(newstate["s"], newstate["colors"], newstate["device"],
			newstate["fog"], newstate["active"], locked)
		self.p0 = oldstate["x"] + 0.5 * oldstate["s"], oldstate["y"] + 0.5 * oldstate["s"]
		tileeffects[(oldstate["x"], oldstate["y"])] = self
	def draw(self):
		w, h = self.img0.get_size()
		w = int(w * math.cos(3.14 * min(self.t / self.T, 1)))
		img = self.img0 if w > 0 else self.img1
		img = pygame.transform.smoothscale(img, (abs(w), h))
		rect = img.get_rect(center = worldtoscreen(self.p0))
		screen.blit(img, rect)

class CoinFlipTile(FlipTile):
	def draw(self):
		self.drawover = False
		FlipTile.draw(self)
		w = abs(int(cameraz * math.cos(3.14 * self.t / self.T)))
		x0, y0 = worldtoscreen(self.p0)
		a = self.t / self.T
		y0 -= int(cameraz * a * (2 - a))
		img = deviceimg("coin", cameraz)
		rect = img.get_rect(center = (x0, y0))
		screen.blit(img, rect)

class SplatEffect(Effect):
	T = 0.4
	def __init__(self, x, y):
		self.p0 = x + 0.5, y + 0.5
		effects.append(self)
	def draw(self):
		r = int(0.8 * cameraz * self.t / self.T)
		if r < 2: return
		pygame.draw.circle(screen, (0,0,0), worldtoscreen(self.p0), r, 2)

class StepEffect(Effect):
	T = 0.25
	def __init__(self, x0, y0, x1, y1):
		self.x0, self.y0 = x0 + 0.5, y0 + 0.5
		self.x1, self.y1 = x1 + 0.5, y1 + 0.5
		self.p1 = x1, y1
		effects.append(self)
	def draw(self):
		f = self.t / self.T
		g = 1 - f
		p = worldtoscreen((self.x1 * f + self.x0 * g, self.y1 * f + self.y0 * g))
		pygame.draw.circle(screen, (0,0,0), p, 10)

class LaserEffect(Effect):
	T = 0.15
	def __init__(self, x0, y0, x1, y1):
		self.x0, self.y0 = x0 + 0.5, y0 + 0.5
		self.x1, self.y1 = x1 + 0.5, y1 + 0.5
		self.p1 = x1, y1
		effects.append(self)
	def draw(self):
		p0 = worldtoscreen((self.x0, self.y0))
		p1 = worldtoscreen((self.x1, self.y1))
		pygame.draw.line(screen, (0,255,0), p0, p1, 2)


def think(dt):
	global effects
	for p, tileeffect in list(tileeffects.items()):
		tileeffect.think(dt)
		if not tileeffect.alive:
			del tileeffects[p]

	for effect in effects:
		effect.think(dt)
	effects = [e for e in effects if e.alive]


def draw():
	screen.fill((0,0,0))
	visibleeffects = []
	shields = []
	for x, y in visibletiles():
		if (x, y) in tileeffects:
			visibleeffects.append(tileeffects[(x, y)])
			continue
		tile = clientstate.gridstate.getrawtile(x, y)
		if not tile:
			continue
		locked = tile.lock and tile.lock != clientstate.you.username
		img = gettileimg(tile.s, tile.colors, tile.device, tile.fog, tile.active, locked)
		screen.blit(img, worldtoscreen((x, y)))
		if tile.active and tile.device and "shield" in tile.device:
			shields.append(tile)
	visibleeffects.extend(effects)
	for effect in visibleeffects:
		effect.draw()
	nodraws = [e.p1 for e in effects if isinstance(e, StepEffect)]
	import time
	for monster in clientstate.monsters.values():
		if (monster.x, monster.y) in nodraws:
			continue
		s = 1 + 0.3 * math.sin(7 * time.time())
		a = [0.2, 0.3, 0.5, 0.7][monster.hp]
		rect = pygame.Rect(0, 0, int(a * cameraz * s), int(a * cameraz / s))
		rect.center = worldtoscreen((monster.x + 0.5, monster.y + 0.5))
		pygame.draw.ellipse(screen, (0,0,0), rect)

	a = (time.time() / 1.4) % 1
	if a < 0.2:
		a *= 5
		for shield in shields:
			x0, y0 = shield.x + 0.5, shield.y + 0.5
			r = int(0.2 * cameraz)
			if shield.device == "shield":
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0 + 1.4*a, y0)), r, 3)
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0 - 1.4*a, y0)), r, 1)
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0, y0 + 1.4*a)), r, 1)
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0, y0 - 1.4*a)), r, 1)
			if shield.device == "1dshield0":
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0, y0 - 3.4*a)), r, 3)
			if shield.device == "1dshield1":
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0 + 3.4*a, y0)), r, 3)
			if shield.device == "1dshield2":
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0, y0 + 3.4*a)), r, 3)
			if shield.device == "1dshield3":
				pygame.draw.circle(screen, (0, 255, 100), worldtoscreen((x0 - 3.4*a, y0)), r, 3)

	drawhud()

	if menu.stack:
		menu.top().draw(screen)

	pygame.display.flip()

selected = None
huds = 60
hudrects = {
	"none":      (settings.windowx +  20,  20, huds, huds),
	"shuffle":   (settings.windowx + 100,  20, huds, huds),
	"wall":      (settings.windowx + 180,  20, huds, huds),
	"1laser0":   (settings.windowx +  20, 100, huds, huds),
	"2laser0":   (settings.windowx + 100, 100, huds, huds),
	"4laser":    (settings.windowx + 180, 100, huds, huds),
	"1blaster0": (settings.windowx +  20, 180, huds, huds),
	"mine":      (settings.windowx + 100, 180, huds, huds),
	"adjmine":   (settings.windowx + 180, 180, huds, huds),
	"shield":    (settings.windowx +  20, 260, huds, huds),
	"1dshield0":  (settings.windowx + 100, 260, huds, huds),
	"special":   (settings.windowx + 180, 260, huds, huds),
}

def drawhud():
	global selected
	menu.drawoutsetbox(screen, settings.windowx, 0, settings.hudx, settings.screeny, 4, (20,20,20))
	cimg = deviceimg("coin", 70)
	screen.blit(cimg, cimg.get_rect(center = (settings.windowx + 40, settings.screeny - 40)))
	text.drawtext(screen, "x %s" % clientstate.you.coins,
		40, (255, 100, 255), (settings.windowx + 70, settings.screeny - 40),
		anchor="midleft", ocolor=(0,0,0), fontname="RacingSansOne")
	text.drawtext(screen, "%s XP" % clientstate.you.xp,
		40, (160, 160, 160), (settings.windowx + 70, settings.screeny - 70),
		anchor="midleft", ocolor=(0,0,0), fontname="RacingSansOne")

	if clientstate.qstatus:
		text.drawtext(screen, "Unlocking node: %d/%d" % clientstate.qstatus,
			40, (255, 255, 255), (10, 10), anchor="topleft", ocolor=(0,0,0), fontname="Homenaje")

	if clientstate.you.trained < 3:
		return
	
	for dname, rect in hudrects.items():
		if dname == "special" and not clientstate.you.special:
			continue
		if dname == "none":
			device = None
			active = False
		else:
			device = dname
			active = selected == dname
		img = gettileimg(1, None, device, 0, active, z=huds)
		rect = pygame.Rect(rect)
		screen.blit(img, rect)
		if device in settings.devicexp and device not in clientstate.you.unlocked:
			text.drawtext(screen, "%sxp" % settings.devicexp[device], 36, (0,0,0),
				rect.center, anchor="center", ocolor=(255, 255, 255), d=2, fontname="Viga")
			screen.set_at(rect.center, (255,0,0))
	if hudpoint:
		unlocked = hudpoint in clientstate.you.unlocked
		menu.gethudbox(hudpoint, unlocked).draw(screen)


def onhud((x,y)):
	return x > settings.windowx

def hudclick(p):
	for dname, rect in hudrects.items():
		if pygame.Rect(rect).collidepoint(p):
			return dname
	return None

def handlehudclick(name):
	global selected
	if name in (None, "none"):
		selected = None
	elif name not in clientstate.you.unlocked:
		selected = None
	elif name == selected:
		if name[0] == "2":
			selected = name[:-1] + str((int(name[-1]) + 1) % 2)
			hudrects[selected] = hudrects[name]
			del hudrects[name]
		elif name[0] == "1":
			selected = name[:-1] + str((int(name[-1]) + 3) % 4)
			hudrects[selected] = hudrects[name]
			del hudrects[name]
		else:
			selected = None
	else:
		selected = name


def screenshot():
	pygame.image.save(screen, util.screenshotname())

