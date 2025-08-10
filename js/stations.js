const animParams = {fps:30,animations:{0:[0],1:[0,1],r1:[1,0],2:[0,1,2],r2:[2,1,0],3:[0,1,2,3],r3:[3,2,1,0],4:[0,1,2,3,4],r4:[4,3,2,1,0],5:[0,1,2,3,4,5],r5:[5,4,3,2,1,0],6:[0,1,2,3,4,5,6],r6:[6,5,4,3,2,1,0],7:[0,1,2,3,4,5,6,7],r7:[7,6,5,4,3,2,1,0],8:[0,1,2,3,4,5,6,7,8],r8:[8,7,6,5,4,3,2,1,0],9:[0,1,2,3,4,5,6,7,8,9],r9:[9,8,7,6,5,4,3,2,1,0],10:[0,1,2,3,4,5,6,7,8,9,10],r10:[10,9,8,7,6,5,4,3,2,1,0]},loop: false,autoPlay: false},
	clr = {"artist":{"off":"rgb(255,255,255,0)","on":"rgb(255,255,255,1)"},"title":{"off":"rgb(201,201,201,0)","on":"rgb(201,201,201,1)"}},
	parser = ['record','ps','tm','teo'],
	showTitles = ['Record Club', 'Record Club Chart', 'Record News', 'Record Dance Radio', 'Record Superchart', 'Вейкаперы', 'Кремов и Хрусталёв', 'by DJ Peretse'],
	stream = ['https://radiorecord.hostingradio.ru/rr_main96.aacp','https://radiorecord.hostingradio.ru/ps96.aacp','https://radiorecord.hostingradio.ru/tm96.aacp','https://radiorecord.hostingradio.ru/teo96.aacp'];
let getCurVolPos = 0;

function currPlayerStatus(stat) {
	let cur = $('.station.active').find('.play-button');
	switch(stat !== undefined ? stat : playStatus) {
		case 'waiting':
		case 'stalled':
		case 'loading':
		case 'connecting': {
			if(!cur.hasClass('connecting')) {
				cur.addClass('connecting');
			} else if(cur.hasClass('stopped')) {
				cur.removeClass('stopped').addClass('connecting');
			} else if(cur.hasClass('playing')) {
				cur.removeClass('playing').addClass('connecting');
			}
			break;
		}
		case 'playing': {
			if(cur.hasClass('connecting')) {
				cur.removeClass('connecting').addClass('playing');
			} else if(!cur.hasClass('playing')) {
				cur.addClass('playing');
			}
			break;
		}
		default: {
			cur.removeClass(['connecting','playing']);
		}
	}
}

function openURL(windowName, url) {
	if(!window.popups) window.popups = [];
	let wnd = window.popups[windowName];
	if(wnd && !wnd.closed) wnd.focus(); 
	wnd = window.open(url, windowName, "top=100,left=200,width=418,height=544,location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no");
	wnd.focus();
	window.popups[windowName] = wnd;
}

function showOnlinePlayer(tab) {
	openURL($('head').children('title').html(), `${window.location.href}`);
}

function parseTitle(Titler, txt1, txt2) {
	$.each(Titler, function(key, val) {
		switch(key) {
			case 'artist': {
				txt1.html(val.setArtistName());
				txt1.animate({color: clr.artist.on}, 400, function() {
					$(this).attr('title', val);
				});
				break;
			}
			case 'trackname': {
				txt2.html(val.setSongName());
				txt2.animate({color: clr.title.on}, 400, function() {
					$(this).attr('title', val);
					currParser>=3 ? currParser = 0 : currParser++;
					$(`.station:eq(${currParser})`).children('.pie-timer').addClass('active');
					mInterval = setInterval(() => updateTitle(), 10000);
				});
				break;
			}
		}
	});
}

function updateTitle(startWith) {
	if(mInterval !== undefined) clearInterval(mInterval);
	$('.station').children('.pie-timer').removeClass('active');
	$.getJSON(`https://tags.radiorecord.fm/now.php?chan=${parser[startWith>=0 ? startWith : currParser]}`).done(function(data) {
		parseTitle(
			data,
			$(`.station:eq(${currParser})`).find('.station-track-artist'),
			$(`.station:eq(${currParser})`).find('.station-track-title')
		);
		setTimeout(() => hideTextMetadata(currParser), 9800);
	}).fail(function() {
		showMessage('notloaded');
		mInterval = setInterval(() => updateTitle(), 10000);
	});
}

