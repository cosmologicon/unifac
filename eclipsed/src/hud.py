import random
from OpenGL.GL import *

import text, settings, cursor, things, state, info, scene, sound, graphics


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
	soundname = "select"

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

	def onpoint(self):
		return None


class SubButton(Button):
	size0 = 1.5
	color = 222, 222, 255
	boxcolor0 = 1, 1, 1, 0.1
	boxcolor1 = 0, 0, 0.8, 0.3
	indent0 = 2
	width0 = 10


class BuildButton(SubButton):
	def __init__(self, btype):
		self.btype = btype
		name = "build" + btype.__name__.lower()
		words = (btype.shortname or btype.__name__).upper()
		SubButton.__init__(self, name, words)

	def draw(self):
		self.color = (222, 222, 255) if self.frac >= 1 else (111, 111, 155)
		SubButton.draw(self)

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
		return bool(self.text or self.nexttext)

class Warnbox(Textbox):
	color = 255, 128, 128
	size0 = 2.5
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy/2)

class Statusbox(Textbox):
	hanchor = 1
	fontname = "Viga"
	size0 = 1.2
	
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx - f(0.3), settings.sy - f(0.2))

	def draw(self):
		if not self.text:
			return
		y = self.y
		for t, color in self.text:
			text.write(t, self.fontname, self.size, color, (self.x, y), (0, 0, 0),
				self.hanchor, self.vanchor)
			y -= int(self.size * 1.4)
			
	def think(self, dt):
		pass

	def settext(self, text=None):
		self.text = text

class Titlebox(Textbox):
	color = 255, 255, 255
	size0 = 5
	vanchor = 0.5
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy*0.65)
	
	def draw(self):
		if not self.text:
			return
		text.write(self.text[0], self.fontname, self.size, self.color, (self.x, self.y), (0, 0, 0),
			self.hanchor, self.vanchor, alpha=self.alpha)
		text.write(self.text[1], self.fontname, int(self.size/3), self.color, (self.x, self.y - self.size), (0, 0, 0),
			self.hanchor, self.vanchor, alpha=self.alpha)

class Dialoguebox(Textbox):
	color = 220, 250, 220
	size0 = 3
	vanchor = 1
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy * 0.9)

class Leveltitlebox(Textbox):
	color = 255, 255, 255
	size0 = 5
	vanchor = 0.5
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy/2)
	
	def draw(self):
		if not self.text:
			return
		text.write(self.text[0], self.fontname, int(self.size/3), self.color, (self.x, self.y + self.size * 0.85), (0, 0, 0),
			self.hanchor, self.vanchor, alpha=self.alpha)
		text.write(self.text[1], self.fontname, self.size, self.color, (self.x, self.y), (0, 0, 0),
			self.hanchor, self.vanchor, alpha=self.alpha)
		text.write(self.text[2], self.fontname, int(self.size/3), self.color, (self.x, self.y - self.size * 0.85), (0, 0, 0),
			self.hanchor, self.vanchor, alpha=self.alpha)


class Endtitlebox(Textbox):
	fontname = "Homenaje"
	size0 = 6
	color = 255, 255, 255
	hanchor = 0.5
	vanchor = 0.5
	fadespeed = 4
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy/2)



class Buildinfobox(Textbox):
	color = 180, 180, 180
	size0 = 2
	vanchor = 1
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy - f(3))

	def setbuilding(self, bname=None):
		if not bname:
			self.settext()
		else:
			self.bname = bname[5:]
			if not self.text:
				self.nexttext = True
	
	def draw(self):
		if not self.text:
			return
		y = [self.y]
		btype = buttons["build" + self.bname].btype
		def write(t, dsize, color, fontname=None):
			text.write(t, (fontname or self.fontname), int(self.size * dsize), color, (self.x, y[0]), (0, 0, 0),
				self.hanchor, self.vanchor, alpha=self.alpha)
			y[0] -= int(self.size * dsize * 1.5)
		write(btype.longname, 1, self.color)
		for line in btype.info.splitlines():
			write(line, 0.7, self.color)
		y[0] -= int(self.size * 0.4)
		write("Power drain:", 0.7, self.color)
		for j, (color, cost) in enumerate(zip(info.pcolors, btype.pneeds)):
			if not cost:
				continue
			write("%s %s" % (cost, info.pnames[j]), 0.7, color, "Viga")
		y[0] -= int(self.size * 0.4)
		write("Cost to build:", 0.7, self.color)
		for j, (color, cost) in enumerate(zip(info.mcolors, btype.cost)):
			if not cost:
				continue
			write("%s %s" % (cost, info.mnames[j]), 0.7, color, "Viga")
			

