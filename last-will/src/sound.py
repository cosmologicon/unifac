import pygame
import data, settings, menu

sounds = {}
def play(soundname):
	if not settings.audio or not settings.sound:
		return
	if menu.stack:
		return
	if soundname not in sounds:
		sounds[soundname] = pygame.mixer.Sound(data.filepath("sound", "%s.ogg" % soundname))
	sounds[soundname].play()

currentmusic = None
def playmusic(songname):
	global currentmusic
	if not settings.audio or not settings.music:
		return
	if songname == currentmusic:
		return
	currentmusic = songname
	pygame.mixer.music.stop()
	pygame.mixer.music.load(data.filepath("music", "%s.ogg" % songname))
	pygame.mixer.music.play(-1)


