# data loader
import os.path, pygame

def filename(name):
    return os.path.join("data", name)


imgcache = {}

def img(imgname, flip=False, cfilter=None):
    key = imgname, flip, cfilter
    if key not in imgcache:
        i = pygame.image.load(filename(imgname + ".png")).convert_alpha()
        if flip:
            i = pygame.transform.flip(i, True, False)
        if cfilter:
            pix = pygame.surfarray.pixels3d(i)
            for c in (0,1,2):
                print cfilter[c]
                pix[:,:,c] = pix[:,:,c] * (cfilter[c] / 255.)
        imgcache[key] = i
    return imgcache[key]


def draw(surf, i, pos, anchor="center"):
    rect = i.get_rect()
    setattr(rect, anchor, pos)
    surf.blit(i, rect)


