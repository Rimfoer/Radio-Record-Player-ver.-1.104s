const animParams = {fps:60,animations:{0:[0],1:[0,1],r1:[1,0],2:[0,1,2],r2:[2,1,0],3:[0,1,2,3],r3:[3,2,1,0],4:[0,1,2,3,4],r4:[4,3,2,1,0],5:[0,1,2,3,4,5],r5:[5,4,3,2,1,0],6:[0,1,2,3,4,5,6],r6:[6,5,4,3,2,1,0],7:[0,1,2,3,4,5,6,7],r7:[7,6,5,4,3,2,1,0],8:[0,1,2,3,4,5,6,7,8],r8:[8,7,6,5,4,3,2,1,0],9:[0,1,2,3,4,5,6,7,8,9],r9:[9,8,7,6,5,4,3,2,1,0],10:[0,1,2,3,4,5,6,7,8,9,10],r10:[10,9,8,7,6,5,4,3,2,1,0]},loop: false,autoPlay: false};
const clr = {"artist":{"off":"rgb(255,255,255,0)","on":"rgb(255,255,255,1)"},"title":{"off":"rgb(163,163,163,0)","on":"rgb(163,163,163,1)"}};
const parser = ['record','ps','tm','teo'];
const showArtists = ['Gvozd', 'Record Megamix', 'Selection', 'Вейкаперы', 'Кремов и Хрусталёв'];
const showTitles = ['Record Club', 'Record News', 'Record Superchart', 'Record Club Chart', 'Record Dance Radio', 'by DJ Peretse'];
const stream = ['https://radiorecord.hostingradio.ru/rr_main96.aacp','https://radiorecord.hostingradio.ru/ps96.aacp','https://radiorecord.hostingradio.ru/tm96.aacp','https://radiorecord.hostingradio.ru/teo96.aacp'];
const specialChars = /[@#$%^*_\=\{};:"\\|<>\/]/;

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
	let resolution = url !== window.location.href ? 'width=839,height=420' : 'width=418,height=544';
	if(wnd && !wnd.closed) wnd.focus(); 
	wnd = window.open(url, windowName, `top=100,left=200,${resolution},location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`);
	wnd.focus();
	window.popups[windowName] = wnd;
}

