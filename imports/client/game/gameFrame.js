import Asteroid from './lib/asteroid.browser';
import { resultTypes } from './helpers';

const DEBUG = true;//typeof localStorage != 'undefined' && !!localStorage.getItem('agentCarDebug');


if (DEBUG) {
    console.log('gameFrame started');
    window.$ = $; // make jq available for debug
}

const DOMAIN = window.location.host;

const OWNER_ID = window.location.hash.substr(1);
DEBUG && console.log('OWNER_ID: ', OWNER_ID);

const asteroid = new Asteroid(DOMAIN, location.protocol == 'https:');


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

const GAME_DIR = `//${DOMAIN}/gamemy3`;

$(document).ready(() => {
    // Form: $('#ac_game_ifr').contents().find('#gwd-taparea_2').click()
    // $('#ac_game_ifr').on('load', function(e) {
        let formFrame = $('#gwd-iframe_1,#gwd-iframe_2,#gwd-iframe_3,#gwd-iframe_4');
        let getResultFromP = p => {
            let result = $(p).text();
            // DEBUG && console.log(`result0: "${result}"`);
            result = result.replace(/[\n\r]/g, '').match(/В багажнике:(.*[^!])!?/); // В багажнике: X!
            result = result[1].trim().replace(/\s+/g, ' ');
            // DEBUG && console.log(`result: "${result}"`);
            return result;
        };
        if (DEBUG) {
            let allResults = $('p:contains(багажнике)').toArray().map(getResultFromP);
            DEBUG && console.log(`allResults: `, allResults);
            allResults.forEach(r => {
                if (resultTypes.indexOf(r) == -1)
                    console.error(`"${r}" not in `, resultTypes);
            });
        }
        formFrame.on('load', () => {
            let form = formFrame.contents().find('form');
            form.attr('action', '');
            form.find('[type=submit]').attr('onclick', () => {});
            form.on('submit', e => {
                e.preventDefault();
                let name = e.target.name.value,
                    email = e.target.mail.value,
                    phone = e.target.tel.value;
                let result = getResultFromP($('p:contains(багажнике):visible'));
                DEBUG && console.log(`result: "${result}"`);

                sendSubscribe(result, { name, email, phone });
                // $('#ac_game_ifr').attr('src', `${GAME_DIR}/end.html`);
                window.location = `${GAME_DIR}/end.html`;
                return false;
            });
        });
});


function receiveLoaderMessage(event) {
    DEBUG && console.log('GAME_FRAME POST MSG: ', event);

    // Do we trust the sender of this message?
    // if (!event.origin.startsWith(GAME_DIR))
    //     return;

    if (event.data && event.data.type == 'eval')
        eval(event.data.js_code);
}
window.addEventListener("message", receiveLoaderMessage, false);