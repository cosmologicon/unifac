from __future__ import division
import pygame, random
import vista, settings

cache = {}
font = None

def getrawimg(imgname):
	global font
#	cache[key] = pygame.image.load("img/%s.png" % imgname).convert_alpha()
	if imgname.startswith("sun-"):
		r = int(float(imgname[4:]) * settings.imgscale)
		img = pygame.Surface((2*r, 2*r)).convert_alpha()
		img.fill((0,0,0,0))
		for s in range(8):
			R = int(round(r * (1 - 0.04 * s)))
			color = 255, 255, 255, 255 - 30 * (7 - s)
			pygame.draw.circle(img, color, (r, r), R)
	else:
		img = pygame.Surface((40, 40)).convert_alpha()
		r, g, b = [random.randint(100, 200) for _ in range(3)]
		img.fill((r, g, b, 50))
		if font is None:
			font = pygame.font.Font(None, 24)
		t = font.render(imgname, True, (255, 255, 255))
		img.blit(t, t.get_rect(center = img.get_rect().center))
	return img


def getimg(imgname, angle = 0, scale = 1.0):
	angle = round(angle / 6) % 60 * 6 if angle else 0
	key = imgname, angle, scale
	if key not in cache:
		if angle == 0 and scale == 1.0:
			cache[key] = img = getrawimg(imgname)
		else:
			img0 = getimg(imgname)
			cache[key] = pygame.transform.rotozoom(img0, angle, scale)
	return cache[key]

def draw(imgname, screenpos, angle = None, scale = 1.0):
	img = getimg(imgname, angle, scale)
	r = img.get_rect(center = screenpos)
	vista.screen.blit(img, r)

def worlddraw(imgname, worldpos, angle = None, scale = 1.0):
	scale *= vista.scale / settings.imgscale
	draw(imgname, vista.worldtoscreen(worldpos), angle = angle, scale = scale)


