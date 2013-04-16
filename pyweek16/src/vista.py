import pygame, math, logging
import settings, clientstate, data, util

log = logging.getLogger(__name__)

screen = None

def init():
	global screen
	pygame.font.init()
	screen = pygame.display.set_mode((settings.screenx, settings.screeny))

camerax0, cameray0 = 200, 200
def worldtoscreen((x, y)):
	return (
		int(settings.screenx * 0.5 + 40 * x - camerax0),
		int(settings.screeny * 0.5 + 40 * y - cameray0),
	)
def screentoworld((px, py)):
	return (
		(px + camerax0 - 0.5 * settings.screenx) / 40,
		(py + cameray0 - 0.5 * settings.screeny) / 40,
	)
def screentotile(p):
	return [int(math.floor(a)) for a in screentoworld(p)]
def drag(dx, dy):
	global camerax0, cameray0
	camerax0 -= dx
	cameray0 -= dy
def visibletiles():
	xmin, ymin = screentotile((0, 0))
	xmax, ymax = screentotile((settings.screenx, settings.screeny))
	for x in range(xmin, xmax+1):
		for y in range(ymin, ymax+1):
			yield x, y

tilecache = {}
def gettileimg(s, colors, device, fog, active):
	key = s, tuple(colors), device, fog, active
	if key in tilecache:
		return tilecache[key]
	s, w, h = s, s * 40, s * 40
	img = pygame.Surface((w, h)).convert_alpha()
	img.fill((0,0,0,0))
	bcolor = (100, 140, 0) if active else (100, 100, 100)
	img.fill(bcolor, (1,1, w-2,h-2))
	rs = (
		[(10+40*j, 1, 20, 5) for j in range(s)] +
		[(w-6, 10+40*j, 5, 20) for j in range(s)] +
		[(10+40*(s-j-1), h-6, 20, 5) for j in range(s)] +
		[(1, 10+40*(s-j-1), 5, 20) for j in range(s)]
	)
	for rect, colorcode in zip(rs, colors):
		img.fill(settings.colors[colorcode], rect)
	if device:
		color = {
			"eye": (255, 0, 255),
			"base": (0, 0, 0),
			"coin": (255, 255, 0),
			"power": (0, 255, 255),
			"wall": (255, 100, 100),
		}[device]
		pygame.draw.circle(img, color, (w/2, h/2), 10)
	if fog == settings.penumbra:
		img.fill((0,0,0))
	else:
		mask = pygame.Surface((w, h)).convert_alpha()
		mask.fill((0,0,0,140))
		for _ in range(fog):
			img.blit(mask, (0, 0))
	tilecache[key] = img
	return img

effects = {}
class SpinTile(object):
	alive = True
	T = 0.25
	def __init__(self, tile, dA):
		self.dA = dA % 4
		if self.dA > 2: self.dA -= 4
		self.t = 0
		self.state = tile.getstate()
		self.img0 = gettileimg(tile.s, tile.colors, None, tile.fog, False)
		self.p0 = tile.x + 0.5 * tile.s, tile.y + 0.5 * tile.s
		effects[(tile.x, tile.y)] = self
	def think(self, dt):
		self.t += dt
		if self.t >= self.T:
			self.alive = False
	def draw(self):
		A = self.dA * min(self.t / self.T, 1)
		img = pygame.transform.rotozoom(self.img0, -90 * A, 1)
		rect = img.get_rect(center = worldtoscreen(self.p0))
		screen.blit(img, rect)

class FlipTile(object):
	alive = True
	T = 0.25
	def __init__(self, oldstate, newstate):
		self.t = 0
		self.state0 = oldstate
		self.img0 = gettileimg(oldstate["s"], oldstate["colors"], oldstate["device"],
			oldstate["fog"], oldstate["active"])
		self.img1 = gettileimg(newstate["s"], newstate["colors"], newstate["device"],
			newstate["fog"], newstate["active"])
		self.p0 = oldstate["x"] + 0.5 * oldstate["s"], oldstate["y"] + 0.5 * oldstate["s"]
		effects[(oldstate["x"], oldstate["y"])] = self
	def think(self, dt):
		self.t += dt
		if self.t >= self.T:
			self.alive = False
	def draw(self):
		w, h = self.img0.get_size()
		w = int(w * math.cos(3.14 * min(self.t / self.T, 1)))
		img = self.img0 if w > 0 else self.img1
		img = pygame.transform.smoothscale(img, (abs(w), h))
		rect = img.get_rect(center = worldtoscreen(self.p0))
		screen.blit(img, rect)

class CoinFlipTile(FlipTile):
	def draw(self):
		FlipTile.draw(self)
		w = abs(int(20 * math.cos(3.14 * self.t / self.T)))
		x0, y0 = worldtoscreen(self.p0)
		a = self.t / self.T
		y0 -= int(40 * a * (2 - a))
		rect = pygame.Rect(0, 0, w, 20)
		rect.center = x0, y0
		pygame.draw.ellipse(screen, (255, 255, 0), rect)
		

def think(dt):
	for p, effect in list(effects.items()):
		effect.think(dt)
		if not effect.alive:
			del effects[p]

fonts = {}
textcache = {}
def drawtext(text, size, color, p, anchor = "center"):
	key = text, size, color
	if key in textcache:
		img = textcache[key]
	else:
		if size not in fonts:
			fonts[size] = pygame.font.Font(None, size)
		font = fonts[size]
		img = textcache[key] = font.render(text, True, color)
	rect = img.get_rect(**{anchor: p})
	screen.blit(img, rect)


def draw():
	screen.fill((0,0,0))
	visibleeffects = []
	for x, y in visibletiles():
		if (x, y) in effects:
			visibleeffects.append(effects[(x, y)])
			continue
		tile = clientstate.gridstate.getrawtile(x, y)
		if not tile:
			continue
		img = gettileimg(tile.s, tile.colors, tile.device, tile.fog, tile.active)
		screen.blit(img, worldtoscreen((x, y)))
	for effect in visibleeffects:
		effect.draw()
	for monster in clientstate.monsters.values():
		import time
		s = 1 + 0.3 * math.sin(7 * time.time())
		rect = pygame.Rect(0, 0, int(20 * s), int(20 / s))
		rect.center = worldtoscreen((monster.x + 0.5, monster.y + 0.5))
		pygame.draw.ellipse(screen, (0,0,0), rect)

	drawtext("Coinz: %s" % clientstate.you.coins,
		28, (255, 255, 255), (5, settings.screeny - 5), anchor="bottomleft")
	pygame.display.flip()

def screenshot():
	pygame.image.save(screen, util.screenshotname())

