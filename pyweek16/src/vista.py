import pygame
import settings, clientstate

screen = None

def init():
	global screen
	screen = pygame.display.set_mode((settings.screenx, settings.screeny))


tilecache = {}
def gettile(tile):
	key = tuple(tile.colors)
	if key in tilecache:
		return tilecache[key]
	img = pygame.Surface((40, 40)).convert_alpha()
	img.fill((0,0,0,0))
	img.fill((160,160,160), (1,1,38,38))
	rs = (10,1,20,5), (35,10,5,20), (10,35,20,5), (1,10,5,20)
	for rect, colorcode in zip(rs, tile.colors):
		img.fill(settings.colors[colorcode], rect)
	tilecache[key] = img
	return img

def draw():
	screen.fill((0,0,0))
	for x in range(10):
		for y in range(10):
			img = gettile(clientstate.gridstate.gettile(x, y))
			screen.blit(img, (40*x, 40*y))
	pygame.display.flip()


