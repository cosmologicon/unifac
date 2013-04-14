import uuid, os.path
import settings, data

def getlogin():
	fname = data.filepath(settings.loginfile)
	if os.path.exists(fname):
		return open(fname).read()
	return None
def savelogin(username):
	fname = data.filepath(settings.loginfile)
	open(fname, "w").write(username)

usednames = set()
def randomname():
	while True:
		r = str(uuid.uuid4())
		if r not in usednames:
			return r


