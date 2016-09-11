import Asteroid from './lib/asteroid.browser';
import './lib/jquery.maskedinput';

const DEBUG = typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug');
var dealerSettings = {};

let scriptUrl = $(document.currentScript).attr('src');
let urlParser = document.createElement('a');
urlParser.href = scriptUrl;
const ACurl = urlParser.host;

// require('./agentcar.css');
require("!style!css!less!./agentcar.less");

const ac_maket = require('html!./ac_maket.html');
DEBUG && console.log('maket: ', ac_maket);

const ac_result = require('html!./ac_result.html');
DEBUG && console.log('ac_result: ', ac_result);

const ac_reserve = require('html!./ac_reserve.html');
DEBUG && console.log('ac_reserve: ', ac_reserve);

const ac_need_details = require('html!./ac_need_details.html');
DEBUG && console.log('ac_need_details: ', ac_need_details);

const ac_negative = require('html!./ac_negative.html');
DEBUG && console.log('ac_negative: ', ac_negative);

const ownerId = $(document.currentScript).data('id');
const asteroid = new Asteroid(ACurl, location.protocol == 'https:');

if (DEBUG) {
    window.$ = $; // make jq available for debug

    asteroid.subscribe('statistics', ownerId);
    var statistics = asteroid.getCollection('statistics');
    var rq = statistics.reactiveQuery({});

    rq.on('change', function() {
        DEBUG && console.log('CHANGE! ', rq.result);
        const [{ queries, widgetLoaded, widgetOpen, reserve, subscribe }] = rq.result;
        $('#agent_car_widget_stat').remove();
        $('.agent_car_body').append(
            `<div id="agent_car_widget_stat">
                Открытий/загрузок виджета: ${widgetOpen||0}/${widgetLoaded||0};
                Отправлено форм: ${queries||0}; Заявок/подписок: ${reserve||0}/${subscribe||0}
            </div>`
        );
    });
}

function getInitWidgetData() {
	return asteroid.call('getInitWidgetData', ownerId).result
		.then(result => {
			DEBUG && console.log("getInitWidgetData Success");
			DEBUG && console.log(result);
			return result;
		});
}
// function availableMarksModels(cb) {
// 	asteroid.call('availableMarksModels', ownerId).result
// 		.then(result => {
// 			DEBUG && console.log("availableMarksModels Success");
// 			DEBUG && console.log(result);
// 			cb(result);
// 		})
// 		.catch(error => {
// 			console.log("availableMarkNames Error");
// 			console.error(error);
// 		});
// }

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

function showSearchResults(results) {
    DEBUG && console.log('Total results: ', results.length);

    $('.agent_car_form').hide();
    $('.agent_car_result_block').hide();
    $('.agent_car_negative_block').hide();
    $('[name=agent_car_reserve]').hide();
    $('.agent_car_reserve_status').html('');

    $('.agent_car_result').empty();
    $('.agent_car_result_link').empty();

    const formatPrice = (price, sep = ' ') =>
        _.chain(price).split('').reverse().chunk(3)
                      .map(arr => arr.reverse().join(''))
                      .reverse().join(sep).value();

    const onSelect_i = i => {
        const result = results[i];
        $('.ac_link_active').removeClass('ac_link_active');
        $(`.agent_car_result_link a:eq(${i})`).addClass('ac_link_active');
        if (result.mileage)
            var mileage = `Б/у. Пробег: ${result.mileage}; Год выпуска: ${result.year}`;
        else
            mileage = 'Машина новая';
        $('.agent_car_result').replaceWith(
            `<div data-id="${result._id}" class="agent_car_result">
                <div class="agent_car_mark">
                    <strong>${result.mark} ${result.model}</strong>
                    <br/><br/>
                    <img src="${result.photo}" width="130"/>
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
                    Старая цена: ${result.priceold}
                    <div class="agent_car_price">${formatPrice(result.price)} Р</div>
                </div>
            </div>`
        );
    };
    if (results.length > 1)
        results.forEach((result, i) => {
            $('.agent_car_result_link').append(`<span class="agent_car_result_link_n">${i+1}</span>`);
            $('.agent_car_result_link span:last').click(onSelect_i.bind(null, i));
         });
    if (results.length) {
        $('.agent_car_result_block').show();
        // $('.agent_car_return h3').text('Мы нашли для Вас');
        onSelect_i(0);
		$('[name=agent_car_reserve]').show();
		$('[name=agent_car_need_details]').show();
    } else {
        $('.agent_car_negative_block').show();
        $('.agent_car_negative_form').show();
        // $('.agent_car_return h3').text('Мы ничего для Вас не нашли');
    }
}

