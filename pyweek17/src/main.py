import pygame, math, os.path
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, scenes.game, scenes.menu, graphics, sound, state

math.tau = 2 * math.pi

def main():
	pygame.init()
	pygame.mixer.init()
	sound.setvolume(0)
	pygame.font.init()
	graphics.setmode()
	graphics.init()

	scene.push(scenes.menu)
	if not settings.restart and os.path.exists(state.fname):
		state.load()
		scene.push(scenes.game)
	clock = pygame.time.Clock()
	while scene.top():
		dt = min(0.001 * clock.tick(settings.fps), 0.5)
#		pygame.display.set_caption("%s - %.1ffps" % (settings.gamename, clock.get_fps()))
		s = scene.top()
		while dt > 0:
			tdt = min(dt, 0.1)
			s.think(tdt, pygame.event.get(), pygame.key.get_pressed())
			dt -= tdt
		s.draw()
		pygame.display.flip()

	graphics.quit()



