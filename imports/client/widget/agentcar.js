import Asteroid from './lib/asteroid.browser';

// widget root
$('<div class="agent_car_widget"></div>').insertAfter(document.currentScript);

// window.$ = $; // for debug
const ownerId = $(document.currentScript).data('userid');
// const ACurl = "localhost:3000";
// const ACurl = "198.211.121.66";
const ACurl = 'debian359.tk';

const asteroid = new Asteroid(ACurl);

asteroid.subscribe('statistics', ownerId);
var statistics = asteroid.getCollection('statistics');
var rq = statistics.reactiveQuery({});

rq.on('change', function() {
    console.log('CHANGE! ', rq.result);
    const [{ queries, widgetLoaded, widgetOpen }] = rq.result;
    $('#agent_car_widget_stat').remove();
    $('.agent_car_body').append(
        `<div id="agent_car_widget_stat">
            Открытий/загрузок виджета: ${widgetOpen||0}/${widgetLoaded||0};
            Отправлено форм: ${queries||0}
        </div>`
    );
});

function updateMarkNames() {
    asteroid.call("availableMarkNames", ownerId).result
        .then(result => {
            console.log("availableMarkNames Success");
            console.log(result);
            // $('select#agent_car_mark option').remove();
            $('select#agent_car_mark').empty();
            result.forEach(mark => {
                $('select#agent_car_mark').append(`<option value="${mark}">${mark}</option>`);
            });
        })
        .catch(error => {
            console.log("availableMarkNames Error");
            console.error(error);
        });
}

function filterByParams(params, cb) {
    console.log('Params: ', { ...params, ownerId });
    asteroid.call("carsByParams", { ...params, ownerId }).result
    .then(result => {
        console.log("carsByParams Success: ", result);
        cb(result);
    }).catch(error => {
        console.log("carsByParams Error");
        console.error(error);
    });
}

function onWidgetOpen() {
    asteroid.call("onWidgetOpen", ownerId).result
    .then(result => {
        console.log("onWidgetOpen Success: ", result);
    }).catch(error => {
        console.log("onWidgetOpen Error");
        console.error(error);
    });
}

