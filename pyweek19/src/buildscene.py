import pygame, random
import vista, state, scene, settings, img, parts

controls = []
cps = []
cursor = None
mpos = None

# TODO: move to settings
cx0, cy0 = 300, 100
blocksize = 50


def init():
	global controls, cursor, cps
	controls = [
		parts.Conduit((1,)),
		parts.Conduit((2,)),
	]
	cps = [
		(cx0 + blocksize * j, cy0, blocksize)
		for j in range(len(controls))
	]
	cursor = None

def handleclick((mx, my)):
	global cursor
	for control, (x0, y0, b) in zip(controls, cps):
		x = (mx - x0) / b
		y = (my - y0) / b
		if control.contains((x, y)):
			cursor = control
	

def think(dt, events, mousepos):
	global mpos
	for event in events:
		if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
			scene.pop()
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
			handleclick(event.pos)
	mpos = mousepos

def draw():
	for x in range(settings.shipw):
		for y in range(settings.shiph):
			vista.screen.fill((100, 50, 0), (blocksize*x, blocksize*y, blocksize-3, blocksize-3))
	for j, control in enumerate(controls):
		p0 = cx0 + blocksize * j, cy0
		control.draw(p0, blocksize)
	if cursor is not None and mpos is not None:
		p = (mpos[0] - 0) / blocksize, (mpos[1] - 0) / blocksize
		icon = cursor.nearest(p)
		icon.draw((0, 0), blocksize)



