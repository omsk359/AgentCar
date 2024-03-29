import Asteroid from './lib/asteroid.browser';
import './lib/jquery.maskedinput';
import './lib/zIndex';
import './lib/autoNumeric';

const AUTO_OPEN = 30; // seconds

const DEBUG = typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug');

var dealerSettings = {}, allDealersInfo = [];



let scriptUrl = $(document.currentScript).attr('src');
let urlParser = document.createElement('a');
urlParser.href = scriptUrl;
const ACurl = urlParser.host;

require("!style!css!less!./agentcar.less");

const ac_maket = require('html!./ac_maket.html');
const ac_result = require('html!./ac_result.html');
const ac_reserve = require('html!./ac_reserve_2.html');
const ac_need_details = require('html!./ac_need_details_2.html');
const ac_negative = require('html!./ac_negative.html');
const ac_result_lock = require('html!./ac_result_lock.html');

const ownerId = $(document.currentScript).data('id');
const asteroid = new Asteroid(ACurl, location.protocol == 'https:');

if (DEBUG) {
	window.$ = $; // make jq available for debug

	asteroid.subscribe('statistics', ownerId);
	var statistics = asteroid.getCollection('statistics');
	var rq = statistics.reactiveQuery({});
	rq.on('change', function() {
		DEBUG && console.log('CHANGE! ', rq.result);
		const [{ queries, widgetLoaded, widgetOpen, reserve, subscribe, needDetails, resultLocks }] = rq.result;
		$('#agent_car_widget_stat').remove();
		$('.agent_car_body').append(
			`<div id="agent_car_widget_stat">
				Открытий/загрузок виджета: ${widgetOpen||0}/${widgetLoaded||0};
				Отправлено форм(с тел./всего): ${resultLocks||0}/${queries||0}; Заявок/узнать подробнее/подписок: ${reserve||0}/${needDetails||0}/${subscribe||0}
			</div>`
		);
	});

	asteroid.subscribe('DealerSettings', ownerId);
	var Settings = asteroid.getCollection('DealerSettings');
	var dealerSettings_rq = Settings.reactiveQuery({});
	dealerSettings_rq.on('change', function() {
		DEBUG && console.log('DealerSettings CHANGE! ', dealerSettings_rq.result);
		applySettings(dealerSettings = dealerSettings_rq.result[0]);
	});

	var initDebug = () => {
		$('#agent_car_i_have').val('800 000');
		if ($('.agent_car_body').is(':hidden'))
			$('.agent_car_logo').click();
		// $('.agent_car_search').click();
		// window.checkAllInput = checkAllInput;
		// $('[name=agent_car_result_lock_phone]').val('+7 (111) 111-2222');
		// window.setTimeout(() => {
		//     $('[name=agent_car_result_lock_send]').click();
		//     // $('[name=agent_car_need_details]').click();
		// }, 5000);
	};
}

function getInitWidgetData() {
	return asteroid.call('getInitWidgetData', ownerId).result
		.then(result => {
			DEBUG && console.log("getInitWidgetData Success");
			DEBUG && console.log(result);
			return result;
		});
}

function filterByParams(params, cb) {
	DEBUG && console.log('Params: ', { ...params, ownerId });
	asteroid.call("carsByParams", { ...params, ownerId }).result
		.then(result => {
			DEBUG && console.log("carsByParams Success: ", result);
			cb(result);
		}).catch(error => {
			console.log("carsByParams Error");
			console.error(error);
		});
}

function reserveCar(carId, contactInfo, needDetails = false) {
	DEBUG && console.log('Params: ', { ownerId, carId, contactInfo, needDetails });
	return asteroid.call('reserveCar', ownerId, carId, contactInfo, needDetails).result
		.then(result => {
			DEBUG && console.log("reserveCar Success: ", result);
			return result;
		});
}

function negativeSubscribe(contactInfo, searchParams) {
	DEBUG && console.log('Params: ', { ownerId, contactInfo, searchParams });
	return asteroid.call('negativeSubscribe', { ownerId, contactInfo, searchParams }).result
		.then(result => {
			DEBUG && console.log("negativeSubscribe Success: ", result);
			return result;
		});
}

