# Raw json dumping ground
# Definitely don't use this for anything that you need to process quickly, because all the records
# are just thrown together so you'll have to go through them one by one.

import cgi, json, sys, tempfile, os

sys.stderr = sys.stdout
data = cgi.FieldStorage().getfirst("data")
print("Content-type: text/plain\n")
limit = 10000000
if len(data) > limit:
	print("Data not accepted - exceeds %s bytes" % limit)
	exit()
data = json.dumps(json.loads(data))
fd, _ = tempfile.mkstemp(suffix = ".json", prefix = "", dir = "/var/data/rawjson")
os.write(fd, data)
os.close(fd)
print("Data accepted")

