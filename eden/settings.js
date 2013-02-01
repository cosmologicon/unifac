var settings = {
	sx: 960, sy: 540,
	vx0: 500, vy0: 270,
	musicvolume: 0.4,
	savegamename: "devilshandiworksave",
	
	allowzoom: true,

	sins: ["defy", "want", "pride", "gorge", "rage", "laze"],
	
	// Game mechanics
	blobheight: 20,
	gravity: 600,
	hopvx: 100,
	hopvy: 160,
	hopdelay: 0.2,
	wantv: 100,
	wanta: 100,
	ragerange: 40,
	ragegravity: 10000,
	ragehopvy: 1000,
	ragetime: 3.0,
	gorgetime: 4.0,
	pridetime: 8.0,
	pridevx: 30,
	pridevy: 110,
	lazetime: 10.0,
	lazerange: 25,

	tradius: 30,  // cursor target radius
	touchtradius: 60,
	zfactor: 0.04,
}

settings.allowzoom = window.location.href.indexOf("nozoom") == -1



