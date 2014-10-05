import pygame
import vista, state

def init():
	pass

def think(dt, events):
	for event in events:
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
			pos = event.pos
			worldpos = vista.screentoworld(event.pos)
			state.state.you.target = worldpos

	state.state.think(dt)
	vista.think(dt)

def draw():
	state.state.draw()

