import util

class Player(util.serializable):
	fields = "username coins xp".split()
	defaults = {"coins": 0, "xp": 0}


