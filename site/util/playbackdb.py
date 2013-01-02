# Access the playback database

# Requirements:
#   gamename must be 1-200 characters
#   gameversion is optional: 0-200 characters
#   sessionname must be 0-200 characters
#   playername 0-200 characters
#   above fields can only contain letters, numbers, space, dash, period, comma, underscore
#   sessiontime is integer 0-1<<53
#   chapternumber is integer 0-1<<53
#   chaptertime is integer 0-1<<53
#   chapterduration is integer 0-1<<53
#   chapterdata must be JSONed and 0 bytes to 100 MB in length

import sqlite3, re, json
import userdb

def extractfields(form):
	return {
		"gamename": form.get("gamename", ""),
		"gameversion": form.get("gameversion", ""),
		"sessionname": form.get("sessionname", ""),
		"playername": form.get("playername", ""),
		"sessiontime": int(form.get("sessiontime", 0)),
		"chaptertime": int(form.get("chaptertime", 0)),
		"chapternumber": int(form.get("chapternumber", 0)),
		"chapterduration": int(form.get("chapterduration", 0)),
		"chapterdata": validatedata(form.get("chapterdata", "")),
	}

def validatefields(fields):
	assert fields["gamename"]
	for k in "gamename gameversion sessionname playername".split():
		assert len(fields[k]) <= 200
		assert re.match("^[a-zA-Z0-9\-\.\, \_]*$", fields[k])
	for k in "sessiontime chapternumber chaptertime chapterduration".split():
		assert 0 <= fields[k] <= 1 << 53

def validatedata(data):
	assert 0 <= len(data) <= 100 << 20
	return json.dumps(json.loads(data))


# Object to access the database with
class DB(object):
	dbfilename = "/var/data/playback.db"
	def __enter__(self):
		self.db = sqlite3.connect(self.dbfilename)
		self.db.text_factory = str
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

# A list of all games visible to this user
# can optionally pass in an owners database
def gamenames(user = None, db = None):
	user = user or userdb.currentuser()
	if user:
		query, par = "SELECT gamename FROM owners WHERE user = ? OR user = ?", (user, "_public")
	else:
		query, par = "SELECT gamename FROM owners WHERE user = ?", ("_public",)
	if db:
		result = db.query(query, par)
	else:
		with DB() as db:
			result = db.query(query, par)
	return [fields[0] for fields in result]

# Is this game visible to this user?
def gamevisible(gamename, user = None, db = None):
	return gamename in gamenames(user, db)

def creategame(gamename, user = None):
	user = user or userdb.currentuser() or "_public"
	with DB() as db:
		gexists = db.query("SELECT gamename FROM owners WHERE gamename = ?", (gamename,))
		if gexists:
			return False
		db.query("INSERT INTO owners (gamename, user) VALUES (?, ?)", (gamename, user))
		return True

# THESE NEXT FOUR FUNCTIONS ASSUME THAT gamevisible(gamename, user) IS TRUE!!!

# Given a game name, return a list of all versions of this game and the number of 
# sessions available for that version.
def gameversions(gamename):
	with DB() as db:
		result = db.query(
			"SELECT DISTINCT gameversion, sessionname FROM chapters WHERE gamename = ?",
			(gamename,)
		)
	ret = {}
	for ver, sname in result:
		ret[ver] = ret[ver] + 1 if ver in ret else 1
	return sorted(ret.items())

# A list of info objects for all sessions for the specified gamename
# Return list of objects: sessionname, sessiontime, sessionduration, playername, nchapters
def sessions(gamename, gameversion):
	with DB() as db:
		result = db.query(
			"SELECT sessionname, sessiontime, playername, chapterduration FROM chapters WHERE gamename = ? AND gameversion = ?",
			(gamename, gameversion)
		)
	ret = {}
	for sname, stime, pname, cdur in result:
		if sname not in ret:
			ret[sname] = {
				"sessionname": sname,
				"sessiontime": int(stime),
				"sessionduration": 0,
				"playername": pname,
				"nchapters": 0,
			}
		ret[sname]["sessionduration"] += int(cdur)
		ret[sname]["nchapters"] += 1
	ret = sorted(ret.values(), key = lambda obj: obj["sessiontime"])
	return ret

