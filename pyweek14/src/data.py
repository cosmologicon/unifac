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


