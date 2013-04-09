import gamestate


updates = []
galaxy = gamestate.Galaxy()
serverstate = gamestate.Gamestate()
class run(object):
	def __enter__(self):
		galaxy.create()
		updates.append(("galaxy", galaxy.getstate()))
		you = gamestate.Stork({
			"name": "you",
			"parent": None,
			"p": (0,0),
			"v": (0,0),
		})
		you.land("hatchery", galaxy)
		serverstate.addyou(you)
		updates.append(("you", you.getstate()))

	def __exit__(self, ttype, value, tback):
		print "exiting fake client"

def getupdates():
	while updates:
		yield updates.pop(0)


