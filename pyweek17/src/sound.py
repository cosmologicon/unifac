import pygame
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


