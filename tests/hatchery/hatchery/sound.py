import pygame
import data

enabled = False

sounds = {}
def play(sname):
	if not enabled:
		return
	if sname not in sounds:
		sounds[sname] = pygame.mixer.Sound(data.filepath(sname + ".ogg"))
	sounds[sname].play()


