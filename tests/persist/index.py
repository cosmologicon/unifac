import cgi, os, cgitb, json, urllib, urllib2, time
import userdb, playbackdb

cgitb.enable(display = 0, logdir = "/tmp")
#form = cgi.FieldStorage()
#form = { field: form.getfirst(field) for field in form }
print("Content-type: text/html\n\n")
for x in range(20):
	print("<p>test")
	time.sleep(0.5)



