import cgi, os, cgitb, json, urllib, urllib2
import userdb, playbackdb

cgitb.enable(display = 0, logdir = "/tmp")
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
act = form["act"] if "act" in form else "get" + form["get"] if "get" in form else ""
print("Content-type: application/json\n")
if act == "getgamenames":
	print json.dumps(playbackdb.gamenames())
elif act == "getgameversions":
	gamename = form["gamename"]
	assert playbackdb.gamevisible(gamename)
	print json.dumps(playbackdb.gameversions(gamename))
elif act == "getsessions":
	gamename = form["gamename"]
	gameversion = form["gameversion"] if "gameversion" in form else ""
	assert playbackdb.gamevisible(gamename)
	print json.dumps(playbackdb.sessions(gamename, gameversion))
elif act == "getsession":
	gamename, sessionname = form["gamename"], form["sessionname"]
	gameversion = form["gameversion"] if "gameversion" in form else ""
	assert playbackdb.gamevisible(gamename), "User %s does not have permission to access game %s" % (userdb.currentuser(), gamename)
	print json.dumps(playbackdb.session(gamename, gameversion, sessionname))
elif act == "getchapters":
	gamename, sessionname = form["gamename"], form["sessionname"]
	gameversion = form["gameversion"] if "gameversion" in form else ""
	assert playbackdb.gamevisible(gamename)
	print json.dumps(playbackdb.chapters(gamename, gameversion, sessionname))
elif act == "getchapter":
	gamename, sessionname, chapternumber = form["gamename"], form["sessionname"], form["chapternumber"]
	gameversion = form["gameversion"] if "gameversion" in form else ""
	assert playbackdb.gamevisible(gamename)
	print playbackdb.chapter(gamename, gameversion, sessionname, chapternumber)

