import cgi, datetime, urllib
import webapp2
from google.appengine.ext import db
from google.appengine.api import users, channel


print "executing yon code"
current_channel = None

class MainPage(webapp2.RequestHandler):
	def get(self):
		global current_channel
		self.response.out.write("<html><h1>Channel testing</h1>")
		self.response.out.write("<p>user: %s" % users.get_current_user())
		if current_channel is None:
			current_channel = channel.create_channel("abc")
			self.response.out.write("<p>Creating channel abc")
			print "Channel created: %s" % current_channel
		self.response.out.write("<p>%s" % current_channel)

	def post(self):
		print "Incoming POST request:", self.request


app = webapp2.WSGIApplication([
	("/channeltest.html", MainPage),
], debug = True)



