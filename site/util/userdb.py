# Access to the user database: session validation etc.
# I don't store any user credentials here.

import os, hashlib, sqlite3, uuid, Cookie, random, string, time

sessionlife = 7776000  # 90 days
salt = "rmvtjdzzkbxkcava"
def gethash(s):
	return hashlib.sha224(salt + s).hexdigest()
def makesession():
	return "".join(random.choice(string.lowercase) for _ in range(16))

# Object to access the database with
class DB(object):
	dbfilename = "/var/data/user.db"
	def __enter__(self):
		self.db = sqlite3.connect(self.dbfilename)
		self.c = self.db.cursor()
		return self
	def query(self, qstring, params = ()):
		return self.c.execute(qstring, params).fetchall()
	def queryone(self, qstring, params = ()):
		return self.c.execute(qstring, params).fetchone()
	def querysingle(self, qstring, params = ()):
		ans = self.queryone(qstring, params)
		return ans and ans[0]
	def __exit__(self, typ, val, tb):
		if not tb:
			self.db.commit()
		self.db.close()

# Given a verified off-site user ID, get the UUID for that user
# Create an entry in the database if it doesn't exist.
def getuser(userid, mode="persona"):
	who = gethash("getuser" + mode + userid)
	with DB() as db:
		user = db.querysingle("SELECT user FROM creds WHERE who = ? AND mode = ?", (who, mode))
		if not user:
			user = str(uuid.uuid4())
			while db.querysingle("SELECT user FROM creds WHERE user = ?", (user,)):
				user = str(uuid.uuid4())
			db.query("INSERT INTO creds (user, who, mode) VALUES (?, ?, ?)", (user, who, mode))
	return user

def createsession(user, agent = None):
	agent = gethash("agent" + (agent or os.environ.get("HTTP_USER_AGENT") or ""))
	session = makesession()
	with DB() as db:
		db.query("DELETE FROM sessions WHERE user = ?", (user,))
		db.query("INSERT INTO sessions (user, agent, session, created) VALUES (?, ?, ?, ?)",
			(user, agent, session, time.time()))
	return session

def removesessions(user):
	with DB() as db:
		db.query("DELETE FROM sessions WHERE user = ?", (user,))

def verifysession(user, session = None, agent = None):
	session = session or Cookie.SimpleCookie(os.environ["HTTP_COOKIE"])["session"].value
	agent = gethash("agent" + (agent or os.environ.get("HTTP_USER_AGENT") or ""))
	with DB() as db:
		t0 = db.querysingle("SELECT created FROM sessions WHERE user = ? AND session = ? AND agent = ?",
			(user, session, agent))
	return bool(t0) and time.time() < float(t0) + sessionlife

if __name__ == "__main__":
	with DB() as db:
		# The creds table matches up elsewhere-verified usernames (such as email addresses from
		#   Mozilla Persona) to unifac-specific UUIDs.
		# To avoid storing email addresses etc, "who" is a hashed version of the external username
		fields = "(user TEXT, who TEXT, mode TEXT)"
		db.query("CREATE TABLE IF NOT EXISTS creds %s" % fields)
		# The sessions table lists currently active sessions, obvs
		# Agent is a hash based on the user agent, a very small security measure
		fields = "(user TEXT, agent TEXT, session TEXT, created NUMERIC)"
		db.query("CREATE TABLE IF NOT EXISTS sessions %s" % fields)

