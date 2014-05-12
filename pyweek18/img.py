from pygame import *
from random import *
import settings

cache = {}
font0 = None

def drawtext(text, filled=True):
	global font0
	if font0 is None:
		font0 = font.Font(None, 64)
	ix, iy = font0.size(text)
	d = 1
	surf = Surface((ix+2*d, iy+2*d)).convert_alpha()
	surf.fill((0,0,0,0))
	i0 = font0.render(text, True, (0, 0, 0))
	for off in ((d, 0), (0, d), (d, 2*d), (2*d, d)):
		surf.blit(i0, off)
	if filled:
		i1 = font0.render(text, True, (255, 255, 255))
		surf.blit(i1, (d, d))
	return surf

def getimg(imgname):
	if imgname in cache:
		return cache[imgname]
	if imgname == "purple":
		img = Surface((40, 40)).convert_alpha()
		img.fill((255, 0, 255))
	elif imgname == "brown":
		img = Surface((30, 30)).convert_alpha()
		img.fill((255, 128, 0))
	elif imgname == "cannonball":
		img = Surface((12, 12)).convert_alpha()
		img.fill((0, 0, 0))
	elif imgname == "splash":
		img = Surface((32, 32)).convert_alpha()
		img.fill((0, 0, 0, 0))
		for _ in range(10):
			r = 2
			x, y = randrange(r, 32-r), randrange(r, 32-r)
			draw.circle(img, (255, 255, 255, 100), (x, y), r)
	elif imgname == "smoke":
		img = Surface((32, 32)).convert_alpha()
		img.fill((0, 0, 0, 0))
		for _ in range(10):
			r = 2
			x, y = randrange(r, 32-r), randrange(r, 32-r)
			draw.circle(img, (0, 0, 0, 100), (x, y), r)
	elif imgname == "heal":
		img = Surface((18, 18)).convert_alpha()
		img.fill((255, 0, 0, 100))
	elif imgname == "island":
		img = Surface((120, 120)).convert_alpha()
		img.fill((0, 255, 0))
	elif imgname.startswith("rgb"):
		cs = map(int, imgname[3:].split(","))
		img = Surface((40, 40)).convert_alpha()
		img.fill(cs)
	elif imgname.startswith("text:"):
		img = drawtext(imgname[5:])
	elif imgname.startswith("text0:"):
		img = drawtext(imgname[6:], False)
	elif imgname.startswith("rock"):
		w, h = [int(settings.ik * float(v)) for v in imgname[4:].split(",")]
		img = Surface((w, h)).convert_alpha()
		img.fill((0, 0, 0, 0))
		r = 6
		for y in range(r, h-r):
			x = randrange(r, w-r)
			color = randrange(100, 160), randrange(50, 80), 0
			draw.circle(img, color, (x, y), r)
	elif imgname.startswith("shroud"):
		img = Surface(settings.size).convert_alpha()
		img.fill((20, 20, 60, 90))
	elif imgname == "grayfill":
		img = Surface(settings.size).convert_alpha()
		img.fill((0, 0, 0, 200))
	elif imgname == "backdrop":
		img = Surface(settings.size).convert_alpha()
		img.fill((200, 200, 255))
		img.fill((140, 140, 255), (0, settings.Yh, settings.sX, settings.sY))
		line = Surface((settings.sX, 1)).convert()
		line.fill((255, 255, 255))
		for Y in range(settings.sY):
			dY = abs(Y - settings.Yh)
			line.set_alpha(min(max(255 - 2 * dY, 0), 255))
			img.blit(line, (0, Y))
	cache[imgname] = img
	return img

