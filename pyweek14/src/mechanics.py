
elements = ["laser", "freeze", "fire", "plague", "atomic"]
inventions = ["stone", "monkey", "shark", "corpse"]

footprints = {
    "stone": [(0,0), (0,1), (1,0), (0,-1), (-1,0)],
    "monkey": [(0,0), (0,1), (1,0), (0,-1), (-1,0)],
    "shark": [(0,0), (0,1), (1,0), (0,-1), (-1,0)],
    "corpse": [(0,0), (0,1), (1,0), (0,-1), (-1,0)],
}


# map colors
okterrain = {
    (0, 0, 255): "shark".split(),  # water
    (0, 255, 0): "monkey stone".split(), # grass
    (128, 128, 128): "monkey stone corpse".split(), # graveyard
}
homecolor = 255, 255, 255



