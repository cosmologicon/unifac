import pygame, math, logging
import settings, clientstate, data, util

log = logging.getLogger(__name__)

screen = None

def init():
	global screen
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
		pygame.draw.circle(img, (255, 0, 255), (w/2, h/2), 10)
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
		

def think(dt):
	for p, effect in list(effects.items()):
		effect.think(dt)
		if not effect.alive:
			del effects[p]

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
	pygame.display.flip()

def screenshot():
	pygame.image.save(screen, util.screenshotname())

