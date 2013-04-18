import util

class Player(util.serializable):
	fields = "username coins xp unlocked special trained story".split()
	defaults = {"coins": 100, "xp": 100, "unlocked": None, "special": None, "trained": 0, "story": 0}
	def __init__(self, *args, **kw):
		util.serializable.__init__(self, *args, **kw)
		if not self.unlocked:
			self.unlocked = {}

