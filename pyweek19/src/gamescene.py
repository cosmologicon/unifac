import pygame
import vista, state, button, scene, buildscene

apart = {
	"mother": False,
}

def init():
	makebuttons()
	apart["mother"] = False

buttons = []
def makebuttons():
	del buttons[:]
	for j, bname in enumerate(state.state.modules):
		buttons.append(button.ModuleButton(bname, (600, 400 - 25 * j, 80, 20)))

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
	for b in buttons:
		b.think(dt)

	if state.state.mother.within((state.state.you.x, state.state.you.y)):
		if apart["mother"]:
			apart["mother"] = False
			scene.push(buildscene)
			state.state.you.x = state.state.mother.x
			state.state.you.y = state.state.mother.y
			state.state.you.allstop()
	else:
		apart["mother"] = True


def draw():
	state.state.drawviewport()
	for b in buttons:
		b.draw()