class Launchinfobox(Textbox):
	color = 180, 180, 180
	size0 = 2
	vanchor = 1
	def __init__(self, name):
		Textbox.__init__(self, name, settings.sx/2, settings.sy - f(3))

	def setsat(self, bname=None):
		if not bname:
			self.settext()
		else:
			self.sname = bname[6:]
			if not self.text:
				self.nexttext = True
	
	def draw(self):
		if not self.text:
			return
		y = [self.y]
		btype = buttons["launch" + self.sname].ltype
		def write(t, dsize, color, fontname=None):
			text.write(t, (fontname or self.fontname), int(self.size * dsize), color, (self.x, y[0]), (0, 0, 0),
				self.hanchor, self.vanchor, alpha=self.alpha)
			y[0] -= int(self.size * dsize * 1.5)
		write(btype.longname, 1, self.color)
		y[0] -= int(self.size * 0.4)
		write("Power provided:", 0.7, self.color)
		for j, (color, cost) in enumerate(zip(info.pcolors, btype.gpower)):
			if not cost:
				continue
			write("%s %s" % (cost, info.pnames[j]), 0.7, color, "Viga")
		y[0] -= int(self.size * 0.4)
		write("Cost to build:", 0.7, self.color)
		for j, (color, cost) in enumerate(zip(info.mcolors, btype.cost)):
			if not cost:
				continue
			write("%s %s" % (cost, info.mnames[j]), 0.7, color, "Viga")


def f(size):
	return int(round(size * settings.sy / 32.0))

def init():
	for cls in [Button, SubButton, BuildButton, LaunchButton, HelpButton]:
		cls.size = f(cls.size0)
		cls.indent = f(cls.indent0)
		cls.width = f(cls.width0)
	for cls in [Textbox, Warnbox, Statusbox, Titlebox, Leveltitlebox, Buildinfobox, Launchinfobox, Endtitlebox, Dialoguebox]:
		cls.size = f(cls.size0)

	buttons.clear()
	Button("buildw", "BUILD (W)")
	Button("buildb", "BUILD (B)")
	Button("buildr", "BUILD (R)")
	Button("disable", "DISABLE")
	Button("launch", "LAUNCH")
	Button("unbuild", "UNBUILD")
	Button("unlaunch", "UNLAUNCH")
	Button("help", "HELP")
	Button("quit", "QUIT")
	Button("back", "BACK")
	Button("bcancel", "CANCEL")
	SubButton("savequit", "SAVE + QUIT")
	SubButton("abandonquit", "ABANDON + QUIT")
	BuildButton(things.Collector)
	BuildButton(things.WExtractor)
	BuildButton(things.BExtractor)
	BuildButton(things.RExtractor)
	BuildButton(things.Cleaner)
	BuildButton(things.Launcher)
	BuildButton(things.Satcon)
	BuildButton(things.Medic)
	BuildButton(things.WBooster)
	BuildButton(things.RBooster)
	BuildButton(things.BBooster)
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

	HelpButton("mission")
	HelpButton("controls")
	HelpButton("more~controls")
	HelpButton("power")
	HelpButton("satellites")
	HelpButton("satcon")

	Textbox("cursor", settings.sx/2, settings.sy - f(3))
	Textbox("instructions", settings.sx/2, settings.sy - f(3))
	Textbox("helppage", settings.sx/2, settings.sy - f(3))
	Warnbox("warning")
	Warnbox("powerwarning")
	Statusbox("status")
	Titlebox("title")
	Leveltitlebox("leveltitle")
	Buildinfobox("buildinfo")
	Launchinfobox("launchinfo")

	Button("selectlevel", "MISSION")
	Button("options", "OPTIONS")
	Button("credits", "CREDITS")
	Button("quitgame", "QUIT")
	LevelButton(0)
	LevelButton(1)
	LevelButton(2)
	LevelButton(3)
	SubButton("soundtoggle", "SOUND: ON")
	SubButton("musictoggle", "MUSIC: ON")
	SubButton("fullscreentoggle", "FULLSCREEN: OFF")
	buttons["soundtoggle"].words = "SOUND: %s" % ("ON" if settings.sound else "OFF")
	buttons["musictoggle"].words = "MUSIC: %s" % ("ON" if settings.music else "OFF")
	buttons["fullscreentoggle"].words = "FULLSCREEN: %s" % ("ON" if settings.fullscreen else "OFF")

	global endtitle, dialoguebox
	endtitle = Endtitlebox("endtitle")
	del labels["endtitle"]
	dialoguebox = Dialoguebox("dialogue")
	del labels["dialogue"]

	
	mainmode()
	for button in buttons.values():
		button.jump()


