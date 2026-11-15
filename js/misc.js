function showMessage(txt, val) {
	if(isUndefined(txt) && !isUndefined(val)) {
		$('.tooltip').html(arrMessages[txt]).addClass('active');
		setTimeout(() => $('.tooltip').removeClass('active'), 5000 + String(arrMessages[txt]).length * 50);
	} else if(isUndefined(txt) && isUndefined(val)) {
		$('.tooltip').html(arrMessages[txt] + val + (txt === 'volume' ? '%' : '')).addClass('active');
	} else {
		$('.tooltip').removeClass('active');
	}
}

function openURL(windowName, link) {
	let params = calcRes(link !== window.location.href ? 'other' : 'that');
	window.open(link, windowName, `top=100,left=200,${params},location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`).focus();
}

function calcRes(what) {
	let res = {"other": {"height": "428", "width": "844"}, "that": {"height": "554", "width": "422"}};
	let scale = Math.ceil((window.outerWidth - 10) / window.innerWidth * 100);
	let height = Math.round(res[what].height*scale/100);
	let width = Math.round(res[what].width*scale/100);
	return `width=${width},height=${height}`;
}

function checkLSItems() {
	const obj = ['copyTextTip', 'currVolume'];
	for(cls = 0; cls < obj.length; cls++) {
		if(!localStorage[obj[cls]]) setLSItem(obj[cls]);
	}
}

function setLSItem(id) {
	switch(id) {
		case 'copyTextTip': localStorage[id] = 'false'; break;
		case 'currVolume': localStorage[id] = '75'; break;
	}
}

function currColorScheme() {
	if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
		$('.context-menu').addClass('dark-mode');
	}
}

function isUndefined(a) {
	return (a !== undefined ? true : false);
}

function isEmpty(a) {
	return (a !== "" ? true : false);
}
