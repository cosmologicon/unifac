# The main game map drawing routine

import pygame, random, math, numpy
import vista, gamestate, settings, mechanics


mode = None  # current button mode

def downeventname(event):
    if event.type == pygame.MOUSEBUTTONDOWN and 1 <= event.button <= 3:
        return ["LMB", "MMB", "RMB"][event.button-1]

def upeventname(event):
    if event.type == pygame.MOUSEBUTTONUP and 1 <= event.button <= 3:
        return ["LMB", "MMB", "RMB"][event.button-1]

def mapimg(zoomx, zoomy, cache = {}):
    key = zoomx, zoomy
    if key in cache: return cache[key]
    zoomx /= 4
    zoomy /= 2
    size = gamestate.mapx * zoomx, gamestate.mapy * zoomy
    
    gx, gy = 7 * zoomx, 7 * zoomy
    gaussian = pygame.Surface((gx, gy)).convert_alpha()
    gaussian.fill((255, 255, 255, 0))
    for x in range(gx):
        for y in range(gy):
            dx, dy = (x - gx/2.) / zoomx / 1.3, (y - gy/2.) / zoomy / 1.3
            a = math.exp(-(dx ** 2 + dy ** 2))
            gaussian.set_at((x, y), (255, 255, 255, 255*a))
    
    # The road layer
    road = pygame.Surface(size).convert_alpha()
    water = pygame.Surface(size).convert_alpha()
    road.fill((0, 0, 0))
    water.fill((0, 0, 0))
    for x in range(gamestate.map0.get_width()):
        for y in range(gamestate.map0.get_height()):
            c = gamestate.map0.get_at((x, y))
            if c == (255, 255, 0):
                road.blit(gaussian, ((x - 3) * zoomx, (y - 3) * zoomy))
            elif c == (0, 0, 255):
                water.blit(gaussian, ((x - 3) * zoomx, (y - 3) * zoomy))
    ralpha = pygame.surfarray.array3d(road)[:,:,0]
    ralpha = numpy.maximum(numpy.minimum(ralpha * 1.8 - 120 - (numpy.random.rand(*size) * 80), 255), 0)
    pygame.surfarray.pixels_alpha(road)[:,:] = ralpha
    rpix = pygame.surfarray.pixels3d(road)
    rpix[:,:,0] = numpy.random.rand(*size) * 20 + 100
    rpix[:,:,1] = numpy.random.rand(*size) * 20 + 100
    rpix[:,:,2] = numpy.random.rand(*size) * 10
    del rpix
    walpha = pygame.surfarray.array3d(water)[:,:,0]
    water.fill((0, 0, 128))
    pygame.surfarray.pixels_alpha(water)[:] = walpha
    
    img = pygame.transform.smoothscale(gamestate.map0, size)
    cpix = pygame.surfarray.pixels3d(img)
    cpix[:,:,0] = numpy.random.rand(*size) * 10
    cpix[:,:,1] = numpy.random.rand(*size) * 20 + 100
    cpix[:,:,2] = numpy.random.rand(*size) * 10
    del cpix
    img.blit(water, (0, 0))
    img.blit(road, (0, 0))
    img = pygame.transform.smoothscale(img, (size[0]*4, size[1]*2))
    cache[key] = img
    return img

def build(obj):
    print "building", obj

def think(dt, events):
    global mode
    for event in events:
        if event.type == pygame.MOUSEBUTTONUP:
            print event.pos, vista.worldpos(event.pos)
        ename = downeventname(event)
        if ename:
            mode = ename
        ename = upeventname(event)
        if ename == mode:
            if mode in gamestate.rbindings:
                build(gamestate.rbindings[mode])
            mode = None

def draw():
    vista.mapwindow.fill((100, 0, 0))
    vista.mapwindow.blit(mapimg(vista.zoomx, vista.zoomy), vista.mappos((0, 0)))

    # cursor grid coordinates
    cx, cy = vista.worldpos(pygame.mouse.get_pos())
    rect = pygame.Rect(0, 0, vista.zoomx + 1, vista.zoomy + 1)
    if mode and mode in gamestate.rbindings:
        tech = gamestate.rbindings[mode]
        footprint = mechanics.footprints[tech.split()[1]]
        for dx, dy in footprint:
            rect.topleft = vista.mappos((cx+dx, cy+dy))
            pygame.draw.rect(vista.mapwindow, (255, 255, 255), rect, 1)


    


