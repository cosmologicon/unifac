# Access the records database, for very generic game logs

# Requirements:
#   gamename must be 1-200 characters
#   gameversion is optional: 0-200 characters
#   sessionname is optional: 0-200 characters
#   playername is optional: 0-200 characters
#   above fields can only contain letters, numbers, space, dash, period, comma, underscore
#   records must be JSONed and 0 bytes to 100 MB in length

import sqlite3, re, json

def extractfields(form):
	return {
		"gamename": form.get("gamename", ""),
		"gameversion": form.get("gameversion", ""),
		"sessionname": form.get("sessionname", ""),
		"playername": form.get("playername", ""),
		"records": validatedata(form.get("records", "")),
	}

def validatefields(fields):
	assert fields["gamename"]
	for k in "gamename gameversion sessionname playername".split():
		assert len(fields[k]) <= 200
		assert re.match("^[a-zA-Z0-9\-\.\, \_]*$", fields[k])

def validatedata(data):
	assert 0 <= len(data) <= 100 << 20
	return json.dumps(json.loads(data))


# Object to access the database with
class DB(object):
	dbfilename = "/var/data/records.db"
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

# The data should be validated before being put here, okay?
def addrecords(fields, zipmode="gzip"):
	fieldnames = "gamename gameversion playername sessionname records".split()
	values = [fields[fieldname] for fieldname in fieldnames]
	fieldnames += ["zipmode", "data", "datalength"]
	data = fields["records"]
	values += [zipmode, zipdata(data, zipmode), len(data)]
	with DB() as db:
		db.query("INSERT INTO records (%s) VALUES (%s)" % (", ".join(fieldnames), ", ".join("?" * len(values))), values)

if __name__ == "__main__":
	with DB() as db:
		fields = [
			"tstamp DATETIME DEFAULT CURRENT_TIMESTAMP",
			"gamename TEXT",
			"gameversion TEXT",
			"playername TEXT",
			"sessionname TEXT",
			"zipmode TEXT",
			"data TEXT",
			"datalength INTEGER",
		]
		db.query("CREATE TABLE IF NOT EXISTS records (%s)" % ", ".join(fields))


