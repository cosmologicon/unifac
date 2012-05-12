# data loader
import os.path, pygame

def filename(*args):
    return os.path.join("data", *args)


imgcache = {}

def img(imgname, flip=False, alpha=0, cfilter=None):
#    alpha = int(alpha/2) * 2
    alpha = int(alpha)
    key = imgname, flip, cfilter, alpha
    if key not in imgcache:
        i = pygame.image.load(filename(imgname + ".png")).convert_alpha()
        if alpha:
            i = pygame.transform.rotozoom(i, alpha, 1)
        if flip:
            i = pygame.transform.flip(i, True, False)
        if cfilter:
            pix = pygame.surfarray.pixels3d(i)
            for c in (0,1,2):
                pix[:,:,c] = pix[:,:,c] * (cfilter[c] / 400.)
        imgcache[key] = i
    return imgcache[key]


def draw(surf, i, pos, anchor="center"):
    rect = i.get_rect()
    setattr(rect, anchor, pos)
    surf.blit(i, rect)


# sound channel 0 : speech
# sound channels 1+ : sound effects

soundcache = {}
def initsound():
    global speechchannel
    pygame.mixer.set_reserved(0)
    speechchannel = pygame.mixer.Channel(0)

def playsfx(sname):
    if sname not in soundcache:
        soundcache[sname] = pygame.mixer.Sound(filename(sname + ".ogg"))
    sound = soundcache[sname]
    sound.play()

def playspeech(sname, queue=False):
    if not queue and speechchannel.get_busy():
        return
    if sname not in soundcache:
        soundcache[sname] = pygame.mixer.Sound(filename(sname + ".ogg"))
    sound = soundcache[sname]
    speechchannel.queue(sound)

def playmusic(sname):
    pygame.mixer.music.load(filename(sname + ".ogg"))
    pygame.mixer.music.play(-1)

def fademusic(dt):
    v0 = pygame.mixer.music.get_volume()
    if speechchannel.get_busy():
        pygame.mixer.music.set_volume(min(v0 + dt, 1.0))
    else:
        pygame.mixer.music.set_volume(max(v0 - dt, 0.0))

