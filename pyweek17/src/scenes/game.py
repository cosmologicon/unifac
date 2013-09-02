import pygame, math, numpy, random
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera, text, things
from vec import vec


t = 0

def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_LIGHT0)
	glEnable(GL_AUTO_NORMAL)

	glLight(GL_LIGHT0, GL_AMBIENT, [0.2,0.2,0.2,1])
	glLight(GL_LIGHT0, GL_DIFFUSE, [1,1,1,1])
	glLight(GL_LIGHT0, GL_SPECULAR, [0,0,0,1])
	
	global t, towers
	t = 0
	towers = [things.Car() for _ in range(10)]
	


def think(dt, events, kpress):
	global t
	t += dt
	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			camera.seek((0, 0, 1))
			
	if kpress[K_ESCAPE]:
		scene.pop()
	dx = (kpress[K_RIGHT]) - (kpress[K_LEFT])
	dy = (kpress[K_UP]) - (kpress[K_DOWN])
	dr = (kpress[K_e]) - (kpress[K_a])
	dA = (kpress[K_COMMA]) - (kpress[K_o])

	camera.move(1 * dt * dx, 1 * dt * dy, 0.7 * dt * dr, 0.7 * dt * dA)
	camera.think(dt)

	for tower in towers:
		tower.think(dt)

	#x, y = camera.screentoworld(pygame.mouse.get_pos())
	#print x, y, math.sqrt(x*x + y*y)



def draw():
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
	glEnable(GL_CULL_FACE)

	camera.look()
	
	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars)
	glEnable(GL_LIGHTING)

	graphics.draw(graphics.moon)


	for tower in towers:
		glPushMatrix()
		tower.draw()
		glPopMatrix()

	text.setup()

	if t < 1:
		text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0))
	
	glDisable(GL_TEXTURE_2D)


