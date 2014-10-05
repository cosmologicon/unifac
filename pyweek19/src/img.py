import vista
import pygame

cache = {}

def getimg(imgname, angle = 0, scale = 1.0):
	angle = round(angle) % 360
	key = imgname, angle, scale
	if key not in cache:
		if angle == 0 and scale == 1.0:
			cache[key] = pygame.image.load("img/%s.png" % imgname).convert_alpha()
		else:
			img0 = getimg(imgname)
			cache[key] = pygame.transform.rotozoom(img0, angle, scale)
	return cache[key]

def draw(imgname, screenpos, angle = None, scale = 1.0):
	img = getimg(imgname, angle, scale)
	r = img.get_rect(center = screenpos)
	vista.screen.blit(img, r)


