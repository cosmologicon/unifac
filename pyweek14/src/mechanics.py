import pygame

elements = ["laser", "freeze", "fire", "plague", "atomic"]
inventions = ["spire", "monkey", "shark", "corpse", "glyph"]

footprints = {
    "spire": [(-1,-2), (0,-2), (-2,-1), (-1,-1), (0,-1), (1,-1), (-2,0), (-1,0), (0,0), (1,0), (-1,1), (0,1)],
    "monkey": [(0,0), (0,1), (1,0), (0,-1), (-1,0)],
    "shark": [(0,0), (0,1), (1,0), (1, 1)],
    "corpse": [(0,0), (0,1), (0,-1), (0,-2)],
    "glyph": [(-1,-2), (0,-2), (1,-2),
     (-2,-1), (-1,-1), (0,-1), (1,-1), (2,-1),
     (-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0),
     (-2, 1), (-1, 1), (0, 1), (1, 1), (2, 1),
              (-1, 2), (0, 2), (1, 2)],
}
footoffs = {
    "spire": (0, 0),
    "monkey": (0.5, 0.5),
    "shark": (1, 1),
    "corpse": (0.5, 0),
    "glyph": (0.5, 0.5),
}
ranges = {
    "spire": 7,
    "monkey": 4,
    "shark": 5,
    "corpse": 4,
    "glyph": 2.5,
}
ecolors = {
    "laser": (255, 255, 0),
    "freeze": (128, 128, 255),
    "fire": (255, 128, 0),
    "plague": (80, 160, 80),
    "atomic": (0, 255, 255),
}
damages = {
    "laser": 10,
    "freeze": 0,
    "fire": 5,
    "plague": 2,
    "atomic": 4,
}

basecost = 30
incrementcost = 10
sortcost = 50



# map colors
okterrain = {
    (0, 0, 255): "shark".split(),  # water
    (0, 255, 0): "monkey spire glyph".split(), # grass
    (128, 128, 128): "monkey spire corpse glyph".split(), # graveyard
    (255, 255, 0): "glyph".split(), # road
}
homecolor = 255, 255, 255

def upeventname(event):
    if event.type == pygame.MOUSEBUTTONUP and 1 <= event.button <= 3:
        return ["LMB", "MMB", "RMB"][event.button - 1]
    elif event.type == pygame.KEYUP:
        return pygame.key.name(event.key).upper()

def downeventname(event):
    if event.type == pygame.MOUSEBUTTONDOWN and 1 <= event.button <= 3:
        return ["LMB", "MMB", "RMB"][event.button-1]
    elif event.type == pygame.KEYDOWN:
        return pygame.key.name(event.key).upper()

