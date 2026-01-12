const animParams = {fps:60,animations:{0:[0],1:[0,1],r1:[1,0],2:[0,1,2],r2:[2,1,0],3:[0,1,2,3],r3:[3,2,1,0],4:[0,1,2,3,4],r4:[4,3,2,1,0],5:[0,1,2,3,4,5],r5:[5,4,3,2,1,0],6:[0,1,2,3,4,5,6],r6:[6,5,4,3,2,1,0],7:[0,1,2,3,4,5,6,7],r7:[7,6,5,4,3,2,1,0],8:[0,1,2,3,4,5,6,7,8],r8:[8,7,6,5,4,3,2,1,0],9:[0,1,2,3,4,5,6,7,8,9],r9:[9,8,7,6,5,4,3,2,1,0],10:[0,1,2,3,4,5,6,7,8,9,10],r10:[10,9,8,7,6,5,4,3,2,1,0]},loop: false,autoPlay: false};
const clr = {"artist":{"off":"rgb(255,255,255,0)","on":"rgb(255,255,255,.7)"},"title":{"off":"rgb(163,163,163,0)","on":"rgb(163,163,163,.8)"}};
const parser = ['record','ps','tm','teo'];
const showArtists = ['Gvozd', 'Record Megamix', 'Selection'];
const showTitles = ['Record Club', 'Record News', 'Record Superchart', 'Record Club Chart', 'Record Dance Radio', 'by DJ Peretse', 'Вейкаперы', 'Кремов и Хрусталёв'];
const stream = ['https://radiorecord.hostingradio.ru/rr_main96.aacp','https://radiorecord.hostingradio.ru/ps96.aacp','https://radiorecord.hostingradio.ru/tm96.aacp','https://radiorecord.hostingradio.ru/teo96.aacp'];
const specialChars = /[@#$^*_\=\{};:"\\|<>\/]/;

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
	let params = url !== window.location.href ? (window.devicePixelRatio > 1 ? 'width=838,height=418' : 'width=844,height=422') : (window.devicePixelRatio > 1 ? 'width=417,height=544' : 'width=422,height=554');
	if(wnd && !wnd.closed) wnd.focus(); 
	wnd = window.open(url, windowName, `top=100,left=200,${params},location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`);
	wnd.focus();
	window.popups[windowName] = wnd;
}

function parseTitle(Titler, txt1, txt2) {
	$.each(Titler, function(key, val) {
		switch(key) {
			case 'artist': {
				txt1.animate({color: clr.artist.off}, 400, function() {
					$(this).html(val.setArtistName(Titler.trackname));
					$(this).attr('title', val);
					txt1.delay(150).animate({color: clr.artist.on}, 400);
				});
				break;
			}
			case 'trackname': {
				txt2.animate({color: clr.title.off}, 400, function() {
					$(this).html(val.setSongName(Titler.artist));
					$(this).attr('title', val);
					$('.station').children('.pie-timer').removeClass('active');
					txt2.delay(150).animate({color: clr.title.on}, 400, function() {
						currParser>=3 ? currParser = 0 : currParser++;
						$(`.station:eq(${currParser})`).children('.pie-timer').addClass('active');
						mInterval = setInterval(() => updateTitle(), 10000);
					});
				});
				break;
			}
		}
	});
}

function updateTitle(startWith) {
	if(mInterval !== undefined) clearInterval(mInterval);
	$.getJSON(`https://tags.radiorecord.fm/now.php?chan=${parser[startWith>=0 ? startWith : currParser]}`).done(function(data) {
		parseTitle(
			data,
			$(`.station:eq(${currParser})`).find('.station-track-artist'),
			$(`.station:eq(${currParser})`).find('.station-track-title')
		);
	}).fail(function() {
		$('.station').children('.pie-timer').removeClass('active');
		showMessage('notloaded');
		currParser>=3 ? currParser = 0 : currParser++
		$(`.station:eq(${currParser})`).delay(200).children('.pie-timer').addClass('active');
		mInterval = setInterval(() => updateTitle(), 10000);
	});
	return false;
}

Number.prototype.limiter = function(num) {
	return (Number(this) > 100 ? 100 : Number(this) < 0 ? 0 : Number(this));
}

String.prototype.setArtistName = function(s_name) {
	let artist = String(this);
	if(['Record','Radio Record',''].includes(artist) && checkShowIncludes(s_name)) {
		return `В эфире: ${s_name}`;
	} else if(showArtists.includes(artist)) {
		return `В эфире: ${artist}`;
	} else if(['Record','Radio Record',''].includes(artist) && !s_name) {
		return 'В эфире:';
	} else {
		return artist.stripWhitespace('artist');
	}
};

