from pygame import *

cache = {}

def getimg(imgname):
	if imgname in cache:
		return cache[imgname]
	if imgname == "purple":
		img = Surface((40, 40)).convert_alpha()
		img.fill((255, 0, 255))
	elif imgname == "brown":
		img = Surface((20, 20)).convert_alpha()
		img.fill((255, 128, 0))
	elif imgname.startswith("rgb"):
		cs = map(int, imgname[3:].split(","))
		img = Surface((40, 40)).convert_alpha()
		img.fill(cs)
	cache[imgname] = img
	return img

