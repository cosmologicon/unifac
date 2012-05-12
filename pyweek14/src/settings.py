import data

gamename = "Mad Science TD 101"

ssize = sx, sy = 854, 480  # screen size
wsize = wx, wy = 472, 472  # gameplay window size
msize = mx, my = 144, 144  # mini window size
wx0, wy0 = sy//2, sy//2    # main gameplay window center
mx0, my0 = 600, 80         # mini window position

buttonsize = 40
buttonspace = 2

transtime = 0.5  # transition time

maxfps = 60
minfps = 10

class fonts:
    table = data.filename("fonts", "Gorditas", "Gorditas-Regular.ttf")
    HUD = data.filename("fonts", "Fontdiner_Swanky", "FontdinerSwanky.ttf")