function initSearchResults() {
    $('.agent_car_search').click(() => {
        $('.agent_car_form').show();
        $('.agent_car_result_block').hide();
		$('[name=agent_car_reserve]').show();
		$('[name=agent_car_need_details]').show();
		$('.agent_car_reserve_block').hide();
		$('.agent_car_need_details_block').hide();
        $('.agent_car_negative_block').hide();
        $('.agent_car_reserve_status').html('');
        $('.agent_car_negative_status').html('');
    });
	$('[name=agent_car_reserve]').click(() => {
		$('.agent_car_reserve_block').show();
		// $('.agent_car_reserve_status').text('');
		$('[name=agent_car_reserve]').hide();
		$('[name=agent_car_need_details]').hide();
	});
	$('[name=agent_car_need_details]').click(() => {
		$('.agent_car_need_details_block').show();
		// $('.agent_car_reserve_status').text('');
		$('[name=agent_car_reserve]').hide();
		$('[name=agent_car_need_details]').hide();
	});
}

function checkInput(input) {
    var val = $(input).val();
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
    ok ? errField.hide() : errField.show();
    return ok;
}
var checkAllInput = inputs => _.every(inputs.map(input => checkInput(input)));

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
function initNeedDetails() {
	$('.agent_car_need_details_block').hide();

	$('[name=agent_car_need_details_name]').blur(e => checkInput(e.target));
	$('[name=agent_car_need_details_phone]').blur(e => checkInput(e.target));
	$('[name=agent_car_need_details_email]').blur(e => checkInput(e.target));

	$('[name=agent_car_need_details_send]').click(e => {
		e.preventDefault();
		var toCheck = [ '[name=agent_car_need_details_name]', '[name=agent_car_need_details_phone]', '[name=agent_car_need_details_email]' ];
		if (!checkAllInput(toCheck))
			return;
		var name = $('[name=agent_car_need_details_name]').val();
		var phone = $('[name=agent_car_need_details_phone]').val();
		var email = $('[name=agent_car_need_details_email]').val();
		var carId = $('.agent_car_result').data('id');
		var info = { name, phone };
		if (/\S/.test(email))
			info.email = email;
		reserveCar(carId, info, true).then(reserveId => {
			// alert(`Успешно забронировали! ID заявки: ${reserveId}`);
			$('.agent_car_reserve_status').html(
				`<h3>Спасибо!</h3>`
			);
			$('.agent_car_need_details_block').hide();
		}).catch(err => {
			alert(`Ошибка! ${err.message}`);
			$('.agent_car_reserve_status').text(`Ошибка! ${err.message}`);
			console.log("need_detailsCar Error");
			console.error(err);
		});
	});
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
    $('.agent_car_result_block').hide();

    $('[name=agent_car_credit_pay]').closest('.agent_car_group').hide();
	$('[name=agent_car_credit_time]').closest('.agent_car_group').hide();
    $('[name=agent_car_my_car_cost]').closest('.agent_car_group').hide();

	$('[name=agent_car_credit]').click(function() {
		$('[name=agent_car_credit_pay]').closest('.agent_car_group').toggle();
		$('[name=agent_car_credit_time]').closest('.agent_car_group').toggle();
	});

	$('[name=agent_car_trade_in]').click(function() {
        $('[name=agent_car_my_car_cost]').closest('.agent_car_group').toggle();
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

        filterByParams(params, showSearchResults);

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

function applySettings({ mark, customCSS, position, color, opacity, animate }) {
	// replace KIA in the maket
	// MARK = mark;
	var origText = $('.agent_car_group:eq(0) label').text();
	$('.agent_car_group:eq(0) label').text(`${origText} ${mark.toUpperCase()}`);
	// $('.agent_car_group:eq(0) label').text(origText.replace(/\S+$/, MARK));

    if (position == 'right')
        $('.agent_car_widget').addClass('agent_car_right');

    if (color == 'green') {
        $('.agent_car_logo').addClass('agent_car_green');
        $('[type=submit]').addClass('agent_car_green');
        $('[type=button]').addClass('agent_car_green');
        $('.agent_car_close').addClass('agent_car_green');
    }

    if (opacity)
        $('.agent_car_logo').addClass('agent_car_opacity');

    if (animate)
        $('.agent_car_logo').addClass('agent_car_animate');

	if (customCSS)
		$('head').append(`<style>${customCSS}</style>`);
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

$(document).ready(function() {
    $('body').append(ac_maket);

    $('.agent_car_result_block').replaceWith(ac_result);
    $('.agent_car_reserve_block').replaceWith(ac_reserve);
    $('.agent_car_need_details_block').replaceWith(ac_need_details);
    $('.agent_car_negative_block').replaceWith(ac_negative);
    $('.agent_car_field_error').hide();

    $('#agent_car_reserve_phone, #agent_car_need_details_phone, #agent_car_negative_phone').mask('+7 (999) 999-9999');

    initMaket();
	getInitWidgetData().then(({ marksModels, settings }) => {
        dealerSettings = settings;
		applySettings(settings);
		updateMarksModels(marksModels);
    }).catch(err => {
		console.log("getInitWidgetData Error");
		console.error(err);
		$('.agent_car_body').html(`Ошибка загрузки виджета: ${err.message}`);
	});

    initSearchResults();
    initReserve();
    initNeedDetails();
    initNegative();
});
