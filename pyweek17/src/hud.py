import random
import text, settings, cursor, things


buttons = {}
mode = None

class Button(object):
	size0 = 2
	color = 222, 222, 255
	boxcolor0 = 0, 0, 255, 100
	boxcolor1 = 255, 255, 255, 50
	indent0 = 1
	width0 = 5

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
		text.drawbutton(self.words, self.size, self.color, (self.x, self.y), boxcolor, self.boxcolor1, self.indent, self.width)
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
	boxcolor0 = 0, 0, 255, 100
	boxcolor1 = 255, 255, 255, 50
	indent0 = 2
	width0 = 6
	

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
	SubButton("bsatcon", "SATCON")
	SubButton("brelay", "RELAY")

	SubButton("wsat", "W.SAT")
	SubButton("rsat", "R.SAT")
	SubButton("bsat", "B.SAT")


	
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
		y -= buttons[bname].size + f(0.5)

def mainmode():
	setmode("main", "build launch")

def buildmode():
	setmode("build", "build brelay bsatcon")

def launchmode():
	setmode("launch", "launch wsat rsat bsat")

def draw():
	for b in buttons.values():
		b.draw()

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
	if bname == "launch":
		if mode == "main":
			launchmode()
		elif mode == "launch":
			mainmode()

	if bname == "bsatcon":
		cursor.tobuild = things.Tower
		mainmode()




