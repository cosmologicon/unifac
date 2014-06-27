from pygame import *
import settings

cache = {}
def playsound(sname):
	if settings.nosfx:
		return
	if sname not in cache:
		cache[sname] = mixer.Sound("sfx/%s.ogg" % sname)
		cache[sname].set_volume(0.8)
		if sname == "shoot":
			cache[sname].set_volume(0.2)
		if sname == "splash":
			cache[sname].set_volume(0.25)
		if sname == "kill":
			cache[sname].set_volume(0.4)
	cache[sname].play()

mplaying = None
def playmusic(mname):
	global mplaying
	if settings.nomusic:
		return
	if mname == mplaying:
		return
	mixer.music.set_volume(0.4)
	mixer.music.stop()
	mixer.music.load("music/%s.ogg" % mname)
	mixer.music.play(-1)
	mplaying = mname

