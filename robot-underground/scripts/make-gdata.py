import json
import graphics, svg

gdata = {}
ps = []
indices = {}


def pathstolines(paths):
	mps = []
	for path in paths:
		for j in range(0, len(path) - 2, 2):
			mps += path[j:j+4]
	return mps

def loadsvg(img, shift=False):
	if isinstance(img, svg.SVG):
		if shift:
			img.shiftcenter()
		if img.filename not in indices:
			mps = pathstolines(img.paths)
			indices[img.filename] = len(ps) // 2, len(mps) // 2
			ps.extend(mps)
		offset, plen = indices[img.filename]
		return { "p0": offset, "np": plen, "height": img.height }
	if isinstance(img, svg.AnimatedSVG):
		return { "frames": [loadsvg(f, shift) for f in img.frames], "framelength": img.framelength }
	if isinstance(img, svg.TurretSVG):
		return { "base": loadsvg(img.basesvg, shift), "turret": loadsvg(img.turretsvg, shift) }
	if isinstance(img, svg.StatefulSVG):
		return { "states": { sname: loadsvg(simg, shift) for sname, simg in img.stateanims.items() } }

def loadimgmap(imgmap, shift=False):
	s = {}
	for name, (img, color) in imgmap.items():
		s[name] = loadsvg(img, shift)
		s[name]["colour"] = color
	return s

def loadportraits(imgmap):
	s = {}
	for imgname, (pname, img, color) in imgmap.items():
		s[imgname] = loadsvg(img)
		s[imgname]["colour"] = color
		s[imgname]["name"] = pname
	return s

for name in "sprites cursors".split():
	gdata[name] = loadimgmap(getattr(graphics, name), True)

gdata["portraits"] = loadportraits(graphics.portraits)

for name in "weapon_icons armour_icons walls".split():
	gdata[name] = { name: loadsvg(img) for name, img in getattr(graphics, name).items() }

for name in "cross drop weapondrop splash leftclaw rightclaw trail eject eject_confirm floor triup tridown appraised equipped title debug_iface_circle".split():
	gdata[name] = loadsvg(getattr(graphics, name))


gdata["ps"] = map(int, map(round, ps))

s = json.dumps(gdata, separators=(',', ':'))
print len(s)

open("../data/gdata.js", "w").write("var gdata = %s\n" % s)


