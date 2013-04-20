import pygame
import settings, text, data, dialog, util, time, random

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
		if name == "filter":
			img = pygame.image.load(data.filepath("psychofilter.png")).convert_alpha()
			pics[name] = pygame.transform.smoothscale(img, (settings.screenx, settings.screeny))
	return pics[name]

class Menu(object):
	fonts = {}
	textcache = {}
	def __init__(self, clear = True, size = None, dx = 0, dy = 0):
		self.sx, self.sy = settings.screenx, settings.screeny
		self.surf = pygame.Surface((self.sx, self.sy)).convert_alpha()
		if clear:
			self.surf.fill((0,0,0,200))
		else:
			self.surf.fill((0,0,0,0))
		w, h = size or (824, 450)
		self.rect = pygame.Rect((0, 0, w, h))
		self.rect.center = self.sx // 2 + dx, self.sy // 2 + dy
		drawoutsetbox(self.surf, self.rect.x, self.rect.y, self.rect.w, self.rect.h, 6)
		self.buttons = {}
		self.next = None

	def darken(self):
		f = self.surf.copy()
		f.fill((0,0,0,128))
		self.surf.blit(f, (0, 0))

	def addinfotext(self, t):
		x = self.rect.x + 20
		y = self.rect.y + 100
		w = self.rect.width - 300
		text.drawtext(self.surf, t, 25, (255,0,255), (x, y), ocolor=(0,0,0), width = w, anchor="topleft",
			fontname="LondrinaSolid")

	def addbutton(self, name, t, x, y, w, h, color = (100, 100, 100)):
		self.buttons[name] = pygame.Rect(x, y, w, h)
		drawoutsetbox(self.surf, x, y, w, h, 3, color)
		text.drawtext(self.surf, t, 32, (255, 255, 255), (x + w//2, y + h//2), ocolor = (0,0,0),
			fontname="JockeyOne")

	def addnav(self):
		self.addbutton("next", "Next",
			self.rect.right - 180, self.rect.top + 320 + 50 * len(self.buttons), 100, 40,
			(100, 100, 100)
		)
		self.addbutton("cancel", "Skip",
			self.rect.right - 180, self.rect.top + 320 + 50 * len(self.buttons), 100, 40,
			(100, 0, 0)
		)

	def addoption(self, name, t, topt, color = (100, 100, 100), w = 100):
		x, y, w, h = self.rect.left + 60, self.rect.top + 280 + 50 * len(self.buttons), w, 40
		self.addbutton(name, t, x, y, w, h, color)
		text.drawtext(self.surf, topt, 20, (255, 255, 255), (x + w + 10, y + h // 2),
			ocolor = (0,0,0), anchor="midleft", width = self.rect.width - 240,
			fontname="Audiowide")
	
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

	def drawfullalien(self):
		self.surf.fill((0,0,0))
		img = pygame.image.load(data.filepath("original", "spacebird_complete1.jpg"))
		rect = img.get_rect(center = self.surf.get_rect().center)
		self.surf.blit(img, rect)

	def addorders(self, t):
		text.drawtext(self.surf, t + "|", 22, (0, 255, 0), (self.rect.x + 20, self.rect.y + 15),
			ocolor = (0,0,0), anchor="topleft", width = self.rect.width - 240,
			fontname = "MeriendaOne")

	def adddialog(self, t):
		text.drawtext(self.surf, t, 24, (255, 128, 0), (self.rect.centerx, self.rect.y + 232),
			ocolor = (0,0,0), anchor="midtop", width = self.rect.width - 60,
			fontname = "Audiowide")

	def addmessage(self, t):
		text.drawtext(self.surf, t, 32, (200, 200, 200), self.rect.center,
			ocolor = (0,0,0), width = self.rect.width - 20, fontname = "Viga")

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

	def addicon(self, img):
		rect = img.get_rect(topleft = (self.rect.x + 30, self.rect.y + 30))
		self.surf.blit(img, rect)

	def adddname(self, t):
		text.drawtext(self.surf, t, 40, (255, 255, 255), (self.rect.x + 120, self.rect.y + 30),
			ocolor = (0,0,0), anchor="topleft", width = self.rect.width - 140, fontname = "Homenaje")

	def adddescription(self, t):
		text.drawtext(self.surf, t, 24, (255, 255, 255), (self.rect.x + 20, self.rect.y + 130),
			ocolor = (0,0,0), anchor="topleft", width = self.rect.width - 40, fontname = "LondrinaSolid")

	def addcost(self, t):
		text.drawtext(self.surf, t, 20, (128, 128, 128), (self.rect.x + 20, self.rect.bottom - 20),
			ocolor = (0,0,0), anchor="bottomleft", width = self.rect.width - 40, fontname = "Viga")

	def addcredits(self):
		text.drawtext(self.surf, "Last Will of the Emtar", 48, (255, 128, 128),
			(self.rect.centerx, self.rect.centery - 60),
			ocolor = (0,0,0), d = 4, anchor="midbottom", width = self.rect.width - 40, fontname = "RuslanDisplay")
		text.drawtext(self.surf,
			"by Christopher Night|music by Kevin MacLeod (incompetech.com)|",
			30, (128, 128, 255), (self.rect.centerx, self.rect.centery - 60),
			ocolor = (0,0,0), d = 4, anchor="midtop", width = self.rect.width - 40, fontname = "JockeyOne")

	def addfilter(self):
		self.surf.blit(getpic("filter"), (0, 0))

	def clickanywhere(self):
		self.buttons["cancel"] = pygame.Rect((0, 0, self.sx, self.sy))

	def clicktoadvance(self):
		self.buttons["next"] = pygame.Rect((0, 0, self.sx, self.sy))


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
		if tname == "joinboss":
			menu.addfilter()
		lastmenu = menu

def loadunlockboss(bosscode):
	menu = Menu()
	stack.append(menu)

	texts = dialog.unlockboss
	lastmenu = None
	for t in texts:
		if "%s" in t:
			t = t % bosscode
		if lastmenu:
			menu = Menu()
			lastmenu.next = menu
		menu.addcaptain()
		menu.addorders(t)
		menu.addnav()
		menu.addfilter()
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
#		menu.addnav()
		menu.clicktoadvance()
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
		import clientstate
		menu.addinfotext("Unlocking this node will show The Last Will of the Emtar, recording #%s of 3" % (clientstate.you.story + 1))
	else:
		tex = (
			"Difficulty: %s|" +
			"Unlocking this node will have the following effects:|" +
			"~~~Grant you %s resource units.|" +
			"~~~Grant you %s experience points.|" +
			"~~~Make visible tiles out to %s units."
		) % (qinfo["difficulty"], qinfo["coins"], qinfo["xp"], qinfo["range"])
		if qinfo["bonus"]:
			tex += "|~~~Grant you 1 special item."
		menu.addinfotext(tex)
	menu.addoption("qaccept-group", "Group", "Unlock the node. Other players may join you.", (0,100,0))
	menu.addoption("qaccept-solo", "Solo", "Unlock the node. Other players will be locked out from this area.", (0,100,0))
	menu.addoption("cancel", "Cancel", "Do not unlock the node at this time.", (100,0,0))


def loadmessage(message):
	menu = Menu(size = (300, 100))
	stack.append(menu)
	menu.addmessage(message)
	menu.clickanywhere()

hudboxes = {}
def gethudbox(dname, unlocked):
	import vista
	if dname[-1] in "123":
		dname = dname[:-1] + "0"
	if dname == "special":  # TODO
		dname = "none"
	key = dname, unlocked
	if key in hudboxes:
		return hudboxes[key]
	box = Menu(clear = False, size = (420, 400), dx = -100)
	box.addicon(vista.gettileimg(1, None, dname, 0, True, z = 80))
	box.adddname(dialog.dnames[dname])
	box.adddescription(dialog.descriptions[dname])
	if dname not in ("none", "special"):
		if unlocked:
			box.addcost("To use: %s Credits" % settings.devicecost[dname])
		else:
			box.addcost("To unlock: %s XP" % settings.devicexp[dname])
	hudboxes[key] = box
	return box

def loadtitle():
	menu = Menu()
	stack.append(menu)
	menu.drawfullalien()
	menu.darken()
	menu.addcredits()
	menu.addoption("join", "Join Server", "", w = 200)
	if util.getbosscode():
		menu.addoption("joinboss", "Join Boss Server", "", w = 200)
	menu.addoption("quit", "Quit", "", w = 200)


class Collapse(object):
	def __init__(self):
		self.t0 = time.time()
		self.sx, self.sy = settings.screenx, settings.screeny
		self.surf = pygame.Surface((self.sx, self.sy)).convert_alpha()
	def draw(self, screen):
		import vista
		t = time.time() - self.t0
		if t > 7:
			advance()
		vista.camerax0 += random.uniform(-1, 1) * t * 2
		vista.cameray0 += random.uniform(-1, 1) * t * 2
		a = min(int(t / 4 * 255), 255)
		self.surf.fill((255,255,255,a))
		screen.blit(self.surf, (0, 0))
	def checkclick(self, pos):
		return False
		

def loadgameover():
	clear()
	collapse = Collapse()
	credits = Menu()
	credits.drawfullalien()
	credits.darken()
	credits.addcredits()
	credits.clicktoadvance()
	endtitle = Menu(size = (300, 120))
	endtitle.addmessage("Last Will of Theresa Nayrano")
	endtitle.clicktoadvance()
	loadtraining("last")
	stinger = stack.pop()
	
	collapse.next = credits
	credits.next = endtitle
	endtitle.next = stinger
	stack.append(collapse)
	



