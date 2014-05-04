# Quick packaging utility for JavaScript games. Useful for game jams where I don't need to do
# anything too sophisticated. Concatenates and minifies all the JavaScript files included by
# game.html and includes them in a script tag directly within the HTML, outputting to index.html.

# Usage:
#   python make.py gamedir
# gamedir is a subdirectory of unifac/

import sys, os
from subprocess import Popen, PIPE
from BeautifulSoup import BeautifulSoup, Comment

# Get YUI compressor from https://github.com/yui/yuicompressor/releases
yuipath = "/home/christopher/Downloads/yuicompressor-2.4.8.jar"

gamedir = sys.argv[1]
gamefile = os.path.join(gamedir, "game.html")
if not os.path.exists(gamefile):
	raise IndexError("Missing game file: " + gamefile)

# Parse game document
html = BeautifulSoup(open(gamefile).read())

# Strip comments
for comment in html.findAll(text=lambda text:isinstance(text, Comment)):
	comment.extract()

url = "https://code.google.com/p/unifac/source/browse/#hg%2F" + gamedir
html.insert(1, "\n<!-- Unminified version available at: %s -->" % url)

code = ""
for script in html.findAll("script"):
	if script["src"]:
		code += open(os.path.join(gamedir, script["src"])).read()
	else:
		code += script.contents
	script.extract()

html = BeautifulSoup(str(html))  # Gets rid of whitespace
if code:
	com = "java -jar %s --type=js" % yuipath
	proc = Popen(com.split(), stdin=PIPE, stdout=PIPE)
	proc.stdin.write(code)
	proc.stdin.close()
	code = proc.stdout.read()
	html.append("<script>%s</script>" % code)

with open(os.path.join(gamedir, "index.html"), "w") as f:
	f.write(str(html))