def think(dt):
	for button in buttons.values():
		button.think(dt)
	for label in labels.values():
		label.think(dt)
	endtitle.think(dt)
	dialoguebox.think(dt)

	if cursor.tobuild:
		labels["cursor"].settext("Click to build")
	elif cursor.disable:
		if cursor.pointingto:
			text = "Click to disable" if cursor.pointingto.enabled else "Click to enable"
			text += "\nDisabled structures will not consume or transmit Wonderflonium"
			labels["cursor"].settext(text)
		else:
			labels["cursor"].settext()
	elif cursor.unbuild:
		if cursor.pointingto:
			labels["cursor"].settext("Click to remove")
		else:
			labels["cursor"].settext()
	elif cursor.pointingto:
		labels["cursor"].settext(cursor.pointingto.qdescrip())
	else:
		labels["cursor"].settext()

def clearlabels():
	for label in labels.values():
		label.settext()

def setmode(modename, bnames):
	global mode
	mode = modename
	for button in buttons.values():
		button.seek()
	y = settings.sy - f(1)
	for bname in bnames.split():
		if settings.level is not None and bname in info.locked[settings.level]:
			continue
		buttons[bname].seek((0, y))
		y -= buttons[bname].size * 1.2 + f(0.5)

def setstatus():
	buttons["buildw"].frac = state.buildclock
	buttons["buildb"].frac = state.buildclock
	buttons["buildr"].frac = state.buildclock
	for bname, b in buttons.items():
		if bname.startswith("build") and len(bname) > 6:
			b.frac = min(state.buildclock / float(b.btype.buildclock), 1)
		if bname.startswith("launch") and bname.endswith("sat"):
			b.frac = min(state.launchclock / float(b.ltype.launchclock), 1)
	if not state.status:
		labels["status"].settext()
		return
	lines = []
	for j in range(3):
		lines.append((info.pnames[j], info.pcolors[j]))
		res = state.reserves[j] if state.reserves[j] >= 0 else "<0"
		lines.append(("reserve: %s/%s" % (res, state.cpow[j]), info.pcolors[j]))
		lines.append(("rate: +%s - %s" % (state.ppow[j], state.mpow[j]), info.pcolors[j]))
	for j in range(3):
		amt = "unlimited" if state.materials[j] > 100000 else state.materials[j]
		lines.append(("%s: %s" % (info.mnames[j], amt,), info.mcolors[j]))
	lines.append(("Satcon: %s/%s" % (state.nsat, state.satcon), (255, 255, 255)))
	if state.wintime:
		lines.append(("", (0,0,0)))
		lines.append(("Mission completion: %s/30" % state.wintime, (255, 255, 255)))

	labels["status"].settext(lines)

def mainmode():
	labels["helppage"].settext()
	labels["instructions"].settext()
	cursor.disable = False
	cursor.unbuild = False
	setmode("main", "buildw buildb buildr disable unbuild launch unlaunch help quit")

def buildwmode():
	setmode("buildw", "buildw buildwextractor buildcollector buildlauncher buildwrelay buildwbasin buildwbooster bcancel back")

def buildbmode():
	setmode("buildb", "buildb buildbextractor buildsatcon buildmedic buildbrelay buildbbasin buildbbooster bcancel back")

def buildrmode():
	setmode("buildr", "buildr buildrextractor buildcleaner buildrrelay buildrbasin buildrbooster bcancel back")

def launchmode():
	setmode("launch", "launch launchwsat launchbsat launchrsat back")

def disablemode():
	cursor.tobuild = None
	cursor.disable = True
	setmode("disable", "disable back")

def unbuildmode():
	cursor.tobuild = None
	cursor.unbuild = True
	setmode("unbuild", "unbuild back")

def unlaunchmode():
	cursor.tobuild = None
	setmode("unlaunch", "unlaunch unlaunchwsat unlaunchbsat unlaunchrsat back")

def helpmode():
	setmode("help", "help helpmission helpcontrols helpmore~controls helppower helpsatellites helpsatcon back")

def quitmode():
	setmode("quit", "quit savequit abandonquit back")


def menumode():
	setmode("menu", "selectlevel options credits quitgame")
	clearlabels()
	labels["title"].settext([settings.gamename, "by Christopher Night"])

def levelmode():
	lmax = min(settings.unlocked + 1, len(info.Rs))
	lbuttons = " ".join("level%s" % j for j in range(lmax))
	setmode("level", "selectlevel " + lbuttons + " options credits quitgame")
	clearlabels()

def optionsmode():
	setmode("options", "selectlevel options fullscreentoggle soundtoggle musictoggle credits quitgame")
	clearlabels()
	labels["helppage"].settext("\n\nPlease restart game to\napply changes to graphics settings.")
	
