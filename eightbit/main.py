from __future__ import division
from pygame import *
import datetime
import settings, play, scene, img, state

if settings.reset:
	state.reset()

clock = time.Clock()

mixer.pre_init(22050, -16, 2, 0)
flags = FULLSCREEN if settings.fullscreen else 0
display.set_mode(settings.size, flags)
img.preload()
init()
display.set_caption(settings.gamename)

scene.scenes.append(play.Scene())

accum = 0

nframe, nslow, toldslow = 0, 0, False

while scene.scenes:
	s = scene.scenes[-1]
	dt0 = clock.tick(settings.fps)
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
	accum += min(0.001 * dt0, 0.1) * (5 if settings.DEBUG and kpressed[K_TAB] else 1)
	dt = 1 / settings.fps
	while accum > dt:
		s.think(dt, kpressed, kdowns)
		accum -= dt
		kdowns = []
	s.draw()
	if settings.DEBUG:
		display.set_caption("%s %.1ffps" % (settings.gamename, clock.get_fps()))
	if not settings.lowres and not toldslow:
		nframe += 1
		nslow += clock.get_fps() < 15
		if nframe > 200 and nslow > 0.2 * nframe:
			print "Note: game running slow. Consider the flag --lowres to disable some special effects."
			toldslow = True
	display.flip()
quit()