String.prototype.setSongName = function(a_name) {
	let title = String(this);
	if(title === "" || showTitles.includes(title) && !a_name) {
		return '—';
	} else if(showTitles.includes(title) && a_name !== "") {
		return title;
	} else if(specialChars.test(title)) {
		return title.stripWhitespace('title0');
	} else {
		return '— ' + title.stripWhitespace('title1');
	}
};

let checkShowIncludes = function(val) {
	if(showTitles.includes(val) || val.length > 0) {
		return true;
	} else if(val === "" || val.length === 0) {
		return false;
	}
}

String.prototype.stripWhitespace = function() {
	let txt_0 = String(this);
	if(txt_0.toUpperCase() === txt_0) {
		return (txt_0.length > 25 ? `${txt_0.slice(0, 25)} .&nbsp.&nbsp.` : txt_0);
	} else if(txt_0.toLowerCase() === txt_0) {
		return (txt_0.length > 31 ? `${txt_0.slice(0, 31)} .&nbsp.&nbsp.` : txt_0);
	} else {
		return (txt_0.length > 28 ? `${txt_0.slice(0, 28)} .&nbsp.&nbsp.` : txt_0);
	}
}

function setWatch(ts) {
	let time = Math.floor(ts/1000);
	let days = Math.floor(time%86400);
	let hours = String(Math.floor(days/3600)).padStart(2,'0');
	let minutes = String(Math.floor((days-hours*3600)/60)).padStart(2,'0');
	let seconds = String(days-(hours*3600+minutes*60)).padStart(2,'0');
	let milliseconds = String(ts%1000).padStart(3,'0');
	switch(playStatus) {
		case 'connecting':
		case 'loading':
		case 'playing': {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: -4px">:${minutes}</span>
				<span style="color: rgb(255,255,255,1); margin-left: -4px">:${seconds}</span>
				<span style="color: rgb(87,87,87,.5)">&nbsp${milliseconds}</span>
			`);
			break;
		}
		default: {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: -4px">:${minutes}</span>
				<span style="color: rgb(255,255,255,1); margin-left: -4px">:${seconds}</span>
			`);
		}
	}
}

function showMessage(txt, val) {
	let msg;
	if(txt !== undefined && val === undefined) {
		switch(txt) {
			case 'closeTab': msg = 'Теперь вкладку можно закрыть.'; break;
			case 'copy': msg = 'Текст скопирован в буфер обмена'; break;
			case 'copytext': msg = 'Нажми два раза, чтобы скопировать в буфер обмена'; break;
			case 'mute': msg = 'Звук приглушен'; break;
			case 'nocopy': msg = 'Текст не был скопирован'; break;
			case 'noselect': msg = 'Станция не выбрана'; break;
			case 'noconnect': msg = 'Ошибка подключения к аудиопотоку. Проверьте состояние интернет-соединения или попробуйте подключиться позже.'; break;
			case 'notloaded': msg = 'Ошибка загрузки данных о текущем треке'; break;
			case 'notplaying': msg = 'В данный момент ничего не играет.';
			case 'nowplaying': msg = 'Воспроизведение остановлено'; break;
			case 'restart': msg = 'Воспроизведение перезапущено'; break;
			case 'unmute': msg = 'Звук возобновлен'; break;
			case 'volume': msg = `Громкость ${smVolume}%`; break;
			default: msg = 'Не понимаю, что ты от меня хочешь';
		}
		$('.tooltip').html(msg).addClass('active');
		setTimeout(() => $('.tooltip').removeClass('active'), 5000+String(msg).length*50);
	} else if(txt !== undefined && val !== undefined) {
		switch(txt) {
			case 'volume': msg = `Громкость ${val}%`; break;
		}
		$('.tooltip').hasClass('active') ? $('.tooltip').html(msg) : $('.tooltip').html(msg).addClass('active');
	} else {
		$('.tooltip').removeClass('active');
	}
}

function checkLSItems() {
	const obj = ['copyTextTip', 'currVolume'];
	for(cls = 0; cls < obj.length; cls++) {
		if(!localStorage[obj[cls]]) setLSItem(obj[cls]);
	}
}

function setLSItem(id) {
	switch(id) {
		case 'copyTextTip': localStorage[id] = false; break;
		case 'currVolume': localStorage[id] = '75'; break;
	}
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
			localStorage.playSource = 'current';
		},
		stop: function() {
			soundManager.destroySound('record');
			clearInterval(ctInterval);
			$('.station.active').children('.volume').removeClass('active');
			$('.station.active').find('.play-button').removeClass(['connecting','playing']);
			$('.watch').removeClass('active');
			ctInterval = undefined,
			currTime = 0,
			playStatus = 'stopped';
			setWatch(0);
			localStorage.playSource = '';
		}
	});
})(jQuery);