function onWidgetOpen() {
	asteroid.call("onWidgetOpen", ownerId).result
		.then(result => {
			DEBUG && console.log("onWidgetOpen Success: ", result);
		}).catch(error => {
			console.log("onWidgetOpen Error");
			console.error(error);
		});
}

function onCarView(carId) {
	asteroid.call('onCarView', carId).result
		.then(result => {
			DEBUG && console.log("onCarView Success: ", result);
		}).catch(error => {
			console.log("onCarView Error");
			console.error(error);
		});
}

function onResultLock(searchQueryId, contactInfo) {
	return asteroid.call('onResultLock', ownerId, searchQueryId, contactInfo).result
		.then(result => {
			DEBUG && console.log("onResultLock Success: ", result);
		}).catch(error => {
			console.log("onResultLock Error");
			console.error(error);
		});
}


function showSearchResults(results) {
	DEBUG && console.log('Total results: ', results.length);
	results = _.uniqWith(results, _.isEqual);
	DEBUG && console.log('Total results 2: ', results);

	let formatPrice = (price, sep = ' ') =>
		_.chain(price).split('').reverse().chunk(3)
					  .map(arr => arr.reverse().join(''))
					  .reverse().join(sep).value();

	let onSelect_i = i => {
		DEBUG && console.log(`onSelect_i(${i})`);
		const result = results[i];
		updateNavPanel(i);
		onCarView(result._id);
		$('.ac_link_active').removeClass('ac_link_active');
		$(`.agent_car_result_link a:eq(${i})`).addClass('ac_link_active');
		if (result.mileage)
			var mileage = `Б/у. Пробег: ${result.mileage}; Год выпуска: ${result.year}`;
		else
			mileage = 'Машина новая';
		if (dealerSettings.placementType == 'partner') {
			let dealerName = _.filter(allDealersInfo, {ownerId: dealerSettings.ownerId})[0].name;
			var dealerStr = `Доступен у диллера "${dealerName}"`;
		}
		$('.agent_car_result').replaceWith(
			`<div data-id="${result._id}" class="agent_car_result">
				<div class="agent_car_mark">
					<strong>${result.mark} ${result.model}</strong>
					<br/><br/>
					<img src="//${ACurl + result.photo}" width="130"/>
				</div>
				<div class="agent_car_equip">
					<br/>${result.equipment}
					<br/>${result.kpp}
					<br/>
					Тип: ${result.engine.type};
					Объем: ${result.engine.capacity};
					Мощность: ${result.engine.power}
					<br/>${result.color}<br/>
					${mileage}<br />
					Доступность: ${result.availability}<br />
					<s>${result.priceold ? formatPrice(result.priceold) + '&#8381;' : ''}</s>
					<div class="agent_car_price">${formatPrice(result.price)} &#8381;</div>
					${dealerStr || ''}
					Просмотров сегодня: ${result.viewCnt}
				</div>
			</div>`
		);
	};

	let updateNavPanel = i => {
		$('.agent_car_result_link').empty();
		addNavPanel(i);
	};

	let addNavPanel = (i, n = results.length) => {

		let getNavItem = (title, i) =>
			$('.agent_car_result_link')
				.append(`<span class="
						agent_car_result_link_n ${i || i === 0 ? '' : 'agent_car_no_pointer'}
					">${title}</span>`).find(':last')
				.click(() => i && onSelect_i(i));
		let left = () => getNavItem('<', i - 1), right = () => getNavItem('>', i + 1);
		let num = i => getNavItem(i, i - 1), dots = () => getNavItem('…');
		let range = (a, b) => { while (a <= b) num(a++) };

		if (n <= 5) // [1, ..., n]
			range(1, n);
		else if (i < 3) // [1, 2, 3, '...', n]
			range(1, 3), dots(), num(n), right();
		else if (n - 1 - i < 3) // [1, '...', n-2, n-1, n]
			left(), num(1), dots(), range(n-2, n);
		else // [1, '...', i, '...', n]
			left(), num(1), dots(), num(i), dots(), num(n), right();
	};


	if (results.length) {
		$('.agent_car_result_block').show();
		// $('.agent_car_return h3').text('Мы нашли для Вас');
		onSelect_i(0);
		// $('[name=agent_car_reserve]').show();
		// $('[name=agent_car_need_details]').show();
		// $('[name=agent_car_need_details_send]').click();

		let { ac_form_i_have, ac_form_credit_pay, ac_form_credit_time, ac_form_car_cost } = getSearchParams();
		let ac_form_cash = ac_form_i_have + ac_form_credit_pay * ac_form_credit_time + ac_form_car_cost;
		DEBUG && console.log('getSearchParams: ', getSearchParams());
		let text = $('.agent_car_return h3').text();
		text = text.replace(/\d[\d\s]*/, formatPrice(ac_form_cash) + ' ');
		$('.agent_car_return h3').text(text);

	} else {
		$('.agent_car_negative_block').show();
		$('.agent_car_negative_form').show();
		// $('.agent_car_return h3').text('Мы ничего для Вас не нашли');
	}
}

