// This will be created inside the WklineCtrl scope, but it will be globally
// available for data injection into the controller scope
var wkInject,
    wkHandlers,
    merge_recursive

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

wkHandlers = {
	widget: function ($scope, data) {
		if (! $scope.widget.hasOwnProperty(data._widget)) {
			$scope.widget[data._widget] = {}
		}
		$scope.widget[data._widget] = merge_recursive($scope.widget[data._widget], data)
	},
}

angular.module('Wkline', [])
	.controller('WklineCtrl', ['$scope', function ($scope) {
		$scope.widget = {}
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
					wkHandlers[handler]($scope, payload.data)
				}
				catch (e) {}
			})
		}
	}])
