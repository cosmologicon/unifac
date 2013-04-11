import pygame, math, random, time
import settings, gamestate, data, client
from pygame.locals import *

class camera:
	x0 = 0
	y0 = 0
	A = 0

	@classmethod
	def worldtoscreen(cls, (x, y)):
		dx, dy = x - cls.x0, y - cls.y0
		return [
			int(settings.sx/2 + dx),
			int(settings.sy/2 - dy),
		]

	@classmethod
	def drawcircle(cls, p, r, color):
		pygame.draw.circle(screen, color, cls.worldtoscreen(p), int(r))

	@classmethod
	def circlevisible(cls, p, r):
		px, py = cls.worldtoscreen(p)
		return -r < px < settings.sx + r and -r < py < settings.sy + r

	@classmethod
	def orient(cls, you):
		cls.x0, cls.y0 = you.worldpos

def init():
	global screen
	screen = pygame.display.set_mode(settings.size)
	pygame.display.set_caption("Hatchery")


fonts = {}
surfcache = {}
def drawtext(surf, text, size, p, color, anchor="center"):
	key = size, text, color
	if key not in surfcache:
		if size not in fonts:
			pygame.font.init()
			fonts[size] = pygame.font.Font(data.filepath("Skranji-Regular.ttf"), size)
		surfcache[key] = fonts[size].render(text, True, color)
	img = surfcache[key]
	rect = img.get_rect(**{anchor: p})
	surf.blit(img, rect)

def drawshadowtext(surf, text, size, (x,y), color0, color1, d=1, anchor="center"):
	for dx in (-d,d):
		for dy in (-d,d):
			drawtext(surf, text, size, (x+dx, y+dy), color1, anchor=anchor)
	drawtext(surf, text, size, (x,y), color0, anchor=anchor)

def brighten(color):
	return tuple(min(max(int(c + 0.08 * (255 - c)), 0), 255) for c in color)
def darken(color):
	return tuple(min(max(int(c * 0.4), 0), 255) for c in color)

