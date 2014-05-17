from pygame import *
import datetime
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
	if settings.DEBUG and K_F12 in kdowns:
		fname = datetime.datetime.now().strftime("screenshots/screenshot-%Y%m%d%H%M%S.png")
		image.save(display.get_surface(), fname)
	if settings.DEBUG and kpressed[K_TAB]:
		dt *= 5
	s.think(dt, kpressed, kdowns)
	s.draw()
	if settings.DEBUG:
		display.set_caption("%s %.1ffps" % (settings.gamename, clock.get_fps()))
	display.flip()
quit()


