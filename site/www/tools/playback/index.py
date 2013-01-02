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

print(html)

if act == "creategame":
	gamename = form["gamename"]
	if user:
		if playbackdb.creategame(gamename, user):
			print("<p>Created game %s" % gamename)
		else:
			print("<p>Unable to create game %s" % gamename)
	else:
		print("<p>You must be signed in to add a game to the database")
if act == "" or act == "creategame":
	print("<p>Signed in as: %s" % user)
	print("<p>Games visible to you:\n<ul>")
	for gamename in playbackdb.gamenames(user):
		print("<li>%s" % gamename)
	print("</ul>")

print("""<p>
<form name="creategame" action="http://universefactory.net/tools/playback/" method="post">
<input type="hidden" name="act" value="creategame">
<p>Add a game to the database: <input type="text" name="gamename">
<p><input type="submit" value="Submit">
</form>
""")
