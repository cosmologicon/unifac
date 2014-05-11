from pygame import *
import settings

cache = {}

def getimg(imgname):
	if imgname in cache:
		return cache[imgname]
	if imgname == "purple":
		img = Surface((40, 40)).convert_alpha()
		img.fill((255, 0, 255))
	elif imgname == "brown":
		img = Surface((30, 30)).convert_alpha()
		img.fill((255, 128, 0))
	elif imgname == "splash":
		img = Surface((18, 18)).convert_alpha()
		img.fill((255, 255, 255, 100))
	elif imgname == "smoke":
		img = Surface((18, 18)).convert_alpha()
		img.fill((0, 0, 0, 100))
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
	elif imgname.startswith("shroud"):
		img = Surface(settings.size).convert_alpha()
		img.fill((40, 40, 40, 90))
	cache[imgname] = img
	return img

