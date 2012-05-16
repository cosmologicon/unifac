import pygame
import settings, gamestate

def init():
    global screen, mapwindow, techwindow, minimapwindow, _screen
    if settings.doubleview:
        _screen = pygame.display.set_mode((settings.sx*2, settings.sy*2))
        screen = pygame.Surface(settings.ssize).convert()
    else:
        screen = pygame.display.set_mode(settings.ssize)
    pygame.display.set_caption(settings.gamename)
    mapwindow = pygame.Surface(settings.wsize).convert_alpha()
    techwindow = pygame.Surface(settings.wsize).convert_alpha()
    initpos()

def initpos():
    global mapx, mapy, mapsx, mapsy, techx, techy, techsx, techsy
    global mode, ftrans
    global zoomx, zoomy, vx0, vy0
    global winrect, minirect
    mapx, mapy = settings.wx0, settings.wy0
    techx, techy = settings.mx0, settings.my0
    mapsx, mapsy = settings.wsize
    techsx, techsy = settings.msize
    winrect = pygame.Rect((0, 0, settings.wx, settings.wy))
    winrect.center = settings.wx0, settings.wy0
    minirect = pygame.Rect((0, 0, settings.mx, settings.my))
    minirect.center = settings.mx0, settings.my0
    mode = True  # true for map mode, false for tech mode
    ftrans = 0      # transition fraction
    zoomx, zoomy = 24, 12
    vx0, vy0 = 13, 20

def swapmode():
    global mode, ftrans
    if ftrans: return
    mode = not mode
    ftrans = settings.transtime
    import gamemap
    gamemap.mode = None

def think(dt):
    global mapx, mapy, mapsx, mapsy, techx, techy, techsx, techsy
    global ftrans
    if ftrans > 0:
        ftrans = max(ftrans - dt, 0)
        f = (ftrans / settings.transtime) ** 3
        wx = int(settings.mx0 * f + settings.wx0 * (1 - f))
        wy = int(settings.my0 * f + settings.wy0 * (1 - f))
        wsx = int(settings.mx * f + settings.wx * (1 - f))
        wsy = int(settings.my * f + settings.wy * (1 - f))
        mx = settings.mx0 + 500 * f
        my = settings.my0
        msx = settings.mx
        msy = settings.my
        if mode:
            mapx, mapy, mapsx, mapsy = wx, wy, wsx, wsy
            techx, techy, techsx, techsy = mx, my, msx, msy
        else:
            techx, techy, techsx, techsy = wx, wy, wsx, wsy
            mapx, mapy, mapsx, mapsy = mx, my, msx, msy


def worldpos((x, y)):
    if settings.doubleview:
        x, y = x//2, y//2
    return vx0 + int((x - settings.wx0) / zoomx), vy0 + int((y - settings.wy0) / zoomy)

# coordinates within the map window
def mappos((x, y)):
    px = int(settings.wx/2 - zoomx * (gamestate.mapx/2 - x))
    py = int(settings.wy/2 - zoomy * (gamestate.mapy/2 - y))
    return px, py

def clear(color = (0, 0, 0)):
    screen.fill(color)

def drawwindows():
    clear()
    w = mapwindow if mapsx == settings.wx else pygame.transform.smoothscale(mapwindow, (mapsx, mapsy))
    r = w.get_rect(center = (mapx, mapy))
    screen.blit(w, r)
    w = techwindow if techsx == settings.wx else pygame.transform.smoothscale(techwindow, (techsx, techsy))
    r = w.get_rect(center = (techx, techy))
    screen.blit(w, r)

def flip():
    if settings.doubleview:
        pygame.transform.scale2x(screen, _screen)
    pygame.display.flip()