# session object
def session(gamename, gameversion, sessionname):
	with DB() as db:
		result = db.query(
			"SELECT sessiontime, playername, chapternumber, data, zipmode FROM chapters WHERE gamename = ? AND gameversion = ? AND sessionname = ?",
			(gamename, gameversion, sessionname)
		)
	if not result: return False
	t, pname, _, _, _ = result[0]
	session = {
		"gamename": gamename,
		"version": gameversion,
		"name": sessionname,
		"t": int(t),
		"playername": pname,
	}
	chapters = []
	for stime, pname, cnum, data, zipmode in result:
		chapters.append((cnum, unzipdata(data, zipmode)))
	session["nchapters"] = len(chapters)
	session["chapters"] = [json.loads(data) for cnum, data in sorted(chapters)]
	return session

# A list of info objects for all chapters for the specified gamename
def chapters(gamename, gameversion, sessionname):
	with DB() as db:
		result = db.query(
			"SELECT chapternumber, chaptertime, chapterduration, datalength FROM chapters WHERE gamename = ? AND gameversion = ? AND sessionname = ?",
			(gamename, gameversion, sessionname)
		)
	ret = [{
		"chapternumber": int(cnum),
		"chaptertime": int(ctime),
		"chapterduration": int(cdur),
		"datalength": int(dlen),
	} for cnum, ctime, cdur, dlen in result]
	ret.sort(key = lambda obj: obj["chapternumber"])
	return ret

# A JSONed chapter object
def chapter(gamename, gameversion, sessionname, chapternumber):
	with DB() as db:
		result = db.queryone(
			"SELECT data, zipmode FROM chapters WHERE gamename = ? AND gameversion = ? AND sessionname = ? AND chapternumber = ?",
			(gamename, gameversion, sessionname, chapternumber)
		)
	if not result: return ""
	data, zipmode = result
	return unzipdata(data, zipmode)
	

def zipdata(data, zipmode=None):
	if zipmode == "gzip":
		import zlib
		return zlib.compress(data)
	return data

def unzipdata(data, zipmode=None):
	if zipmode == "gzip":
		import zlib
		return zlib.decompress(data)
	return data

# The data should be validated before being put here, okay?
def postchapter(fields, zipmode="gzip"):
	fieldnames = "gamename gameversion playername sessionname sessiontime chapternumber chaptertime chapterduration".split()
	values = [fields[fieldname] for fieldname in fieldnames]
	fieldnames += ["zipmode", "data", "datalength"]
	data = fields["chapterdata"]
	values += [zipmode, zipdata(data, zipmode), len(data)]
	with DB() as db:
		db.query("INSERT INTO chapters (%s) VALUES (%s)" % (", ".join(fieldnames), ", ".join("?" * len(values))), values)

if __name__ == "__main__":
	with DB() as db:
		# The owners table matches up users with game names.
		db.query("CREATE TABLE IF NOT EXISTS owners (user TEXT, gamename TEXT)")
		# insert an example for public consumption.
		db.query("INSERT INTO owners (user, gamename) VALUES (?, ?)", ("_public", "examplegame"))
		# The chapters table has one entry for each saved chapter
		fields = [
			"who TEXT",
			"tstamp DATETIME DEFAULT CURRENT_TIMESTAMP",
			"gamename TEXT",
			"gameversion TEXT",
			"playername TEXT",
			"sessionname TEXT",
			"sessiontime INTEGER",
			"chapternumber INTEGER",
			"chaptertime INTEGER",
			"chapterduration INTEGER",
			"zipmode TEXT",
			"data TEXT",
			"datalength INTEGER",
		]
		db.query("CREATE TABLE IF NOT EXISTS chapters (%s)" % ", ".join(fields))
		# TODO: a separate table for session summaries?

