import random
from OpenGL.GL import *

import text, settings, cursor, things, state, info, scene


buttons = {}
labels = {}
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

class UnlaunchButton(SubButton):
	def __init__(self, ltype):
		self.ltype = ltype
		name = "unlaunch" + ltype.__name__.lower()
		words = (ltype.shortname or ltype.__name__).upper()
		SubButton.__init__(self, name, words)

class HelpButton(SubButton):
	width0 = 11
	def __init__(self, helpname):
		self.helpname = helpname.replace("~", " ")
		name = "help" + helpname
		words = self.helpname.upper()
		SubButton.__init__(self, name, words)

class LevelButton(SubButton):
	def __init__(self, n):
		self.n = n
		name = "level%s" % n
		words = info.levelname[n]
		SubButton.__init__(self, name, words)



class Textbox(object):
	fontname = "Homenaje"
	size0 = 2
	color = 255, 255, 255
	hanchor = 0.5
	vanchor = 1
	fadespeed = 4
	def __init__(self, name, x, y):
		self.name = name
		self.text = None
		self.nexttext = None
		self.x = x
		self.y = y
		self.alpha = 0
		labels[name] = self

	def settext(self, text=None):
		if text == self.text:
			return
		self.nexttext = text or ""
	
	def think(self, dt):
		if self.nexttext is not None:
			self.alpha -= self.fadespeed * dt
			if self.alpha <= 0:
				self.alpha, self.text, self.nexttext = 0, self.nexttext, None
		elif self.text:
			self.alpha = min(self.alpha + self.fadespeed * dt, 1)
		else:
			self.text, self.alpha = None, 0
		
	def draw(self):
		if not self.text:
			return
		text.write(self.text, self.fontname, self.size, self.color, (self.x, self.y), (0, 0, 0),
			self.hanchor, self.vanchor, alpha=self.alpha)

	def __nonzero__(self):
		return self.text or self.nexttext




def f(size):
	return int(round(size * settings.sy / 32.0))

def init():
	for cls in [Button, SubButton, BuildButton, LaunchButton, HelpButton]:
		cls.size = f(cls.size0)
		cls.indent = f(cls.indent0)
		cls.width = f(cls.width0)
	for cls in [Textbox]:
		cls.size = f(cls.size0)

	buttons.clear()
	Button("build", "BUILD")
	Button("disable", "DISABLE")
	Button("launch", "LAUNCH")
	Button("unbuild", "UNBUILD")
	Button("unlaunch", "UNLAUNCH")
	Button("help", "HELP")
	Button("quit", "QUIT")
	Button("back", "BACK")
	SubButton("confirmquit", "CONFIRM")
	BuildButton(things.Collector)
	BuildButton(things.Extractor)
	BuildButton(things.Cleaner)
	BuildButton(things.Launcher)
	BuildButton(things.Satcon)
	BuildButton(things.WRelay)
	BuildButton(things.BRelay)
	BuildButton(things.RRelay)
	BuildButton(things.WBasin)
	BuildButton(things.BBasin)
	BuildButton(things.RBasin)
	LaunchButton(things.WSat)
	LaunchButton(things.RSat)
	LaunchButton(things.BSat)
	UnlaunchButton(things.WSat)
	UnlaunchButton(things.RSat)
	UnlaunchButton(things.BSat)

	HelpButton("controls")
	HelpButton("more~controls")
	HelpButton("wonderflonium")

	Textbox("cursor", settings.sx/2, settings.sy - f(3))
	Textbox("instructions", settings.sx/2, settings.sy - f(3))
	Textbox("helppage", settings.sx/2, settings.sy - f(3))

	Button("selectlevel", "MISSION")
	Button("quitgame", "QUIT")
	LevelButton(0)
	LevelButton(1)
	LevelButton(2)

	
	mainmode()
	for button in buttons.values():
		button.jump()


def think(dt):
	for button in buttons.values():
		button.think(dt)
	for label in labels.values():
		label.think(dt)
	labels["cursor"].settext("Click to build" if cursor.tobuild else None)

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
	labels["helppage"].settext()
	labels["instructions"].settext()
	cursor.disable = False
	setmode("main", "build disable unbuild launch unlaunch help quit")

def buildmode():
	setmode("build", "build buildcollector buildextractor buildcleaner buildlauncher buildsatcon buildwrelay buildbrelay buildrrelay buildwbasin buildbbasin buildrbasin back")

def launchmode():
	setmode("launch", "launch launchwsat launchrsat launchbsat back")

def disablemode():
	cursor.tobuild = None
	cursor.disable = True
	labels["instructions"].settext("Click to disable or enable structures\nDisabled structures will not consume or transmit Wonderflonium")
	setmode("disable", "disable back")

def unbuildmode():
	cursor.tobuild = None
	cursor.unbuild = True
	labels["instructions"].settext("Click to remove structure")
	setmode("unbuild", "unbuild back")

def unlaunchmode():
	cursor.tobuild = None
	setmode("unlaunch", "unlaunch unlaunchwsat unlaunchrsat unlaunchbsat back")

def helpmode():
	setmode("help", "help helpcontrols helpmore~controls helpwonderflonium back")

def quitmode():
	setmode("quit", "quit confirmquit back")


def menumode():
	setmode("menu", "selectlevel level0 level1 level2 quitgame")

def draw():
	for b in buttons.values():
		b.draw()
	for l in labels.values():
		l.draw()

	texts = state.infotext
	
	y = 0
	for t in texts:
		text.write(t, "Homenaje", f(1.5), (255, 255, 255), (settings.sx, settings.sy - y), (0, 0, 0), 1, 1)
		y += f(2)

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
#		mainmode()
	if bname == "launch":
		if mode == "main":
			launchmode()
		elif mode == "launch":
			mainmode()
	elif bname.startswith("launch"):
		state.launch(buttons[bname].ltype)
#		mainmode()

	if bname == "help":
		if mode == "main":
			helpmode()
		elif mode == "help":
			mainmode()
	elif bname.startswith("help"):
		labels["helppage"].settext(info.help[buttons[bname].helpname])

	if bname == "unbuild":
		if mode == "main":
			unbuildmode()
		elif mode == "unbuild":
			mainmode()

	if bname == "unlaunch":
		if mode == "main":
			unlaunchmode()
		elif mode == "unlaunch":
			mainmode()
	elif bname.startswith("unlaunch"):
		state.unlaunch(buttons[bname].ltype)
#		mainmode()

	if bname == "disable":
		if mode == "main":
			disablemode()
		elif mode == "disable":
			mainmode()

	if bname == "back":
		mainmode()

	if bname == "quit":
		quitmode()

	if (bname == "confirmquit" and mode == "quit") or bname == "quitgame":
		scene.top().playing = False

	if bname.startswith("level"):
		scene.top().playing = False
		scene.top().selected = buttons[bname].n


