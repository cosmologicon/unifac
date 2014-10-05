import settings
import pygame


def init():
	global screen
	screen = pygame.display.set_mode(settings.ssize)

def clear():
	screen.fill((0, 0, 0))

def flip():
	pygame.display.flip()



