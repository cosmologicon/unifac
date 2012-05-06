# The main game map drawing routine

import pygame
import vista, gamestate

def think(dt, events):
    pass

def draw():
    vista.mapwindow.fill((100, 0, 0))
    vista.mapwindow.blit(pygame.transform.scale(gamestate.map0, (400, 400)), (0, 0))



