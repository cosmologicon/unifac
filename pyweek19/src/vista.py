import settings
import pygame

scale = 1.0
x0, y0 = 0, 0  # center of viewport in world coordinates
X0, Y0 = settings.sx // 2, settings.sy // 2  # center of viewport in screen coordinates

def init():
	global screen
	screen = pygame.display.set_mode(settings.ssize)

def clear():
	screen.fill((0, 0, 0))

def flip():
	pygame.display.flip()

def think(dt):
	pass

def worldtoscreen((x, y)):
	return (
		int(round(X0 + (x - x0) * scale)),
		int(round(Y0 + (y - y0) * scale)),
	)

