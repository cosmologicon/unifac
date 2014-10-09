import pygame, datetime, math
import settings, state

scale = settings.grect.width / 2 / settings.vsize
x0, y0 = 0, 0  # center of viewport in world coordinates
X0, Y0 = settings.grect.center  # center of gameplay viewport in screen coordinates

def init():
	global screen
	screen = pygame.display.set_mode(settings.ssize)

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

