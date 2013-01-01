# Playback info!

import cgi, os, cgitb, json, urllib, urllib2
import userdb, playbackdb

cgitb.enable(display = 0, logdir = "/tmp")
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
act = form["act"] if "act" in form else ""
user = userdb.currentuser()

html = """Content-type: text/html

<!doctype html>
<title>UFX.playback portal</title>
<h1>UFX.playback portal</h1>"""

if act == "":
	print(html)
	print("<p>Games:\n<ul>")
	for gamename in playbackdb.gamenames(user):
		print("<li>%s" % gamename)
	print("</ul>")

