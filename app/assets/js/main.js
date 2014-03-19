registerCallback('battery', function (percentage, state, timeToEmpty, timeToFull) {
	var container
	var fields
	var stateClass = {
		0: 'unknown',
		1: 'charging',
		2: 'discharging',
		3: 'empty',
		4: 'full',
		5: 'charging', // charging pending
		6: 'discharging', // discharging pending
	}
	var container = $('#widget_battery')
	var fields = {
		icon: $('.contents .icon', container),
		percentage: $('.contents .percentage', container),
		time_left: $('.contents .time_left', container),
	}

	var sec
	var timeLeft = ''
	var timeLeftHours
	var timeLeftMinutes
	var timeLeftSeconds

	show($('.contents', container))
	if (timeToEmpty) {
		sec = data.timeToEmpty
	}
	if (timeToFull) {
		sec = timeToFull
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
	container.classList.add('state-' + stateClass[state])
	container.classList.remove('percentage-critical', 'percentage-low', 'percentage-medium', 'percentage-high')
	if (percentage >= 70) {
		container.classList.add('percentage-high')
	}
	else if (percentage >= 40) {
		container.classList.add('percentage-medium')
	}
	else if (percentage >= 5) {
		container.classList.add('percentage-low')
	}
	else {
		container.classList.add('percentage-critical')
	}

	fields.percentage.textContent = Math.round(percentage) + '%'
	fields.time_left.textContent = timeLeft
})

registerCallback('datetime', function (date, time) {
	var container = $('#widget_datetime .contents')
	var fields = {
		date: $('.date', container),
		time: $('.time', container),
	}
	show(container)
	fields.date.textContent = date
	fields.time.textContent = time
})

registerCallback('desktops', function (desktopObj) {
	var data = JSON.parse(desktopObj)
	var container = $('#widget_desktops .contents')
	show(container)

	this.data = {}

	// check if we need to replace all the desktop elements
	if (this.data.desktopsLen !== data.desktops.length) {
		this.data.desktopsLen = data.desktops.length
		while (container.firstChild) {
			container.removeChild(container.firstChild)
		}
		for (var i = 0; i < data.desktops.length; i += 1) {
			var desktopEl = document.createElement('li')
			desktopEl.textContent = data.desktops[i].name
			desktopEl.classList.add('desktop-' + (i + 1), 'desktop')
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
})

registerCallback('email_imap', function (unread) {
	var container = $('#widget_email_imap .contents')
	var field = $('.unread', container)

	show(container)

	container.classList.remove('has-unread')
	field.textContent = ''

	if (unread > 0) {
		container.classList.add('has-unread')
		field.textContent = unread
	}
})

registerCallback('external_ip', function (ip) {
	var container = $('#widget_external_ip .contents')
	if (!ip) {
		hide(container)
		return
	}
	show(container)
	$('.ip', container).textContent = ip
})

registerCallback('magick_background', function (img, cssOverlay) {
	var overlay = ''
	if (cssOverlay) {
		overlay += '-webkit-linear-gradient(' + cssOverlay + '),'
	}
	$('#statusline-bg').style.background = overlay + 'url(data:image/jpg;base64,' + img + ')'
})

var nowPlayingElapsedUpdater = null
registerCallback('now_playing_mpd', function (title, artist, album, timeTotal, timeElapsed, playing) {
	var container = $('#widget_now_playing .contents')
	if (!artist || !title) {
		hide(container)
		return
	}
	var fields = {
		elapsedTime: $('.elapsed_time', container),
		totalTime: $('.total_time', container),
		elapsedPercentBar: $('.bar.elapsed_percent', container),
		artist: $('.artist', container),
		title: $('.title', container),
		statusIcon: $('.status-icon', container),
	}
	var elapsedUpdaterCb = function (elapsed) {
		if (!this.elapsed) {
			this.elapsed = elapsed
		}
		this.elapsed += 1

		var elapsedMinutes = Math.floor(this.elapsed / 60)
		var elapsedSeconds = this.elapsed % 60

		fields.elapsedTime.textContent = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
		fields.elapsedPercentBar.style.width = (data.elapsedSec / data.totalSec * 100) + '%'
	}

	show(container)

	var elapsedMinutes = Math.floor(timeElapsed / 60),
	    elapsedSeconds = timeElapsed % 60,
	    totalMinutes = Math.floor(timeTotal / 60),
	    totalSeconds = timeTotal % 60

	fields.elapsedTime.textContent = elapsedMinutes + ':' + pad(elapsedSeconds, 2)
	fields.totalTime.textContent = totalMinutes + ':' + pad(totalSeconds, 2)
	fields.elapsedPercentBar.style.width = (timeElapsed / timeTotal * 100) + '%'
	fields.artist.textContent = artist
	fields.title.textContent = title
	if (playing) {
		fields.statusIcon.classList.add('playing')
	}
	else {
		fields.statusIcon.classList.remove('playing')
	}

	clearInterval(nowPlayingElapsedUpdater)
	if (playing) {
		nowPlayingElapsedUpdater = setInterval(elapsedUpdaterCb, 1000, timeElapsed)
	}
})

registerCallback('volume', function (percentage, enabled, str) {
	var volumeContainer = $('#widget_volume .contents')
	var volumeFields = {
		icon: $('.icon', volumeContainer),
		percent_bar: $('.bar.volume_percent', volumeContainer),
	}
	show(volumeContainer)
	volumeFields.icon.classList.remove('off', 'low', 'medium', 'high')
	if (enabled) {
		volumeFields.percent_bar.style.width = percentage + '%'
		if (percentage > 75) {
			volumeFields.icon.classList.add('high')
		}
		else if (percentage > 30) {
			volumeFields.icon.classList.add('medium')
		}
		else if (percentage > 0) {
			volumeFields.icon.classList.add('low')
		}
		else {
			volumeFields.icon.classList.add('off')
		}
	}
	else {
		volumeFields.percent_bar.style.width = '0'
		volumeFields.icon.classList.add('off')
	}
	volumeContainer.offsetHeight // redraw
})

registerCallback('weather', function (code, temp, unit) {
	var container = $('#widget_weather .contents')
	var fields = {
		icon: $('.icon', container),
		temp: $('.temp', container),
	}
	var weatherIconEl = document.createElement('img')
	show(container)
	fields.temp.classList.remove('c', 'f', 'k')
	while (fields.icon.firstChild) {
		fields.icon.removeChild(fields.icon.firstChild)
	}
	weatherIconEl.src = 'static/img/weather/' + code + '.svg'
	fields.icon.appendChild(weatherIconEl)
	fields.temp.textContent = weatherTempConversions[unit.toLowerCase()](temp)
	fields.temp.classList.add(unit)
})

registerCallback('window_title', function (windowTitle) {
	var container = $('#widget_window_title .contents')
	show(container)
	container.textContent = windowTitle
})
