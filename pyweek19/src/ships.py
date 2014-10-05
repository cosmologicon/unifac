import vista, img

class Ship(object):
	def __init__(self):
		self.x, self.y = 0, 0

	def think(self, dt):
		pass
		
	def draw(self):
		screenpos = vista.worldtoscreen((self.x, self.y))
		img.draw(self.imgname, screenpos, angle = 0, scale = vista.scale)
		

class You(Ship):
	imgname = "ship1a"


