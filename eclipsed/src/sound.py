import pygame, os.path
import settings, data

volume = None

def setvolume(vol=None):
	global volume
	if vol is not None:
		vol = min(max(vol, 0), 1)
	if vol == volume:
		return
	if vol is not None:
		volume = vol
	pygame.mixer.music.set_volume(volume if settings.music else 0)

def playmusic(name):
	pygame.mixer.music.load(data.filepath("music", "%s.ogg" % name))
	pygame.mixer.music.play(-1)

sounds = {}
def play(soundname):
	if soundname not in sounds:
		f = data.filepath("sfx", "%s.ogg" % soundname)
		if not os.path.exists(f):
#			print "sound: " + soundname
			return
		sounds[soundname] = pygame.mixer.Sound(f)
	if settings.sound:
		sounds[soundname].play()

