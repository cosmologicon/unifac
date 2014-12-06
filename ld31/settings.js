var settings = {
	gamename: "LD31",
	savename: "LD31save",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
}
if (window.location.href.indexOf("RESET") > -1) {
	delete window.localStorage[settings.savename]
}

