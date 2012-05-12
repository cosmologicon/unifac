# Who's the REAL monster, ya'll?

import pygame, math, random
import vista, gamestate, data, effect, settings

class Foe(object):
    v = 2.0
    hp0 = 10
    dhp = 1
    color = 0, 0, 0
    anchor = "center"
    imgname = None
    imgflip = False
    reward = 2
    layer = 0
    
    def __init__(self, path):
        self.path = list(path)
        self.path = [(x + random.uniform(0, 1), y + random.uniform(0, 1)) for x, y in self.path]
        self.path.append((gamestate.homex, gamestate.homey))
        self.x, self.y = self.path[0]
        self.hp = self.hp0
        self.vx, self.vy = 0, 0
        self.stept = 0
        self.freezetime = 0
        self.flametime = 0
        self.atomtime = 0

    def die(self):
        gamestate.foes.remove(self)

    def hurt(self, dhp):
        self.hp -= dhp
        if self.hp <= 0:
            gamestate.bank += self.reward
            gamestate.effects.append(effect.Smoke((self.x, self.y)))
            self.die()

    def explode(self):
        self.die()
        for f in gamestate.foes:
            if (f.x - self.x) ** 2 + (f.y - self.y) ** 2 < 2 ** 2:
                f.hurt(5)
        gamestate.effects.append(effect.Bomb((self.x, self.y)))

    def arrive(self):  # reach the castle
        gamestate.damage(self.dhp)
        self.die()
    
    def think(self, dt):
        self.stept += dt * random.uniform(0.8, 1.2)
        if self.freezetime:
            self.freezetime = max(self.freezetime - dt, 0)
        if self.flametime:
            self.flametime = max(self.flametime - dt, 0)
        if self.atomtime:
            self.atomtime -= dt
            if self.atomtime <= 0:
                self.explode()
        tx, ty = self.path[0]
        dx, dy = tx - self.x, ty - self.y
        if self.flametime:
            if random.uniform(0, 0.3) < dt:
                theta = random.uniform(0, 2*math.pi)
                self.vx = 2 * self.v * math.sin(theta)
                self.vy = 2 * self.v * math.cos(theta)
        elif dx ** 2 + dy ** 2 < 0.5 ** 2:
            self.path.pop(0)
            if not self.path:
                self.arrive()
        else:
            d = math.sqrt(dx ** 2 + dy ** 2)
            a = self.v * 20
            self.vx += dt * dx / d * a
            self.vy += dt * dy / d * a
            
            v = math.sqrt(self.vx ** 2 + self.vy ** 2)
            if v > self.v:
                self.vx *= self.v / v
                self.vy *= self.v / v

        f = 0.15 if self.freezetime else 1
        self.x += dt * self.vx * f
        self.y += dt * self.vy * f

    def draw(self):
        px, py = vista.mappos((self.x, self.y))
        h = 8 * abs(2.5 * self.stept % 1 - 0.5)
        alpha = 20 * ((2.5 * self.stept + 0.5) % 1 - 0.5)
        flip = self.imgflip
        if flip:
            alpha = -alpha
        if self.vx < 0:
            flip = not flip
        if self.freezetime:
            pygame.draw.rect(vista.mapwindow, (0, 0, 255), (px-6, py-12-h, 12, 16))
        if self.flametime:
            flip = random.choice([True, False])
            alpha = random.uniform(-10, 10)
            data.draw(vista.mapwindow, data.img("flame", flip=flip, alpha=alpha), (px, py-h), self.anchor)
        if self.atomtime:
            img = effect.bordertext(str(int(self.atomtime)), settings.fonts.atom, 18, (255, 0, 255), (0, 0, 0))
            data.draw(vista.mapwindow, img, (px, py-h-22), "midbottom")
        img = data.img(self.imgname, flip=flip, alpha=alpha)
        data.draw(vista.mapwindow, img, (px, py-h), self.anchor)


class Villager(Foe):
    v = 1.0
    dhp = 1
    hp0 = 10
    reward = 15

    def __init__(self, path):
        Foe.__init__(self, path)
        self.imgname = "foe-%s" % random.choice((0,1,2,3))
        self.imgflip = random.choice((True,False))

class Dog(Foe):
    v = 1.8
    dhp = 1
    hp0 = 6
    reward = 25
    imgname = "dog"

    def __init__(self, path):
        Foe.__init__(self, path)
        if not settings.animals:
            self.imgname = "foe-%s" % random.choice((0,1,2,3))
            self.imgflip = random.choice((True,False))


class Soldier(Foe):
    v = 1.0
    dhp = 2
    hp0 = 40
    reward = 10
    imgname = "soldier"
    def __init__(self, path):
        Foe.__init__(self, path)
        self.imgflip = random.choice((True,False))

class Horseman(Foe):
    v = 2.2
    dhp = 2
    hp0 = 20
    reward = 60
    imgname = "horseman"
    def __init__(self, path):
        Foe.__init__(self, path)
        if not settings.animals:
            self.imgname = "soldier"
            self.imgflip = random.choice((True,False))


