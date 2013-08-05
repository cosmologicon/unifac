import pygame, os, json

pygame.display.init()

mapdata = {}
dir0 = "/home/christopher/Downloads/robot-underground-1.0.4/data/maps"
for imgname in os.listdir(dir0):
	basename = imgname[:-4]
	img = pygame.image.load(dir0 + "/" + imgname)
	w, h = img.get_size()
	data = [1 if img.get_at((x,y))[0] else 0 for y in range(h) for x in range(w)]
	mapdata[basename] = {
		"w": w,
		"h": h,
		"data": data
	}

s = json.dumps(mapdata, separators=(',', ':'))
print len(s)

open("../data/mapdata.json", "w").write(s)

