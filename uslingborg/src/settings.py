# MOST OF THESE SETTINGS DON'T DO ANYTHING, OKAY? SO DON'T EXPECT STUFF TO WORK IF YOU MESS WITH THEM


import sys
import data

gamename = "Uslingborg Defense"
showfps = "--showfps" in sys.argv

ssize = sx, sy = 854, 480  # screen size
wsize = wx, wy = 24*26, 12*40  # gameplay window size
msize = mx, my = wx//3, wy//3  # mini window size
wx0, wy0 = wx//2, wy//2    # main gameplay window center
mx0, my0 = sx-mx/2, my/2         # mini window position
doubleview = False   # Need to fix input if this is going to work

animals = "--noanimals" not in sys.argv  # whether animalS appear (and can be killed) in the game

buttonsize = 60
buttonspace = 2

transtime = 0.5  # transition time

maxfps = 60
minfps = 10
doubletime = "--doubletime" in sys.argv

class fonts:
    table = data.filename("fonts", "Gorditas", "Gorditas-Regular.ttf")
    cells = data.filename("fonts", "Bangers", "Bangers.ttf")
    title = data.filename("fonts", "Creepster", "Creepster-Regular.ttf")
    HUD = data.filename("fonts", "Fontdiner_Swanky", "FontdinerSwanky.ttf")
    atom = data.filename("fonts", "Bangers", "Bangers.ttf")

sound = True
music = True