function showSearchResultsLock({ foundCars, searchQueryId }) {
	$('.agent_car_form').hide();
	$('.agent_car_result_block').hide();
	$('.agent_car_negative_block').hide();
	$('[name=agent_car_reserve]').hide();
	$('.agent_car_reserve_status').html('');

	$('.agent_car_result').empty();

	// let header = $('.agent_car_result_lock_block h3');
	// let s = header.text().replace(/\d[\d\s]*/, foundCars.length + ' ');
	// header.text(s);

	if (!foundCars.length)
		return showSearchResults(foundCars);

	$('.agent_car_result_block').hide();
	$('.agent_car_result_lock_block').show();

	showLockedResults = ({ phone, name }) => {
			$('[name=agent_car_need_details_name]').val(name);
			// $('[name=agent_car_need_details_phone]').val(phone);
		onResultLock(searchQueryId, { phone, name }).then(() => {
			$('.agent_car_result_block').show();
			$('.agent_car_result_lock_block').hide();
			showSearchResults(foundCars);
		});
	};
	// $('[name=agent_car_result_lock_send]').one('click', e => {
	//     e && e.preventDefault();
	//     if (!checkAllInput(['[name=agent_car_result_lock_phone]', '[name=agent_car_result_lock_fio]']))
	//         return DEBUG && console.info('lock! ', e);

	//     let phone = $('[name=agent_car_result_lock_phone]').val();
	//     let name = $('[name=agent_car_result_lock_fio]').val();
	//     $('#agent_car_reserve_phone, #agent_car_need_details_phone, #agent_car_negative_phone').val(phone);
	//     onResultLock(searchQueryId, { phone, name }).then(() => {
	//         $('.agent_car_result_block').show();
	//         $('.agent_car_result_lock_block').hide();
	//         showSearchResults(foundCars);
	//     });
	// });

}
var showLockedResults = () => {};

