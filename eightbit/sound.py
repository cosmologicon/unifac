from pygame import *

cache = {}
def playsound(sname):
	if sname not in cache:
		cache[sname] = mixer.Sound("sfx/%s.ogg" % sname)
		cache[sname].set_volume(0.4)
		if sname == "shoot":
			cache[sname].set_volume(0.1)
	cache[sname].play()

mplaying = None
def playmusic(mname):
	global mplaying
	if mname == mplaying:
		return
	mixer.music.stop()
	mixer.music.load("music/%s.ogg" % mname)
	mixer.music.play(-1)
	mplaying = mname

