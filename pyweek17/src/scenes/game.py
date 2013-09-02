import pygame, math, numpy, random, cPickle
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera, text, things, state
from vec import vec


t = 0

def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_LIGHT0)
	glEnable(GL_NORMALIZE)

	glLight(GL_LIGHT0, GL_AMBIENT, [0.2,0.2,0.2,1])
	glLight(GL_LIGHT0, GL_DIFFUSE, [1,1,1,1])
	glLight(GL_LIGHT0, GL_SPECULAR, [0,0,0,1])
	
	global t, towers
	t = 0
	towers = [things.Car() for _ in range(4)]
	towers += [things.Mine() for _ in range(4)]
	
	t0 = things.Tower(vec(0, 0, 1))
	t1 = things.Tower(vec(0.5, 0, 1).norm())
	t2 = things.Tower(vec(1, 0, 1).norm())
	t3 = things.Tower(vec(1, 0.3, 0.8).norm())
	towers += [t0, t1, t2, t3]
	towers += [
		things.Wire(t0.u, t1.u),
		things.Wire(t1.u, t2.u),
		things.Wire(t2.u, t3.u),
	]

def think(dt, events, kpress):
	global t
	t += dt
	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			camera.seek((0, 0, 1))
		if event.type == KEYDOWN and event.key == K_F12:
			data = glReadPixels(0, 0, settings.sx, settings.sy, GL_RGB, GL_UNSIGNED_BYTE)
			data = numpy.fromstring(data, dtype=numpy.uint8).reshape((settings.sy, settings.sx, 3))
			data = numpy.transpose(data, (1, 0, 2))[:,::-1,:]
			surf = pygame.Surface((settings.sx, settings.sy)).convert_alpha()
			pygame.surfarray.pixels3d(surf)[:] = data
			pygame.image.save(surf, "screenshot.png")
			
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
#	glEnable(GL_CULL_FACE)

	camera.look()

	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars)
	glEnable(GL_LIGHTING)

	glPushMatrix()
	glScale(state.R, state.R, state.R)
	graphics.draw(graphics.moon)
	glPopMatrix()


	for tower in towers:
		glPushMatrix()
		tower.draw()
		glPopMatrix()

	px, py = pygame.mouse.get_pos()
	p = camera.screentoworld((settings.sx - px, settings.sy - py))
	
	if p:
		tower = things.Tower(p.norm())
		glPushMatrix()
		tower.draw()
		glPopMatrix()



	text.setup()

	if t < 1:
		text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0))

	text.write("O", None, 8, (255, 0, 0), camera.worldtoscreen(vec(0, 0, state.R)), (0, 0, 0))
	
	camera.screentoworld(camera.worldtoscreen(vec(0, 0, state.R)))
	
	glDisable(GL_TEXTURE_2D)


