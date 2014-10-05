import state, img

class Explosion(object):
	imgname = "boom"
	lifetime = 1
	def __init__(self, parent):
		self.x, self.y = parent.x, parent.y
		self.t = 0
	
	def think(self, dt):
		self.t += dt
		if self.t > self.lifetime:
			state.state.effects.remove(self)
			
	def draw(self):
		img.worlddraw(self.imgname, (self.x, self.y), angle = 0)


