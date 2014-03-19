var $ = function (selector, el) {
	if (!el) {
		el = document
	}
	return el.querySelector(selector)
}

var show = function () {
	for (var i = 0; i < arguments.length; i += 1) {
		arguments[i].parentNode.style.display = 'inline-block'
	}
}

var hide = function () {
	for (var i = 0; i < arguments.length; i += 1) {
		arguments[i].parentNode.style.display = 'none'
	}
}

var pad = function (n, width, z) {
	z = z || '0'
	n = n + ''
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

var registerCallback = function (widget, fn) {
	var obj = 'widget_' + widget
	if (typeof window[obj] === 'undefined') {
		return false
	}
	window[obj].onDataChanged = fn
}

var weatherTempConversions = {
	'c': function (temp) { return temp },
	'f': function (temp) { return (temp * 9 / 5) + 32 },
	'k': function (temp) { return temp + 273.15 },
}