function hideTextMetadata(num) {
	$(`.station:eq(${num})`).find('.station-track-artist').animate({color: clr.artist.off}, 400);
	$(`.station:eq(${num})`).find('.station-track-title').animate({color: clr.title.off}, 400);
}

Number.prototype.limiter = function(num) {
	if(Number(this) > 100) {
		return 100;
	} else if(Number(this) < 0) {
		return 0;
	} else {
		return Number(this);
	}
}

String.prototype.setArtistName = function(a_name) {
	if(String(this) === '' || String(this) === 'Radio Record') {
		return 'В эфире:';
	} else {
		return String(this);
	}
};

String.prototype.setSongName = function(s_name) {
	if(String(this) === '') {
		return ' ― ';
	} else if(String(this).indexOf('#') !== -1 || String(this).indexOf('Record Superchart') !== -1 || showTitles.includes(String(this))) {
		return String(this);
	} else {
		return `— ${String(this)}`;
	}
};

function setWatch(ts) {
	let time = Math.floor(ts/1000);
	let hours = String(Math.floor(time/3600)).padStart(2,'0');
	let minutes = String(Math.floor((time-hours*3600)/60)).padStart(2,'0');
	let seconds = String(time-(hours*3600+minutes*60)).padStart(2,'0');
	let milliseconds = String(ts%1000).padStart(3,'0');
	switch(playStatus) {
		case 'connecting':
		case 'loading':
		case 'playing': {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: ${watch_pos}">:${minutes}</span>
				<span style="color: rgb(255,255,255,1); margin-left: ${watch_pos}">:${seconds}</span>
				<span style="color: #575757">&nbsp${milliseconds}</span>
			`);
			break;
		}
		default: {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: ${watch_pos}">:${minutes}</span>
				<span style="color: rgb(255,255,255,1); margin-left: ${watch_pos}">:${seconds}</span>
			`);
		}
	}
}

function showMessage(txt) {
	switch(txt) {
		case 'copy':
			$('.tooltip').html('Текст скопирован в буфер обмена');
			break;
		case 'mute':
			$('.tooltip').html('Звук приглушен');
			break;
		case 'noselect':
			$('.tooltip').html('Станция не выбрана');
			break;
		case 'nocopy':
			$('.tooltip').html('Текст не был скопирован');
			break;
		case 'notloaded':
			$('.tooltip').html('Ошибка загрузки данных о текущем треке');
			break;
		case 'nowplaying':
			$('.tooltip').html('Воспроизведение остановлено');
			break;
		case 'restart':
			$('.tooltip').html('Воспроизведение перезапущено');
			break;
		case 'unmute':
			$('.tooltip').html('Звук возобновлен');
			break;
		default:
			$('.tooltip').html('Не понимаю, что ты от меня хочешь');
	}
	$('.tooltip').addClass('active');
	setTimeout(() => $('.tooltip').removeClass('active'), 5000);
}

(function($) {
	$.fn.extend({
		play: function() {
			$(this).find('.play-button').trigger('click');
		},
		restart: function() {
			soundManager.destroySound('record');
			playStatus = 'connecting';
			currPlayerStatus('connecting');
			setTimeout($(`#${radio}`).startPlay(url), 1500);
			showMessage('restart');
		},
		startPlay: function(link) {
			if(playStatus === 'playing' || playStatus === 'connecting') $(`#${radio}`).stop();
			soundObject = soundManager.createSound({
				autoLoad: false,
				autoPlay: true,
				html5PollingInterval: true,
				id: 'record',
				onfinish: function() {
					$(`#${radio}`).restart();
				},
				stream: true,
				url: link,
				useHtml5Audio: true,
				volume: smVolume
			});
			if(soundManager.muted) {
				soundManager.unmute();
				$('.volume-click').animateSprite('frame', smVolume/10);
			}
			setWatch(0);
			$('.watch').addClass('active');
			$('.station.active').children('.volume').addClass('active');
			$('.station.active').children('.station-text').addClass('shorted');
		},
		stop: function() {
			soundManager.destroySound('record');
			clearInterval(ctInterval);
			$('.station.active').children('.volume').removeClass('active');
			$('.station.active').find('.play-button').removeClass(['connecting','playing']);
			$('.station.active').children('.station-text').removeClass('shorted');
			$('.watch').removeClass('active');
			ctInterval = undefined,
			currTime = 0,
			playStatus = 'stopped';
			setWatch(0);
		}
	});

})(jQuery);
