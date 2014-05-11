from pygame import *
import settings, play, scene

clock = time.Clock()

display.set_mode(settings.size)
init()
display.set_caption(settings.gamename)

scene.scenes.append(play.Scene())

while scene.scenes:
	s = scene.scenes[-1]
	dt = min(0.001 * clock.tick(settings.fps), 0.1)
	kpressed = key.get_pressed()
	kdowns = []
	for e in event.get():
		if e.type == QUIT:
			del scene.scenes[:]
		if e.type == KEYDOWN:
			kdowns.append(e.key)
	s.think(dt, kpressed, kdowns)
	s.draw()
	if settings.DEBUG:
		display.set_caption("%s %.1ffps" % (settings.gamename, clock.get_fps()))
	display.flip()


