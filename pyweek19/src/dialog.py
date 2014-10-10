import pygame
import settings, img

iconscale = 1
fontsize = 32

colors = {
	"P": (0, 255, 0),
}
fonts = {
	"P": None,
}

played = set()
playing = list()
tline = 0


def duration(line):
	return 1 + 0.05 * len(line)

def pause():
	pass

def resume():
	pass

def think(dt):
	global tline
	if not playing:
		return
	who, _, line = playing[0].partition(": ")
	tline += dt
	if tline > duration(line):
		tline = 0
		del playing[0]

def draw():
	if not playing:
		return
	who, _, line = playing[0].partition(": ")
	img.draw("icon%s" % who, (50, 400), scale = iconscale)
	img.drawtext(line, fontname = fonts[who], fontsize = fontsize, color = colors[who], topleft = (110, 400), maxwidth = 600)

def playfirst(dname):
	if dname in played:
		return
	play(dname)

def play(dname):
	played.add(dname)
	if dname in lines:
		playing.extend(lines[dname])
	else:
		print "playing %s" % dname

def clear(dname):
	pass

lines = {
	"cometomother": [
		"P: This is a distress call from Lieutenant Pelana of the Exelu, to anyone who can hear me. We've suffered heavy casualties.",
		"P: Our engines are completely destroyed. We're dead in space. You'll have to come to the Exelu. I'm uploading the coordinates to your navcom.",
	]


}


