var settings = {
	vyup: 20,
	dup: 1.1,
	hover: 0.15,
	aydown: 40,
	vx: 6,
	hangtime: 0.2,
	ahang: 1.4,
	tmercy: 1.6,
	sectorsize: 40,
}
var qobj = {}
var qstring = window.location.search.slice(1)
qstring.split("&").forEach(function (qstr) {
	var a = qstr.split("=")
	if (a.length == 1) qobj[a[0]] = true
	if (a.length == 2) qobj[a[0]] = JSON.parse(decodeURIComponent(a[1]))
})
var DEBUG = qobj.DEBUG

