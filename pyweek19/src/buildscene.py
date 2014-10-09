from __future__ import division
import pygame, random
import vista, state, scene, settings, img, parts

controls = []
cps = []
cursor = None
mpos = None

# modules
mx0, my0, mscale = 100, 100, 50

# board
bx0, by0, bscale = 300, 100, 50
brect = pygame.Rect((bx0, by0, bscale * settings.shipw, bscale * settings.shiph))

# conduits
cx0, cy0, cscale, csep = 600, 100, 50, 80

titlesize = int(0.6 * bscale)
availsize = int(0.3 * bscale)


def init():
	global controls, cursor, cps
	controls = [
		parts.Conduit((1,)),
		parts.Conduit((2,)),
		parts.Conduit((3,)),
	]
	cps = [
		(cx0 + csep * j, cy0, cscale)
		for j in range(len(controls))
	]
	cursor = None

def handleclick((mx, my), alt = False):
	global cursor
	for control, (x0, y0, b) in zip(controls, cps):
		x = (mx - x0) / b
		y = (my - y0) / b
		if control.contains((x, y)):
			cursor = control
	if brect.collidepoint((mx, my)):
		if cursor:
			p = (mx - bx0) / bscale, (my - by0) / bscale
			icon = cursor.nearest(p)
			if state.state.canaddpart(icon):
				state.state.addpart(icon)
				cursor = None
			else:
				print "can't build"


def think(dt, events, mousepos):
	global mpos
	for event in events:
		if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
			scene.pop()
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
			handleclick(event.pos)
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 2:
			handleclick(event.pos, True)
	mpos = mousepos

def draw():
	vista.screen.fill((50, 50, 50))
	for x in range(settings.shipw):
		for y in range(settings.shiph):
			vista.screen.fill((100, 50, 0), (bx0 + bscale*x, by0 + bscale*y, bscale-3, bscale-3))
	for part in state.state.parts:
		part.draw((bx0, by0), bscale)
	for (x0, y0, scale), control in zip(cps, controls):
		control.draw((x0, y0), scale)
	img.drawtext("MODULES", fontsize = titlesize, color = (200, 100, 100), bottomleft = (mx0, my0 - 10))
	img.drawtext("SHIP LAYOUT", fontsize = titlesize, color = (160, 160, 160), bottomleft = (bx0, by0 - 10))
	img.drawtext("CONDUITS", fontsize = titlesize, color = (100, 200, 100), bottomleft = (cx0, cy0 - 10))
	if cursor is not None and mpos is not None:
		p = (mpos[0] - bx0) / bscale, (mpos[1] - by0) / bscale
		icon = cursor.nearest(p)
		bad = not state.state.canaddpart(icon)
		icon.draw((bx0, by0), bscale, bad = bad)



