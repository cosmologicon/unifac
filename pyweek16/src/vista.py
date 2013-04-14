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
def gettile(tile):
	key = tuple(tile.colors), tile.device, tile.fog, tile.active
	if key in tilecache:
		return tilecache[key]
	img = pygame.Surface((40, 40)).convert_alpha()
	img.fill((0,0,0,0))
	bcolor = (200, 200, 200) if tile.active else (100, 100, 100)
	img.fill(bcolor, (1,1,38,38))
	rs = (10,1,20,5), (35,10,5,20), (10,35,20,5), (1,10,5,20)
	for rect, colorcode in zip(rs, tile.colors):
		img.fill(settings.colors[colorcode], rect)
	if tile.device:
		pygame.draw.circle(img, (255, 0, 255), (20, 20), 10)
	if tile.fog == settings.penumbra:
		img.fill((0,0,0))
	else:
		mask = pygame.Surface((40, 40)).convert_alpha()
		mask.fill((0,0,0,140))
		for _ in range(tile.fog):
			img.blit(mask, (0, 0))
	tilecache[key] = img
	return img

def draw():
	screen.fill((0,0,0))
	for x, y in visibletiles():
		tile = clientstate.gridstate.gettile(x, y)
		if not tile:
			continue
		img = gettile(tile)
		screen.blit(img, worldtoscreen((x, y)))
	pygame.display.flip()

def screenshot():
	pygame.image.save(screen, util.screenshotname())
