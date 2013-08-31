# Modified from the Robot Underground source
# Easier to parse all the SVGs into JSON, I think, than to port this to JavaScript

from xml.etree.ElementTree import parse
import re
import gzip
import json


# from constants.py
BEZIER_POINTS = 4


total_vertices = 0

class StatefulSVG(object):
    def __init__(self, statedict):
        self.stateanims = statedict
    def draw_at(self, *args, **kwargs):
        self.stateanims[kwargs['state']].draw_at(*args, **kwargs)
    def draw_rotated(self, *args, **kwargs):
        self.stateanims[kwargs['state']].draw_rotated(*args, **kwargs)

class TurretSVG(object):
    def __init__(self, base, turret):
        self.basesvg = base
        self.turretsvg = turret
    def draw_at(self, *args, **kwargs):
        self.basesvg.draw_at(*args, **kwargs)
        newargs = list(args)
        newargs[3] = kwargs['turretbearing']
        self.turretsvg.draw_rotated(*newargs, **kwargs)
    def draw_rotated(self, *args, **kwargs):
        self.basesvg.draw_rotated(*args, **kwargs)
        newargs = list(args)
        newargs[3] = kwargs['turretbearing']
        self.turretsvg.draw_rotated(*newargs, **kwargs)

class AnimatedSVG(object):
    def __init__(self, framefiles, framelength=5):
        self.frames = [SVG(f) for f in framefiles]
        self.framelength = framelength
    def draw_at(self, *args, **kwargs):
        fn = kwargs['frameno']
        fn /= self.framelength
        fn %= len(self.frames)
        self.frames[fn].draw_at(*args, **kwargs)
    
    def draw_rotated(self, *args, **kwargs):
        fn = kwargs['frameno']
        fn /= self.framelength
        fn %= len(self.frames)
        self.frames[fn].draw_rotated(*args, **kwargs)
            
class SVG(object):
    def __init__(self, filename):
        self.filename = filename
        if filename.endswith(".svgz"):
            f = gzip.open(filename)
        else:
            f = open(filename)
        self.tree = parse(f)
        self.parse_doc()

        self.paths = filter(None, self.paths)
        self.shifted = False

    def shiftcenter(self):
    	if not self.shifted:
	        self.paths = [[x - 0.5*self.height for x in path] for path in self.paths]
        self.shifted = True


    def parse_float(self, txt):
        if txt.endswith('px'):
            return float(txt[:-2])
        else:
            return float(txt)
    def parse_doc(self):
        self.paths = []
        self.width = self.parse_float(self.tree._root.get("width"))
        self.height = self.parse_float(self.tree._root.get("height"))
        for e in self.tree.getiterator():
            if e.tag.endswith('path'):
                pathdata = e.get('d')
                if not pathdata:
                    continue
                pathdata = re.findall("([A-Za-z]|-?[0-9]+\.?[0-9]*(?:e-?[0-9]*)?)", pathdata)

                def pnext():
                    return (float(pathdata.pop(0)), self.height - float(pathdata.pop(0)))
                self.new_path()
                while pathdata:
                    opcode = pathdata.pop(0)
                    if opcode == 'M':
                        self.end_path()
                        self.new_path()
                        self.set_position(*pnext())
                    elif opcode == 'C':
                        self.curve_to(*(pnext() + pnext() + pnext()))
                    elif opcode == 'c':
                        mx = self.x
                        my = self.y
                        x1, y1 = pnext()
                        x2, y2 = pnext()
                        x, y = pnext()
                        y1 = self.height - y1
                        y2 = self.height - y2
                        y = self.height - y
                        self.curve_to(mx + x1, my - y1, mx + x2, my - y2, mx + x, my - y)
                    elif opcode == 'z':
                        self.line_to(*(self.path[0:2]))
                    elif opcode == 'L':
                        self.line_to(*pnext())
                    else:
                        print self.filename, " - Warning, unrecognised opcode:", opcode
                self.end_path()
            elif e.tag.endswith('rect'):
                x = float(e.get('x'))
                y = self.height - float(e.get('y'))
                h = float(e.get('height'))
                w = float(e.get('width'))
                self.new_path()
                self.set_position(x, y)
                self.line_to(x+w,y)
                self.line_to(x+w,y-h)
                self.line_to(x,y-h)
                self.line_to(x,y)
                self.end_path()
    def new_path(self):
        self.x = 0
        self.y = 0
        self.path = []
        
    def set_position(self, x, y):
        self.x = x
        self.y = y
        self.path.extend([x,y])

    def curve_to(self, x1, y1, x2, y2, x, y):
        
        for i in xrange(BEZIER_POINTS+1):
            t = float(i)/BEZIER_POINTS
            #Curse you, Pierre Bezier!
            xp = (1 - t) ** 3 * self.x + 3 * t * (1 - t) ** 2 * x1 + 3 * t ** 2 * (1 - t) * x2 + t ** 3 * x
            yp = (1 - t) ** 3 * self.y + 3 * t * (1 - t) ** 2 * y1 + 3 * t ** 2 * (1 - t) * y2 + t ** 3 * y
            self.line_to(xp, yp)
            
    def line_to(self, x, y):
        self.set_position(x, y)
        
    def end_path(self):
        self.paths.append(self.path)

if __name__ == '__main__':
    import sys, os
    svgdata = {}
    for dirpath, dirnames, filenames in os.walk("../data/images"):
        group = dirpath.split("/")[-1]
        for filename in filenames:
            imgname = filename.split(".")[0]
            s = SVG("%s/%s" % (dirpath, filename))
            if group in ["enemies", "robots"]:
            	s.paths = [[x - 0.5*s.height for x in path] for path in s.paths]
        	s.paths = [map(int, map(round, path)) for path in s.paths]
            svgdata["%s.%s" % (group, imgname)] = {
                "paths": s.paths,
                "width": s.width,
                "height": s.height,
            }
#            print group, imgname, s.width, s.height

    print len(svgdata), len(json.dumps(svgdata))
    open("../data/imagedata.js", "w").write("var imagedata = %s\n" % json.dumps(svgdata))


