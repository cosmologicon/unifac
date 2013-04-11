import pygame, math
import settings, gamestate
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


fonts = {}
def drawtext(surf, text, size, p, color):
	if size not in fonts:
		pygame.font.init()
		fonts[size] = pygame.font.Font(None, size)
	img = fonts[size].render(text, True, color)
	rect = img.get_rect(center = p)
	surf.blit(img, rect)

def drawshadowtext(surf, text, size, (x,y), color0, color1, d=1):
	for dx in (-d,d):
		for dy in (-d,d):
			drawtext(surf, text, size, (x+dx, y+dy), color1)
	drawtext(surf, text, size, (x,y), color0)

def brighten(color):
	return tuple(min(max(int(c + 0.08 * (255 - c)), 0), 255) for c in color)
def darken(color):
	return tuple(min(max(int(c * 0.4), 0), 255) for c in color)

arrow = None
def draw(state):
	global arrow
	camera.orient(state.you)
	if arrow is None:
		arrow = pygame.Surface((50, 50)).convert_alpha()
		arrow.fill((0,0,0,0))
		ps = (25, 50), (10, 0), (25, 5), (40, 0)
		pygame.draw.polygon(arrow, (255,255,255,50), ps)
		pygame.draw.aalines(arrow, (255,255,255,100), True, ps)

	screen.fill((0,0,0))
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
		tcolor = (100, 100, 100) if world.colorcode is None else (255, 255, 255)
		drawshadowtext(screen, world.name.title(), 48, camera.worldtoscreen(world.p), tcolor, (0,0,0), 2)
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
	pygame.display.flip()

def makemap():
	z = 0.1
	sx, sy = 1400, 1400
	worldmap = pygame.Surface((sx, sy)).convert()
	worldmap.fill((0,0,0))
	for wname, world in gamestate.galaxy.worlds.items():
		px, py, r = int(sx/2 + z * world.p[0]), int(sy/2 + z * world.p[1]), int(z * world.r)
		pygame.draw.circle(worldmap, settings.wcolors[world.colorcode], (px, py), r)
		drawshadowtext(worldmap, wname.title(), 14, (px, py), (255,255,255), (0,0,0))
	pygame.image.save(worldmap, "worldmap.png")
	



