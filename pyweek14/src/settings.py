import data

gamename = "Uslingborg Defense"
showfps = True

ssize = sx, sy = 854, 480  # screen size
wsize = wx, wy = 472, 472  # gameplay window size
msize = mx, my = 144, 144  # mini window size
wx0, wy0 = sy//2, sy//2    # main gameplay window center
mx0, my0 = 600, 80         # mini window position
doubleview = False   # Need to fix input if this is going to work


buttonsize = 60
buttonspace = 2

transtime = 0.5  # transition time

maxfps = 60
minfps = 10

class fonts:
    table = data.filename("fonts", "Gorditas", "Gorditas-Regular.ttf")
    cells = data.filename("fonts", "Bangers", "Bangers.ttf")
    title = data.filename("fonts", "Creepster", "Creepster-Regular.ttf")
    HUD = data.filename("fonts", "Fontdiner_Swanky", "FontdinerSwanky.ttf")


