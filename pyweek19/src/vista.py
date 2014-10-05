import pygame, datetime
import settings, state

scale = 50.0
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
	global x0, y0
	x0 = state.state.you.x
	y0 = state.state.you.y

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

def screenshot():
	sname = "screenshot-%s.png" % datetime.datetime.now().strftime("%Y%m%d%H%M%S")
	pygame.image.save(screen, sname)

