import pygame
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *

pygame.init()
pygame.display.set_mode((600, 400), OPENGL)

glClearColor(0, 1, 0, 1)

playing = True
clock = pygame.time.Clock()
while playing:
	dt = 0.001 * clock.tick(40)
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	for event in pygame.event.get():
		if event.type == MOUSEBUTTONDOWN:
			playing = False
	pygame.display.flip()



