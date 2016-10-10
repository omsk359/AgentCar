import './lib/jquery-ui-1.12.1.custom/jquery-ui.min';

require("!style!css!./lib/jquery-ui-1.12.1.custom/jquery-ui.min.css");

const DEBUG = typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug');
if (DEBUG) {
    console.log('gameLoader started');
    window.$ = $; // make jq available for debug

    window.clickCar = (n = 2, m = 1) => {
        let ifrWin = $('#ac_game_ifr').get(0).contentWindow;
        let js_code = `document.getElementById('car${n}_${m}').click()`;
        ifrWin.postMessage({ type: 'eval', js_code }, `${location.protocol}//${DOMAIN}`);
    };
    window.goUserInfo = (n = 2) => {
        let ifrWin = $('#ac_game_ifr').get(0).contentWindow;
        let js_code = `document.getElementById('gwd-taparea_${n}').click()`;
        ifrWin.postMessage({ type: 'eval', js_code }, `${location.protocol}//${DOMAIN}`);
    };
}

let scriptUrl = $(document.currentScript).attr('src');
let urlParser = document.createElement('a');
urlParser.href = scriptUrl;
const DOMAIN = urlParser.host;

const OWNER_ID = $(document.currentScript).data('id');

const GAME_DIR = `//${DOMAIN}/gamemy3`;

$(function() {
    var iframe = $(`<iframe src="${GAME_DIR}/index.html#${OWNER_ID}" width="700" height="373" id="ac_game_ifr" frameborder="0" marginwidth="0" marginheight="0"></iframe>`);
    var dialog = $("<div></div>").append(iframe).appendTo("body").dialog({
        autoOpen: true,
        modal: true,
        resizable: false,
        width: "auto",
        height: "auto",
        close: function() {
            iframe.attr("src", "");
        }
    });

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
