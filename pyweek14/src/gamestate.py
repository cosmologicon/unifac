import pygame
import mechanics, data


def save():
    pass

def load():
    pass


def loadlevel():
    global elements, inventions, map0

    # available (researched) elements and inventions
    elements = list(mechanics.elements)
    inventions = list(mechanics.inventions)
    
    # initial map (with nothing built on it)
    map0 = pygame.image.load(data.filename("map-0.png"))


