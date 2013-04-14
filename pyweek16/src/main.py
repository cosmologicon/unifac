from lib.websocket import websocket
import logging
import settings, client, util

log = logging.getLogger(__name__)

def main():
	username, password = util.getlogin()
	with client.run(username, password):
		while client.playing:
			client.getupdates()



