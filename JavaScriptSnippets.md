# Snippets #

Here are some simple snippets I find myself using that aren't big or important enough to make into a UFX module.



## Computational snippets ##

### Clamp value to a given range ###

```
function clamp(x,a,b){return x>b?b:x<a?a:x}

function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
```

`clamp(x,a,b)` will return the value in the range `[a,b]` that's closest to `x`. The second form can also be used with just two arguments, in which case `clamp(x,a)` will use the range `[-a,a]`.

### Timestep-independent exponential-decay approach factor ###

```
function efac(x){return 1-Math.exp(-x)}
```

One way to make some value smoothly approach another value. For instance, to make `x` approach `x0` smoothly, every frame set `x += (x0 - x) * efac(3 * dt)`, where `dt` is the timestep. Note that `efac(x)` is approximately equal to `x` for small `x`, so if you're not concerned about numerical accuracy (eg moving the HUD), then it's fine to just say `x += (x0 - x) * (3 * dt)`.

### Robust modulo ###

```
function rmod(x,z){return(x%z+z)%z}
```

`rmod(x,z)` returns a value in the range `[0,z)` that's equal to `x` mod `z`, regardless of the sign of `x`. This is how python handles the modulo of negative numbers.

### Zero-centered modulo ###

```
function zmod(x,z){return((x+z/2)%z+z)%z-z/2}
```

`zmod(x,z)` returns a value in the range `[-z/2,z/2)` that's equal to `x` mod `z`.

## DOM and browser utilities ##

### Convert object to/from query string ###

```
function objqstring (obj) {
    var a = []
    for (var s in obj) {
        a.push(s + "=" + encodeURIComponent(JSON.stringify(obj[s])))
    }
    return a.join("&")
}
```

```
function qstringobj (qstring) {
    var obj = {}
    qstring = qstring || window.location.search.slice(1)
    qstring.split("&").forEach(function (qstr) {
        var a = qstr.split("=")
        if (a.length == 1) obj[a[0]] = null
        if (a.length == 2) obj[a[0]] = JSON.parse(decodeURIComponent(a[1]))
    })
    return obj
}
```

### Cookies in an object ###

```
var cookies = {}
document.cookie.split(";").forEach(function (kv) {
    kv = kv.replace(/^\s\s*/, "").split("=")
    cookies[kv[0]] = decodeURIComponent(kv[1])
})
```

### Read error message when you don't have a console ###

```
window.onerror = function (error, url, line) {
    document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
}
```

## Canvas-based snippets ##

### Screenshot in pop-up window ###

```
window.open(canvas.toDataURL())
```

### Word wrap ###

Give it a string, (optionally) a max width in pixels, and (optionally) a context that has the appropriate font set. Returns an array of strings split on spaces each of which is no longer than the given width. The context defaults to the global variable `context`. The max width defaults to the width of the context's canvas.

```
function wordwrap(text, twidth, con) {
    con = con || context
    twidth = twidth || con.canvas.width
    var texts = [text], n = 0, s
    while (con.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
        var t = texts[n], a = t.lastIndexOf(" ")
        while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
        texts[n++] = t.substr(0, a)
        texts.push(t.substr(a+1))
    }
    return texts
}
```

## Polyfill ##

### `requestAnimationFrame` ###

```
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||  
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame
```

### `requestFullscreen` ###

```
canvas.requestFullscreen = canvas.requestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullScreen
document.cancelFullscreen = document.cancelFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen
```

And if you're using UFX.maximize, also include:

```
UFX.maximize.getfullscreenelement = function () {
    return document.fullScreenElement || document.webkitCurrentFullScreenElement || document.mozFullScreenElement
}
```