import pygame, math
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, scenes.game, graphics

math.tau = 2 * math.pi

pygame.init()
if not settings.ssize:
	settings.sx, settings.sy = settings.ssize = max(pygame.display.list_modes())
fsflag = FULLSCREEN if settings.fullscreen else 0
pygame.display.set_mode(settings.ssize, DOUBLEBUF | OPENGL | fsflag)
pygame.display.set_caption(settings.gamename)
pygame.font.init()
glutInit()
glClearColor(0, 0, 0, 1)
graphics.init()

scene.push(scenes.game)
clock = pygame.time.Clock()
while scene.top():
	dt = 0.001 * clock.tick(settings.fps)
	pygame.display.set_caption("%s - %.1ffps" % (settings.gamename, clock.get_fps()))
	s = scene.top()
	s.think(dt, pygame.event.get(), pygame.key.get_pressed())
	s.draw()
	pygame.display.flip()

graphics.quit()



