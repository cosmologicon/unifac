import pygame, math
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics

cam = 1.0, 0.0, 0.0
up = 0.0, 0.0, 1.0
def times((x,y,z), f):
	return x*f, y*f, z*f
def plus((x0, y0, z0), (x1, y1, z1)):
	return x0+x1, y0+y1, z0+z1
def norm((x, y, z), a=1):
	d = a/math.sqrt(x**2 + y**2 + z**2)
	return x*d, y*d, z*d
def dot((x0,y0,z0), (x1,y1,z1)):
	return x0*x1 + y0*y1 + z0*z1
def cross((x0,y0,z0), (x1,y1,z1)):
	return y0*z1-y1*z0, z0*x1-z1*x0, x0*y1-x1*y0
def proj(a, b):
	return times(b, dot(a, b) / dot(b, b))
def rej(a, b):
	return plus(a, times(b, -dot(a, b) / dot(b, b)))


def think(dt, events, kpress):
	global cam, up
	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			scene.pop()
	dx = (kpress[K_RIGHT]) - (kpress[K_LEFT])
	dy = (kpress[K_UP]) - (kpress[K_DOWN])
	
	if dx:
		dcam = times(cross(up, cam), 0.3*dt*dx)
		cam = norm(plus(cam, dcam))
	if dy:
		cam = norm(plus(cam, times(up, 0.3*dt*dy)))
		up = norm(rej(up, cam))



def draw():
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
	glEnable(GL_CULL_FACE)

	glMatrixMode(GL_PROJECTION)
	glLoadIdentity()
	gluPerspective(30,float(settings.sx) / settings.sy,0.01,10000)
	gluLookAt(5*cam[0], 5*cam[1], 5*cam[2], 0, 0, 0, up[0], up[1], up[2])
	glColor(0.3, 0.3, 0.3)
	
#	glutSolidSphere(1, 20, 20)
	graphics.draw(graphics.stars)
	graphics.draw(graphics.moon)
	


