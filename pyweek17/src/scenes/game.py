import pygame, math
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera
from vec import vec


def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_LIGHT0)
	glEnable(GL_AUTO_NORMAL)

	glLight(GL_LIGHT0, GL_AMBIENT, [0.2,0.2,0.2,1])
	glLight(GL_LIGHT0, GL_DIFFUSE, [1,1,1,1])
	glLight(GL_LIGHT0, GL_SPECULAR, [0,0,0,1])



def think(dt, events, kpress):
	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			scene.pop()
	dx = (kpress[K_RIGHT]) - (kpress[K_LEFT])
	dy = (kpress[K_UP]) - (kpress[K_DOWN])
	dr = (kpress[K_e]) - (kpress[K_a])
	dA = (kpress[K_COMMA]) - (kpress[K_o])

	camera.move(1 * dt * dx, 1 * dt * dy, 0.7 * dt * dr, 0.7 * dt * dA)


def draw():
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
	glEnable(GL_CULL_FACE)

	glMatrixMode(GL_PROJECTION)
	glLoadIdentity()
	gluPerspective(30,float(settings.sx) / settings.sy,0.01,10000)
	camera.look()
	
	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars)
	glEnable(GL_LIGHTING)

	graphics.draw(graphics.moon)
	glPushMatrix()
	glTranslate(0, 0, 1)
	glScale(0.02, 0.02, 0.02)
	graphics.draw(graphics.tower)
	glPopMatrix()
	


