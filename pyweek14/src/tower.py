import pygame, math
import vista, foe, gamestate, mechanics, data, effect


class Tower(object):
    color = 50, 125, 200
    anchor = "center"
    layer = 0
    def __init__(self, tech, (x, y)):
        self.element, self.invention = tech.split()
        dx, dy = mechanics.footoffs[self.invention]
        self.x, self.y = x + dx, y + dy
        self.chargetime = mechanics.chargets[self.element] * mechanics.chargets[self.invention]
        self.chargetimer = 0
        self.damage = mechanics.damages[self.element]
        self.range = mechanics.ranges[self.invention]
        self.t = 0
        self.cfilter = mechanics.ecolors[self.element]
        self.imgname = self.invention
        if self.invention == "spire": self.imgname = "spire"
        self.h = { "spire": 40, "monkey": 30, "shark": 0, "corpse": 40, "glyph": 0 }[self.invention]
        
        self.vh = 30  # you know, for sharks
        self.x0, self.y0 = self.x, self.y  # you know, for monkeys
        if self.invention == "glyph": self.layer = -1

    def attack(self, who):
        if self.element == "laser":
            who.hurt(self.damage)
            data.playsfx("laser")
        elif self.element == "freeze":
            who.freezetime += 5
            who.flametime = 0
            data.playsfx("freeze")
        elif self.element == "fire":
            who.hurt(self.damage)
            who.flametime = 3
            who.freezetime = 0
            data.playsfx("flame")
        elif self.element == "atomic":
            who.flametime = 0
            who.freezetime = 0
            data.playsfx("laser")
            who.atomtime = 5
        self.chargetimer = 0
        if self.invention == "glyph":
            beam = effect.Beam((who.x, who.y+0.1, 0), (who.x, who.y+0.1, 40), self.cfilter)
        else:
            beam = effect.Beam((self.x, self.y, self.h), (who.x, who.y, 20), self.cfilter)
        gamestate.effects.append(beam)

    def gettarget(self):
        if not gamestate.foes: return None
        foes = gamestate.foes
        if self.element == "freeze":
            foes = [f for f in foes if not f.freezetime]
        if not foes:
            return None
        f = min(foes, key = lambda f: (f.x - self.x) ** 2 + (f.y - self.y) ** 2)
        if (f.x - self.x) ** 2 + (f.y - self.y) ** 2 < self.range ** 2:
            return f
        return None

    def think(self, dt):
        self.chargetimer += dt
        self.t += dt
        if self.invention == "shark" and self.h > 0:
            self.h += self.vh * dt
            self.vh -= 160 * dt

        if self.invention == "monkey":
            r, theta = 2 * math.sin(self.t), 0.2 * self.t + 2 * math.sin(self.t)
            self.x, self.y = self.x0 + r * math.sin(theta), self.y0 + r * math.cos(theta)

        if self.chargetimer >= self.chargetime:
            if self.invention == "shark":
                if self.h <= 0:
                    self.h = 0.1
                    self.vh = 120
                elif self.vh < 0:
                    self.chargetimer = 0
                    target = self.gettarget()
                    if target: self.attack(target)
            elif self.invention == "glyph":
                for f in gamestate.foes:
                    if (f.x - self.x) ** 2 + (f.y - self.y) ** 2 < self.range ** 2:
                        self.attack(f)
                self.chargetimer = 0
            else:
                self.chargetimer = self.chargetime
                target = self.gettarget()
                if target: self.attack(target)
        
        
    def drawglow(self, (px, py)):
        if self.chargetimer < 0.5:
            pass
        elif self.chargetimer < self.chargetime:
            for j in range(30):
                theta = j * math.pi / 15
                r = (73 * theta ** 2 - 22 * self.t) % (12 * self.chargetimer / self.chargetime + theta/2)
                pos = px + int(r * math.sin(theta)), py + int(r * math.cos(theta))
                vista.mapwindow.set_at(pos, self.cfilter)
        else:
            theta, r = self.t * 4, 8 + 6 * math.sin(2.2 * self.t)
            s, c = int(r * math.sin(theta)), int(r * math.cos(theta))
            pygame.draw.line(vista.mapwindow, self.cfilter, (px+s,py+c), (px-s,py-c))
            pygame.draw.line(vista.mapwindow, self.cfilter, (px+s,py-c), (px-s,py+c))

    def draw(self):
        px, py = vista.mappos((self.x, self.y))
        if self.invention == "spire":
            self.drawglow((px, py-39))
            img = data.img(self.imgname, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py), self.anchor)
        elif self.invention == "monkey":
            data.draw(vista.mapwindow, data.img("shadow"), (px, py), "center")
            h = 3 * math.sin(self.t * 7)
            alpha = (3+h)*15
            py -= 30 + h
            img = data.img("wing", alpha=alpha, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py-3), self.anchor)
            img = data.img("wing", flip=True, alpha=alpha, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py-3), self.anchor)
            img = data.img(self.imgname, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py), self.anchor)
        elif self.invention == "shark":
            if self.h > 0:
                img = data.img("shark", alpha=2*self.vh, cfilter=self.cfilter)
                data.draw(vista.mapwindow, img, (px, int(py - self.h)), self.anchor)
        elif self.invention == "corpse":
            n = 0 if self.chargetimer > self.chargetime - 0.4 else int(self.chargetimer * 4) % 2 + 1
            img = data.img("arm-%s" % n, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py), self.anchor)
        elif self.invention == "glyph":
            r = mechanics.ranges["glyph"]
            f = self.chargetimer / self.chargetime
            color = [int(c*f) for c in self.cfilter]
            rect = pygame.Rect(0, 0, 2*r*vista.zoomx, 2*r*vista.zoomy)
            rect.center = px, py
            pygame.draw.ellipse(vista.mapwindow, color, rect, 1)
            rect = pygame.Rect(0, 0, 1.8*r*vista.zoomx, 1.8*r*vista.zoomy)
            rect.center = px, py
            pygame.draw.ellipse(vista.mapwindow, color, rect, 1)
            alphas = [(f*2+j*4)*math.pi/5 for j in range(5)]
            ps = [vista.mappos((self.x + 0.9 * r * math.sin(alpha), self.y + 0.9 * r * math.cos(alpha))) for alpha in alphas]
            pygame.draw.lines(vista.mapwindow, color, True, ps, 1)


class Castle(object):
    layer = 0
    def __init__(self, (x, y)):
        self.x, self.y = x + 0.5, y + 0.5
        self.img = pygame.transform.smoothscale(data.img("castle"), (120, 248))
        self.alive = True

    def think(self, dt):
        if self.alive and gamestate.hp < 0:
            self.alive = False
            for j in range(50):
                dy = random.uniform(-4, 4)
                dx = random.uniform(-4, 4)
                gamestate.effects.append(effect.Smoke((self.x + dx, self.y + dy)))

    def draw(self):
        if self.alive:
            px, py = vista.mappos((self.x, self.y))
            data.draw(vista.mapwindow, self.img, (px, py), "center")


