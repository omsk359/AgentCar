import Asteroid from './lib/asteroid.browser';

const DEBUG = typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug')
const MARK = 'LADA';

// const ACurl = "localhost:3000";
// const ACurl = "198.211.121.66";
// const ACurl = DEBUG ? 'localhost:3000' : 'debian359.tk';
const ACurl = 'debian359.tk';

require('./agentcar.css');

const ac_maket = require('html!./ac_maket.html');
DEBUG && console.log('maket: ', ac_maket);

const ac_result = require('html!./ac_result.html');
DEBUG && console.log('ac_result: ', ac_result);

const ownerId = $(document.currentScript).data('id');
const asteroid = new Asteroid(ACurl);

if (DEBUG) {
    window.$ = $; // make jq available for debug

    asteroid.subscribe('statistics', ownerId);
    var statistics = asteroid.getCollection('statistics');
    var rq = statistics.reactiveQuery({});

    rq.on('change', function() {
        DEBUG && console.log('CHANGE! ', rq.result);
        const [{ queries, widgetLoaded, widgetOpen }] = rq.result;
        $('#agent_car_widget_stat').remove();
        $('.agent_car_body').append(
            `<div id="agent_car_widget_stat">
                Открытий/загрузок виджета: ${widgetOpen||0}/${widgetLoaded||0};
                Отправлено форм: ${queries||0}
            </div>`
        );
    });
}

function availableMarksModels(cb) {
    asteroid.call('availableMarksModels', ownerId).result
        .then(result => {
            DEBUG && console.log("availableMarksModels Success");
            DEBUG && console.log(result);
            cb(result);
        })
        .catch(error => {
            console.log("availableMarkNames Error");
            console.error(error);
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
    $('.agent_car_result_block').show();

    $('.agent_car_result').empty();
    $('.agent_car_result_link').empty();

    const onSelect_i = i => {
        const result = results[i];
        $('.ac_link_active').removeClass('ac_link_active');
        $(`.agent_car_result_link a:eq(${i})`).addClass('ac_link_active');
        $('.agent_car_result').replaceWith(
            `<div class="agent_car_result">
                <div class="agent_car_mark">
                    <strong>${result.mark} ${result.model}</strong><br/>
                    <img src="${result.photo}" width="130"/>
                </div>
                <div class="agent_car_equip">
                    <br/>${result.equipment}
                    <br/>${result.carcase}
                    <br/>
                    Тип: ${result.engine.type};
                    Объем: ${result.engine.capacity};
                    Мощность: ${result.engine.power}
                    <br/>${result.color}<br/>
                    <div class="agent_car_price">${result.price} Р</div>
                </div>
            </div>`
        );
    };
    if (results.length > 1)
        results.forEach((result, i) => {
            $('.agent_car_result_link').append(`<a href="#">${i+1}</a>`);
            $('.agent_car_result_link a:last').click(onSelect_i.bind(null, i));
         });
    if (results.length) {
        $('.agent_car_return h3').text('Мы нашли для Вас');
        onSelect_i(0);
    } else
        $('.agent_car_return h3').text('Мы ничего для Вас не нашли');
}

function initSearchResults() {
    $('.agent_car_search').click(() => {
        $('.agent_car_form').show();
        $('.agent_car_result_block').hide();
    });
}
function initMaket() {
    $('.agent_car_result_block').hide();

    $( "[name=agent_car_credit_pay]" ).hide();
	$( "[name=agent_car_credit_time]" ).hide();
	$( "[name=agent_car_my_car_cost]" ).hide();

	$('[name=agent_car_credit]').click(function() {
		$('[name=agent_car_credit_pay]').toggle();
		$('[name=agent_car_credit_time]').toggle();
	});

	$('[name=agent_car_trade_in]').click(function() {
		$('[name=agent_car_my_car_cost]').toggle();
	});

    var close = () => {
        $('.agent_car_logo').css('height', '105px');
        $('.agent_car_logo').css('right', '30px');
        $('.agent_car_body').hide();
        $('.agent_car_border').hide();
    };
    var open = () => {
        $('.agent_car_logo').css('height', '65px');
        $('.agent_car_logo').css('left', '30px');
        $('.agent_car_body').show();
        $('.agent_car_border').show();
        onWidgetOpen();
    };

    $('.agent_car_logo').click(() => {
        var isOpen = !$('.agent_car_body').is(':hidden');
        isOpen ? close() : open();
    });
    $('#agent_car_close_x').click(close);

	$('.agent_car_form').submit(function(e) {
        var ac_form_i_have = +$("input[name=agent_car_i_have]").val(),
            ac_form_credit_pay = +$("input[name=agent_car_credit_pay]").val(),
            ac_form_credit_time = +$("select[name=agent_car_credit_time]").val(),
            ac_form_car_cost = +$("input[name=agent_car_my_car_cost]").val(),
            model = $("select[name=agent_car_mark]").val();

        var params = {
            ac_form_i_have,
            ac_form_credit_pay: $('[name=agent_car_credit]').is(':checked') ? ac_form_i_have : 0,
            ac_form_credit_time: $('[name=agent_car_credit]').is(':checked') ? ac_form_credit_time : 0,
            ac_form_car_cost: $('[name=agent_car_trade_in]').is(':checked') ? ac_form_car_cost : 0,
            model : model == '_ANY' ? '' : model,
            mark: MARK
        };

        filterByParams(params, showSearchResults);

        e.preventDefault();
		return false;
    });
}

$(document).ready(function() {
    $('body').append(ac_maket);

    // replace KIA in the maket
    var origText = $('.agent_car_group:eq(0) label').text();
    $('.agent_car_group:eq(0) label').text(`${origText} ${MARK}`);
    // $('.agent_car_group:eq(0) label').text(origText.replace(/\S+$/, MARK));

    $('.agent_car_body').append(ac_result);
    initMaket();
    availableMarksModels(result => {
        var models = _.chain(result).filter(car => car.mark == MARK).map('model').value();
        DEBUG && console.log(`${MARK} models: `, models);
        $('select[name=agent_car_mark]').empty();
        $('select[name=agent_car_mark]').append(`<option value="_ANY">_Любую</option>`);
        models.forEach(model => {
            $('select[name=agent_car_mark]').append(`<option value="${model}">${model}</option>`);
        });
    });
    initSearchResults();
});