def creditsmode():
	setmode("credits", "selectlevel options credits quitgame")
	clearlabels()
	labels["helppage"].settext(info.creds)

def draw():
	for b in buttons.values():
		b.draw()
	for l in labels.values():
		l.draw()

def point((x, y)):
	for bname, button in buttons.items():
		if (x, y) in button:
			pointto(bname)
			return button.name
	pointto("")
	return False

def click((x, y)):
	for bname, button in buttons.items():
		if (x, y) in button:
			clickon(bname)
			return True


launchpoint = None
def pointto(bname):
	global launchpoint
	if bname.startswith("launch") and bname.endswith("sat"):
		labels["launchinfo"].setsat(bname)
		launchpoint = buttons[bname].ltype
	else:
		labels["launchinfo"].setsat()
		launchpoint = None
	if bname.startswith("build") and len(bname) > 6:
		labels["buildinfo"].setbuilding(bname)
	else:
		labels["buildinfo"].setbuilding()

	if mode == "level":
		if bname.startswith("level") and len(bname) == 6:
			settings.level = int(bname[5:])
			labels["leveltitle"].settext(info.missionnames[settings.level].splitlines())
		else:
			labels["leveltitle"].settext()
	

def clickon(bname):
	soundname = buttons[bname].soundname
	if bname == "buildw":
		if mode == "main":
			buildwmode()
		elif mode == "buildw":
			soundname = "back"
			mainmode()
	elif bname == "buildb":
		if mode == "main":
			buildbmode()
		elif mode == "buildb":
			soundname = "back"
			mainmode()
	elif bname == "buildr":
		if mode == "main":
			buildrmode()
		elif mode == "buildr":
			soundname = "back"
			mainmode()
	elif bname.startswith("build"):
		cursor.tobuild = buttons[bname].btype
	if bname == "launch":
		if mode == "main":
			launchmode()
		elif mode == "launch":
			soundname = "back"
			mainmode()
	elif bname.startswith("launch"):
		if state.launcherror(buttons[bname].ltype):
			soundname = "error"
		else:
			state.launch(buttons[bname].ltype)
			soundname = "launch"

	if bname == "help":
		if mode == "main":
			soundname = "back"
			helpmode()
		elif mode == "help":
			mainmode()
	elif bname == "helpmission":
		labels["helppage"].settext(info.missionhelp[settings.level])
	elif bname.startswith("help"):
		labels["helppage"].settext(info.help[buttons[bname].helpname])

	if bname == "unbuild":
		if mode == "main":
			unbuildmode()
		elif mode == "unbuild":
			soundname = "back"
			mainmode()

	if bname == "unlaunch":
		if mode == "main":
			unlaunchmode()
		elif mode == "unlaunch":
			soundname = "back"
			mainmode()
	elif bname.startswith("unlaunch"):
		state.unlaunch(buttons[bname].ltype)

	if bname == "disable":
		if mode == "main":
			disablemode()
		elif mode == "disable":
			soundname = "back"
			mainmode()

	if bname == "back":
		soundname = "back"
		cursor.tobuild = None
		mainmode()
	
	if bname == "bcancel":
		soundname = "back"
		cursor.tobuild = None

	if bname == "quit":
		soundname = "back"
		quitmode()

	if bname == "abandonquit":
		soundname = "back"
		state.removesave()
		scene.top().playing = False

	if bname == "savequit":
		soundname = "back"
		state.save()
		scene.pop()
		scene.pop()

	if bname == "quitgame":
		scene.top().playing = False


	if bname.startswith("level"):
		scene.top().playing = False
		scene.top().selected = buttons[bname].n

	if bname == "selectlevel":
		if mode == "level":
			soundname = "back"
			menumode()
		else:
			levelmode()
	if bname == "options":
		if mode == "options":
			soundname = "back"
			menumode()
		else:
			optionsmode()
	if bname == "credits":
		if mode == "credits":
			soundname = "back"
			menumode()
		else:
			creditsmode()

	if bname == "soundtoggle":
		settings.sound = not settings.sound
		settings.save()
		sound.setvolume()
	if bname == "musictoggle":
		settings.music = not settings.music
		settings.save()
		sound.setvolume()
	if bname == "fullscreentoggle":
		settings.fullscreen = not settings.fullscreen
		settings.save()
	if mode == "options":
		buttons["soundtoggle"].words = "SOUND: %s" % ("ON" if settings.sound else "OFF")
		buttons["musictoggle"].words = "MUSIC: %s" % ("ON" if settings.music else "OFF")
		buttons["fullscreentoggle"].words = "FULLSCREEN: %s" % ("ON" if settings.fullscreen else "OFF")

	sound.play(soundname)

