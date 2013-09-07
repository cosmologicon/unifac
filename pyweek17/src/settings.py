import sys, math, cPickle, os.path
import data

gamename = "Luna whatever"

# DEFAULT OPTIONS

# size in windowed mode
wsize = 854, 480
fullscreen = False
fps = 60
fov = 30
swaparrows = False
dragfactor = 2.0
sound = True
music = True
level = None
unlocked = 0
speedup = 1

prefsfile = data.filepath("prefs.pickle")

def save():
	obj = wsize, fullscreen, swaparrows, sound, music
	cPickle.dump(obj, open(prefsfile, "wb"))

def load():
	if not os.path.exists(prefsfile):
		return
	global wsize, fullscreen, swaparrows, sound, music
	wsize, fullscreen, swaparrows, sound, music = cPickle.load(open(prefsfile, "rb"))

load()

if "--fullscreen" in sys.argv:
	fullscreen = True
if "--nosound" in sys.argv:
	sound = False
if "--nomusic" in sys.argv:
	music = False
if "--2x" in sys.argv:
	speedup = 2
if "--unlockall" in sys.argv:
	unlocked = 99

save()

tanB = math.tan(math.radians(0.5 * fov))
cotB = 1 / tanB


