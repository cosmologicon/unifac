import pygame, datetime, math, random
import settings, state

scale = settings.grect.width / 2 / settings.vsize
x0, y0 = 0, 0  # center of viewport in world coordinates
X0, Y0 = settings.grect.center  # center of gameplay viewport in screen coordinates
nstars = int(0.002 * settings.grect.width * settings.grect.height)

def init():
	global screen, stars
	screen = pygame.display.set_mode(settings.ssize)
	stars = sorted([
		(random.uniform(0.05, 1), random.uniform(0, 10000), random.uniform(0, 10000))
		for _ in range(nstars)
	])

def clear():
	screen.fill((0, 0, 0))

def flip():
	pygame.display.flip()

def think(dt):
	global x0, y0, xmin, xmax, ymin, ymax
	x0 = state.state.you.x
	y0 = state.state.you.y
	gw, gh = settings.grect.size
	xmin, xmax = x0 - gw / 2 / scale, x0 + gw / 2 / scale
	ymin, ymax = y0 - gw / 2 / scale, y0 + gw / 2 / scale

def worldtoscreen((x, y)):
	return (
		int(round(X0 + (x - x0) * scale)),
		int(round(Y0 + (y - y0) * scale)),
	)

def screentoworld((X, Y)):
	return (
		(X - X0) / scale + x0,
		(Y - Y0) / scale + y0,
	)

def drawstars():
	for z, x, y in stars:
		px = int((x - x0) * z * scale) % settings.grect.width
		py = int((y - y0) * z * scale) % settings.grect.height
		c = int(255 * z)
		screen.set_at((px, py), (c, c, c))

def drawbolt((x0, y0), (x1, y1), color):
	dx, dy = x1 - x0, y1 - y0
	if dx ** 2 + dy ** 2 < 1:
		pygame.draw.aaline(screen, color, worldtoscreen((x0, y0)), worldtoscreen((x1, y1)))
		return
	r = random.uniform(-0.3, 0.3)
	xc = (x1 + x0) / 2 + r * dy
	yc = (y1 + y0) / 2 - r * dx
	drawbolt((x0, y0), (xc, yc), color)
	drawbolt((xc, yc), (x1, y1), color)

def isvisible((x, y), r = 0):
	return xmin - r < x < xmax + r and ymin - r < y < ymax + r

# Where to put an indicator
def indpos((x, y)):
	gw, gh = settings.grect.size
	rx, ry = 0.45 * gw / scale, 0.45 * gh / scale
	dx, dy = x - x0, y - y0
	f = rx / abs(dx) if rx * abs(dy) < ry * abs(dx) else ry / abs(dy)
	d = math.sqrt(dx ** 2 + dy ** 2)
	return (x0 + f * dx, y0 + f * dy), math.degrees(math.atan2(-dx, -dy))

def screenshot():
	sname = "screenshot-%s.png" % datetime.datetime.now().strftime("%Y%m%d%H%M%S")
	pygame.image.save(screen, sname)

