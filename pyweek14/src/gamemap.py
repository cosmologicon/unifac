# The main game map drawing routine

import pygame
import vista, gamestate, settings, mechanics


mode = None  # current button mode

def downeventname(event):
    if event.type == pygame.MOUSEBUTTONDOWN and 1 <= event.button <= 3:
        return ["LMB", "MMB", "RMB"][event.button-1]

def upeventname(event):
    if event.type == pygame.MOUSEBUTTONUP and 1 <= event.button <= 3:
        return ["LMB", "MMB", "RMB"][event.button-1]

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
    size = gamestate.mapx * vista.zoomx, gamestate.mapy * vista.zoomy
    smap = pygame.transform.scale(gamestate.map0, size)
    vista.mapwindow.blit(smap, vista.mappos((0, 0)))

    # cursor grid coordinates
    cx, cy = vista.worldpos(pygame.mouse.get_pos())
    rect = pygame.Rect(0, 0, vista.zoomx + 1, vista.zoomy + 1)
    if mode and mode in gamestate.rbindings:
        tech = gamestate.rbindings[mode]
        footprint = mechanics.footprints[tech.split()[1]]
        for dx, dy in footprint:
            rect.topleft = vista.mappos((cx+dx, cy+dy))
            pygame.draw.rect(vista.mapwindow, (255, 255, 255), rect, 1)


    


