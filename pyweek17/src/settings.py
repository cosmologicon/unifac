import sys, math, cPickle, os.path
import data

gamename = "Eclipsed"

# DEFAULT OPTIONS

# size in windowed mode
wsize = 854, 480
fullscreen = False
fps = 60
fov = 30
swaparrows = False
dragfactor = 1.2
sound = True
music = True
restart = False
level = None
unlocked = 0
speedup = 1
savetime = 5

prefsfile = data.filepath("prefs.pkl")

def save():
	obj = wsize, fullscreen, swaparrows, sound, music, unlocked
	cPickle.dump(obj, open(prefsfile, "wb"))

def load():
	if not os.path.exists(prefsfile):
		return
	global wsize, fullscreen, swaparrows, sound, music, unlocked
	wsize, fullscreen, swaparrows, sound, music, unlocked = cPickle.load(open(prefsfile, "rb"))

load()

if "--fullscreen" in sys.argv:
	fullscreen = True
if "--restart" in sys.argv:
	restart = True
if "--nosound" in sys.argv:
	sound = False
if "--nomusic" in sys.argv:
	music = False
if "--2x" in sys.argv:
	speedup = 2
if "--unlockall" in sys.argv:
	unlocked = 99

for arg in sys.argv:
	if arg.startswith("--r="):
		wsize = map(int, arg[4:].split("x"))

save()

tanB = math.tan(math.radians(0.5 * fov))
cotB = 1 / tanB


