import pygame, logging
import data

log = logging.getLogger(__name__)

fonts = {}
def getfont(size, fontname = None):
	if size not in fonts:
		if fontname:
			fonts[(fontname, size)] = pygame.font.Font(data.filepath(fontname + ".ttf"), size)
		else:
			fonts[(fontname, size)] = pygame.font.Font(None, size)
	return fonts[(fontname, size)]

textcache = {}
def gettext(text, size, color, fontname = None, ocolor = None, d = 1):
	key = text, fontname, size, color, ocolor, d
	if key in textcache:
		return textcache[key]
	font = getfont(size, fontname)
	if ocolor:
		img0 = font.render(text, True, color)
		oimg = font.render(text, True, ocolor)
		w, h = img0.get_size()
		img = textcache[key] = pygame.Surface((w + 2*d, h + 2*d)).convert_alpha()
		img.fill((0,0,0,0))
		for x, y in (0, 0), (d, 0), (2*d, 0), (0, d), (2*d, d), (0, 2*d), (d, 2*d), (2*d, 2*d):
			img.blit(oimg, (x, y))
		img.blit(img0, (d, d))
		return img
	else:
		textcache[key] = font.render(text, True, color)
		return textcache[key]

wcache = {}
def getwraptext(text, size, color, width = 400, anchor = "center", fontname = None, ocolor = None, d = 1):
	key = text, size, color, width, anchor, fontname, ocolor, d
	if key in wcache:
		return wcache[key]
	if ocolor is None:
		d = 0
	width -= 2 * d
	font = getfont(size, fontname = fontname)
	def choppable(t):
		return " " in t and font.size(t[:t.rindex(" ")].replace("~", " "))[0] > width
	texts = [text]
	while choppable(texts[-1]):
		texts.append("")
		while choppable(texts[-2]):
			a = texts[-2].rindex(" ")
			texts[-2:] = texts[-2][:a], texts[-2][a+1:] + (" " + texts[-1] if texts[-1] else "")
			if "|" in texts[-2]:
				p = texts[-2].index("|")
				texts[-1] = texts[-2][p+1:] + texts[-1]
				texts[-2] = texts[-2][:p]
	if "|" in texts[-1]:
		p = texts[-1].index("|")
		texts.append(texts[-1][p+1:])
		texts[-2] = texts[-2][:p]
	#log.debug(texts)
	imgs = [
		gettext(t.replace("~", " "), size, color, fontname = fontname, ocolor = ocolor, d = d)
		for t in texts
	]
	maxw = max(img.get_width() for img in imgs)
	h = size * len(imgs)
	surf = pygame.Surface((maxw, h)).convert_alpha()
	surf.fill((0, 0, 0, 0))
	if anchor in ("center", "midtop", "midbottom"):
		ranchor, px = "midtop", maxw // 2
	else:
		ranchor, px = "topleft", d
	for j, img in enumerate(imgs):
		rect = img.get_rect(**{ ranchor: (px, d + j * size) })
		surf.blit(img, rect)
	wcache[key] = surf
	return surf


def drawtext(surf, text, size, color, p, anchor = "center", fontname = None, ocolor = None, d = 1, width = None):
	if width is None:
		img = gettext(text, size, color, fontname = fontname, ocolor = ocolor, d = d)
	else:
		img = getwraptext(text, size, color, width = width, anchor = anchor, fontname = fontname,
			ocolor = ocolor, d = d)
	rect = img.get_rect(**{anchor: p})
	surf.blit(img, rect)


