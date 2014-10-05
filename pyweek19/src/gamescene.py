import pygame
import vista, state, button

def init():
	makebuttons()

buttons = []
def makebuttons():
	del buttons[:]
	for j, bname in enumerate(state.state.modules):
		buttons.append(button.Button(bname, (600, 400 - 25 * j, 80, 20)))

def handleclick(pos):
	for b in buttons:
		if b.within(pos):
			b.click()
			return
	worldpos = vista.screentoworld(pos)
	state.state.you.target = worldpos


def think(dt, events):
	for event in events:
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
			handleclick(event.pos)

	state.state.think(dt)
	vista.think(dt)

def draw():
	state.state.drawviewport()
	for b in buttons:
		b.draw()