arrow = None
stars = []
def draw(state):
	global arrow, stars
	screen.fill((0,0,0))
	camera.orient(state.you)
	if arrow is None:
		arrow = pygame.Surface((50, 50)).convert_alpha()
		arrow.fill((0,0,0,0))
		ps = (25, 50), (10, 0), (25, 5), (40, 0)
		pygame.draw.polygon(arrow, (255,255,255,50), ps)
		pygame.draw.aalines(arrow, (255,255,255,100), True, ps)
	if not stars:
		nstars = int(0.002 * settings.sx * settings.sy)
		stars = [
			(random.uniform(0, 10000), random.uniform(0, 10000), random.uniform(0.4, 1) ** 2)
			for _ in range(nstars)
		]
	for x, y, f in stars:
		px = int(x - 0.15 * f * camera.x0) % settings.sx
		py = int(y + 0.15 * f * camera.y0) % settings.sy
		color = [int(255 * f)] * 3
		screen.set_at((px, py), color)


	if settings.mapmode:
		screen.blit(worldmap, (int(settings.sx/2 - mapx0), int(settings.sy/2 - mapy0)))
		if time.time() % 0.5 < 0.4:
			for stork in state.storks.values():
				color = (255, 0, 255) if stork is state.you else (128, 0, 128)
				x, y = stork.worldpos
				px = int(mapsx/2 - mapx0 + settings.sx/2 + mapz * x)
				py = int(mapsy/2 - mapy0 + settings.sy/2 - mapz * y)
				pygame.draw.circle(screen, color, (px, py), 3)
	else:
		for world in gamestate.galaxy.worlds.values():
			if not camera.circlevisible(world.p, world.r):
				continue
			color = settings.wcolors[world.colorcode]
			if world.colorcode not in (0, None) and world.ndeliver == 0:
				color = darken(color)
			(x,y), r = world.p, world.r
			for _ in range(8):
				camera.drawcircle((x, y), r, color)
				color = brighten(color)
				r *= 0.8
				x -= 0.12 * r
				y += 0.12 * r
			tcolor = (100, 100, 100) if world.colorcode is None or (world.colorcode and not world.ndeliver) else (255, 255, 255)
			if world.name == "hatchery":
				px, py = camera.worldtoscreen(world.p)
				drawshadowtext(screen, "Hatchery", 48, (px, py-48), tcolor, (0,0,0), 2)
				drawshadowtext(screen, "by", 30, (px, py+2), tcolor, (0,0,0), 2)
				drawshadowtext(screen, "Christopher Night", 36, (px, py+48), tcolor, (0,0,0), 2)
			else:
				drawshadowtext(screen, world.name.title(), 30, camera.worldtoscreen(world.p), tcolor, (0,0,0), 2)
		x, y = state.you.worldpos
		d = math.sqrt(x ** 2 + y ** 2)
		if d > 600:
			p = camera.worldtoscreen((x - 60 * x / d, y - 60 * y / d))
			img = pygame.transform.rotozoom(arrow, -57.3 * math.atan2(x, y), 1)
			screen.blit(img, img.get_rect(center = p))
		for stork in state.storks.values():
			color = (255, 255, 255) if stork is state.you else (128, 128, 128)
			camera.drawcircle(stork.worldpos, 12, color)
			camera.drawcircle(stork.worldpos, 10, (0,0,0))
		fs = min(48, int(0.05 * settings.sy))
		drawshadowtext(screen, "Deliveries: %s" % state.you.ndeliver,
			fs, (10, settings.sy - 6 - 2*fs), (255, 0, 255), (0,0,0), 2, anchor="bottomleft")
		drawshadowtext(screen, "First deliveries: %s" % state.you.n1st,
			fs, (10, settings.sy - 6 - fs), (255, 0, 255), (0,0,0), 2, anchor="bottomleft")
		drawshadowtext(screen, "Talon charges: %s" % state.you.clings,
			fs, (10, settings.sy - 6), (255, 0, 255), (0,0,0), 2, anchor="bottomleft")
		drawshadowtext(screen, "Lag: %sms" % int(client.estlag),
			fs, (settings.sx - 10, 6), (255, 0, 255), (0,0,0), 2, anchor="topright")
		drawshadowtext(screen, "up or space: jump/use talons",
			fs, (settings.sx - 10, settings.sy - 6 - 2 * fs), (255, 0, 255), (0,0,0), 2, anchor="bottomright")
		drawshadowtext(screen, "down: get egg at hatchery",
			fs, (settings.sx - 10, settings.sy - 6 - fs), (255, 0, 255), (0,0,0), 2, anchor="bottomright")
		drawshadowtext(screen, "M: view map",
			fs, (settings.sx - 10, settings.sy - 6), (255, 0, 255), (0,0,0), 2, anchor="bottomright")
	screen.fill((255, 255, 255), (20, 20, 100, 100))
	screen.fill((0, 0, 0), (23, 23, 94, 94))
	if state.you.held:
		for j, colorcode in enumerate(state.you.held):
			r = 18 + 6 * (len(state.you.held) - j)
			pygame.draw.circle(screen, settings.wcolors[colorcode], (70, 70), r, 0)
		drawshadowtext(screen, "%s" % state.you.jumps, 32, (70, 70), (255, 255, 255), (0,0,0), 2)
	drawshadowtext(screen, "Egg", 24, (70, 18), (255, 0, 255), (0,0,0), 2)
	pygame.display.flip()

worldmap = None
mapx0, mapy0 = 1000, 1000
mapz = 0.3
mapsx, mapsy = 2000, 2000

def makemap():
	global worldmap
	worldmap = pygame.Surface((mapsx, mapsy)).convert_alpha()
	worldmap.fill((0,0,0,0))
	for wname, world in gamestate.galaxy.worlds.items():
		px, py = int(mapsx/2 + mapz * world.x), int(mapsy/2 - mapz * world.y)
		r = int(mapz * world.r)
		color = settings.wcolors[world.colorcode]
		if world.colorcode not in (0, None) and world.ndeliver == 0:
			color = darken(color)
		pygame.draw.circle(worldmap, color, (px, py), r)
		tcolor = (100, 100, 100) if world.colorcode is None or (world.colorcode and not world.ndeliver) else (255, 255, 255)
		drawshadowtext(worldmap, wname.title(), 12, (px, py), tcolor, (0,0,0))
	



