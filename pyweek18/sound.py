from pygame import *

cache = {}
def playsound(sname):
	if sname not in cache:
		cache[sname] = mixer.Sound("sfx/%s.ogg" % sname)
		cache[sname].set_volume(0.4)
		if sname == "shoot":
			cache[sname].set_volume(0.1)
	cache[sname].play()

def playmusic(mname):
	pass

