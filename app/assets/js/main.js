var widgets = new WidgetStorage(),
    widget_battery,
    widget_datetime,
    widget_desktops,
    widget_external_ip,
    widget_now_playing_mpd,
    widget_volume,
    widget_weather,
    widget_window_title

widget_battery = function (config) {
	var container, fields, stateClass = {
		0: 'unknown',
		1: 'charging',
		2: 'discharging',
		3: 'empty',
		4: 'full',
		5: 'charging', // charging pending
		6: 'discharging', // discharging pending
	}
	config = mergeRecursive({
	}, config)
	container = $('#widget_battery')
	fields = {
		icon: $('.contents .icon', container),
		percentage: $('.contents .percentage', container),
		time_left: $('.contents .time_left', container),
	}
	this.update = function (data) {
		var sec, timeLeft = '', timeLeftHours, timeLeftMinutes, timeLeftSeconds
		show($('.contents', container))
		if (data.time_to_empty) {
			sec = data.time_to_empty
		}
		if (data.time_to_full) {
			sec = data.time_to_full
		}
		if (sec) {
			timeLeftHours = parseInt(sec / 3600, 10) % 24
			timeLeftMinutes = parseInt(sec  / 60, 10) % 60
			timeLeftSeconds = parseInt(sec % 60, 10)
			if (timeLeftHours) {
				timeLeft += pad(timeLeftHours, 2) + ':'
			}
			if (timeLeftMinutes) {
				timeLeft += pad(timeLeftMinutes, 2) + ':'
			}
			timeLeft += pad(timeLeftSeconds, 2)
		}

		container.classList.remove('state-unknown', 'state-charging', 'state-discharging', 'state-empty', 'state-full')
		container.classList.add('state-' + stateClass[data.state])
		container.classList.remove('percentage-critical', 'percentage-low', 'percentage-medium', 'percentage-high')
		if (data.percentage >= 70) {
			container.classList.add('percentage-high')
		}
		else if (data.percentage >= 40) {
			container.classList.add('percentage-medium')
		}
		else if (data.percentage >= 5) {
			container.classList.add('percentage-low')
		}
		else {
			container.classList.add('percentage-critical')
		}

		fields.percentage.textContent = Math.round(data.percentage) + '%'
		fields.time_left.textContent = timeLeft
	}
}

widget_datetime = function (config) {
	var container, fields
	config = mergeRecursive({
		update_interval: 1000,
	}, config)
	container = $('#widget_datetime .contents')
	fields = {
		date: $('.date', container),
		time: $('.time', container),
	}
	this.update = function (data) {
		show(container)
		fields.date.textContent = data.date
		fields.time.textContent = data.time
	}
}

widget_desktops = function (config) {
	var container
	config = mergeRecursive({
	}, config)
	container = $('#widget_desktops .contents')
	this.data = {}
	this.update = function (data) {
		show(container)

		// check if we need to replace all the desktop elements
		if (this.data.desktopsLen !== data.desktops.length) {
			this.data.desktopsLen = data.desktops.length
			while (container.firstChild) {
				container.removeChild(container.firstChild)
			}
			for (var i = 0; i < data.desktops.length; i += 1) {
				var desktopEl = document.createElement('li'),
				    desktopName = (i + 1).toString()
				desktopEl.textContent = desktopName
				desktopEl.classList.add('desktop-' + desktopName, 'desktop')
				container.appendChild(desktopEl)
			}
		}

		data.desktops.forEach(function (d, i) {
			var desktopEl = $('.desktop-' + (i + 1))
			desktopEl.classList.remove('selected', 'has-windows', 'urgent')
			if (d.clients_len > 0) {
				desktopEl.classList.add('has-windows')
			}
			if (d.is_urgent) {
				desktopEl.classList.add('urgent')
			}
			if (i === data.current_desktop) {
				desktopEl.classList.add('selected')
			}
		})
	}
}

widget_external_ip = function (config) {
	var container
	config = mergeRecursive({
	}, config)
	container = $('#widget_external_ip .contents')
	this.field = $('.ip', container),
	this.update = function (data) {
		show(container)
		this.field.textContent = data.ip
	}
}

