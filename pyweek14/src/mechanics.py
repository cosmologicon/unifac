
elements = ["laser", "freeze", "fire", "plague", "atomic"]
inventions = ["stone", "monkey", "shark", "corpse"]

footprints = {
    "stone": [(-1,-2), (0,-2), (-2,-1), (-1,-1), (0,-1), (1,-1), (-2,0), (-1,0), (0,0), (1,0), (-1,1), (0,1)],
    "monkey": [(0,0), (0,1), (1,0), (0,-1), (-1,0)],
    "shark": [(0,0), (0,1), (1,0), (1, 1)],
    "corpse": [(0,0), (0,1), (-1,0)],
}
footoffs = {
    "stone": (0, 0),
    "monkey": (0.5, 0.5),
    "shark": (0.5, 0.5),
    "corpse": (0.5, 0.5),
}
ecolors = {
    "laser": (255, 255, 0),
    "freeze": (128, 128, 255),
    "fire": (255, 128, 0),
    "plague": (80, 160, 80),
    "atomic": (0, 255, 255),
}



# map colors
okterrain = {
    (0, 0, 255): "shark".split(),  # water
    (0, 255, 0): "monkey stone".split(), # grass
    (128, 128, 128): "monkey stone corpse".split(), # graveyard
}
homecolor = 255, 255, 255


