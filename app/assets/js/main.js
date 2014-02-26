// This will be created inside the WklineCtrl scope, but it will be globally
// available for data injection into the controller scope
var wkInject,
    wkHandlers,
    wkFilters,
    merge_recursive,
    pad

merge_recursive = function (obj1, obj2) {
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

pad = function (n, width, z) {
	z = z || '0'
	n = n + ''
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

wkHandlers = {
	widget: function ($scope, data) {
		if (! $scope.widget.hasOwnProperty(data._widget)) {
			$scope.widget[data._widget] = {}
		}
		$scope.widget[data._widget] = merge_recursive($scope.widget[data._widget], data)
	},
}

wkFilters = {
	now_playing: function (data) {
		var elapsedMinutes = Math.floor(data.elapsed_sec / 60),
		    elapsedSeconds = data.elapsed_sec % 60,
		    totalMinutes = Math.floor(data.total_sec / 60),
		    totalSeconds = data.total_sec % 60

		data.elapsed_time = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
		data.total_time = totalMinutes + ':' + pad(totalSeconds, 2)
		data.elapsed_percent = data.elapsed_sec / data.total_sec * 100

		return data
	},
	weather: function (data) {
		var tempConversions = {
			'c': function (temp) { return temp },
			'f': function (temp) { return (temp * 9 / 5) + 32 },
			'k': function (temp) { return temp + 273.15 },
		}

		if (! tempConversions.hasOwnProperty(data.unit)) {
			data = {}
		}
		data.temp = tempConversions[data.unit](data.temp)

		return data
	},
}

angular.module('Wkline', [])
	.controller('WklineCtrl', ['$scope', function ($scope) {
		$scope.widget = {};

		var updateDatetimeWidget = function () {
			var now = new Date()
			$scope.widget.datetime = {
				date: now.getFullYear() + '-' +
					pad(now.getMonth() + 1, 2) + '-' +
					pad(now.getDate(), 2),
				time: pad(now.getHours(), 2) + ':' +
					pad(now.getMinutes(), 2),
			}
		}

		// For some reason $scope.$apply breaks if run outside this setTimeout block
		setTimeout(function () { $scope.$apply(updateDatetimeWidget)}, 1)
		setInterval(function () { $scope.$apply(updateDatetimeWidget)}, 10000)

		wkInject = function (payload) {
			if (! payload) {
				return false
			}

			$scope.$apply(function () {
				var handler

				if (payload.hasOwnProperty('widget')) {
					handler = 'widget'
					payload.data._widget = payload.widget
				}
				if (payload.hasOwnProperty('init')) {
					handler = 'init'
				}
				if (payload.hasOwnProperty('action')) {
					handler = 'action'
				}

				if (! handler || ! wkHandlers.hasOwnProperty(handler)) {
					return false
				}

				try {
					if (wkFilters.hasOwnProperty(payload.data._widget)) {
						// pass through filter
						payload.data = wkFilters[payload.data._widget](payload.data)
					}
					wkHandlers[handler]($scope, payload.data)
				}
				catch (e) {}
			})
		}
	}])
