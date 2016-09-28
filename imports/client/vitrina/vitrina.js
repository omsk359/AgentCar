import Asteroid from './lib/asteroid.browser';
import './lib/jquery.maskedinput';
import './lib/zIndex';
import './lib/autoNumeric';

import { DEBUG, checkInput, checkAllInputs, update_zIndex } from './helpers';

const AUTO_OPEN = 30; // seconds

const W_ID = 'ac_v'; // widget main ID attr (on top of the .less)

var dealerSettings = {};


let scriptUrl = $(document.currentScript).attr('src');
let urlParser = document.createElement('a');
urlParser.href = scriptUrl;
const ACurl = urlParser.host;

require("!style!css!less!./vitrina.less");

const ac_v_main = require('html!./html/main.html');
DEBUG && console.log('ac_v_main: ', ac_v_main);


const ownerId = $(document.currentScript).data('id');
const asteroid = new Asteroid(ACurl, location.protocol == 'https:');

if (DEBUG) {
    window.$ = $; // make jq available for debug

	// asteroid.subscribe('DealerSettings', ownerId);
	// var Settings = asteroid.getCollection('DealerSettings');
	// var dealerSettings_rq = Settings.reactiveQuery({});
	// dealerSettings_rq.on('change', function() {
	// 	DEBUG && console.log('DealerSettings CHANGE! ', dealerSettings_rq.result);
	// 	applySettings(dealerSettings = dealerSettings_rq.result[0]);
	// });
}

function getInitWidgetData() {
	return asteroid.call('getInitWidgetData', ownerId).result
		.then(result => {
			DEBUG && console.log("getInitWidgetData Success");
			DEBUG && console.log(result);
			return result;
		});
}




function applySettings({ mark, customCSS, position, color, opacity, animate, underElements, overElements }) {

	$('#agent_car_customCSS').remove();
	if (customCSS)
		$('body').append(`<style id="agent_car_customCSS" type="text/css">${customCSS}</style>`);

	window.setInterval(() => update_zIndex(underElements, overElements), 400);
}



getInitWidgetData().then(({ marksModels, settings }) => {
    dealerSettings = settings;

    $(document).ready(function() {
        $('body').append(`<div id="${W_ID}">${ac_v_main}</div>`);


        applySettings(settings);

    });
}).catch(err => {
    console.log("getInitWidgetData Error");
    console.error(err);
    $(document).ready(function() {
        $('body').append(`<div id="${W_ID}"><div class="init-err">Ошибка загрузки виджета: ${err.message}</div></div>`);
    });
});
