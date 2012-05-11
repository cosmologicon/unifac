# the tech tree

import pygame
import vista, gamestate, data, settings

font, bfont = None, None
drag = None
dragpos = None
dragz0, dragz = None, None
w = settings.buttonsize + settings.buttonspace

tablex0, tabley0 = 100, 100

def rowy(element):
    if element == drag:
        return dragpos
    z = gamestate.elements.index(element)
    if drag in gamestate.elements:
        if dragz0 <= z <= dragz:
            z -= 1
        elif dragz0 >= z >= dragz:
            z += 1
    return tabley0 + int(w * (z + 0.5))


def colx(invention):
    if invention == drag:
        return dragpos
    z = gamestate.inventions.index(invention)
    if drag in gamestate.inventions:
        if dragz0 <= z <= dragz:
            z -= 1
        elif dragz0 >= z >= dragz:
            z += 1
    return tablex0 + int(w * (z + 0.5))

def rows():
    for element in gamestate.elements:
        if element != drag:
            yield element, rowy(element)
    if drag in gamestate.elements:
        yield drag, rowy(drag)
    
def cols():
    for invention in gamestate.inventions:
        if invention != drag:
            yield invention, colx(invention)
    if drag in gamestate.inventions:
        yield drag, colx(drag)

def rects():
    for element, y in rows():
        for invention, x in cols():
            rect = pygame.Rect(0, 0, settings.buttonsize, settings.buttonsize)
            rect.center = x, y
            yield element + " " + invention, rect

def aerects():
    for element, y in rows():
        rect = pygame.Rect(0, 0, 30, 30)
        rect.midleft = tablex0 + 4 + w * len(gamestate.inventions), y
        yield element, rect

def airects():
    for invention, x in cols():
        rect = pygame.Rect(0, 0, 30, 30)
        rect.midtop = x, tabley0 + 4 + w * len(gamestate.elements)
        yield invention, rect

def think(dt, events):
    global drag, dragpos, dragz, dragz0
    for event in events:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            for elem, rect in aerects():
                if rect.collidepoint(event.pos):
                    drag = elem
                    dragpos = event.pos[1]
                    dragz = dragz0 = gamestate.elements.index(drag)
            for inv, rect in airects():
                if rect.collidepoint(event.pos):
                    drag = inv
                    dragpos = event.pos[0]
                    dragz = dragz0 = gamestate.inventions.index(drag)
        if event.type == pygame.MOUSEMOTION:
            if drag in gamestate.elements:
                dragpos = event.pos[1]
                dragz = min(max(int((dragpos - tabley0) / w + 0.5), 0), len(gamestate.elements) - 1)
            elif drag in gamestate.inventions:
                dragpos = event.pos[0]
                dragz = min(max(int((dragpos - tablex0) / w + 0.5), 0), len(gamestate.inventions) - 1)
        if drag:
            if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                if drag in gamestate.elements:
                    gamestate.elements.remove(drag)
                    gamestate.elements.insert(dragz, drag)
                elif drag in gamestate.inventions:
                    gamestate.inventions.remove(drag)
                    gamestate.inventions.insert(dragz, drag)
                drag = None
        else:
            if event.type == pygame.MOUSEBUTTONUP and 1 <= event.button <= 3:
                bname = ["LMB", "MMB", "RMB"][event.button - 1]
                for obj, rect in rects():
                    if rect.collidepoint(event.pos):
                        gamestate.bind(obj, bname)




def draw():
    global font, bfont
    if font is None:
        font = pygame.font.Font(settings.fonts.table, 20)
    if bfont is None:
        bfont = pygame.font.Font(None, 16)

    vista.techwindow.fill((0, 20, 0))

    for tech, rect in rects():
        vista.techwindow.fill((100, 100, 100), rect)
        pygame.draw.rect(vista.techwindow, (200, 200, 200), rect, 2)
        if tech in gamestate.bindings:
            text = bfont.render(gamestate.bindings[tech], True, (255, 255, 255))
            vista.techwindow.blit(text, rect.move(3, 3))

    for element, y in rows():
        text = font.render(element, True, (255, 255, 255))
        vista.techwindow.blit(text, text.get_rect(midright = (tablex0 - 5, y)))

    for invention, x in cols():
        text = font.render(invention, True, (255, 255, 255))
        text = pygame.transform.rotate(text, 90)
        vista.techwindow.blit(text, text.get_rect(midbottom = (x, tabley0 - 5)))

    for element, rect in aerects():
        vista.techwindow.fill((0, 0, 200), rect)

    for element, rect in airects():
        vista.techwindow.fill((0, 0, 200), rect)


    """
    ps = (0, 0), (-12, -12), (-4, -10), (-8, -30), (0, -26), (8, -30), (4, -10), (12, -12), (0, 0)
    ps = [(x+200, y+300) for x, y in ps]
    pygame.draw.polygon(vista.techwindow, (200, 200, 0), ps)
    pygame.draw.polygon(vista.techwindow, (200, 100, 0), ps, 2)
    """


