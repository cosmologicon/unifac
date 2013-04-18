import pygame
import settings, text, data

def drawoutsetbox(surf, x, y, w, h, d, color = (50, 50, 50)):
	color1 = tuple(int(a * 0.6) for a in color)
	color2 = tuple(min(int(a * 1.4), 255) for a in color)
	surf.fill(color1, (x, y, w, h))
	pygame.draw.polygon(surf, color2,
		[(x, y), (x, y+h), (x+d, y+h-d), (x+w-d, y+d), (x+w, y)]
	)
	surf.fill(color, (x+d, y+d, w-2*d, h-2*d))


pics = {}
def getpic(name):
	if name not in pics:
		if name == "captain":
			pics[name] = pygame.Surface((200, 200)).convert_alpha()
			pics[name].fill((0,255,0))
	return pics[name]

class Menu(object):
	fonts = {}
	textcache = {}
	def __init__(self):
		self.sx, self.sy = settings.screenx, settings.screeny
		self.surf = pygame.Surface((self.sx, self.sy)).convert_alpha()
		self.surf.fill((0,0,0,200))
		self.rect = pygame.Rect((0, 0, self.sx - 30, self.sy - 30))
		self.rect.center = self.sx // 2, self.sy // 2
		drawoutsetbox(self.surf, self.rect.x, self.rect.y, self.rect.w, self.rect.h, 6)
		self.buttons = {}

	def addinfotext(self, t):
		x = self.rect.x + 20
		y = self.rect.y + 100
		w = self.rect.width - 300
		text.drawtext(self.surf, t, 25, (255,0,255), (x, y), ocolor=(0,0,0), width = w, anchor="topleft")

	def addbutton(self, name, t, x, y, w, h, color = (100, 100, 100)):
		self.buttons[name] = pygame.Rect(x, y, w, h)
		drawoutsetbox(self.surf, x, y, w, h, 3, color)
		text.drawtext(self.surf, t, 32, (255, 255, 255), (x + w//2, y + h//2), ocolor = (0,0,0))

	def addoption(self, name, t, topt, color = (100, 100, 100)):
		x, y, w, h = self.rect.left + 60, self.rect.top + 280 + 50 * len(self.buttons), 100, 40
		self.addbutton(name, t, x, y, w, h, color)
		text.drawtext(self.surf, topt, 26, (255, 255, 255), (x + w + 10, y + h // 2),
			ocolor = (0,0,0), anchor="midleft", width = self.rect.width - 240)
	
	def draw(self, screen):
		screen.blit(self.surf, (0, 0))

	def checkclick(self, p):
		for name, rect in self.buttons.items():
			if rect.collidepoint(p):
				return name
		return None

	def addcaptain(self):
		img = getpic("captain")
		rect = img.get_rect()
		rect.top = self.rect.top + 20
		rect.right = self.rect.right - 20
		print rect
		self.surf.blit(img, rect)

	def addorders(self, t):
		text.drawtext(self.surf, t, 32, (0, 255, 0), (self.rect.x + 20, self.rect.y + 20),
			ocolor = (0,0,0), anchor="topleft", width = self.rect.width - 300)


stack = []
def top():
	return stack[-1] if stack else None
def pop():
	if stack:
		del stack[-1]
def clear():
	del stack[:]

def loadqinfo(qinfo):
	menu = Menu()
	stack.append(menu)
	menu.qinfo = qinfo
	menu.addcaptain()

	if qinfo["t"] == "record":
		tex = "Recording Nodes are useless. They just have recordings left over. Don't bother unlocking them."
	else:
		tex = {
			"ops": "Operations Nodes give you extra experience points, which you need to unlock abilities.",
			"resource": "Resource Nodes give you extra resources. It's faster than flipping tiles one at a time.",
			"scan": "Scanner Nodes reveal tiles out to a greater distance, good for exploration.",
			"supply": "Supply Nodes give you a special item that can be used in unlocking a later node.",
		}[qinfo["t"]]
	menu.addorders(tex)


	if qinfo["t"] == "record":
		menu.addinfotext("Unlocking this node will show The Last Will of the Emtar, recording #1 of 5",
			(40, 180), 500)
	else:
		tex = (
			"Unlocking this node will have the following effects:|" +
			"~~~Grant you %s resource units.|" +
			"~~~Grant you %s experience units.|" +
			"~~~Make visible tiles out to %s units."
		) % (qinfo["coins"], qinfo["xp"], qinfo["range"])
		if qinfo["bonus"]:
			tex += "|~~~Grant you 1 special item."
		menu.addinfotext(tex)
	menu.addoption("qaccept-group", "Group", "Unlock the node. Other players may join you.", (0,100,0))
	menu.addoption("qaccept-solo", "Solo", "Unlock the node. Other players will be locked out from this area.", (0,100,0))
	menu.addoption("cancel", "Cancel", "Do not unlock the node at this time.", (100,0,0))
	

