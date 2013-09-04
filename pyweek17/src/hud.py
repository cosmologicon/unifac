import random
from OpenGL.GL import *

import text, settings, cursor, things, state


buttons = {}
mode = None


class Button(object):
	fontname = "Homenaje"
	size0 = 2
	# Text color in normal mode
	color = 222, 222, 255
	# Colors of the box in normal mode
	boxcolor0 = 1, 1, 1, 0.1
	boxcolor1 = 0, 0.5, 1, 0.3
	indent0 = 1
	width0 = 9
	frac = 1

	point = False
	pointcolor = 255, 255, 255, 100

	def __init__(self, name, words, p=None):
		self.name = name
		self.words = words
		self.x, self.y = p or (0, 0)
		self.target = None
		buttons[self.name] = self
	def draw(self):
		if self.x <= -1.5 * self.width:
			return
		if self.point:
			boxcolor = self.pointcolor
		else:
			boxcolor = self.boxcolor0
		x, y = self.x + self.indent, self.y
		w, h = self.width, self.size * 1.2
		w2 = w * self.frac
		f = h * 0.2
		d = h * 0.1
		boxcolor0 = self.boxcolor0
		boxcolor1 = self.boxcolor1

		glDisable(GL_TEXTURE_2D)
		glBegin(GL_QUADS)
		glColor(*boxcolor0)
		glVertex(x-w, y)
		glVertex(x+w+f, y)
		glVertex(x+w, y-h)
		glVertex(x-w, y-h)
		glColor(*boxcolor1)
		glVertex(x-w, y+d)
		glVertex(x+w2-d+f, y+d)
		glVertex(x+w2-d, y-h+d)
		glVertex(x-w, y-h+d)
		glEnd()


		glEnable(GL_TEXTURE_2D)
		glColor(1, 1, 1)
		text.write(self.words, self.fontname, self.size, self.color, (x, y), None, 0, 1)
	def seek(self, p=None):
		self.target = p
	def jump(self):
		if self.target:
			self.x, self.y = self.target
		else:
			self.x = -2 * self.width
	def think(self, dt):
		x, y = self.target or (-2 * self.width, self.y)
		self.x += 6 * dt * (x - self.x)
		self.y += 12 * dt * (y - self.y)
			
	def __contains__(self, (x, y)):
		return 0 <= x - self.x <= self.width + self.size * 0.6 and 0 <= self.y - y <= self.size * 1.1


class SubButton(Button):
	size0 = 1.5
	color = 222, 222, 255
	boxcolor0 = 1, 1, 1, 0.1
	boxcolor1 = 0, 0, 0.8, 0.3
	indent0 = 2
	width0 = 6


class BuildButton(SubButton):
	def __init__(self, btype):
		self.btype = btype
		name = "build" + btype.__name__.lower()
		words = (btype.shortname or btype.__name__).upper()
		SubButton.__init__(self, name, words)

class LaunchButton(SubButton):
	def __init__(self, ltype):
		self.ltype = ltype
		name = "launch" + ltype.__name__.lower()
		words = (ltype.shortname or ltype.__name__).upper()
		SubButton.__init__(self, name, words)

def f(size):
	return int(round(size * settings.sy / 32.0))

def init():
	for cls in [Button, SubButton]:
		cls.size = f(cls.size0)
		cls.indent = f(cls.indent0)
		cls.width = f(cls.width0)

	buttons.clear()
	Button("build", "BUILD")
	Button("launch", "LAUNCH")
	Button("unbuild", "UNBUILD")
	Button("unlaunch", "UNLAUNCH")
	BuildButton(things.Collector)
	BuildButton(things.Extractor)
	BuildButton(things.WRelay)
	BuildButton(things.BRelay)
	BuildButton(things.RRelay)
	BuildButton(things.WBasin)
	BuildButton(things.BBasin)
	BuildButton(things.RBasin)
	LaunchButton(things.WSat)
	LaunchButton(things.RSat)
	LaunchButton(things.BSat)

	
	mainmode()
	for button in buttons.values():
		button.jump()


def think(dt):
	for button in buttons.values():
		button.think(dt)

def setmode(modename, bnames):
	global mode
	mode = modename
	for button in buttons.values():
		button.seek()
	y = settings.sy - f(1)
	for bname in bnames.split():
		buttons[bname].seek((0, y))
		y -= buttons[bname].size * 1.2 + f(0.5)

def mainmode():
	setmode("main", "build launch unbuild unlaunch")

def buildmode():
	setmode("build", "build buildcollector buildextractor buildwrelay buildbrelay buildrrelay buildwbasin buildbbasin buildrbasin")

def launchmode():
	setmode("launch", "launch launchwsat launchrsat launchbsat")

def draw():
	for b in buttons.values():
		b.draw()

	if state.restext[0]:
		text.write(state.restext[0], "Homenaje", 22, (255, 255, 255), (settings.sx, settings.sy), (0, 0, 0), 1, 1)
	if state.restext[1]:
		text.write(state.restext[1], "Homenaje", 22, (120, 120, 255), (settings.sx, settings.sy - 30), (0, 0, 0), 1, 1)
	if state.restext[2]:
		text.write(state.restext[2], "Homenaje", 22, (255, 120, 120), (settings.sx, settings.sy - 60), (0, 0, 0), 1, 1)

def point((x, y)):
	for bname, button in buttons.items():
		if (x, y) in button:
			button.point = True
		else:
			button.point = False

def click((x, y)):
	for bname, button in buttons.items():
		if (x, y) in button:
			clickon(bname)
			return True
	

def clickon(bname):
	if bname == "build":
		if mode == "main":
			buildmode()
		elif mode == "build":
			mainmode()
	elif bname.startswith("build"):
		cursor.tobuild = buttons[bname].btype
		mainmode()
	if bname == "launch":
		if mode == "main":
			launchmode()
		elif mode == "launch":
			mainmode()
	elif bname.startswith("launch"):
		state.launch(buttons[bname].ltype)
		mainmode()


