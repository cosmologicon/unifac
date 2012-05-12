# The main game map drawing routine

import pygame, random, math, numpy
import vista, gamestate, settings, mechanics


mode = None  # current button mode

def mapimg(zoomx, zoomy, cache = {}):
    key = zoomx, zoomy
    if key in cache: return cache[key]
    zoomx /= 4
    zoomy /= 2
    size = gamestate.mapx * zoomx, gamestate.mapy * zoomy
    
    gx, gy = 3 * zoomx, 3 * zoomy
    gaussian = pygame.Surface((gx, gy)).convert_alpha()
    gaussian.fill((255, 255, 255, 0))
    for x in range(gx):
        for y in range(gy):
            dx, dy = (x - gx/2.) / gx * 3, (y - gy/2.) / gy * 3
            a = math.exp(-(dx ** 2 + dy ** 2))
            gaussian.set_at((x, y), (255, 255, 255, 255*a))

    bgaussian = pygame.Surface((gx, gy)).convert_alpha()
    bgaussian.fill((0,0,0,0))
    pygame.surfarray.pixels_alpha(bgaussian)[:,:] = pygame.surfarray.pixels_alpha(gaussian)
    
    yellow = 255, 255, 0
    black = 0, 0, 0
    blue = 0, 0, 255
    gray = 128, 128, 128

    ps = [(x, y) for x in range(gamestate.map0.get_width()) for y in range(gamestate.map0.get_height())]
    random.shuffle(ps)
    def makelayer(colors, r0, dr, g0, dg, b0, db):
        layer = pygame.Surface(size).convert_alpha()
        layer.fill((255, 255, 255))
        for x,y in ps:
            p0 = int((x - 1) * zoomx), int((y - 1) * zoomy)
            c = gamestate.map0.get_at((x, y))
            layer.blit((gaussian if c in colors else bgaussian), p0)
        alpha = pygame.surfarray.array3d(layer)[:,:,0]
        alpha = numpy.maximum(numpy.minimum(alpha * 1.8 - 120 - (numpy.random.rand(*size) * 80), 255), 0)
        pygame.surfarray.pixels_alpha(layer)[:,:] = alpha
        pix = pygame.surfarray.pixels3d(layer)
        pix[:,:,0] = numpy.random.rand(*size) * dr + r0
        pix[:,:,1] = numpy.random.rand(*size) * dg + g0
        pix[:,:,2] = numpy.random.rand(*size) * db + b0
        return layer

    road = makelayer((yellow,), 80, 20, 80, 20, 10, 0)
    water = makelayer((blue, black), 0, 0, 0, 0, 140, 10)
    grave = makelayer((gray,), 80, 10, 80, 10, 80, 10)


    img = pygame.transform.smoothscale(gamestate.map0, size)
    cpix = pygame.surfarray.pixels3d(img)
    cpix[:,:,0] = numpy.random.rand(*size) * 10
    cpix[:,:,1] = numpy.random.rand(*size) * 15 + 70
    cpix[:,:,2] = numpy.random.rand(*size) * 10
    del cpix
    img.blit(water, (0, 0))
    img.blit(grave, (0, 0))
    img.blit(road, (0, 0))
    img = pygame.transform.smoothscale(img, (size[0]*4, size[1]*2))
    cache[key] = img
    return img

def think(dt, events):
    global mode
    for event in events:
        if event.type == pygame.MOUSEBUTTONUP:
            print event.pos, vista.worldpos(event.pos)
        ename = mechanics.downeventname(event)
        if ename:
            mode = ename
        ename = mechanics.upeventname(event)
        if ename == mode:
            if mode in gamestate.rbindings:
                pos = vista.worldpos(pygame.mouse.get_pos())
                gamestate.build(gamestate.rbindings[mode], pos)
            mode = None

def draw():
    vista.mapwindow.fill((100, 0, 0))
    p0 = vista.mappos((0, 0))
    vista.mapwindow.blit(mapimg(vista.zoomx, vista.zoomy), p0)

    entities = gamestate.towers + gamestate.foes + gamestate.effects + [gamestate.castle]
    entities.sort(key = lambda e: e.y)
    for e in entities:
        e.draw()

    if not vista.mode:
        return

    if mode and mode in gamestate.rbindings:
        tech = gamestate.rbindings[mode]
        element, invention = tech.split()
        size = gamestate.mapx * vista.zoomx, gamestate.mapy * vista.zoomy
        mask = pygame.transform.scale(gamestate.buildmasks[invention], size)
        vista.mapwindow.blit(mask, p0)

        # cursor grid coordinates
        cx, cy = vista.worldpos(pygame.mouse.get_pos())
        rect = pygame.Rect(0, 0, vista.zoomx + 1, vista.zoomy + 1)
        footprint = mechanics.footprints[invention]
        color = (255, 255, 255) if gamestate.canbuild(tech, (cx, cy)) else (255, 0, 0)
        for dx, dy in footprint:
            rect.topleft = vista.mappos((cx+dx, cy+dy))
            pygame.draw.rect(vista.mapwindow, color, rect, 1)
        # range circle
        ox, oy = mechanics.footoffs[invention]
        r = mechanics.ranges[invention]
        rect = pygame.Rect(0, 0, 2*r*vista.zoomx, 2*r*vista.zoomy)
        rect.center = vista.mappos((cx+ox, cy+oy))
        pygame.draw.ellipse(vista.mapwindow, mechanics.ecolors[element], rect, 1)


    


