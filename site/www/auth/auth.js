// Use this file along with the Persona include file:
// <script src="https://login.persona.org/include.js"></script>
// <script src="http://universefactory.net/auth/auth.js"></script>

// Also create a container with id="signinbox" if you want buttons.

// Let's keep everything in a nice namespace, shall we?
var AUTH = {}

AUTH.cookies = {}
document.cookie.split(";").forEach(function (kv) {
	kv = kv.replace(/^\s\s*/, "").split("=")
	AUTH.cookies[kv[0]] = decodeURIComponent(kv[1])
})
//alert(document.cookie)
//alert(AUTH.cookies.personauser)

// Sign in / out buttons etc.
AUTH.signinbox = document.getElementById('signinbox')
AUTH.signinpersona = document.getElementById('signinpersona')
AUTH.signout = document.getElementById('signout')
if (AUTH.signinbox) {
	if (AUTH.cookies.user) {
		if (AUTH.cookies.personauser) {
			message = "Signed in as " + AUTH.cookies.personauser + " : "
		} else {
			message = "Signed in : "
		}
		AUTH.mess = document.createElement("p")
		AUTH.mess.appendChild(document.createTextNode(message))
	    AUTH.signinbox.appendChild(AUTH.mess)

		AUTH.signout = document.createElement("a")
		AUTH.signout.href = "#"
		AUTH.signout.appendChild(document.createTextNode("Sign out"))
	    AUTH.signinbox.appendChild(AUTH.signout)
	} else {
		if (!AUTH.signinpersona) {
			AUTH.signinbox.className += " signintooltip"
			AUTH.signinpersona = document.createElement("img")
			AUTH.signinpersona.src = "https://developer.mozilla.org/files/3961/persona_sign_in_black.png"
		    AUTH.signinbox.appendChild(AUTH.signinpersona)
		}
	}
}

if (AUTH.signinpersona) {
	AUTH.signinpersona.onclick = function() {
		navigator.id.request({
			siteName: "Universe Factory Games",
//			siteLogo: ...,   TODO: make a site logo 100x100px
		})
		return false
	}
}

if (AUTH.signout) {
	AUTH.signout.onclick = function() {
		navigator.id.logout()
		return false
	}
}

AUTH.postreload = function (url, qstring) {
	var req = new XMLHttpRequest()
	req.open("POST", url, true)
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	req.send(qstring)
	req.onreadystatechange = (function (r) {
		return function () {
//			console.log([r.readyState, r.status, r.response])
			if (r.readyState == 4 && r.status == 200) window.location.reload(true)
		}
	})(req)
}

navigator.id.watch({
	loggedInUser: AUTH.cookies.personauser || null,
	onlogin: function (assertion) {
		AUTH.postreload(
			"http://universefactory.net/auth/",
			"assertion=" + encodeURIComponent(assertion) + "&act=signinpersona"
		)
	},
	onlogout: function () {
		AUTH.postreload(
			"http://universefactory.net/auth/",
			"act=signout"
		)
	},
})

