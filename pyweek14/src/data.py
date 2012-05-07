# data loader
import os.path, pygame

def filename(name):
    return os.path.join("data", name)


imgcache = {}

def draw(surf, imgname, pos, anchor="center"):
    if imgname not in imgcache:
        flip = imgname.endswith("-R")
        iname = imgname[:-2] if flip else imgname
        img = pygame.image.load(filename(iname + ".png")).convert_alpha()
        if flip:
            img = pygame.transform.flip(img, True, False)
        imgcache[imgname] = img
    img = imgcache[imgname]
    rect = img.get_rect()
    setattr(rect, anchor, pos)
    surf.blit(img, rect)


