from lib.websocket import websocket
import logging
import settings, client, util

log = logging.getLogger(__name__)

def main():
	username = util.getlogin()
	with client.run(username):
		while client.playing:
			client.getupdates()