function initSearchResults() {
	$('.agent_car_search').click(() => {
		$('.agent_car_form').show();
		$('.agent_car_result_block, .agent_car_result_lock_block').hide();
		$('[name=agent_car_reserve]').show();
		$('[name=agent_car_need_details]').show();
		$('.agent_car_reserve_block').hide();
		$('.agent_car_need_details_block').hide();
		$('.agent_car_negative_block').hide();
		$('.agent_car_reserve_status').html('');
		$('.agent_car_negative_status').html('');
		$('.agent_car_result_price_only_today').show();

//		$('[name=agent_car_need_details]').click();
//		$('[name=agent_car_need_details]').hide();
	});
	$('[name=agent_car_reserve]').click(() => {
		$('.agent_car_reserve_block').show();
		// $('.agent_car_reserve_status').text('');
		$('[name=agent_car_reserve]').hide();
		$('[name=agent_car_need_details]').hide();
	});
	// $('[name=agent_car_need_details]').click(() => {
	// 	$('.agent_car_need_details_block').show();
	// 	// $('.agent_car_reserve_status').text('');
	// 	$('[name=agent_car_reserve]').hide();
	// 	$('[name=agent_car_need_details]').hide();
	// });
	$('[name=agent_car_need_details]').click(e => {
		e.preventDefault();
		var carId = $('.agent_car_result').data('id');
		// reserveCarForm(carId);
		onWidgetCloseAddHandler(() => reserveCarForm(carId, ['[name=agent_car_need_details_name]']))

		$('.agent_car_reserve_status').html(
			// '<p>Спасибо, что обратились в нашу компанию. Менеджер свяжется с Вами в самое ближайшее время.</p>'
			'<p>Наш менеджер свяжется с Вами в ближайшее время и расскажет все об этой машине.</p>'
		);
		$('.agent_car_result_price_only_today').hide();
		$('[name=agent_car_need_details]').hide();
	});

	$('[name=agent_car_result_lock_phone]').blur(e => checkInput(e.target));
	$('[name=agent_car_result_lock_fio]').blur(e => checkInput(e.target));

	$('[name=agent_car_result_lock_send]').click(e => {
		e && e.preventDefault();
		if (!checkAllInput(['[name=agent_car_result_lock_phone]', '[name=agent_car_result_lock_fio]']))
			return DEBUG && console.info('lock! ', e);

		let phone = $('[name=agent_car_result_lock_phone]').val();
		let name = $('[name=agent_car_result_lock_fio]').val();
		$('#agent_car_reserve_phone, #agent_car_need_details_phone, #agent_car_negative_phone').val(phone);

		showLockedResults({ phone, name });
	});

	// $('[name=agent_car_result_lock_send]').click(e => {
	//     e.preventDefault();
	//     console.log('-- CHECK LOCK ', $('[name=agent_car_result_lock_phone]').val());
	//     var toCheck = [ '[name=agent_car_result_lock_phone]', '[name=agent_car_result_lock_phone]' ];
	//     if (!checkAllInput(toCheck))
	//         return;
	//     var name = $('[name=agent_car_result_lock_phone]').val();
	//     console.log('@@@@@@@@@@@ -- NO LOCK11');

	//     // e.preventDefault();
	//     // console.log('-- CHECK LOCK ', $('[name=agent_car_result_lock_phone]').val());
	//     // if (!checkAllInput(['[name=agent_car_result_lock_phone]']))
	//     //     return console.info('lock! ', e);
	//     // console.log('@@@@@@@@@@@ -- NO LOCK11');

	//     let phone = $('[name=agent_car_result_lock_phone]').val();
	//     // onResultLock(searchQueryId, { phone }).then(() => {
	//     //     $('.agent_car_result_block').show();
	//     //     $('.agent_car_result_lock_block').hide();
	//     // });
	// });    
}

function checkInput(input) {
	var val = $(input).val();
	if (!val)
		debugger
	DEBUG && console.log(`checkInput val: ${val}`);
	var errField = $(input).parent().find('.agent_car_field_error');
	var required = $(input).attr('required');
	required = typeof required !== typeof undefined && required !== false;
	if (!required && val == '') {
		errField.hide();
		return true;
	}
	var check = $(input).data('check');
	if (!check)
		var ok = required ? val : false;
	else
		ok = new RegExp(check).test(val);
	DEBUG && console.log(`ok: ${ok}; check: "${check}"; val: ${val}`);
	ok ? errField.hide() : errField.show();
	return ok;
}
var checkAllInput = inputs => _.every(inputs.map(checkInput));

