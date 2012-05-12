import pygame
import mechanics, data, tower, settings, vista, effect


def save():
    pass

def load():
    pass

def bind(objname, key):
    global rbindings
    if objname in bindings and bindings[objname] == key:
        del bindings[objname]
    else:
        if key in rbindings and rbindings[key] in bindings:
            del bindings[rbindings[key]]
        bindings[objname] = key
    rbindings = dict((o,k) for k,o in bindings.items())

def damage(dhp):
    global hp
    hp -= dhp

def makebuildmasks():
    global buildmasks, homex, homey
    buildmasks = dict((invention, pygame.Surface((mapx, mapy)).convert_alpha())
                    for invention in inventions)
    for mask in buildmasks.values():    
        mask.fill((255, 0, 0, 100))
    for x in range(mapx):
        for y in range(mapy):
            c = map0.get_at((x, y))
            c = c[0], c[1], c[2]
            if c == mechanics.homecolor:
                homex, homey = x, y
            if c not in mechanics.okterrain: continue
            for inv in mechanics.okterrain[c]:
                buildmasks[inv].set_at((x, y), (255, 0, 0, 0))

def cost(tech):
    element, invention = tech.split()
    if element not in elements: return None
    if invention not in inventions: return None
    inc = elements.index(element) + inventions.index(invention)
    return mechanics.basecost + mechanics.incrementcost * inc

def sortcost():
    return 0 if sortmode else mechanics.sortcost

def cansort():
    return sortcost() <= bank

def canbuild(tech, (x, y)):
    c = cost(tech)
    if c is None or c > bank:
        return False
    element, invention = tech.split()
    footprint = mechanics.footprints[invention]
    mask = buildmasks[invention]
    for dx, dy in footprint:
        px, py = x+dx, y+dy
        if not 0 <= px < mapx or not 0 <= py < mapy:
            return False
        if mask.get_at((px, py))[3]:
            return False
    return True

def build(tech, (x, y)):
    global bank, sortmode
    if not canbuild(tech, (x, y)):
        return
    bank -= cost(tech)
    element, invention = tech.split()
    towers.append(tower.Tower(tech, (x, y)))
    footprint = mechanics.footprints[invention]
    mask = buildmasks[invention]
    for dx, dy in footprint:
        px, py = x+dx, y+dy
        for mask in buildmasks.values():
            mask.set_at((px, py), (255, 0, 0, 100))
    sortmode = False
    return True


def loadlevel():
    global elements, inventions, map0, mapx, mapy, bindings, rbindings
    global towers, foes, effects, castle, paths, hp, hp0, bank, sortmode

    # available (researched) elements and inventions
    elements = list(mechanics.elements)
    inventions = list(mechanics.inventions)
    
    # initial map (with nothing built on it)
    map0 = pygame.image.load(data.filename("map-0.png"))
    mapx, mapy = map0.get_size()
    bindings, rbindings = {}, {}
    towers = []
    foes = []
    effects = []
    
    hp = hp0 = 20
    bank = 100
    sortmode = False

    paths = [
        [(-3, 29), (7, 31), (14, 30), (16, 25), (14, 19), (7, 18), (2, 14), (3, 8),
                     (9, 3), (14, 4)]
    ]
    
    makebuildmasks()
    castle = tower.Castle((homex, homey))

HUDfont = None
def drawHUD():
    text = effect.bordertext("Funds: %s gp" % bank, settings.fonts.HUD, 32, (40, 160, 40), (0, 0, 0))
    rect = text.get_rect(bottomright = (settings.sx - 8, settings.sy - 50))
    vista.screen.blit(text, rect)
    text = effect.bordertext("Castle walls: %s/%s" % (max(0, hp), hp0), settings.fonts.HUD, 32, (40, 160, 40), (0, 0, 0))
    rect = text.get_rect(bottomright = (settings.sx - 8, settings.sy - 8))
    vista.screen.blit(text, rect)


