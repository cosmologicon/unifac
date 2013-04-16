import pygame
import settings, text

def drawoutsetbox(surf, x, y, w, h, d, color = (50, 50, 50)):
	color1 = tuple(int(a * 0.6) for a in color)
	color2 = tuple(min(int(a * 1.4), 255) for a in color)
	surf.fill(color1, (x, y, w, h))
	pygame.draw.polygon(surf, color2,
		[(x, y), (x, y+h), (x+d, y+h-d), (x+w-d, y+d), (x+w, y)]
	)
	surf.fill(color, (x+d, y+d, w-2*d, h-2*d))


class Menu(object):
	fonts = {}
	textcache = {}
	def __init__(self):
		self.sx, self.sy = settings.screenx, settings.screeny
		self.surf = pygame.Surface((self.sx, self.sy)).convert_alpha()
		self.surf.fill((0,0,0,200))
		drawoutsetbox(self.surf, 15, 15, self.sx-30, self.sy-30, 6)
		self.buttons = {}

	def addinfotext(self, t, p):
		text.drawtext(self.surf, t, 32, (255,0,255), p, ocolor=(0,0,0), width = 300)

	def addbutton(self, name, t, x, y, w, h, color = (100, 100, 100)):
		self.buttons[name] = pygame.Rect(x, y, w, h)
		drawoutsetbox(self.surf, x, y, w, h, 3, color)
		text.drawtext(self.surf, t, 32, (255, 255, 255), (x + w//2, y + h//2), ocolor = (0,0,0))

	def addoption(self, name, t, topt, color = (100, 100, 100)):
		x, y, w, h = 60, 200 + 50 * len(self.buttons), 100, 40
		self.addbutton(name, t, x, y, w, h, color)
		text.drawtext(self.surf, topt, 26, (255, 255, 255), (x + w + 10, y + h // 2),
			ocolor = (0,0,0), anchor="midleft", width = 200)
	
	def draw(self, screen):
		screen.blit(self.surf, (0, 0))

	def checkclick(self, p):
		for name, rect in self.buttons.items():
			if rect.collidepoint(p):
				return name
		return None

menu = None


def loadqinfo(qinfo):
	global menu
	menu = Menu()
	menu.addinfotext("This quest is mad awesome yo. You should do it.", (200, 100))
	menu.addoption("group", "Group", "Activate the node. Other players may join you.", (0,100,0))
	menu.addoption("solo", "Solo", "Activate the node. Other players will be locked out.", (0,100,0))
	menu.addoption("cancel", "Cancel", "Do not activate the node at this time.", (100,0,0))
	

