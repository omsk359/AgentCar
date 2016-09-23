import Asteroid from './lib/asteroid.browser';
import './lib/jquery-ui-1.12.1.custom/jquery-ui';
// import { resultTypes } from '../../common/game/helpers';
import { resultTypes } from './helpers';

require("!style!css!./lib/jquery-ui-1.12.1.custom/jquery-ui.css");

const DEBUG = typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug');
if (DEBUG) {
    window.$ = $; // make jq available for debug
}

let scriptUrl = $(document.currentScript).attr('src');
let urlParser = document.createElement('a');
urlParser.href = scriptUrl;
const DOMAIN = urlParser.host;

const OWNER_ID = $(document.currentScript).data('id');
const asteroid = new Asteroid(DOMAIN, location.protocol == 'https:');


// const htmlIndex= require('html!./gamemy3/index.html');
// DEBUG && console.log('maket: ', htmlIndex);
//
// const htmlForm1 = require('html!./gamemy3/form1.html');
// DEBUG && console.log('ac_result: ', htmlForm1);

function sendSubscribe(result, contactInfo) {
    let resultType = resultTypes.indexOf(result);
    if (resultType == -1)
        return console.error(`Wrong result "${result} (${JSON.stringify(resultTypes)})"`);
    DEBUG && console.log('Params: ', { OWNER_ID, resultType, contactInfo });
    return asteroid.call('gameSubscribe', OWNER_ID, resultType, contactInfo).result
        .then(result => {
            DEBUG && console.log("sendSubscribe Success: ", result);
            return result;
        });
}


$(function() {
    var iframe = $(`<iframe src="//${DOMAIN}/gamemy3/index.html" width="700" height="373" id="ac_game_ifr" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>`);
    var dialog = $("<div></div>").append(iframe).appendTo("body").dialog({
        autoOpen: true,
        modal: true,
        resizable: false,
        width: "auto",
        height: "auto",
        close: function () {
            iframe.attr("src", "");
        }
    });
    // Form: $('#ac_game_ifr').contents().find('#gwd-taparea_2').click()
    $('#ac_game_ifr').on('load', function() {
        let formFrame = $(this).contents().find('#gwd-iframe_2');
        formFrame.on('load', function() {
            let form = formFrame.contents().find('form');
            form.attr('action', '');
            form.find('[type=submit]').attr('onclick', () => {});
            form.on('submit', e => {
                e.preventDefault();
                let name = e.target.name.value,
                    email = e.target.mail.value,
                    phone = e.target.tel.value;
                sendSubscribe('Результат 1', { name, email, phone });
                return false;
            });
        });
    });

    // $('#ac_game_ifr').on('submit', 'form', function() {
    // });

    // $(".thumb a").on("click", function (e) {
    //     e.preventDefault();
    //     var src = $(this).attr("href");
    //     var title = $(this).attr("data-title");
    //     var width = $(this).attr("data-width");
    //     var height = $(this).attr("data-height");
    //     iframe.attr({
    //         width: +width,
    //         height: +height,
    //         src: src
    //     });
    //     dialog.dialog("option", "title", title).dialog("open");
    // });
});