#!/usr/bin/python

# Authorization script!
# Must specify one of the following acts:
#   signin: doesn't do anything, just takes you to the signin screen
#   signinpersona: Sign in using Mozilla Persona
#   signout

# TODO: verify SSL certificates
# https://developer.mozilla.org/en-US/docs/Persona/Security_Considerations#Verify_SSL_certificates

import cgi, os, cgitb, json, urllib, urllib2
import userdb

cgitb.enable(display = 0, logdir = "/tmp")
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
act = form["act"] if "act" in form else "signin"

if act == "signin":
	print("Content-type: text/html\n\n")
	print("TODO: add signin screenio")
	print(form)
	exit()
elif act == "signinpersona":
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
		print("Content-type: text/html\n\n")
		print("response: %s" % response)
		exit()
	else:
		print("Content-type: text/html\n\n")
		print("response: %s" % response)
		exit()

elif act == "signout":
	user = userdb.currentuser()
	if user:
		userdb.removesessions(user)
	print("Set-Cookie: personauser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;")
	print("Set-Cookie: user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;")
	print("Set-Cookie: session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;")

print("Content-type: text/html\n\n")


