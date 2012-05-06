import pygame
import settings

def init():
    global screen
    screen = pygame.display.set_mode(settings.ssize)
    display.set_caption(settings.gamename)

def clear(color = (0, 0, 100)):
    screen.fill(color)

def flip():
    pygame.display.flip()



