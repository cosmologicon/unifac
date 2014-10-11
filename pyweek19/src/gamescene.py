import pygame
import vista, state, button, scene, buildscene, dialog, img, settings, sound

apart = {
	"mother": False,
}
shroud = None

def init():
	makebuttons()
	apart["mother"] = False
	sound.playmusic("travel")

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


def think(dt, events, mpos):
	for event in events:
		if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
			handleclick(event.pos)

	state.state.think(dt)
	vista.think(dt)
	dialog.think(dt)
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

	global shroud
	if shroud:
		alpha = shroud.get_alpha()
		alpha = int(alpha - 200 * dt)
		if alpha <= 0:
			shroud = None
		else:
			shroud.set_alpha(alpha)

def setshroud(color, alpha = 255):
	global shroud
	shroud = pygame.Surface(settings.ssize).convert()
	shroud.set_alpha(alpha)


def draw():
	state.state.drawviewport()
	if state.state.alerts:
		img.drawtext("\n".join(state.state.alerts), color = (255, 0, 0), fontsize = settings.alertfontsize, topleft = (0, 0))
	for b in buttons:
		b.draw()
	texts = [
		"Hull: %s/%s" % (state.state.you.hp, state.state.you.maxhp),
		"SpaceBucks: %s" % state.state.bank,
	]
	colors = [
		(200, 200, 200),
		(100, 200, 100),
	]
	for j, (text, color) in enumerate(zip(texts, colors)):
		pos = settings.statpos[0], int(settings.statpos[1] + j * 1.2 * settings.statfontsize)
		img.drawtext(text, fontsize = settings.statfontsize, topleft = pos)
	dialog.draw()
	if shroud:
		vista.screen.blit(shroud, (0, 0))


