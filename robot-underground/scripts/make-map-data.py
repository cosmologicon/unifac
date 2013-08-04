import pygame, os, json

pygame.display.init()

mapdata = {}
for imgname in os.listdir("../data/maps"):
	basename = imgname[:-4]
	img = pygame.image.load("../data/maps/%s" % imgname)
	w, h = img.get_size()
	data = [1 if img.get_at((x,y))[0] else 0 for y in range(h) for x in range(w)]
	mapdata[basename] = {
		"w": w,
		"h": h,
		"data": data
	}

s = json.dumps(mapdata, separators=(',', ':'))
print len(s)

open("../data/mapdata.js", "w").write("var mapdata = %s\n" % s)

