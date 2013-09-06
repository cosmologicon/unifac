import pygame, math, numpy, random, cPickle
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera, text, things, state, cursor, hud, lighting
from vec import vec

playing = True
alpha = 0
def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_NORMALIZE)

	lighting.init()
	state.init()
	hud.init()
	camera.init()
	cursor.tobuild = None
	global playing, alpha
	playing = True
	alpha = 0
		

def think(dt, events, kpress):

	global alpha
	if playing:
		alpha = min(2 * dt + alpha, 1)
	else:
		alpha -= 2 * dt
		if alpha <= 0:
			scene.pop()
			return

	if kpress[K_ESCAPE]:
		scene.pop()
	dx = ((kpress[K_RIGHT]) - (kpress[K_LEFT])) * dt
	dy = ((kpress[K_UP]) - (kpress[K_DOWN])) * dt
	dr = ((kpress[K_e] or kpress[K_d]) - (kpress[K_a])) * dt
	dA = ((kpress[K_COMMA] or kpress[K_w]) - (kpress[K_o] or kpress[K_s])) * dt

	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			if event.button == 4:
				camera.zoom /= 1.1
			elif event.button == 5:
				camera.zoom *= 1.1
			else:
				px, py = pygame.mouse.get_pos()
				if hud.click((px, settings.sy - py)):
					continue
				p = camera.screentoworld((settings.sx - px, settings.sy - py))
				if p and cursor.tobuild:
					if state.canbuild(cursor.tobuild, p.norm()):
						state.build(cursor.tobuild(p.norm()))
						cursor.tobuild = None
				elif cursor.pointingto:
					if cursor.unbuild:
						state.unbuild(cursor.pointingto)
					elif cursor.disable:
						state.toggleenable(cursor.pointingto)
				else:
					cursor.dragging = True
		if event.type == MOUSEBUTTONUP:
			cursor.dragging = False
		if event.type == MOUSEMOTION:
			relx, rely = event.rel
			if event.buttons[0]:
				dx -= relx * settings.dragfactor
				dy += rely * settings.dragfactor
			if event.buttons[2]:
				dr -= relx * settings.dragfactor
				dA += rely * settings.dragfactor
#			camera.seek((0, 0, 1))
		if event.type == KEYDOWN and event.key == K_CAPSLOCK:
			settings.swaparrows = not settings.swaparrows
		if event.type == KEYDOWN and event.key == K_F12:
			graphics.screenshot()
		if event.type == KEYDOWN and event.key == K_1:
			cursor.tobuild = things.Tower
		if event.type == KEYDOWN and event.key == K_2:
			cursor.tobuild = things.Mine

	if bool(kpress[K_LSHIFT]) != bool(settings.swaparrows):
		dx, dy, dr, dA = dr, dA, dx, dy
	
	camera.move(1 * dx, 1 * dy, 0.7 * dr, 0.7 * dA)
	camera.think(dt)
			

	px, py = pygame.mouse.get_pos()
	hud.point((px, settings.sy - py))





	for obj in state.thinkers():
		obj.think(dt)

	hud.think(dt)
	state.think(dt)

	#x, y = camera.screentoworld(pygame.mouse.get_pos())
	#print x, y, math.sqrt(x*x + y*y)


def draw():
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
#	glEnable(GL_CULL_FACE)

	camera.look()

	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars, min(settings.sx * settings.sy / 2000000., 1))
	glEnable(GL_LIGHTING)

	lighting.moon()
	glPushMatrix()
	glScale(state.R, state.R, state.R)
	graphics.draw(graphics.moon)
	glPopMatrix()

	lighting.normal()
	# wire thickness
	glLineWidth(int(math.ceil(camera.wthick())))
	for obj in state.drawers():
		glPushMatrix()
		obj.draw()
		glPopMatrix()
	for obj in state.drawers():
		if not obj.fx:
			continue
		glPushMatrix()
		obj.drawfx()
		glPopMatrix()

	px, py = pygame.mouse.get_pos()
	p = camera.screentoworld((settings.sx - px, settings.sy - py))
	
	cursor.pointingto = None
	if p and cursor.tobuild:
		tower = cursor.tobuild(p.norm())
		tower.t = 100
		tower.invalid = not state.canbuild(cursor.tobuild, p.norm())
		glPushMatrix()
		tower.draw()
		glPopMatrix()
		for w in state.wiresto(tower):
			w.draw()
	elif p:
		cursor.pointingto = state.pointing(p)


	text.setup()

	hud.draw()

	if alpha < 1:
		graphics.fill(0, 0, 0, 1-alpha)

#	if state.t < 1:
#		text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0))

#	text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0), alpha=0.3)
#	text.write("Moony moony moonzzzz!", None, 54, (255, 255, 0), (settings.sx/2, 200), (0, 0, 0))

#	text.write("O", None, 8, (255, 0, 0), camera.worldtoscreen(vec(0, 0, state.R)), (0, 0, 0))
	
	glDisable(GL_TEXTURE_2D)