function initReserve() {
	$('.agent_car_reserve_block').hide();

	$('[name=agent_car_reserve_name]').blur(e => checkInput(e.target));
	$('[name=agent_car_reserve_phone]').blur(e => checkInput(e.target));
	$('[name=agent_car_reserve_email]').blur(e => checkInput(e.target));

	$('[name=agent_car_reserve_send]').click(e => {
		e.preventDefault();
		var toCheck = [ '[name=agent_car_reserve_name]', '[name=agent_car_reserve_phone]', '[name=agent_car_reserve_email]' ];
		if (!checkAllInput(toCheck))
			return;
		var name = $('[name=agent_car_reserve_name]').val();
		var phone = $('[name=agent_car_reserve_phone]').val();
		var email = $('[name=agent_car_reserve_email]').val();
		var carId = $('.agent_car_result').data('id');
		var info = { name, phone };
		if (/\S/.test(email))
			info.email = email;
		reserveCar(carId, info).then(reserveId => {
			// alert(`Успешно забронировали! ID заявки: ${reserveId}`);
			$('.agent_car_reserve_status').html(
				`<h3>Поздравляем!</h3>
				 <p>Вы успешно забронировали автомобиль! 
				 Номер Вашей заявки <strong>${reserveId}</strong>. 
				 Наш менеджер свяжется с Вами в ближайшее время!</p>`
			);
			$('.agent_car_reserve_block').hide();
		}).catch(err => {
			alert(`Ошибка! ${err.message}`);
			$('.agent_car_reserve_status').text(`Ошибка! ${err.message}`);
			console.log("reserveCar Error");
			console.error(err);
		});
	});
}
// var onWidgetCloseHandlers = [];
function onWidgetCloseAddHandler(func) {
	DEBUG && console.log('[onWidgetCloseAddHandler] ', func);
	let once = _.once(func);
	// onWidgetCloseHandlers.push(once);
	$(window).bind('beforeunload', once);
	$('.agent_car_widget').on('closeWidget', event => once());
}
let reserveCarForm = (carId, withoutCheckInputs = []) => {
	DEBUG && console.log(`reserveCarForm for carId ${carId}`);
	var toCheck = [ '[name=agent_car_need_details_name]', '[name=agent_car_need_details_phone]', '[name=agent_car_need_details_email]' ];
	if (!checkAllInput(_.difference(toCheck, withoutCheckInputs)))
		return;
	var name = $('[name=agent_car_need_details_name]').val() || 'noname';
	var phone = $('[name=agent_car_need_details_phone]').val();
	var email = $('[name=agent_car_need_details_email]').val();
	// var carId = $('.agent_car_result').data('id');
	var info = { name, phone };
	if (/\S/.test(email))
		info.email = email;
	reserveCar(carId, info, true).then(reserveId => {
		$('.agent_car_reserve_status').html(
			// '<p>Спасибо, что обратились в нашу компанию. Менеджер свяжется с Вами в самое ближайшее время.</p>'
			'<p>Наш менеджер свяжется с Вами в ближайшее время и расскажет все об этой машине.</p>'
		);
		$('.agent_car_result_price_only_today').hide();
		$('.agent_car_need_details_block').hide();
	}).catch(err => {
		alert(`Ошибка! ${err.message}`);
		$('.agent_car_reserve_status').text(`Ошибка! ${err.message}`);
		console.log("need_detailsCar Error");
		console.error(err);
	});
}

function initNeedDetails() {
	$('.agent_car_need_details_block').hide();

	$('[name=agent_car_need_details_name]').blur(e => checkInput(e.target));
	$('[name=agent_car_need_details_phone]').blur(e => checkInput(e.target));
	$('[name=agent_car_need_details_email]').blur(e => checkInput(e.target));

	$('[name=agent_car_need_details_send]').one('click', e => {
		e.preventDefault();
		var carId = $('.agent_car_result').data('id');
		reserveCarForm(carId);
	});
	// $('[name=agent_car_need_details_send]').click(e => {
	//     e.preventDefault();
	//     var toCheck = [ '[name=agent_car_need_details_name]', '[name=agent_car_need_details_phone]', '[name=agent_car_need_details_email]' ];
	//     if (!checkAllInput(toCheck))
	//         return;
	//     var name = $('[name=agent_car_need_details_name]').val();
	//     var phone = $('[name=agent_car_need_details_phone]').val();
	//     var email = $('[name=agent_car_need_details_email]').val();
	//     var carId = $('.agent_car_result').data('id');
	//     var info = { name, phone };
	//     if (/\S/.test(email))
	//         info.email = email;
	//     reserveCar(carId, info, true).then(reserveId => {
	//         // alert(`Успешно забронировали! ID заявки: ${reserveId}`);
	//         $('.agent_car_reserve_status').html(
	//             '<p>Спасибо, что обратились в нашу компанию. Менеджер свяжется с Вами в самое ближайшее время.</p>'
	//         );
	//         $('.agent_car_result_price_only_today').hide();
	//         $('.agent_car_need_details_block').hide();
	//     }).catch(err => {
	//         alert(`Ошибка! ${err.message}`);
	//         $('.agent_car_reserve_status').text(`Ошибка! ${err.message}`);
	//         console.log("need_detailsCar Error");
	//         console.error(err);
	//     });
	// });
}

