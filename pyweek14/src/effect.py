import pygame
import vista, gamestate, data, settings

def bordertext(text, fontname, fontsize, color0, color1=(255,255,255), d=1, cache={}):
    key = text, fontname, fontsize, color0, color1
    if key in cache: return cache[key]
    fontkey = fontname, fontsize
    if fontkey not in cache:
        cache[fontkey] = pygame.font.Font(fontname, fontsize)
    font = cache[fontkey]
    surf0 = font.render(text, True, color0)
    surf1 = font.render(text, True, color1)
    img = pygame.Surface((surf0.get_width() + 2*d, surf0.get_height() + 2*d)).convert_alpha()
    img.fill((0,0,0,0))
    img.blit(surf1, (d, 0))
    img.blit(surf1, (d, 2*d))
    img.blit(surf1, (0, d))
    img.blit(surf1, (2*d, d))
    img.blit(surf0, (d, d))
    cache[key] = img
    return img

class Title(object):
    def __init__(self, text):
        self.text = text
        self.surf = bordertext(text, settings.fonts.title, 60, (64, 128, 64), (255, 255, 255), 2)
        self.t = 0

    def think(self, dt):
        if self.t < 1 or "Thank you" not in self.text:
            self.t += dt
    
    def draw(self):
        s = min(self.t * 4, (2 - self.t) * 4, 1)
        if s <= 0: return
        rect = self.surf.get_rect()
        rect.center = settings.sx//2, settings.sy//2
        area = 0, 0, int(rect.width * s), rect.height
        vista.screen.blit(self.surf, rect, area)

    def __nonzero__(self):
        return self.t < 4

class Beam(object):
    lifetime = 0.25
    layer = 0
    def __init__(self, (x0, y0, z0), (x1, y1, z1), color):
        self.x = (x0 + x1) / 2
        self.y = (y0 + y1) / 2
        self.x0, self.y0, self.z0 = x0, y0, z0
        self.x1, self.y1, self.z1 = x1, y1, z1
        self.color = color
        self.t = 0
    
    def think(self, dt):
        self.t += dt
        if self.t > self.lifetime:
            gamestate.effects.remove(self)
        
    def draw(self):
        px0, py0 = vista.mappos((self.x0, self.y0))
        px1, py1 = vista.mappos((self.x1, self.y1))
        pygame.draw.line(vista.mapwindow, self.color, (px0, py0-self.z0), (px1, py1-self.z1), 3)
        pygame.draw.line(vista.mapwindow, (255, 255, 255), (px0, py0-self.z0), (px1, py1-self.z1), 1)

class Smoke(object):
    lifetime = 1.
    vz = 40
    layer = 0
    def __init__(self, (x, y)):
        self.x, self.y = x, y
        self.t = 0
    
    def think(self, dt):
        self.t += dt
        if self.t > self.lifetime:
            gamestate.effects.remove(self)
    
    def draw(self):
        f = self.t / self.lifetime
        h = int(f * self.vz)
        px, py = vista.mappos((self.x, self.y))
        img = data.img("smoke")
        sx, sy = img.get_size()
        img = pygame.transform.scale(img, (int(sx*(1+3*f)), int(sy/(1+3*f))))
        data.draw(vista.mapwindow, img, (px, py - h))

class Bomb(object):
    lifetime = 0.5
    layer = -1
    def __init__(self, (x, y)):
        self.x, self.y = x, y
        self.t = 0
    
    def think(self, dt):
        self.t += dt
        if self.t > self.lifetime:
            gamestate.effects.remove(self)
    
    def draw(self):
        f = self.t / self.lifetime
        if f < 0.3: return
        rect = pygame.Rect(0, 0, int(4*f*vista.zoomx), int(4*f*vista.zoomy))
        rect.center = vista.mappos((self.x, self.y))
        pygame.draw.ellipse(vista.mapwindow, (255, 0, 255), rect, 1)


