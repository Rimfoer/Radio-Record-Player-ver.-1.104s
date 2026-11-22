const animParams = {fps:60,animations:{0:[0],1:[0,1],r1:[1,0],2:[0,1,2],r2:[2,1,0],3:[0,1,2,3],r3:[3,2,1,0],4:[0,1,2,3,4],r4:[4,3,2,1,0],5:[0,1,2,3,4,5],r5:[5,4,3,2,1,0],6:[0,1,2,3,4,5,6],r6:[6,5,4,3,2,1,0],7:[0,1,2,3,4,5,6,7],r7:[7,6,5,4,3,2,1,0],8:[0,1,2,3,4,5,6,7,8],r8:[8,7,6,5,4,3,2,1,0],9:[0,1,2,3,4,5,6,7,8,9],r9:[9,8,7,6,5,4,3,2,1,0],10:[0,1,2,3,4,5,6,7,8,9,10],r10:[10,9,8,7,6,5,4,3,2,1,0]},loop: false,autoPlay: false};
const arrTextColor = {"artist":{"off":"rgb(255,255,255,0)","on":"rgb(255,255,255,1)"},"title":{"off":"rgb(163,163,163,0)","on":"rgb(163,163,163,1)"}};
const parser = [71,43,40,57];
const arrArtists = ['Record', 'Radio Record', 'Record Club', 'Record Deep', 'Record Megamix', 'Радио Рекорд', 'Рекорд'];
const arrTitles = ['Altera Moon', 'Armin Van Buuren', 'Feel', 'Gvozd', 'Guest Mix CYRIL', 'Kefir', 'Lady Waks', 'Lena Popova', 'Martin Garrix', 'Nejtrino & Baur', 'Oliver Heldens', 'Record Classix', 'Record Party', 'Record Superchart', 'Record Club Chart', 'Selection', 'The Voice Of My Soul', 'Trance Music Club', 'Zeskullz', 'by DJ Peretse', 'Цветкоff'];
const arrRadioShows = ['InvestFuture', 'Record Dance Radio', 'Record News', 'Вейкаперы', 'Колбасный Цех', 'Кремов и Хрусталёв', 'Русский Час'];
const stream = ['https://radiorecord.hostingradio.ru/rr_main96.aacp','https://radiorecord.hostingradio.ru/ps96.aacp','https://radiorecord.hostingradio.ru/tm96.aacp','https://radiorecord.hostingradio.ru/teo96.aacp'];
const specialChars = /[#$^*\=\{};:"\\|<>]/;
const arrMessages = {'closeTab': 'Теперь вкладку можно закрыть.', 'copy': 'Текст скопирован в буфер обмена', 'copytext': 'Нажми два раза, чтобы скопировать в буфер обмена', 'mute': 'Звук приглушен', 'nocopy': 'Текст не был скопирован', 'noselect': 'Станция не выбрана', 'noconnect': 'Ошибка подключения к аудиопотоку.', 'notloaded': 'Ошибка загрузки данных о текущем треке', 'notplaying': 'В данный момент ничего не играет.', 'played': 'Воспроизведение остановлено', 'restart': 'Воспроизведение перезапущено', 'unmute': 'Звук возобновлен', 'volume': 'Громкость: '};
const stationNames = ['Radio Record', 'Pirate Station', 'Trancemission', 'Teodor'];

function currPlayerStatus(stat) {
	let playButton = $('.station.active').find('.play-button');
	let playButtonBg = $('.station.active').find('.play-button-bg');
	switch(isUndefined(stat) ? stat : playStatus) {
		case 'waiting':
		case 'stalled':
		case 'loading':
		case 'connecting': {
			playButton.removeClass('playing').addClass('connecting');
			playButtonBg.animate({opacity: 0.7}, 300);
			break;
		}
		case 'playing': {
			playButton.removeClass('connecting').addClass('playing');
			playButtonBg.animate({opacity: 0.7}, 300);
			break;
		}
		default: {
			playButton.removeClass(['connecting','playing']);
			playButtonBg.animate({opacity: 0}, 300);
		}
	}
}

function parseTitle(...args) {
	let _this = [args[1].children('span:eq(0)'), args[1].children('span:eq(1)')];
	$.each(args[0], function(key, val) {
		switch(key) {
			case 'artist': {
				_this[0].html(val.setArtistName(args[0].song));
				_this[0].attr('title', val.checkTextLength());
				_this[0].delay(150).animate({color: arrTextColor.artist.on}, 500);
				stationText[args[2]][0] = val;
				break;
			}
			case 'song': {
				_this[1].html(val.setSongName(args[2]));
				_this[1].attr('title', val.checkTextLength());
				_this[1].delay(150).animate({color: arrTextColor.title.on}, 500, function() {
					$('.station').children('.pie-timer').removeClass('active');
					tInterval = setTimeout(() => currDisplayText('off'), 10000);
					currParser.parseCount();
					$(`.station:eq(${currParser})`).children('.pie-timer').addClass('active');
					mInterval = setTimeout(updateTitle, 10400);
				});
				stationText[args[2]][1] = val;
				break;
			}
		}
	});
	if(args[2] === currStation && playStatus === 'playing') {
		setMediaSession();
	}
}

function updateTitle(startWith) {
	let el = $(`.station:eq(${currParser})`).children('.station-text');
	if(isUndefined(mInterval)) clearTimeout(mInterval);
	$.getJSON('https://vk.radiorecord.ru/api/stations/now/').done(function(data) {
		parseTitle(
			data.result[parser[!startWith ? currParser : startWith]].track, el, currParser);
	}).fail(function() {
		currDisplayText('on');
		$('.station').children('.pie-timer').removeClass('active');
		tInterval = setTimeout(() => currDisplayText('off'), 10000);
		showMessage('notloaded');
		currParser.parseCount();
		$(`.station:eq(${currParser})`).children('.pie-timer').addClass('active');
		mInterval = setTimeout(updateTitle, 10500);
	});
}

function currDisplayText(now) {
	$(`.station:eq(${currParser})`).find('.station-track-artist').animate({color: arrTextColor.artist[now]}, 500);
	$(`.station:eq(${currParser})`).find('.station-track-title').animate({color: arrTextColor.title[now]}, 500);
}

Number.prototype.parseCount = function() {
	let curParserPos = Number(this);
	currParser = curParserPos >= 3 ? 0 : curParserPos + 1;
}

Number.prototype.VolLimiter = function(num) {
	return (Number(this) > 100 ? 100 : Number(this) < 0 ? 0 : Number(this));
}

String.prototype.setArtistName = function(songName) {
	let artist = String(this);
	if(!isEmpty(artist) || arrArtists.includes(artist)) {
		if(arrTitles.includes(songName)) {
			return `В эфире: ${artist}`;
		} else if(arrRadioShows.includes(songName)) {
			return `В эфире: ${songName}`;
		} else {
			return 'В эфире:';
		}
	} else {
		return artist.stripWhitespace();
	}
};

String.prototype.setSongName = function(numSt) {
	let title = String(this);
	if(!isEmpty(title) || arrRadioShows.includes(title)) {
		return '';
	} else if(specialChars.test(title)) {
		return ([0,1,2].includes(numSt) ? '' : '— ') + title.stripWhitespace();
	} else {
		return (arrTitles.includes(title) ? '' : '— ') + title.stripWhitespace();
	}
};

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

String.prototype.checkTextLength = function() {
	let txt = String(this);
	if(txt.toUpperCase() === txt) {
		return (txt.length > 25 ? txt : '');
	} else if(txt.toLowerCase() === txt) {
		return (txt.length > 31 ? txt : '');
	} else {
		return (txt.length > 28 ? txt : '');
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
				<span style="color: rgb(255,255,255,.7); margin-left: -4px">:${seconds}</span>
				<span style="color: rgb(87,87,87,.5)">&nbsp${milliseconds}</span>
			`);
			break;
		}
		default: {
			$('.watch').children('.playing-time').html(`
				<span style="color: #666666">${hours}</span>
				<span style="color: #A6A6A6; margin-left: -4px">:${minutes}</span>
				<span style="color: rgb(255,255,255,.7); margin-left: -4px">:${seconds}</span>
			`);
		}
	}
}

function setMediaSession() {
	navigator.mediaSession.metadata = new MediaMetadata({
		title: stationText[currStation][0],
		artist: stationText[currStation][1],
		artwork: [
			{src: `${window.location.href}img/logos/${radio}.png`, sizes: '105x125', type: 'image/png'}
		]
	});
}
