import util

class Player(util.serializable):
	fields = "username coins xp unlocked special trained story".split()
	defaults = {"coins": 200, "xp": 10, "unlocked": None, "special": None, "trained": 3, "story": 0}
	def __init__(self, *args, **kw):
		util.serializable.__init__(self, *args, **kw)
		if not self.unlocked:
			self.unlocked = {}

