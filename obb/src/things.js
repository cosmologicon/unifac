// Try to keep this module from growing uncontrollably
// This should only be for very broad, generic thing-related stuff


var thingprotos = {}
function makething(spec) {
	var type = spec.type
	var thing = Object.create(thingprotos[type])
	thing.setspec(spec)
	return thing
}

var HasSpec = {
	init: function (spectype) {
		this.type = type
		thingprotos[type] = this
	},
	getspec: function () {
		var spec = {}
		this.applyspec(spec)
		return spec
	},
	applyspec: function (spec) {
		spec.type = this.type
		spec.id = this.id
	},
	setspec: function (spec) {
		this.id = spec.id
	},
}

var GridBound = {
	applyspec: function (spec) {
		spec.pN = this.pN
	},
	setspec: function (spec) {
		this.pN = spec.pN
		this.pH = HconvertN(this.pN)
		this.pG = GconvertH(this.pH)
	},
}