function initNegative() {
	$('.agent_car_negative_block').hide();

	$('[name=agent_car_negative_name]').blur(e => checkInput(e.target));
	$('[name=agent_car_negative_phone]').blur(e => checkInput(e.target));
	$('[name=agent_car_negative_email]').blur(e => checkInput(e.target));

	$('[name=agent_car_negative_send]').click(e => {
		e.preventDefault();
		var toCheck = [ '[name=agent_car_negative_name]', '[name=agent_car_negative_phone]', '[name=agent_car_negative_email]' ];
		if (!checkAllInput(toCheck))
			return;
		var name = $('[name=agent_car_negative_name]').val();
		var phone = $('[name=agent_car_negative_phone]').val();
		var email = $('[name=agent_car_negative_email]').val();
		var info = { name, phone, email };
		var searchParams = getSearchParams();
		negativeSubscribe(info, searchParams).then(subscribeId => {
			// alert(`Успешно подписались! ID: ${subscribeId}`);
			$('.agent_car_negative_status').html(
				'<h3>Спасибо!<h3>'
			);
			$('.agent_car_negative_form').hide();
			// $('.agent_car_search').click();
		}).catch(err => {
			alert(`Ошибка! ${err.message}`);
			console.log("negativeSubscribe Error");
			console.error(err);
		});
	});
}

function initMaket() {
	$('.agent_car_result_block, .agent_car_result_lock_block').hide();
	$('.agent_car_text_last_price').hide();

	$('[name=agent_car_credit_pay]').closest('.agent_car_group').hide();
	$('[name=agent_car_credit_time]').closest('.agent_car_group').hide();
	$('[name=agent_car_my_car_cost]').closest('.agent_car_group').hide();

	$('[name=agent_car_credit]').click(function() {
		$('[name=agent_car_credit_pay]').closest('.agent_car_group').toggle();
		$('[name=agent_car_credit_time]').closest('.agent_car_group').toggle();
	});

	$('[name=agent_car_trade_in]').click(function() {
		$('[name=agent_car_my_car_cost]').closest('.agent_car_group').toggle();
		$('.agent_car_text_last_price').toggle();
	});

	var close = () => {
		$('.agent_car_logo').css('height', '115px');
		$('.agent_car_logo').css('right', '30px');
		$('.agent_car_body').hide();
		$('.agent_car_border').hide();
		$('.agent_car_widget').removeClass('agent_car_open');

		if (dealerSettings.opacity)
			$('.agent_car_logo').addClass('agent_car_opacity');
		if (dealerSettings.animate)
			$('.agent_car_logo').addClass('agent_car_animate');

		$('.agent_car_widget').trigger('closeWidget');
	};
	var open = () => {
		$('.agent_car_logo').css('height', '65px');
		$('.agent_car_logo').css('right', '200px');
		$('.agent_car_body').show();
		$('.agent_car_border').show();
		$('.agent_car_widget').addClass('agent_car_open');
		$('.agent_car_logo').removeClass('agent_car_opacity agent_car_animate');
		onWidgetOpen();
	};

	$('.agent_car_logo').click(() => {
		var isOpen = !$('.agent_car_body').is(':hidden');
		isOpen ? close() : open();
	});
	$('#agent_car_close_x').click(close);

	$('.agent_car_form').submit(function(e) {
		var params = getSearchParams();

		filterByParams(params, showSearchResultsLock);

		e.preventDefault();
		return false;
	});
}
function getSearchParams() {
	var ac_form_i_have = +$("input[name=agent_car_i_have]").val().replace(/\s/g, ''),
		ac_form_credit_pay = +$("input[name=agent_car_credit_pay]").val().replace(/\s/g, ''),
		ac_form_credit_time = +$("select[name=agent_car_credit_time]").val().replace(/\s/g, ''),
		ac_form_car_cost = +$("input[name=agent_car_my_car_cost]").val().replace(/\s/g, ''),
		model = $("select[name=agent_car_mark]").val(),
		ac_form_secondhand = $('#agent_car_secondhand').is(':checked');
	return {
		ac_form_i_have,
		ac_form_credit_pay: $('[name=agent_car_credit]').is(':checked') ? ac_form_credit_pay : 0,
		ac_form_credit_time: $('[name=agent_car_credit]').is(':checked') ? ac_form_credit_time : 0,
		ac_form_car_cost: $('[name=agent_car_trade_in]').is(':checked') ? ac_form_car_cost : 0,
		model : model == '_ANY' ? '' : model,
		mark: dealerSettings.mark,
		ac_form_secondhand
	};
}

