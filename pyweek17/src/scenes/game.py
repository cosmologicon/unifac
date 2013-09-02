import pygame, math, numpy, random, cPickle
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera, text, things, state, cursor, hud
from vec import vec


def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_LIGHT0)
	glEnable(GL_NORMALIZE)

	glLight(GL_LIGHT0, GL_AMBIENT, [0.2,0.2,0.2,1])
	glLight(GL_LIGHT0, GL_DIFFUSE, [1,1,1,1])
	glLight(GL_LIGHT0, GL_SPECULAR, [0,0,0,1])

	glLight(GL_LIGHT1, GL_AMBIENT, [0.5,0,0,1])
	glLight(GL_LIGHT1, GL_DIFFUSE, [0.5,0,0,1])
	glLight(GL_LIGHT1, GL_SPECULAR, [0,0,0,1])

	state.init()
	hud.init()
	cursor.tobuild = None
		

def think(dt, events, kpress):
	state.t += dt
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
#			camera.seek((0, 0, 1))
		if event.type == KEYDOWN and event.key == K_F12:
			graphics.screenshot()
		if event.type == KEYDOWN and event.key == K_1:
			cursor.tobuild = things.Tower
		if event.type == KEYDOWN and event.key == K_2:
			cursor.tobuild = things.Mine
			
	if kpress[K_ESCAPE]:
		scene.pop()
	dx = (kpress[K_RIGHT]) - (kpress[K_LEFT])
	dy = (kpress[K_UP]) - (kpress[K_DOWN])
	dr = (kpress[K_e]) - (kpress[K_a])
	dA = (kpress[K_COMMA]) - (kpress[K_o])

	px, py = pygame.mouse.get_pos()
	hud.point((px, settings.sy - py))


	camera.move(1 * dt * dx, 1 * dt * dy, 0.7 * dt * dr, 0.7 * dt * dA)
	camera.think(dt)

	for s in state.structures:
		s.think(dt)

	hud.think(dt)

	#x, y = camera.screentoworld(pygame.mouse.get_pos())
	#print x, y, math.sqrt(x*x + y*y)



def draw():
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
#	glEnable(GL_CULL_FACE)

	camera.look()

	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars)
	glEnable(GL_LIGHTING)

	glPushMatrix()
	glScale(state.R, state.R, state.R)
	graphics.draw(graphics.moon)
	glPopMatrix()


	for s in state.structures:
		glPushMatrix()
		s.draw()
		glPopMatrix()

	px, py = pygame.mouse.get_pos()
	p = camera.screentoworld((settings.sx - px, settings.sy - py))
	
	if p and cursor.tobuild:
		darken = not state.canbuild(cursor.tobuild, p.norm())
		if darken:
			glDisable(GL_LIGHT0)
			glEnable(GL_LIGHT1)
		tower = cursor.tobuild(p.norm())
		tower.t = 100
		glPushMatrix()
		tower.draw()
		glPopMatrix()
		if darken:
			glEnable(GL_LIGHT0)
			glDisable(GL_LIGHT1)



	text.setup()

	hud.draw()

#	if state.t < 1:
#		text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0))
#	text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0))
#	text.write("Moony moony moonzzzz!", None, 54, (255, 255, 0), (settings.sx/2, 200), (0, 0, 0))

#	text.write("O", None, 8, (255, 0, 0), camera.worldtoscreen(vec(0, 0, state.R)), (0, 0, 0))
	
	glDisable(GL_TEXTURE_2D)


