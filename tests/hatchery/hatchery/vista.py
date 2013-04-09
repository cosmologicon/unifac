import pygame
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
		cls.x0 = you.x
		cls.y0 = you.y

def init():
	global screen
	screen = pygame.display.set_mode(settings.size)


fonts = {}
def drawtext(text, size, p, color, dropshadow = False):
	if dropshadow:
		x, y = p
		drawtext(text, size, (x + 1, y - 1), dropshadow)
	if size not in fonts:
		pygame.font.init()
		fonts[size] = pygame.font.Font(None, size)
	img = fonts[size].render(text, True, color)
	rect = img.get_rect(center = camera.worldtoscreen(p))
	screen.blit(img, rect)

def brighten(color):
	return tuple(min(max(int(c + 0.08 * (255 - c)), 0), 255) for c in color)

def draw():
	screen.fill((0,0,0))
	for world in gamestate.galaxy.worlds.values():
		if not camera.circlevisible(world.p, world.r):
			continue
		color = settings.wcolors[world.colorcode]
		(x,y), r = world.p, world.r
		for _ in range(8):
			camera.drawcircle((x, y), r, color)
			color = brighten(color)
			r *= 0.8
			x -= 0.12 * r
			y += 0.12 * r
		drawtext(world.name.title(), 48, world.p, (0,0,0))
	pygame.display.flip()