function parseTitle(Titler, txt1, txt2) {
	$.each(Titler, function(key, val) {
		switch(key) {
			case 'artist': {
				txt1.animate({color: clr.artist.off}, 400, function() {
					$(this).html(val.setArtistName(Titler.trackname));
				});
				txt1.delay(150).animate({color: clr.artist.on}, 500, function() {
					$(this).attr('title', val);
					$('.station').children('.pie-timer').removeClass('active');
				});
				break;
			}
			case 'trackname': {
				txt2.animate({color: clr.title.off}, 400, function() {
					$(this).html(val.setSongName(Titler.artist));
				});
				txt2.delay(150).animate({color: clr.title.on}, 500, function() {
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
	$.getJSON(`https://tags.radiorecord.fm/now.php?chan=${parser[startWith>=0 ? startWith : currParser]}`).done(function(data) {
		parseTitle(
			data,
			$(`.station:eq(${currParser})`).find('.station-track-artist'),
			$(`.station:eq(${currParser})`).find('.station-track-title')
		);
	}).fail(function() {
		showMessage('notloaded');
		mInterval = setInterval(() => updateTitle(), 10000);
	});
}

Number.prototype.limiter = function(num) {
	return (Number(this) > 100 ? 100 : Number(this) < 0 ? 0 : Number(this));
}

String.prototype.setArtistName = function(s_name) {
	if(String(this) === '' && showTitles.includes(s_name) || String(this) === 'Radio Record' && showTitles.includes(s_name)) {
		return `В эфире: ${s_name}`;
	} else if(showArtists.includes(String(this)) && showTitles.includes(s_name)) {
		return `В эфире: ${String(this)} (${s_name})`;
	} else if(String(this) === '') {
		return 'В эфире:';
	} else {
		return String(this).stripWhitespace();
	}
};

String.prototype.setSongName = function(a_name) {
	if(String(this) === '' || showTitles.includes(String(this))) {
		return '';
	} else if(specialChars.test(String(this))) {
		return String(this).stripWhitespace();
	} else {
		return '— ' + String(this).stripWhitespace();
	}
};

String.prototype.stripWhitespace = function(options) {
	let txt_0 = this;
	if(options === undefined || options.indexOf("t", 0) > -1) txt_0 = txt_0.split("\t").join(" ");
	if(options === undefined || options.indexOf("r", 0) > -1) txt_0 = txt_0.split("\r").join(" ");
	if(options === undefined || options.indexOf("n", 0) > -1) txt_0 = txt_0.split("\n").join(" ");
	if(options === undefined || options.indexOf("s", 0) > -1) {
		txt_0 = txt_0.split(" ");
		for(idx in txt_0) {
			if(txt_0[idx].length === 0) txt_0.splice(idx, 1);
		}
		txt_0 = txt_0.join(" ");
	}
	if(options === undefined || options.indexOf("&apos;", 0) > -1) txt_0 = txt_0.split("&apos;").join("\'");
	if(options === undefined || options.indexOf("&apos;", 0) > -1) txt_0 = txt_0.split("&amp;").join("&");
	if(txt_0.indexOf("<") >= 0 && txt_0.indexOf(">") >= 0) {
		let txt_3 = new Array();
		let txt_1 = 0;
		while(txt_0.indexOf(">", txt_1) > txt_1) {
			cut = txt_1,
			txt_1 = txt_1 + 1;
		}
		txt_1 = cut + 2;
		while(_loc2_.indexOf("<", _loc3_) > _loc3_) {
			txt_3.push(txt_0.charAt(txt_1));
			txt_1 = txt_1 + 1;
		}
		txt_0 = txt_3.join("").toString();
	}
	if(txt_0.indexOf("&lt;") >= 0 && txt_0.indexOf("&gt;") >= 0) {
		txt_3 = new Array(),
		txt_1 = 0;
		while(txt_0.indexOf("&gt;", txt_1) > txt_1) {
			cut = txt_1,
			txt_1 = txt_1 + 1;
		}
		txt_1 = cut + 5;
		while(txt_0.indexOf("&lt;", txt_1) > txt_1) {
			txt_3.push(txt_0.charAt(txt_1));
			txt_1 = txt_1 + 1;
		}
		txt_0 = txt_3.join("").toString();
	}
	if(txt_0.length >= 27) txt_0 = `${txt_0.slice(0,26)} .&nbsp.&nbsp.`;
	if(txt_0) return txt_0;
	return "";
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
				<span style="color: #575757">&nbsp${milliseconds}</span>
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

function showMessage(txt) {
	let msg;
	switch(txt) {
		case 'closeTab': msg = 'Теперь вкладку можно закрыть.'; break;
		case 'copy': msg = 'Текст скопирован в буфер обмена'; break;
		case 'copytext': msg = 'Нажми два раза, чтобы скопировать в буфер обмена'; break;
		case 'mute': msg = 'Звук приглушен'; break;
		case 'nocopy': msg = 'Текст не был скопирован'; break;
		case 'noselect': msg = 'Станция не выбрана'; break;
		case 'noconnect': msg = 'Ошибка подключения к аудиопотоку. Проверьте состояние интернет-соединения или попробуйте подключиться позже.'; break;
		case 'notloaded': msg = 'Ошибка загрузки данных о текущем треке'; break;
		case 'nowplaying': msg = 'Воспроизведение остановлено'; break;
		case 'restart': msg = 'Воспроизведение перезапущено'; break;
		case 'unmute': msg = 'Звук возобновлен'; break;
		default: msg = 'Не понимаю, что ты от меня хочешь';
	}
	$('.tooltip').html(msg).addClass('active');
	setTimeout(() => $('.tooltip').removeClass('active'), 6000+String(msg).length*50);
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

