#!/usr/bin/python

# Authorization script!
# Must specify one of the following acts:
#   login: doesn't do anything, just takes you to the login screen
#   loginpersona: Log in using Mozilla Persona
#   logout

# TODO: verify SSL certificates
# https://developer.mozilla.org/en-US/docs/Persona/Security_Considerations#Verify_SSL_certificates

import cgi, os, cgitb, json, urllib, urllib2
import userdb

cgitb.enable(display = 0, logdir = "/tmp")
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
act = form["act"] if "act" in form else "login"

if act == "login":
	print("Content-type: text/html\n\n")
	print("TODO: add login screenio")
	print(form)
	exit()
elif act == "loginpersona":
	url = "https://verifier.login.persona.org/verify"
	data = urllib.urlencode({
		"assertion": form["assertion"],
		"audience": "http://universefactory.net",
	})
	response = json.loads(urllib2.urlopen(urllib2.Request(url, data)).read())

	# TODO: but what if it's *not* okay???
	if response["status"] == "okay":
		personauser = response["email"]
		user = userdb.getuser(personauser, "persona")
		session = userdb.createsession(user)

		# TODO: add timeouts
		print("Set-Cookie: personauser=%s; path=/;" % urllib.quote(personauser.encode("utf-8")))
		print("Set-Cookie: user=%s; path=/;" % user)
		print("Set-Cookie: session=%s; path=/;" % session)
	else:
		print("Content-type: text/html\n\n")
		print("response: %s" % response)
		exit()

elif act == "logout":
	user = userdb.currentuser()
	if user:
		userdb.removesessions(user)
	print("Set-Cookie: personauser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;")
	print("Set-Cookie: user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;")
	print("Set-Cookie: session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;")

print("Content-type: text/html\n\n")


