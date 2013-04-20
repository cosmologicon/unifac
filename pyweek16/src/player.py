import util, settings

class Player(util.serializable):
	fields = "username coins xp unlocked special trained story".split()
	defaults = {"coins": 0, "xp": 0, "unlocked": None, "special": None, "trained": 0, "story": 0}
	def __init__(self, *args, **kw):
		util.serializable.__init__(self, *args, **kw)
		if not self.unlocked:
			self.unlocked = {}
def maxedplayer(username):
	return Player({
		"username": username,
		"coins": 999999999999,
		"xp": 0,
		"unlocked": dict((d, 1) for d in settings.devicesize),
		"special": None,
		"trained": 4,
		"story": 4,
	})
