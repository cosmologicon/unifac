from __future__ import division
import pygame, math, random, cPickle
tau = math.pi * 2

scale = 1
rx, ry = 200, 200

def toscreen((x, y)):
	return int(round((x + rx) * scale)), int(round((y + ry) * scale))
def toworld((x, y)):
	return (x / scale - rx, y / scale - ry)


mapsize = int(2 * rx * scale), int(2 * ry * scale)

screen = pygame.display.set_mode(mapsize)
pygame.font.init()

oort = pygame.Surface(mapsize).convert_alpha()

oops = [
	(-40, 60, 60),
	(40, 30, 50),
	(10, -40, 70),
]

oortdata = {}
for px in range(mapsize[0]):
	for py in range(mapsize[1]):
		x, y = toworld((px, py))
		d = min(math.sqrt((x - ax) ** 2 + (y - ay) ** 2) / r for ax, ay, r in oops)
		alpha = min(max((d - 1) / 0.5, 0), 1)
		oortdata[(px, py)] = alpha
		color = 0, 255, 0, int(alpha * 255)
		oort.set_at((px, py), color)

screen.blit(oort, (0, 0))

acenter = 30, 20
R = 55
Rfac = 0.525731 / 0.200811
a0 = 0.8
angles = [a0 + tau * f / 10 for f in (0, 2, 4, 6, 8, 1, 3, 5, 7, 9)]
Rs = [R * f for f in [1] * 5 + [Rfac] * 5]
starps = [(acenter[0] + r * math.cos(angle), acenter[1] + r * math.sin(angle)) for r, angle in zip(Rs, angles)]

ps = { "angel%s" % j: p for j, p in enumerate(starps) }

ps["start"] = 40, -70
ps["mother"] = -40, 40
ps["baron1"] = 40, 32
ps["seekers"] = -180, 120

f = pygame.font.Font(None, 11)
for name, (x, y) in ps.items():
	px, py = toscreen((x, y))
	pygame.draw.circle(screen, (255, 255, 0), (px, py), int(2 * scale))
	img = f.render(name, True, (255, 255, 0))
	screen.blit(img, img.get_rect(midtop = (px, py+2)))
	

for x, y in starps:
	px, py = toscreen((x, y))
	pygame.draw.circle(screen, (255, 255, 255), (px, py), int(4 * scale))

jplanet = 0
while len(ps) < 80:
	theta = random.uniform(0, tau)
	r = random.uniform(0, 1) * rx
	x, y = r * math.sin(theta), r * math.cos(theta)
	if min((x - sx) ** 2 + (y - sy) ** 2 for sx, sy in ps.values()) < 20 ** 2:
		continue
	ps["planet%s" % jplanet] = x, y
	jplanet += 1
	pygame.draw.circle(screen, (100, 100, 100), toscreen((x, y)), int(2 * scale))

obj = ps, oortdata, scale, rx, ry
cPickle.dump(obj, open("data/starmap.pkl", "wb"))

pygame.display.set_caption("done")
pygame.display.flip()
while not any(event.type in (pygame.KEYDOWN, pygame.QUIT) for event in pygame.event.get()):
	pass