widget_now_playing_mpd = function (config) {
	var container, fields, elapsedUpdater, elapsedUpdaterCb
	config = mergeRecursive({
		update_interval: 1000,
	}, config)
	container = $('#widget_now_playing .contents')
	fields = {
		elapsed_time: $('.elapsed_time', container),
		total_time: $('.total_time', container),
		elapsed_percent_bar: $('.bar.elapsed_percent', container),
		artist: $('.artist', container),
		title: $('.title', container),
		status_icon: $('.status-icon', container),
	}
	this.data = {}
	elapsedUpdater = null
	elapsedUpdaterCb = function () {
		this.data.elapsed_sec += 1

		var elapsedMinutes = Math.floor(this.data.elapsed_sec / 60),
		    elapsedSeconds = this.data.elapsed_sec % 60

		fields.elapsed_time.textContent = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
		fields.elapsed_percent_bar.style.width = (this.data.elapsed_sec / this.data.total_sec * 100) + '%'
	}
	this.update = function (data) {
		if (! data.artist || ! data.title) {
			hide(container)
			return
		}
		this.data = data
		show(container)

		var elapsedMinutes = Math.floor(data.elapsed_sec / 60),
		    elapsedSeconds = data.elapsed_sec % 60,
		    totalMinutes = Math.floor(data.total_sec / 60),
		    totalSeconds = data.total_sec % 60

		fields.elapsed_time.textContent = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
		fields.total_time.textContent = totalMinutes + ':' + pad(totalSeconds, 2)
		fields.elapsed_percent_bar.style.width = (data.elapsed_sec / data.total_sec * 100) + '%'
		fields.artist.textContent = data.artist
		fields.title.textContent = data.title
		if (data.playing) {
			fields.status_icon.classList.add('playing')
		}
		else {
			fields.status_icon.classList.remove('playing')
		}

		clearInterval(elapsedUpdater)
		if (data.playing) {
			elapsedUpdater = setInterval(elapsedUpdaterCb.bind(this), config.update_interval)
		}
	}
}

widget_volume = function (config) {
	var container, fields
	config = mergeRecursive({
	}, config)
	container = $('#widget_volume .contents')
	fields = {
		icon: $('.icon', container),
		percent_bar: $('.bar.volume_percent', container),
	}
	this.update = function (data) {
		show(container)

		fields.percent_bar.style.width = data.percent + '%'

		fields.icon.classList.remove('off', 'low', 'medium', 'high')
		if (data.percent > 75) {
			fields.icon.classList.add('high')
		}
		else if (data.percent > 30) {
			fields.icon.classList.add('medium')
		}
		else if (data.percent > 0) {
			fields.icon.classList.add('low')
		}
		else {
			fields.icon.classList.add('off')
		}
	}
}

widget_weather = function (config) {
	var container, fields
	config = mergeRecursive({
	}, config)
	container = $('#widget_weather .contents')
	fields = {
		icon: $('.icon', container),
		temp: $('.temp', container),
	}
	this.tempConversions = {
		'c': function (temp) { return temp },
		'f': function (temp) { return (temp * 9 / 5) + 32 },
		'k': function (temp) { return temp + 273.15 },
	}
	this.update = function (data) {
		var weatherIconEl = document.createElement('img')
		show(container)
		fields.temp.classList.remove('c', 'f', 'k')

		while (fields.icon.firstChild) {
			fields.icon.removeChild(fields.icon.firstChild)
		}

		weatherIconEl.src = 'static/img/weather/' + data.icon + '.svg'
		fields.icon.appendChild(weatherIconEl)
		fields.temp.textContent = this.tempConversions[data.unit.toLowerCase()](data.temp)
		fields.temp.classList.add(data.unit)
	}
}

widget_window_title = function (config) {
	var container
	config = mergeRecursive({
	}, config)
	container = $('#widget_window_title .contents')
	this.data = {}
	this.update = function (data) {
		show(container)
		container.textContent = data.window_title
	}
}

// TODO move this to the C files based on the #defines there
widgets.register('battery')
widgets.register('datetime')
widgets.register('desktops')
widgets.register('external_ip')
widgets.register('now_playing_mpd')
widgets.register('volume')
widgets.register('weather')
widgets.register('window_title')
