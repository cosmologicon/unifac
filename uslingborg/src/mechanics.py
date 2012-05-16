import pygame
import settings, foe

elements = ["laser", "freeze", "fire", "plague", "atomic"]
inventions = ["spire", "monkey", "shark", "corpse", "glyph"]

unlocks = [
    "laser freeze spire",
    "laser freeze fire spire monkey shark",
    "laser freeze fire spire monkey shark corpse",
    "laser freeze fire atomic spire monkey shark corpse glyph",
    "laser freeze fire atomic spire monkey shark corpse glyph",
]

bank0 = [240, 280, 400, 1000, 2000]


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
    "corpse": 5,
    "glyph": 2.5,
}
ecolors = {
    "laser": (255, 255, 0),
    "freeze": (128, 128, 255),
    "fire": (255, 128, 0),
    "plague": (80, 160, 80),
    "atomic": (255, 0, 255),
}
damages = {
    "laser": 5,
    "freeze": 0,
    "fire": 4,
    "plague": 1,
    "atomic": 2,
}
chargets = {
    "laser": 10,
    "freeze": 1,
    "fire": 7,
    "plague": 10,
    "atomic": 10,
    "spire": 1,
    "monkey": 0.5,
    "shark": 1,
    "corpse": 0.5,
    "glyph": 1.5,
}

basecost = 30
incrementcost = 10
sortcost = 20



# map colors
okterrain = {
    (0, 0, 255): "shark".split(),  # water
    (0, 255, 0): "monkey spire glyph".split(), # grass
    (128, 128, 128): "monkey spire corpse glyph".split(), # graveyard
    (255, 255, 0): "glyph".split(), # road
}
homecolor = 255, 255, 255

def parsepath(s):
    c = map(int, s.split())
    return zip(c[0::2], c[1::2])


paths = [
    [
        parsepath("-5 27 2 28 8 32 11 36 17 38 20 37 24 31 25 28 22 23 18 19 12 21 5 19 1 15 2 9 4 5 7 2 11 0 18 3 17 5 15 8"),
    ],
    [
        parsepath("-5 31 5 29 10 26 14 23 18 19 20 12 17 5 13 2 6 4 3 8 2 12 6 20 11 25 17 26 24 35"),
    ],
    [
        parsepath("-4 26 3 27 6 28 13 29 20 26 24 23 25 20 22 13 19 10"),
        parsepath("10 44 9 36 7 28 4 20 2 11 6 3 10 1 13 3 15 7"),
    ],
    [
        parsepath("-5 9 6 11 14 14 18 17 23 21 25 26 23 31 19 34 13 31 15 16 13 10"),
        parsepath("31 8 20 11 14 13 8 17 2 22 0 28 3 33 8 35 14 32 14 23 14 13 13 10"),
    ],
    [
        parsepath("23 -2 11 1 6 5 1 16 3 21 7 23 11 21"),
        parsepath("28 37 24 19 22 12 18 9 11 13"),
        parsepath("-3 30 1 34 10 37 17 34 21 28 17 21"),
    ],
]

foequeues = [None] * 5

foequeues[0] = [(t, foe.Villager, paths[0][0]) for t in range(10, 160, 3)]
foequeues[0] += [(t+ 1.5, foe.Villager, paths[0][0]) for t in range(70, 160, 2)]

foequeues[1] = [(t, foe.Villager, paths[1][0]) for t in range(10, 160, 3)]
foequeues[1] += [(t+ 1.5, foe.Villager, paths[1][0]) for t in range(70, 160, 2)]
foequeues[1] += [(t+ 1.5, foe.Dog, paths[1][0]) for t in range(70, 160, 3)]

foequeues[2] = [(t, foe.Villager, paths[2][t%2]) for t in range(10, 160, 3)]
foequeues[2] += [(t+ 1.5, foe.Villager, paths[2][t/2%2]) for t in range(70, 160, 2)]
foequeues[2] += [(t+ 2.5, foe.Dog, paths[2][t%2]) for t in range(70, 160, 3)]
foequeues[2] += [(t+ 3.5, foe.Soldier, paths[2][t%2]) for t in range(10, 160, 5)]

foequeues[3] = [(t, foe.Villager, paths[3][t%2]) for t in range(10, 160, 3)]
foequeues[3] += [(t+ 1.5, foe.Villager, paths[3][t/2%2]) for t in range(70, 160, 2)]
foequeues[3] += [(t+ 2.5, foe.Dog, paths[3][t%2]) for t in range(70, 160, 3)]
foequeues[3] += [(t+ 3.5, foe.Soldier, paths[3][t%2]) for t in range(10, 160, 5)]
foequeues[3] += [(t+ 3.5, foe.Horseman, paths[3][t%2]) for t in range(13, 160, 5)]

foequeues[4] = [(t, foe.Villager, paths[4][t%3]) for t in range(20, 1600, 2)]
foequeues[4] += [(t+ 1.5, foe.Villager, paths[4][t%3]) for t in range(40, 1600, 2)]
foequeues[4] += [(t+ 2.5, foe.Dog, paths[4][t%3]) for t in range(50, 1600, 2)]
foequeues[4] += [(t+ 3.5, foe.Soldier, paths[4][t%3]) for t in range(20, 1600, 5)]
foequeues[4] += [(t+ 3.5, foe.Horseman, paths[4][t%3]) for t in range(23, 1600, 5)]
foequeues[4] += [(t+ 3.5, foe.Soldier, paths[4][t%3]) for t in range(60, 1600, 2)]
foequeues[4] += [(t+ 3.5, foe.Horseman, paths[4][t%3]) for t in range(80, 1600, 2)]
foequeues[4] += [(t+ 3.5, foe.Horseman, paths[4][t%3]) for t in range(120, 1600, 1)]




titles = [
    settings.gamename,
    "Level 2: Monkeys + Sharks",
    "Level 3: Corpses",
    "Level 4: Glyphs",
    "Last stand",
]



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

