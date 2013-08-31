import os, urllib2, json

charsets = [
	("uppercase", "ABCDEFGHIJKLMNOPQRSTUVWXYZ-.,!%20%3F"),
	("lowercase", "abcdefghijklmnopqrstuvwxyz-.,!%20%3F"),
	("Fortuna", "Fortuna"),
]

useragents = [
	("python", None),
	("firefox", "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:21.0) Gecko/20100101 Firefox/21.0"),
	("chrome", "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36"),
]

apikey = open("google-api-HGIGNORE").read().strip()

if not os.path.exists("fontdata.json"):
	url = "https://www.googleapis.com/webfonts/v1/webfonts?key=%s" % apikey
	fontdata = urllib2.urlopen(url).read()
	open("fontdata.json", "w").write(fontdata)

fontdata = json.load(open("fontdata.json"))


urlcache = {}
def geturl(url, useragent=None):
	key = url, useragent
	if key not in urlcache:
		req = urllib2.Request(url)
		if useragent:
			req.add_header("User-Agent", useragent)
		opener = urllib2.build_opener()
		urlcache[key] = opener.open(req).read()
	return urlcache[key]

for font in fontdata["items"]:
	fname = font["family"]
	variants = font["variants"]
	for variant in variants:
		fspec = fname.replace(" ", "+") + ":" + variant
		for csname, charset in charsets:
			url = "http://fonts.googleapis.com/css?key=%s&family=%s&text=%s" % (apikey, fspec, charset)
			for uaname, useragent in useragents:
				response = geturl(url, useragent)
				srcline = [line for line in map(str.strip, response.splitlines()) if line.startswith("src")][0]
				for src in srcline[5:-1].split(", "):
					if not src.startswith("url"):
						continue
					furl, fmt = src.split(" ")
					furl = furl[4:-1]
					fmt = fmt[8:-2]
					fontfile = geturl(furl, useragent)
					print fname.replace(" ", "+"), variant, csname, uaname, furl, fmt, len(fontfile)


