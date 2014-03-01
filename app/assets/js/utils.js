var $, show, hide, pad, mergeRecursive, WidgetStorage

$ = function (selector, el) {
	if (!el) {
		el = document
	}
	return el.querySelector(selector)
}

show = function () {
	for (var i = 0; i < arguments.length; i += 1) {
		arguments[i].parentNode.style.display = 'inline-block'
	}
}

hide = function () {
	for (var i = 0; i < arguments.length; i += 1) {
		arguments[i].parentNode.style.display = 'none'
	}
}

pad = function (n, width, z) {
	z = z || '0'
	n = n + ''
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

mergeRecursive = function (obj1, obj2) {
	// http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
	for (var p in obj2) {
		try {
			// Property in destination object set update its value.
			if (obj2[p].constructor === Object) {
				obj1[p] = merge_recursive(obj1[p], obj2[p])
			} else {
				obj1[p] = obj2[p]
			}
		}
		catch (e) {
			// Property in destination object not set create it and set its value.
			obj1[p] = obj2[p]
		}
	}

	return obj1
}

WidgetStorage = function () {
	this.widgets = {}
	this.register = function (widget, config) {
		this.widgets[widget] = new window['widget_' + widget](config)
		if (this.widgets[widget].hasOwnProperty('init')) {
			this.widgets[widget].init()
		}
	}
	this.update = function (widget, data) {
		this.widgets[widget].update(data)
	}
}
