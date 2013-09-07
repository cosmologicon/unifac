import pygame, math, numpy, random, cPickle
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera, text, things, state, cursor, hud, lighting, info, sound
from vec import vec

playing = True
alpha = 0
def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_NORMALIZE)

	lighting.init()
	state.init()
	hud.init()
	camera.init()
	cursor.tobuild = None
	global playing, ending, alpha
	playing = True
	ending = False
	alpha = 0
		

def think(dt, events, kpress):

	global alpha, playing, ending
	if playing and not ending:
		alpha = min(2 * dt + alpha, 1)
	elif ending:
		alpha -= 2 * dt
		if alpha <= -6:
			hud.endtitle.settext()
			if not hud.endtitle:
				scene.pop()
				return
	else:
		alpha -= 2 * dt
		if alpha <= 0:
			scene.pop()
			return
	sound.setvolume(alpha)

	if kpress[K_ESCAPE]:
		playing = False

	dx = ((kpress[K_RIGHT]) - (kpress[K_LEFT])) * dt
	dy = ((kpress[K_UP]) - (kpress[K_DOWN])) * dt
	dr = ((kpress[K_e] or kpress[K_d]) - (kpress[K_a])) * dt
	dA = ((kpress[K_COMMA] or kpress[K_w]) - (kpress[K_o] or kpress[K_s])) * dt

	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			if event.button == 4:
				camera.zoom /= 1.1
			elif event.button == 5:
				camera.zoom *= 1.1
			else:
				px, py = pygame.mouse.get_pos()
				if hud.click((px, settings.sy - py)):
					continue
				p = camera.screentoworld((settings.sx - px, settings.sy - py))
				if p and cursor.tobuild:
					phat = p.norm()
					if state.canbuild(cursor.tobuild, phat):
						f = camera.eye().rej(phat).norm()
						state.build(cursor.tobuild(p.norm(), f))
						cursor.tobuild = None
				elif cursor.pointingto:
					if cursor.unbuild:
						state.unbuild(cursor.pointingto)
					elif cursor.disable:
						state.toggleenable(cursor.pointingto)
				else:
					cursor.dragging = True
		if event.type == MOUSEBUTTONUP:
			cursor.dragging = False
		if event.type == MOUSEMOTION:
			relx, rely = event.rel
			if event.buttons[0]:
				dx -= relx * settings.dragfactor / settings.sy
				dy += rely * settings.dragfactor / settings.sy
			if event.buttons[2]:
				dr -= relx * settings.dragfactor / settings.sy
				dA += rely * settings.dragfactor / settings.sy
#			camera.seek((0, 0, 1))
		if event.type == KEYDOWN and event.key == K_CAPSLOCK:
			settings.swaparrows = not settings.swaparrows
		if event.type == KEYDOWN and event.key == K_F12:
			graphics.screenshot()
		if event.type == KEYDOWN and event.key == K_SPACE:
			things.Asteroid(100)



	if bool(kpress[K_LSHIFT]) != bool(settings.swaparrows):
		dx, dy, dr, dA = dr, dA, dx, dy
	
	camera.move(1 * dx, 1 * dy, 0.7 * dr, 0.7 * dA)
	camera.think(dt)
			

	px, py = pygame.mouse.get_pos()
	hud.point((px, settings.sy - py))




	dtobj = dt * settings.speedup

	for obj in state.thinkers():
		obj.think(dtobj)

	hud.think(dt)
	state.think(dtobj)
	
	hud.setstatus()

	#x, y = camera.screentoworld(pygame.mouse.get_pos())
	#print x, y, math.sqrt(x*x + y*y)

	if state.checklose():
		ending = True
		hud.endtitle.settext("Mission Failed")
	elif state.checkwin():
		ending = True
		hud.endtitle.settext("Mission Complete")
		settings.unlocked = max(settings.unlocked, settings.level + 1)


def draw():
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
#	glEnable(GL_CULL_FACE)

	camera.look()

	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars, min(settings.sx * settings.sy / 2000000., 1))
	glEnable(GL_LIGHTING)

	lighting.moon()
	glPushMatrix()
	glScale(state.R, state.R, state.R)
	graphics.draw(graphics.moon)
	glPopMatrix()

	lighting.normal()
	# wire thickness
	glLineWidth(int(math.ceil(camera.wthick())))
	for obj in state.drawers():
		glPushMatrix()
		obj.draw()
		glPopMatrix()
	for obj in state.drawers():
		if not obj.fx:
			continue
		glPushMatrix()
		obj.drawfx()
		glPopMatrix()

	px, py = pygame.mouse.get_pos()
	p = camera.screentoworld((settings.sx - px, settings.sy - py))
	
	cursor.pointingto = None
	powerwarning = None
	if p and cursor.tobuild:
		phat = p.norm()
		f = camera.eye().rej(phat).norm()
		tower = cursor.tobuild(phat, f)
		tower.dummy = True
		tower.invalid = not state.canbuild(cursor.tobuild, p.norm())
		glPushMatrix()
		tower.draw()
		glPopMatrix()
		for w in state.wiresto(tower):
			w.draw()
		if not state.willgetpower(cursor.tobuild, p.norm()):
			for p, ptype in zip(cursor.tobuild.pneeds, info.pnames):
				if p:
					powerwarning = "Warning: structure will not function\nwithout a %s connection." % ptype
	elif p:
		cursor.pointingto = state.pointing(p)

	hud.labels["powerwarning"].settext(powerwarning)


	text.setup()

	hud.draw()

	if alpha < 1:
		glPushMatrix()
		graphics.fill(0, 0, 0, 1-alpha)
		glPopMatrix()
		glEnable(GL_TEXTURE_2D)

	if hud.endtitle:
		hud.endtitle.draw()

#	if state.t < 1:
#		text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0))

#	text.write("Moony moony moons!", None, 54, (255, 255, 0), (settings.sx/2, 100), (0, 0, 0), alpha=0.3)
#	text.write("Moony moony moonzzzz!", None, 54, (255, 255, 0), (settings.sx/2, 200), (0, 0, 0))

#	text.write("O", None, 8, (255, 0, 0), camera.worldtoscreen(vec(0, 0, state.R)), (0, 0, 0))
	
	glDisable(GL_TEXTURE_2D)


