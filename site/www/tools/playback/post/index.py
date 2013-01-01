import cgi, os, json, urllib, urllib2, sys
import userdb, playbackdb

sys.stderr = sys.stdout
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
act = form["act"] if "act" in form else ""
user = userdb.currentuser()
print("Content-type: text/plain\n")
print(form.keys())
if act == "postchapter":
	fields = playbackdb.extractfields(form)
	playbackdb.validatefields(fields)
	playbackdb.postchapter(fields)

