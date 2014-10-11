from __future__ import division
import pygame, random
import vista, state, scene, settings, img, parts, dialog, button, sound, gamescene

controls = []
cps = []
cursor = None
mpos = None
buttons = []

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
	global controls, cursor, point, cps
	controls = [
		parts.Conduit((1,)),
		parts.Conduit((2,)),
		parts.Conduit((3,)),
	]
	cps = [
		(cx0 + csep * j, cy0, cscale)
		for j in range(len(controls))
	]
	for j, modulename in enumerate(state.state.available):
		controls.append(parts.Module(modulename))
		cps.append((mx0, my0 + 100 * j, mscale))
	cursor = None
	point = None

	del buttons[:]
	buttons.append(button.Button("Remove All", (50, 400, 60, 20)))
	buttons.append(button.Button("Leave", (200, 400, 60, 20)))
	buttons.append(button.Button("buy1", (cx0, cy0+60, cscale, 30), text = "Available: 1\nBuy: $3"))
	gamescene.setshroud((0,0,0))
	sound.playmusic("equip")


# can be: a tuple on the board, a button name, or a module or conduit
def pointat((mx, my)):
	if brect.collidepoint((mx, my)):
		return (mx - bx0) / bscale, (my - by0) / bscale
	for button in buttons:
		if button.within((mx, my)):
			return button.name
	for control, (x0, y0, b) in zip(controls, cps):
		x = (mx - x0) / b
		y = (my - y0) / b
		if control.contains((x, y)):
			return control
	return None

def handleclick():
	global cursor
	if isinstance(point, tuple):
		if cursor:
			icon = cursor.nearest(point)
			if state.state.canaddpart(icon):
				state.state.addpart(icon)
				sound.play("build")
				cursor = None
			else:
				print "can't build"
		else:
			part = state.state.partat(map(int, point))
			print point, part
			if part:
				state.state.removepart(part)
				sound.play("unbuild")
	elif isinstance(point, basestring):
		if point == "Remove All":
			state.state.removeall()
			sound.play("unbuild")
		elif point == "Leave":
			scene.pop()
			sound.playmusic("travel")
		elif point.startswith("buy"):
			cname = "conduit-" + point[3:]
			state.state.buy(cname)
	elif isinstance(point, parts.Conduit):
		if cursor is point:
			for j in range(len(controls)):
				if controls[j] is cursor:
					controls[j] = cursor = cursor.rotate(1)
		elif state.state.unused[point.name]:
			cursor = point
		else:
			sound.play("cantpick")
	elif isinstance(point, parts.Part):
		if cursor is point:
			cursor = None
		elif point.name in state.state.unlocked:
			if state.state.unused[point.name]:
				cursor = point
			else:
				sound.play("cantpick")
		else:
			state.state.unlock(point.name)


def think(dt, events, mousepos):
	global mpos, cursor, point
	point = pointat(mousepos)
	for event in events:
		if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
			scene.pop()
			sound.playmusic("travel")
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
			handleclick()
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 2:
			cursor = None
			point = None
	mpos = mousepos
	dialog.think(dt)
	for b in buttons:
		if b.name.startswith("buy"):
			cname = "conduit-" + b.name[3:]
			b.text = "Buy: $%d\nAvailable: %d" % (settings.modulecosts[cname], state.state.unused[cname])
			b.makeimg()

def draw():
	vista.screen.fill((50, 50, 50))
	for x in range(settings.shipw):
		for y in range(settings.shiph):
			vista.screen.fill((100, 50, 0), (bx0 + bscale*x, by0 + bscale*y, bscale-3, bscale-3))
	for part in state.state.parts:
		part.draw((bx0, by0), bscale)
	for (x0, y0, scale), control in zip(cps, controls):
		control.draw((x0, y0), scale)
		if control is cursor:
			control.drawoutline((x0, y0), scale)
	for b in buttons:
		b.draw()
	img.drawtext("MODULES", fontsize = titlesize, color = (200, 100, 100), bottomleft = (mx0, my0 - 10))
	img.drawtext("SHIP LAYOUT", fontsize = titlesize, color = (160, 160, 160), bottomleft = (bx0, by0 - 10))
	img.drawtext("CONDUITS", fontsize = titlesize, color = (100, 200, 100), bottomleft = (cx0, cy0 - 10))
	img.drawtext("Click multiple times to rotate", fontsize = availsize, color = (100, 200, 100), topleft = (cx0, cy0 - 10))
	img.drawtext("Spacebucks: $%d" % state.state.bank, fontsize = 25, color = (255, 255, 255), topleft = (600, 320))
	if cursor is not None and mpos is not None:
		p = (mpos[0] - bx0) / bscale, (mpos[1] - by0) / bscale
		icon = cursor.nearest(p)
		bad = not state.state.canaddpart(icon)
		icon.draw((bx0, by0), bscale, bad = bad)
	dialog.draw()