$(document).ready(function() {
    /* Load CSS ***/
    var css_link = $("<link>", {
        rel: "stylesheet",
        type: "text/css",
        href: "http://" + ACurl + "/agentcar.css"
    });
    css_link.appendTo('head');

    var ac_html = `
    <div class="agent_car_border">
        <div class="agent_car_body">
            <form class="agent_car_form" action="" id="agent_car_form">
                <div class="agent_car_group">
                    <label for="agent_car_mark">Я хочу машину</label>
                    <div class="agent_car_cell">
                        <select name="agent_car_mark" id="agent_car_mark">
                            <option value="">Любую</option>
                            <option value="Picanto">Picanto</option>
                            <option value="Rio">Rio</option>
                            <option value="Ceed">Ceed</option>
                            <option value="Pro Ceed">Pro Ceed</option>
                            <option value="Sportage">Sportage</option>
                        </select>
                    </div>
                </div>
                <div class="agent_car_group">
                    <label for="agent_car_i_have">У меня есть</label>
                    <div class="agent_car_cell">
                        <input name="agent_car_i_have" id="agent_car_i_have" type="text" value="" />
                    </div>
                </div>
                <div class="agent_car_group">
                    <label for="agent_car_credit">Я хочу кредит</label>
                    <div class="agent_car_cell">
                        <input name="agent_car_credit" id="agent_car_credit" type="checkbox" value="" />
                    </div>
                </div>
                <div class="agent_car_group" id="agent_car_credit_pay">
                    <label for="agent_car_credit_pay">с ежемесячным платежом</label>
                    <div class="agent_car_cell">
                        <input name="agent_car_credit_pay" id="agent_car_credit_pay" type="text" />
                    </div>
                </div>
                <div class="agent_car_group" id="agent_car_credit_time">
                    <label for="agent_car_credit_time">сроком на</label>
                    <div class="agent_car_cell">
                        <select name="agent_car_credit_time" id="agent_car_credit_time">
                            <option value="12">12</option>
                            <option value="24">24</option>
                            <option value="36">36</option>
                            <option value="60">60</option>
                        </select>
                    </div>
                </div>
                <div class="agent_car_group">
                    <label for="agent_car_trade_in">Хочу Trade-In</label>
                    <div class="agent_car_cell">
                        <input name="agent_car_trade_in" id="agent_car_trade_in" type="checkbox" value="" />
                    </div>
                </div>
                <div class="agent_car_group" id="agent_car_my_car_cost">
                    <label for="agent_car_my_car_cost">Моя машина стоит</label>
                    <div class="agent_car_cell">
                        <input name="agent_car_my_car_cost" id="agent_car_my_car_cost" type="text" value="" />
                    </div>
                </div>
                <div class="agent_car_group">
                    <label for="agent_car_run_in">Рассматриваем авто с пробегом?</label>
                    <div class="agent_car_cell">
                        <input name="agent_car_trade_in" type="checkbox" value="" />
                    </div>
                </div>
                <input type="submit" name="go" class="agent_car_search" value="Что Вы можете мне предложить?" />

            </form>
            <div class="agent_car_logo">
                <a href="#"><img src="http://${ACurl}/agentcar.png" width="92" height="92" alt="AgentСar" />
                </a>
            </div>
            <div class="agent_car_return"></div>
        </div>
    </div>
`;

	$( ".agent_car_widget" ).append( ac_html );

    updateMarkNames();

	$( "#agent_car_credit_pay" ).hide();
	$( "#agent_car_credit_time" ).hide();
	$( "#agent_car_my_car_cost" ).hide();

	$('#agent_car_credit').click(function() {
		$('#agent_car_credit_pay').toggle();
		$('#agent_car_credit_time').toggle();
	});

	$('#agent_car_trade_in').click(function() {
		$('#agent_car_my_car_cost').toggle();
	});

    $('.agent_car_logo').click(()  => {
        onWidgetOpen();
    });

	$('#agent_car_form').submit(function(e) {
        e.preventDefault();

        $('#agent_car_form').hide();
        var ac_form_i_have = +$("input#agent_car_i_have").val(),
            ac_form_credit_pay = +$("input#agent_car_credit_pay").val(),
            ac_form_credit_time = +$("select#agent_car_credit_time").val(),
            ac_form_car_cost = +$("input#agent_car_my_car_cost").val(),
            mark = $("select#agent_car_mark").val();
            // ac_return = '<div class="agent_car_return"></div>';
        const params = {
            ac_form_i_have, ac_form_credit_pay,
            ac_form_credit_time, ac_form_car_cost, mark
        };

        filterByParams(params, result => {
             $('.agent_car_return').empty();
             result.forEach(result => {
                 $('.agent_car_return').append('<li>' + result.mark +' '+ result.model +' '+
                                                     result.equipment +' '+ result.color +'</li>');
             });
        });

        // switch(true) {
        // 	case (ac_form_cash >= 470000 && ac_form_cash <= 530000): {
        // 		ac_return = '<div class="agent_car_return"><h3>Мы нашли для вас</h3><div class="agent_car_return_"><img src="http://'+ ACurl +'/img/picanto1.jpg" width="250"/></div></div>';
        // 		break;
        // 	}
        // 	case (ac_form_cash > 530000 && ac_form_cash <= 610000): {
        // 		ac_return = '<div class="agent_car_return"><h3>Мы нашли для вас</h3><div class="agent_car_return_"><img src="http://'+ ACurl +'/img/picanto2.jpg" width="250"/></div></div>';
        // 		break;
        // 	}
        // 	default: {
        // 		ac_return = '<div class="ac_return"><h3>Сегодня мы не нашли для Вас автомобиль :( но, мы сообщим Вам сразу, когда он появится! '+ ac_form_cash +'</h3></div>';
        // 		break;
        // 	}
        // }

		return false;
    });

});