function applySettings({ mark, customCSS, position, color, opacity, animate, underElements, overElements }) {
	// replace KIA in the maket
	var origText = $('.agent_car_group:eq(0) label').text();
	if (!_.endsWith(origText, mark))
		$('.agent_car_group:eq(0) label').text(`${origText} ${mark.toUpperCase()}`);

	if (position == 'right')
		$('.agent_car_widget').addClass('agent_car_right');

	// if (color == 'green') {
	//     $('.agent_car_logo').addClass('agent_car_green');
	//     $('[type=submit]').addClass('agent_car_green');
	//     $('[type=button]').addClass('agent_car_green');
	//     $('.agent_car_close').addClass('agent_car_green');
	// }

	// const color2class = {
	//     green: 'agent_car_green',
	//     green2: 'agent_car_green2'
	// };
	// let cssClass = color2class[color];
	let colorClass =  `agent_car_${color}`;
	$('.agent_car_logo').addClass(colorClass);
	$('[type=submit]').addClass(colorClass);
	$('[type=button]').addClass(colorClass);
	$('.agent_car_close').addClass(colorClass);


	if (opacity)
		$('.agent_car_logo').addClass('agent_car_opacity');

	if (animate)
		$('.agent_car_logo').addClass('agent_car_animate');

	$('#agent_car_customCSS').remove();
	if (customCSS)
		$('body').append(`<style id="agent_car_customCSS" type="text/css">${customCSS}</style>`);

	window.setInterval(() => update_zIndex(underElements, overElements), 400);
}

function update_zIndex(underElements, overElements) {
	var zIndexWidget;
	if (underElements) {
		let zIndexUnder = underElements.split(',').map(el => $(el).zIndex());
		DEBUG && console.log(`zIndexUnder("${underElements}"): `, zIndexUnder);
		let zIndexUnderMax = _.max(zIndexUnder);
		DEBUG && console.log('zIndexUnderMax: ', zIndexUnderMax);
		zIndexWidget = zIndexUnderMax + 1;
	}
	if (overElements) {
		let zIndexOver = overElements.split(',').map(el => $(el).zIndex());
		let zIndexOverMin = _.min(zIndexOver);
		DEBUG && console.log('zIndexOverMin: ', zIndexOverMin);
		if (zIndexWidget && zIndexWidget > zIndexOverMin)
			zIndexWidget = zIndexOverMin - 1;
	}
	if (zIndexWidget)
		$('.agent_car_widget').zIndex(zIndexWidget);
}

function updateMarksModels(marksModels) {
	var { mark } = dealerSettings;
	var models = _.chain(marksModels).filter(car => car.mark == mark).map('model').value();
	DEBUG && console.log(`${mark} models: `, models);
	$('select[name=agent_car_mark]').empty();
	$('select[name=agent_car_mark]').append(`<option value="_ANY">Любую</option>`);
	models.forEach(model => {
		$('select[name=agent_car_mark]').append(`<option value="${model}">${model}</option>`);
	});
}

getInitWidgetData().then(({ marksModels, settings, dealersInfo }) => {
	dealerSettings = settings;
	allDealersInfo = dealersInfo;

	$(document).ready(function() {
		$('body').append(ac_maket);

		$('.agent_car_result_block').replaceWith(ac_result);
		$('.agent_car_result_lock_block').replaceWith(ac_result_lock);
		$('.agent_car_reserve_block').replaceWith(ac_reserve);
		$('.agent_car_need_details_block').replaceWith(ac_need_details);
		$('.agent_car_negative_block').replaceWith(ac_negative);
		$('.agent_car_field_error').hide();

		$('#agent_car_reserve_phone, #agent_car_need_details_phone, #agent_car_negative_phone, #agent_car_result_lock_phone').mask('+7 (999) 999-9999');
		$('#agent_car_i_have, #agent_car_credit_pay, #agent_car_my_car_cost').autoNumeric('init', { aSep: ' ', vMin: '0', mDec: '0' });

		initMaket();

		applySettings(settings);
		updateMarksModels(marksModels);

		initSearchResults();
		initReserve();
		initNeedDetails();
		initNegative();
		initDebug && initDebug();

		if (AUTO_OPEN)
			window.setTimeout(() => {
				if ($('.agent_car_body').is(':hidden'))
					$('.agent_car_logo').click();
			}, AUTO_OPEN * 1000);
	});
}).catch(err => {
	console.log("getInitWidgetData Error");
	console.error(err);
	$('.agent_car_body').html(`Ошибка загрузки виджета: ${err.message}`);
});
