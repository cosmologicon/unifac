import pygame
import vista, state, scene, settings

def init():
	pass

def think(dt, events):
	for event in events:
		if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
			scene.pop()

def draw():
	d = 50
	for x in range(settings.shipw):
		for y in range(settings.shiph):
			vista.screen.fill((100, 50, 0), (d*x, d*y, d-3, d-3))

