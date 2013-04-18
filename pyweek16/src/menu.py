import pygame
import settings, text, data, dialog

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
			img = pygame.image.load(data.filepath("captain.jpg")).convert_alpha()
			pics[name] = pygame.Surface((img.get_width() + 6, img.get_height() + 3)).convert_alpha()
			drawoutsetbox(pics[name], 0, 0, pics[name].get_width(), pics[name].get_height(), 3)
			pics[name].blit(img, (3, 3))
		if name == "alien":
			img = pygame.image.load(data.filepath("emtar.jpg")).convert_alpha()
			pics[name] = pygame.Surface((img.get_width() + 6, img.get_height() + 3)).convert_alpha()
			drawoutsetbox(pics[name], 0, 0, pics[name].get_width(), pics[name].get_height(), 3)
			pics[name].blit(img, (3, 3))
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
		self.next = None

	def addinfotext(self, t):
		x = self.rect.x + 20
		y = self.rect.y + 100
		w = self.rect.width - 300
		text.drawtext(self.surf, t, 25, (255,0,255), (x, y), ocolor=(0,0,0), width = w, anchor="topleft")

	def addbutton(self, name, t, x, y, w, h, color = (100, 100, 100)):
		self.buttons[name] = pygame.Rect(x, y, w, h)
		drawoutsetbox(self.surf, x, y, w, h, 3, color)
		text.drawtext(self.surf, t, 32, (255, 255, 255), (x + w//2, y + h//2), ocolor = (0,0,0))

	def addnav(self):
		self.addbutton("next", "Next",
			self.rect.right - 180, self.rect.top + 320 + 50 * len(self.buttons), 100, 40,
			(100, 100, 100)
		)
		self.addbutton("cancel", "Skip",
			self.rect.right - 180, self.rect.top + 320 + 50 * len(self.buttons), 100, 40,
			(100, 0, 0)
		)

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
		self.surf.blit(img, rect)

	def addalien(self):
		img = getpic("alien")
		rect = img.get_rect()
		rect.top = self.rect.top + 20
		rect.centerx = self.rect.centerx
		self.surf.blit(img, rect)

	def addorders(self, t):
		text.drawtext(self.surf, t, 32, (0, 255, 0), (self.rect.x + 20, self.rect.y + 20),
			ocolor = (0,0,0), anchor="topleft", width = self.rect.width - 360)

	def adddialog(self, t):
		text.drawtext(self.surf, t, 32, (255, 128, 0), (self.rect.centerx, self.rect.y + 200),
			ocolor = (0,0,0), anchor="midtop", width = self.rect.width - 360)

	def adddiagram(self, dname):
		import vista
		x0, y0 = self.rect.left + 240, self.rect.top + 280
		if dname == "activetile":
			self.surf.blit(vista.gettileimg(1, (1,1,0,0), None, 0, True, z = 80), (x0, y0))
			self.surf.blit(vista.gettileimg(1, (1,0,0,0), None, 0, False, z = 80), (x0, y0-80))
			self.surf.blit(vista.gettileimg(1, (1,1,0,1), None, 0, False, z = 80), (x0-80, y0))
			self.surf.blit(vista.gettileimg(1, (1,0,1,0), None, 0, False, z = 80), (x0+80, y0))
			self.surf.blit(vista.gettileimg(1, (1,0,0,1), None, 0, False, z = 80), (x0, y0+80))
		elif dname == "resource":
			self.surf.blit(vista.gettileimg(1, (1,1,0,0), "coin", 0, True, z = 80), (x0, y0))


stack = []
def top():
	return stack[-1] if stack else None
def pop():
	if stack:
		stack.pop()
def clear():
	del stack[:]
def advance():
	if not stack:
		return
	m = stack.pop()
	if m.next:
		stack.append(m.next)

def loadtraining(tname):
	menu = Menu()
	stack.append(menu)

	texts = dialog.train[tname]
	lastmenu = None
	for t in texts:
		if "@" in t:
			diagram, t = t.split("@")
		else:
			diagram = None
		if lastmenu:
			menu = Menu()
			lastmenu.next = menu
		menu.addcaptain()
		menu.addorders(t)
		if diagram:
			menu.adddiagram(diagram)
		menu.addnav()
		lastmenu = menu

def loadcutscene(sname):
	menu = Menu()
	stack.append(menu)

	texts = dialog.cutscene[sname]
	lastmenu = None
	for t in texts:
		if lastmenu:
			menu = Menu()
			lastmenu.next = menu
		menu.addalien()
		menu.adddialog(t)
		menu.addnav()
		lastmenu = menu



def loadqinfo(qinfo):
	menu = Menu()
	stack.append(menu)
	menu.qinfo = qinfo
	menu.addcaptain()

	if qinfo["t"] == "record":
		tex = "Record Nodes are useless. They just have recordings left over. Don't bother unlocking them."
	else:
		tex = {
			"ops": "Operations Nodes give you extra experience points, which you need to unlock abilities.",
			"resource": "Resource Nodes give you extra resources. It's faster than flipping tiles one at a time.",
			"scan": "Scanner Nodes reveal tiles out to a greater distance, good for exploration.",
			"supply": "Supply Nodes give you a special item that can be used in unlocking a later node.",
		}[qinfo["t"]]
	menu.addorders(tex)


	if qinfo["t"] == "record":
		menu.addinfotext("Unlocking this node will show The Last Will of the Emtar, recording #1 of 5")
	else:
		tex = (
			"Difficulty: %s|" +
			"Unlocking this node will have the following effects:|" +
			"~~~Grant you %s resource units.|" +
			"~~~Grant you %s experience units.|" +
			"~~~Make visible tiles out to %s units."
		) % (qinfo["difficulty"], qinfo["coins"], qinfo["xp"], qinfo["range"])
		if qinfo["bonus"]:
			tex += "|~~~Grant you 1 special item."
		menu.addinfotext(tex)
	menu.addoption("qaccept-group", "Group", "Unlock the node. Other players may join you.", (0,100,0))
	menu.addoption("qaccept-solo", "Solo", "Unlock the node. Other players will be locked out from this area.", (0,100,0))
	menu.addoption("cancel", "Cancel", "Do not unlock the node at this time.", (100,0,0))
	

