var settings = {
	gamename: "Stroids vs Toids",
	savename: "LD30save",
	DEBUG: window.location.href.indexOf("-dev") > -1,
	EDITOR: window.location.href.indexOf("EDITOR") > -1,
	rescolors: ["rgb(0,0,255)", "rgb(200,100,0)", "red", "white"],
	resfades: ["rgba(0,0,255,0)", "rgba(200,100,0,0)", "red", "white"],
	bloidcost: 4,
}
if (window.location.href.indexOf("RESET") > -1) {
	delete window.localStorage[settings.savename]
}

