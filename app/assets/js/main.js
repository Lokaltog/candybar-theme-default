var widgets = new WidgetStorage(),
    widget_datetime

widget_datetime = function (config) {
	this.config = mergeRecursive({
		interval: 1000,
		showSeconds: true,
	}, config)
	this.container = $('#datetime')
	this.fields = {
		date: $('.date', this.container),
		time: $('.time', this.container),
	}
	this.init = function () {
		show(this.container)
		setInterval(this.update.bind(this), this.config.interval)
		this.update()
	}
	this.update = function () {
		var now = new Date(),
		    date = now.getFullYear() + '-' +
			    pad(now.getMonth() + 1, 2) + '-' +
			    pad(now.getDate(), 2),
		    time = pad(now.getHours(), 2) + ':' +
			    pad(now.getMinutes(), 2)

		if (this.config.showSeconds) {
			time += ':' +  pad(now.getSeconds(), 2)
		}

		this.fields.date.textContent = date
		this.fields.time.textContent = time
	}
}

widget_external_ip = function (config) {
	this.config = mergeRecursive({
	}, config)
	this.container = $('#external_ip')
	this.field = $('.ip', this.container),
	this.data = {}
	this.update = function (data) {
		show(this.container)
		this.field.textContent = data.ip
	}
}

widget_desktops = function (config) {
	this.config = mergeRecursive({
	}, config)
	this.containers = {
		desktops: $('#desktops'),
		window: $('#window'),
	}
	this.data = {}
	this.update = function (data) {
		show(this.containers.desktops, this.containers.window)

		// check if we need to replace all the desktop elements
		if (this.data.desktopsLen !== data.desktops.length) {
			this.data.desktopsLen = data.desktops.length
			while (this.containers.desktops.firstChild) {
				this.containers.desktops.removeChild(this.containers.desktops.firstChild)
			}
			for (var i = 0; i < data.desktops.length; i += 1) {
				var desktopEl = document.createElement('li'),
				    desktopName = (i + 1).toString()
				desktopEl.textContent = desktopName
				desktopEl.classList.add('desktop-' + desktopName, 'desktop')
				this.containers.desktops.appendChild(desktopEl)
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

		this.containers.window.textContent = data.current_window
	}
}

widget_now_playing = function (config) {
	this.config = mergeRecursive({
		interval: 1000,
	}, config)
	this.container = $('#now_playing')
	this.fields = {
		elapsed_time: $('.elapsed_time', this.container),
		total_time: $('.total_time', this.container),
		elapsed_percent_bar: $('.bar.elapsed_percent', this.container),
		artist: $('.artist', this.container),
		title: $('.title', this.container),
		status_icon: $('.status-icon', this.container),
	}
	this.data = {}
	this.elapsedUpdater = null
	this.elapsedUpdaterCb = function () {
		this.data.elapsed_sec += 1

		var elapsedMinutes = Math.floor(this.data.elapsed_sec / 60),
		    elapsedSeconds = this.data.elapsed_sec % 60

		this.fields.elapsed_time.textContent = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
		this.fields.elapsed_percent_bar.style.width = (this.data.elapsed_sec / this.data.total_sec * 100) + '%'
	}
	this.update = function (data) {
		if (! data.artist || ! data.title) {
			hide(this.container)
			return
		}
		this.data = data
		show(this.container)

		var elapsedMinutes = Math.floor(data.elapsed_sec / 60),
		    elapsedSeconds = data.elapsed_sec % 60,
		    totalMinutes = Math.floor(data.total_sec / 60),
		    totalSeconds = data.total_sec % 60

		this.fields.elapsed_time.textContent = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
		this.fields.total_time.textContent = totalMinutes + ':' + pad(totalSeconds, 2)
		this.fields.elapsed_percent_bar.style.width = (data.elapsed_sec / data.total_sec * 100) + '%'
		this.fields.artist.textContent = data.artist
		this.fields.title.textContent = data.title
		if (data.playing) {
			this.fields.status_icon.classList.add('playing')
		}
		else {
			this.fields.status_icon.classList.remove('playing')
		}

		clearInterval(this.elapsedUpdater)
		if (data.playing) {
			this.elapsedUpdater = setInterval(this.elapsedUpdaterCb.bind(this), this.config.interval)
		}
	}
}

widget_volume = function (config) {
	this.config = mergeRecursive({
	}, config)
	this.container = $('#volume')
	this.fields = {
		icon: $('.icon', this.container),
		percent_bar: $('.bar.volume_percent', this.container),
	}
	this.update = function (data) {
		show(this.container)

		this.fields.percent_bar.style.width = data.percent + '%'

		this.fields.icon.classList.remove('off', 'low', 'medium', 'high')
		if (data.percent > 75) {
			this.fields.icon.classList.add('high')
		}
		else if (data.percent > 30) {
			this.fields.icon.classList.add('medium')
		}
		else if (data.percent > 0) {
			this.fields.icon.classList.add('low')
		}
		else {
			this.fields.icon.classList.add('off')
		}
	}
}

widget_weather = function (config) {
	this.config = mergeRecursive({
	}, config)
	this.container = $('#weather')
	this.fields = {
		icon: $('.icon', this.container),
		temp: $('.temp', this.container),
	}
	this.tempConversions = {
		'c': function (temp) { return temp },
		'f': function (temp) { return (temp * 9 / 5) + 32 },
		'k': function (temp) { return temp + 273.15 },
	}
	this.update = function (data) {
		show(this.container)
		this.fields.temp.classList.remove('c', 'f', 'k')

		this.fields.icon.src = 'static/img/weather/' + data.icon + '.svg'
		this.fields.temp.textContent = this.tempConversions[data.unit.toLowerCase()](data.temp)
		this.fields.temp.classList.add(data.unit)
	}
}

// TODO move this to the C files based on the #defines there
widgets.register('datetime')
widgets.register('desktops')
widgets.register('external_ip')
widgets.register('now_playing')
widgets.register('volume')
widgets.register('weather')
